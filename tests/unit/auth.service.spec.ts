// =============================================================================
// ELECTRA — Auth Service Unit Tests
// System 1: Full QA Expansion
// =============================================================================

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../apps/api/src/auth/auth.service';
import { PrismaService } from '../../apps/api/src/common/prisma/prisma.service';
import { UsersService } from '../../apps/api/src/users/users.module';
import { AuditService } from '../../apps/api/src/admin/audit.service';
import * as bcrypt from 'bcryptjs';

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  session: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
};

const mockConfig = {
  get: jest.fn((key: string, fallback?: any) => {
    const values: Record<string, any> = {
      JWT_SECRET: 'test-secret-key-minimum-32-chars!!',
      JWT_REFRESH_SECRET: 'test-refresh-secret-minimum-32!',
      JWT_EXPIRY: '15m',
      JWT_REFRESH_EXPIRY: '7d',
      BCRYPT_ROUNDS: 10,
    };
    return values[key] ?? fallback;
  }),
};

const mockAudit = { log: jest.fn().mockResolvedValue(undefined) };
const mockUsers = {};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
        { provide: AuditService, useValue: mockAudit },
        { provide: UsersService, useValue: mockUsers },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ── Registration ────────────────────────────────────────────────────────────
  describe('register()', () => {
    it('should create a new user and return tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-001', email: 'voter@test.com', role: 'CITIZEN',
      });
      mockPrisma.session.create.mockResolvedValue({});

      const result = await service.register({
        email: 'voter@test.com', password: 'SecurePass123!',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.expiresIn).toBe(900);
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.register({ email: 'existing@test.com', password: 'Pass123!' }),
      ).rejects.toThrow(ConflictException);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should hash password before storing', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      let createdData: any;
      mockPrisma.user.create.mockImplementation(({ data }) => {
        createdData = data;
        return Promise.resolve({ id: 'u1', email: data.email, role: 'CITIZEN' });
      });
      mockPrisma.session.create.mockResolvedValue({});

      await service.register({ email: 'a@b.com', password: 'MyPlainPass1!' });

      expect(createdData.passwordHash).toBeDefined();
      expect(createdData.passwordHash).not.toBe('MyPlainPass1!');
      const valid = await bcrypt.compare('MyPlainPass1!', createdData.passwordHash);
      expect(valid).toBe(true);
    });
  });

  // ── Login ───────────────────────────────────────────────────────────────────
  describe('login()', () => {
    it('should return tokens for valid credentials', async () => {
      const hash = await bcrypt.hash('CorrectPass1!', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1', email: 'v@test.com', passwordHash: hash, role: 'CITIZEN', deletedAt: null,
      });
      mockPrisma.session.create.mockResolvedValue({});

      const result = await service.login({ email: 'v@test.com', password: 'CorrectPass1!' });
      expect(result.accessToken).toBeDefined();
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hash = await bcrypt.hash('CorrectPass1!', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1', passwordHash: hash, role: 'CITIZEN', deletedAt: null,
      });

      await expect(
        service.login({ email: 'v@test.com', password: 'WrongPass!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for unknown email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'nobody@test.com', password: 'Pass1!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for soft-deleted user', async () => {
      const hash = await bcrypt.hash('Pass1!', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1', passwordHash: hash, role: 'CITIZEN', deletedAt: new Date(),
      });
      await expect(
        service.login({ email: 'deleted@test.com', password: 'Pass1!' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── Refresh Token ───────────────────────────────────────────────────────────
  describe('refresh()', () => {
    it('should issue new tokens and rotate refresh token', async () => {
      const futureDate = new Date(Date.now() + 3600000);
      mockPrisma.session.findUnique.mockResolvedValue({
        id: 's1', userId: 'u1', refreshToken: 'old-token', expiresAt: futureDate,
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1', email: 'v@test.com', role: 'CITIZEN', deletedAt: null,
      });
      mockPrisma.session.delete.mockResolvedValue({});
      mockPrisma.session.create.mockResolvedValue({});

      const result = await service.refresh('old-token');
      expect(result.accessToken).toBeDefined();
      expect(mockPrisma.session.delete).toHaveBeenCalledTimes(1); // Old token revoked
    });

    it('should throw if refresh token is expired', async () => {
      const pastDate = new Date(Date.now() - 1000);
      mockPrisma.session.findUnique.mockResolvedValue({
        id: 's1', userId: 'u1', expiresAt: pastDate,
      });
      mockPrisma.session.delete.mockResolvedValue({});
      await expect(service.refresh('expired-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if refresh token does not exist', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(null);
      await expect(service.refresh('nonexistent-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── Logout ──────────────────────────────────────────────────────────────────
  describe('logout()', () => {
    it('should delete the session associated with the refresh token', async () => {
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 1 });
      await service.logout('my-refresh-token');
      expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({
        where: { refreshToken: 'my-refresh-token' },
      });
    });
  });
});
