import { Module } from '@nestjs/common';
import { EntrevistasController } from './entrevistas.controller';
import { EntrevistasService } from './entrevistas.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports:     [EmailModule],
  controllers: [EntrevistasController],
  providers:   [EntrevistasService],
  exports:     [EntrevistasService],
})
export class EntrevistasModule {}
