// create-vacante.dto.ts
import { IsString, IsOptional, IsNumber, IsIn, Min, Max, Length } from 'class-validator';

export class CreateVacanteDto {
  @IsString()
  @Length(3, 150, { message: 'El título debe tener entre 3 y 150 caracteres' })
  titulo: string;

  @IsString()
  @Length(10, 10000, { message: 'La descripción debe tener al menos 10 caracteres' })
  descripcion: string;

  @IsOptional()
  @IsIn(['borrador', 'abierta', 'pausada', 'cerrada'], { message: 'Estado inválido' })
  estado?: string;

  @IsOptional() @IsString() categoria?: string;
  @IsOptional() @IsString() modalidad?: string;

  @IsOptional()
  @IsNumber()
  @Min(0) @Max(50)
  experienciaMinima?: number;

  @IsOptional() @IsNumber() @Min(0) salarioMin?: number;
  @IsOptional() @IsNumber() @Min(0) salarioMax?: number;

  @IsOptional() requisitos?: any;
  @IsOptional() matchingWeights?: any;
}
