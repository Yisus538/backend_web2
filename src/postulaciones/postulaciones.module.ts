import { Module } from '@nestjs/common';
import { PostulacionesController } from './postulaciones.controller';
import { PostulacionesService } from './postulaciones.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports:     [EmailModule],
  controllers: [PostulacionesController],
  providers:   [PostulacionesService],
  exports:     [PostulacionesService],
})
export class PostulacionesModule {}
