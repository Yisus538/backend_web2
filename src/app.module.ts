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
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { NavigationModule } from './navigation/navigation.module';
import { CurriculumModule } from './curriculum/curriculum.module';
import { EntrevistasModule } from './entrevistas/entrevistas.module';

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
    CloudinaryModule,
    NavigationModule,
    CurriculumModule,

    // ── Feature modules ──
    AuthModule,
    VacantesModule,
    PostulacionesModule,
    CandidatosModule,
    CvModule,
    UploadModule,
    HealthModule,
    AdminModule,
    EntrevistasModule,
  ],
})
export class AppModule {}
