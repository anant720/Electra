// =============================================================================
// ELECTRA — Root Application Module
// =============================================================================

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CountriesModule } from './countries/countries.module';
import { ElectionsModule } from './elections/elections.module';
import { AiModule } from './ai/ai.module';
import { ReadinessModule } from './readiness/readiness.module';
import { EmergencyModule } from './emergency/emergency.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HealthController } from './common/health.controller';

@Module({
  imports: [
    // ─── Config ─────────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // ─── Rate Limiting ───────────────────────────────────────────────────────
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('RATE_LIMIT_TTL', 60) * 1000,
          limit: config.get<number>('RATE_LIMIT_MAX', 100),
        },
      ],
    }),

    // ─── Cache (In-Memory for Stability) ──────────────────────────────────────
    CacheModule.register({
      isGlobal: true,
      ttl: 300,
    }),

    // ─── Scheduled Tasks ─────────────────────────────────────────────────────
    ScheduleModule.forRoot(),

    // ─── Database ────────────────────────────────────────────────────────────
    PrismaModule,

    // ─── Feature Modules ─────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    CountriesModule,
    ElectionsModule,
    AiModule,
    ReadinessModule,
    EmergencyModule,
    AdminModule,
    NotificationsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
