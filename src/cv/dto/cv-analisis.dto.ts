export class SkillDto {
  skill: string;
  nivel_estimado: string;
  confianza: string;
}

export class ExperienciaIaDto {
  empresa: string;
  cargo: string;
  ubicacion: string;
  periodo: string;
  descripcion: string[];
}

export class EducacionIaDto {
  institucion: string;
  titulo: string;
  periodo: string;
  observaciones: string;
}

export class IdiomaIaDto {
  idioma: string;
  nivel: string;
}

import { IsNotEmpty, IsString } from 'class-validator';

export class CvAnalisisDto {
  @IsString()
  @IsNotEmpty({ message: 'candidatoId es requerido' })
  candidatoId: string;
  nombre_completo: string;
  correo_cv: string;
  telefono_cv: string;
  puesto_evaluado: string;
  motivo_rechazo: string;
  resumen: string;
  skills_detectadas: SkillDto[];
  tecnologias_detectadas: string[];
  experiencia_laboral: ExperienciaIaDto[];
  educacion: EducacionIaDto[];
  idiomas: IdiomaIaDto[];
  confianza_datos: string;
}
