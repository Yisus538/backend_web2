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

export class CvAnalisisDto {
  candidatoId: string;
  skills_detectadas: SkillDto[];
  experiencia_laboral: ExperienciaIaDto[];
  educacion: EducacionIaDto[];
  idiomas: IdiomaIaDto[];
  confianza_datos: string;
}
