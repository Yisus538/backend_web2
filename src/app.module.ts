import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { VacantesModule } from './vacantes/vacantes.module';
import { PostulacionesModule } from './postulaciones/postulaciones.module';
import { CandidatosModule } from './candidatos/candidatos.module';
import { CvModule } from './cv/cv.module';
import { UploadModule } from './upload/upload.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // ── Variables de entorno ──
    ConfigModule.forRoot({ isGlobal: true }),

    // ── Rate limiting global (5 req / 15 min por IP) ──
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 900_000,  // 15 minutos en ms
        limit: 100,    // límite general (los endpoints críticos tienen su propia guard)
      },
    ]),

    // ── Core ──
    PrismaModule,
    EmailModule,

    // ── Feature modules ──
    AuthModule,
    VacantesModule,
    PostulacionesModule,
    CandidatosModule,
    CvModule,
    UploadModule,
    HealthModule,
  ],
})
export class AppModule {}
