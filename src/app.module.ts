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
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),


    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 900_000, 
        limit: 100,    
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
    AdminModule,
  ],
})
export class AppModule {}
