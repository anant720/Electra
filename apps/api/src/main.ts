// =============================================================================
// ELECTRA API — Application Bootstrap
// Navigate Every Election.
// =============================================================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // ─── Security: Helmet ─────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https://generativelanguage.googleapis.com'],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
        },
      },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    }),
  );

  // ─── CORS ─────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: config.get<string>('API_CORS_ORIGIN', 'http://localhost:3000').split(','),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID'],
  });

  // ─── Global Prefix ────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─── Global Validation Pipe ───────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // Strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Swagger / API Docs ───────────────────────────────────────────────────
  if (config.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('ELECTRA API')
      .setDescription('Navigate Every Election — Civic Intelligence Platform API')
      .setVersion('1.0.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('countries', 'Country civic data')
      .addTag('elections', 'Election events')
      .addTag('ai', 'AI civic query engine')
      .addTag('readiness', 'Voter readiness scoring')
      .addTag('emergency', 'Emergency resolution paths')
      .addTag('admin', 'Administrative governance')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
    logger.log('📚 Swagger docs available at /api/docs');
  }

  // ─── Start Server ─────────────────────────────────────────────────────────
  const port = config.get<number>('API_PORT', 3001);
  await app.listen(port);

  logger.log(`🚀 ELECTRA API running on: http://localhost:${port}`);
  logger.log(`🌐 Navigate Every Election.`);
}

bootstrap();
