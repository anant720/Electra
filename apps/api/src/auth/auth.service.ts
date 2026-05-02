// =============================================================================
// ELECTRA — Auth Service
// =============================================================================

import {
  Injectable, UnauthorizedException, ConflictException, Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../common/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthTokens, JwtPayload, UserRole } from '@electra/types';
import { AuditService } from '../admin/audit.service';
import { createHash } from 'crypto';


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  // ─── Register with email/password ─────────────────────────────────────────
  async register(dto: RegisterDto): Promise<AuthTokens> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('An account with this email already exists.');

    const passwordHash = await bcrypt.hash(dto.password, this.config.get<number>('BCRYPT_ROUNDS', 12));

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        preferredLanguage: dto.language ?? 'en',
      },
    });

    await this.audit.log(user.id, 'CITIZEN', 'USER_REGISTERED', 'User', user.id);
    this.logger.log(`New user registered: ${user.id}`);

    return this.issueTokens(user.id, user.email, user.role as UserRole);
  }

  // ─── Login with email/password ────────────────────────────────────────────
  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials.');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials.');

    if (user.deletedAt) throw new UnauthorizedException('This account has been deactivated.');

    await this.audit.log(user.id, user.role, 'USER_LOGIN', 'User', user.id);
    return this.issueTokens(user.id, user.email, user.role as UserRole);
  }

  // ─── Google OAuth callback ────────────────────────────────────────────────
  async googleLogin(googleUser: { googleId: string; email: string; name?: string; avatar?: string }): Promise<AuthTokens> {
    this.logger.log(`Attempting Google Login for email: ${googleUser.email}`);
    
    let user = await this.prisma.user.findFirst({
      where: { oauthProvider: 'google', oauthId: googleUser.googleId },
    });

    if (!user) {
      this.logger.log(`No user found with googleId: ${googleUser.googleId}, checking email: ${googleUser.email}`);
      user = await this.prisma.user.findUnique({ where: { email: googleUser.email } });
      
      if (user) {
        this.logger.log(`Found existing user with email: ${googleUser.email}, linking Google account.`);
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { 
            oauthProvider: 'google', 
            oauthId: googleUser.googleId, 
            emailVerified: true, 
            emailVerifiedAt: new Date(),
            fullName: user.fullName || googleUser.name,
            avatarUrl: user.avatarUrl || googleUser.avatar,
          },
        });
      } else {
        this.logger.log(`Creating new user for Google login: ${googleUser.email}`);
        user = await this.prisma.user.create({
          data: {
            email: googleUser.email,
            oauthProvider: 'google',
            oauthId: googleUser.googleId,
            emailVerified: true,
            emailVerifiedAt: new Date(),
            fullName: googleUser.name,
            avatarUrl: googleUser.avatar,
          },
        });
      }
    }

    this.logger.log(`User resolved: ${user.id}, issuing tokens...`);
    await this.audit.log(user.id, user.role, 'USER_GOOGLE_LOGIN', 'User', user.id);
    return this.issueTokens(user.id, user.email, user.role as UserRole, googleUser.name);
  }

  // ─── Refresh Token ────────────────────────────────────────────────────────
  async refresh(refreshToken: string): Promise<AuthTokens> {
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');

    const session = await this.prisma.session.findUnique({ where: { tokenHash } });
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      if (session) await this.prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || user.deletedAt) throw new UnauthorizedException('Account not found.');

    // Rotate refresh token (invalidate old, issue new)
    await this.prisma.session.delete({ where: { id: session.id } });
    return this.issueTokens(user.id, user.email, user.role as UserRole);
  }

  // ─── Logout ───────────────────────────────────────────────────────────────
  async logout(refreshToken: string): Promise<void> {
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');

    await this.prisma.session.updateMany({ where: { tokenHash }, data: { revokedAt: new Date() } });
  }

  // ─── Issue JWT Access + Refresh Tokens ────────────────────────────────────
  private async issueTokens(userId: string, email: string, role: UserRole, name?: string): Promise<AuthTokens> {
    this.logger.log(`Issuing tokens for userId: ${userId}`);
    const payload: JwtPayload = { sub: userId, email, role, ...(name ? { name } : {}) };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: this.config.get<string>('JWT_EXPIRY', '15m'),
    });

    const refreshTokenValue = this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRY', '7d'),
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const tokenHash = createHash('sha256').update(refreshTokenValue).digest('hex');

    this.logger.log(`Creating session for user: ${userId}`);
    try {
      await this.prisma.session.create({
        data: { userId, tokenHash, expiresAt },
      });
    } catch (e) {
      this.logger.error(`Failed to create session in database: ${e.message}`, e.stack);
      throw e;
    }

    return { accessToken, refreshToken: refreshTokenValue, expiresIn: 900 };
  }
}
