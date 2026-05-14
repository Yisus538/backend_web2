import { Module } from '@nestjs/common';
import { CandidatosController } from './candidatos.controller';
import { CandidatosService } from './candidatos.service';
import { CurriculumModule } from '../curriculum/curriculum.module';

@Module({
  imports:     [CurriculumModule],
  controllers: [CandidatosController],
  providers:   [CandidatosService],
})
export class CandidatosModule {}
