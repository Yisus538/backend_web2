import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, Min, Max } from 'class-validator';

export class PostulacionCallbackDto {
  @IsString()
  postulacionId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  matchScore: number;

  @IsBoolean()
  apto: boolean;

  @IsString()
  @IsOptional()
  resumen?: string;

  @IsArray()
  @IsOptional()
  fortalezas?: string[];

  @IsArray()
  @IsOptional()
  debilidades?: string[];

  @IsString()
  @IsOptional()
  motivoRechazo?: string;

  @IsArray()
  @IsOptional()
  habilidadesDetectadas?: string[];

  @IsString()
  @IsOptional()
  nivelExperiencia?: string;

  @IsString()
  @IsOptional()
  recomendacion?: string;

  @IsOptional()
  datosCrudos?: Record<string, any>;
}
