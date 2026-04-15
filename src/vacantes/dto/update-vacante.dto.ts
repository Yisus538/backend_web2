import { PartialType } from '@nestjs/mapped-types';
import { CreateVacanteDto } from './create-vacante.dto';

export class UpdateVacanteDto extends PartialType(CreateVacanteDto) {}

export class UpdateEstadoDto {
  estado: string;
}
