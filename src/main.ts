import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://frontendweb2-production.up.railway.app',
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global → /api/...  (mantiene compatibilidad 100% con el frontend)
  app.setGlobalPrefix('api');

  // CORS — réplica exacta del middleware.ts original
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) callback(null, true);
      else callback(null, false);
    },
    credentials:    true,
    methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:            true,
      forbidNonWhitelisted: false,
      transform:            true,
      transformOptions:     { enableImplicitConversion: true },
    }),
  );

  // Filtro global de excepciones → { ok, message, errors? }
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`\n  🚀  ReclutaIA NestJS\n  Local:  http://localhost:${port}/api\n  Health: http://localhost:${port}/api/health\n`);
}

bootstrap();
