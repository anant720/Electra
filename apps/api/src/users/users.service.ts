import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        preferredCountry: true,
        preferredPersona: true,
        elderlyMode: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(id: string, data: { preferredCountry?: string; preferredPersona?: string; elderlyMode?: boolean }) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
