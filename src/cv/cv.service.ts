import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CvAnalisisDto } from './dto/cv-analisis.dto';

// Normaliza el string "periodo" de Make al formato interno.
// Ej: "Ene 2020 - Jun 2022", "2020-03 - Actualidad", "2018 - 2022"
function parsePeriodo(periodo: string): {
  fechaInicio: string;
  fechaFin: string | null;
  actual: boolean;
} {
  const CURRENT = ['actualidad', 'actual', 'presente', 'present', 'current', 'hoy', 'today'];
  const parts = (periodo ?? '').split(/\s*[-–]\s*/);
  if (parts.length < 2) {
    return { fechaInicio: parts[0]?.trim() || 'Sin fecha', fechaFin: null, actual: false };
  }
  const finRaw = parts[parts.length - 1].trim();
  const actual  = CURRENT.some(m => finRaw.toLowerCase().includes(m));
  return {
    fechaInicio: parts[0].trim() || 'Sin fecha',
    fechaFin:    actual ? null : finRaw,
    actual,
  };
}

// Mapea el nivel de idioma de Make a los valores válidos del sistema.
function normalizarNivelIdioma(nivel: string): string {
  const n = (nivel ?? '').toLowerCase().trim();
  if (/nativ|native|c2/.test(n))             return 'nativo';
  if (/avanzad|advanced|c1|b2/.test(n))      return 'avanzado';
  if (/intermed|intermediate|b1|a2/.test(n)) return 'intermedio';
  return 'basico';
}

// Parsea confianza_datos → Int (0-100). Acepta "85", "85%", "0.85", o number.
function parseScore(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = parseFloat(String(raw).replace('%', '').trim());
  if (isNaN(n)) return null;
  return Math.round(n <= 1 ? n * 100 : n);
}

@Injectable()
export class CvService {
  private readonly logger = new Logger(CvService.name);

  constructor(
    private readonly prisma:            PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // Sube el CV a Cloudinary y persiste la URL en candidato.urlCv.
  // Retorna la secureUrl o null si falla (el análisis IA continúa igual).
  async uploadCvAndPersist(
    file: Express.Multer.File,
    candidatoId: string,
  ): Promise<string | null> {
    if (file.mimetype !== 'application/pdf') return null;
    try {
      const { secureUrl } = await this.cloudinaryService.uploadCv(
        file.buffer,
        candidatoId,
        file.originalname,
      );
      await this.prisma.candidato.upsert({
        where:  { usuarioId: candidatoId },
        create: { usuarioId: candidatoId, urlCv: secureUrl },
        update: { urlCv: secureUrl },
      });
      this.logger.log(`[uploadCvAndPersist] CV subido: ${secureUrl}`);
      return secureUrl;
    } catch (err) {
      this.logger.error('[uploadCvAndPersist] Error subiendo a Cloudinary:', err);
      return null;
    }
  }

  // GET /api/cv/analisis — devuelve análisis + datos redistribuidos de la BD
  async getAnalisis(candidatoId: string) {
    const [analisis, experienciaLaboral, todasHabilidades, candidato] = await Promise.all([
      this.prisma.analisisCvDirecto.findFirst({
        where:   { candidatoId },
        orderBy: { analizadoEl: 'desc' },
      }),
      this.prisma.experienciaLaboral.findMany({
        where:   { candidatoId },
        orderBy: { fechaInicio: 'desc' },
        select: {
          id:          true,
          empresa:     true,
          cargo:       true,
          fechaInicio: true,
          fechaFin:    true,
          actual:      true,
          descripcion: true,
          modalidad:   true,
        },
      }),
      this.prisma.candidatoHabilidad.findMany({
        where:   { candidatoId },
        select: {
          nivel:     true,
          aniosExp:  true,
          tipo:      true,
          habilidad: { select: { nombre: true } },
        },
        orderBy: { aniosExp: 'desc' },
      }),
      this.prisma.candidato.findUnique({
        where:  { usuarioId: candidatoId },
        select: { urlCv: true },
      }),
    ]);

    if (!analisis) return null;

    const habilidades = todasHabilidades
      .filter(h => h.tipo !== 'tecnologia')
      .map(h => ({ nombre: h.habilidad.nombre, nivel: h.nivel ?? null, aniosExp: h.aniosExp ?? null }));

    const tecnologias = todasHabilidades
      .filter(h => h.tipo === 'tecnologia')
      .map(h => h.habilidad.nombre);

    // Exponer solo columnas escalares del análisis (sin los JSON blobs)
    const { cvCompleto: _, evaluacionCompleta: __, ...analisisLimpio } = analisis as any;

    return {
      ...analisisLimpio,
      experienciaLaboral,
      habilidades,
      tecnologias,
      urlArchivo: candidato?.urlCv ?? null,
    };
  }

  // Llamado desde el callback de Make.com con el análisis procesado.
  // Graba el análisis en AnalisisCvDirecto y enriche el perfil del candidato
  // (skills, experiencia, educación, idiomas) sin borrar datos existentes.
  async procesarAnalisis(candidatoId: string, payload: CvAnalisisDto): Promise<void> {
    const startMs = Date.now();
    this.logger.log(`[callback] Procesando análisis para candidato ${candidatoId}`);

    // Parsear campos que Make envía como string JSON en lugar de array real.
    const asArray = (v: any): any[] => {
      if (Array.isArray(v)) return v;
      if (typeof v !== 'string' || !v.trim()) return [];
      const t = v.trim();
      // Intento 1: ya es JSON array
      if (t.startsWith('[')) {
        try { return JSON.parse(t); } catch { /* continuar */ }
      }
      // Intento 2: envolver en [] — funciona con "{...}, {...}" de Make
      if (t.startsWith('{')) {
        try { return JSON.parse('[' + t + ']'); } catch { /* continuar */ }
      }
      // Intento 3: split regex para JSON anidado complejo
      if (t.startsWith('{')) {
        try {
          return t.split(/\}\s*,\s*\{/).map((p) => {
            let s = p.trim();
            if (!s.startsWith('{')) s = '{' + s;
            if (!s.endsWith('}')) s = s + '}';
            return JSON.parse(s);
          });
        } catch { /* continuar */ }
      }
      // Intento 4: strings simples separados por coma (tecnologías)
      return t.split(/[,;]/).map((s: string) => s.trim()).filter(Boolean);
    };

    const skills      = asArray(payload.skills_detectadas);
    const tecnologias = asArray(payload.tecnologias_detectadas);
    const expLaboral  = asArray(payload.experiencia_laboral);
    const educacion   = asArray(payload.educacion);
    const idiomas     = asArray(payload.idiomas);

    this.logger.log(
      `[callback] Arrays recibidos — skills: ${skills.length}, tecno: ${tecnologias.length}, ` +
      `exp: ${expLaboral.length}, edu: ${educacion.length}, idiomas: ${idiomas.length}`,
    );

    // 1. Asegurar que existe el perfil de candidato (puede no existir aún)
    await this.prisma.candidato.upsert({
      where:  { usuarioId: candidatoId },
      create: { usuarioId: candidatoId },
      update: {},
    });

    // 2. Crear registro de análisis con score, datos personales y payload completo
    const score = parseScore(payload.confianza_datos);
    const analisis = await this.prisma.analisisCvDirecto.create({
      data: {
        candidatoId,
        score,
        apto:               score !== null ? score >= 60 : null,
        resumen:            payload.resumen          ?? null,
        nombreCompleto:     payload.nombre_completo  ?? null,
        correoCv:           payload.correo_cv        ?? null,
        telefonoCv:         payload.telefono_cv      ?? null,
        puestoEvaluado:     payload.puesto_evaluado  ?? null,
        motivoRechazo:      payload.motivo_rechazo   ?? null,
      },
    });
    this.logger.log(`[callback] AnalisisCvDirecto creado: ${analisis.id} — score: ${score}`);

    // 3. Habilidades — upsert sin sobrescribir datos manuales, tipo = 'habilidad'
    let skillsNuevas = 0;
    for (const s of skills) {
      const nombre = (typeof s === 'string' ? s : s.skill)?.trim();
      if (!nombre) continue;
      try {
        const habilidad = await this.prisma.habilidad.upsert({
          where:  { nombre },
          create: { nombre },
          update: {},
        });
        const { created } = await this.upsertCandidatoHabilidad(
          candidatoId,
          habilidad.id,
          s.nivel_estimado ?? null,
          'habilidad',
          analisis.id,
        );
        if (created) skillsNuevas++;
      } catch (err) {
        this.logger.warn(`[callback] No se pudo procesar skill "${nombre}": ${(err as Error).message}`);
      }
    }
    this.logger.log(`[callback] Skills procesadas: ${skillsNuevas} nuevas de ${skills.length}`);

    // 3b. Tecnologías — upsert en habilidades con tipo = 'tecnologia'
    let tecnologiasNuevas = 0;
    for (const tech of tecnologias) {
      const nombre = (typeof tech === 'string' ? tech : (tech as any)?.nombre)?.trim();
      if (!nombre) continue;
      try {
        const habilidad = await this.prisma.habilidad.upsert({
          where:  { nombre },
          create: { nombre },
          update: {},
        });
        const { created } = await this.upsertCandidatoHabilidad(
          candidatoId,
          habilidad.id,
          null,
          'tecnologia',
          analisis.id,
        );
        if (created) tecnologiasNuevas++;
      } catch (err) {
        this.logger.warn(`[callback] No se pudo procesar tecnología "${nombre}": ${(err as Error).message}`);
      }
    }
    this.logger.log(`[callback] Tecnologías procesadas: ${tecnologiasNuevas} nuevas de ${tecnologias.length}`);

    // 4. Experiencia — insertar solo si no existe ya (misma empresa + cargo)
    let expNuevas = 0;
    for (const exp of expLaboral) {
      const { empresa, cargo, periodo, descripcion } = exp;
      if (!empresa?.trim() || !cargo?.trim()) continue;
      try {
        const existe = await this.prisma.experienciaLaboral.findFirst({
          where: {
            candidatoId,
            empresa: { equals: empresa.trim(), mode: 'insensitive' },
            cargo:   { equals: cargo.trim(),   mode: 'insensitive' },
          },
        });
        if (!existe) {
          const { fechaInicio, fechaFin, actual } = parsePeriodo(periodo);
          const desc = Array.isArray(descripcion)
            ? descripcion.filter(Boolean).join('\n')
            : (descripcion ?? null);
          await this.prisma.experienciaLaboral.create({
            data: {
              candidatoId,
              empresa:          empresa.trim(),
              cargo:            cargo.trim(),
              fechaInicio,
              fechaFin,
              actual,
              descripcion:      desc,
              analisisOrigenId: analisis.id,
            },
          });
          expNuevas++;
        }
      } catch (err) {
        this.logger.warn(`[callback] No se pudo procesar experiencia "${empresa}/${cargo}": ${(err as Error).message}`);
      }
    }
    this.logger.log(`[callback] Experiencia: ${expNuevas} nuevas de ${expLaboral.length}`);

    // 5. Educación — insertar solo si no existe ya (misma institución + título)
    let eduNuevas = 0;
    for (const edu of educacion) {
      const { institucion, titulo, periodo, observaciones } = edu;
      if (!institucion?.trim() || !titulo?.trim()) continue;
      try {
        const existe = await this.prisma.educacion.findFirst({
          where: {
            candidatoId,
            institucion: { equals: institucion.trim(), mode: 'insensitive' },
            titulo:      { equals: titulo.trim(),      mode: 'insensitive' },
          },
        });
        if (!existe) {
          const { fechaInicio, fechaFin, actual: cursando } = parsePeriodo(periodo);
          await this.prisma.educacion.create({
            data: {
              candidatoId,
              institucion:      institucion.trim(),
              titulo:           titulo.trim(),
              fechaInicio,
              fechaFin,
              cursando,
              descripcion:      observaciones?.trim() || null,
              analisisOrigenId: analisis.id,
            },
          });
          eduNuevas++;
        }
      } catch (err) {
        this.logger.warn(`[callback] No se pudo procesar educación "${institucion}/${titulo}": ${(err as Error).message}`);
      }
    }
    this.logger.log(`[callback] Educación: ${eduNuevas} nuevas de ${educacion.length}`);

    // 6. Idiomas — insertar solo si el candidato no tiene ese idioma ya
    let idiomasNuevos = 0;
    for (const id of idiomas) {
      const { idioma, nivel } = id;
      if (!idioma?.trim()) continue;
      try {
        const existe = await this.prisma.idioma.findFirst({
          where: {
            candidatoId,
            idioma: { equals: idioma.trim(), mode: 'insensitive' },
          },
        });
        if (!existe) {
          await this.prisma.idioma.create({
            data: {
              candidatoId,
              idioma:           idioma.trim(),
              nivel:            normalizarNivelIdioma(nivel),
              analisisOrigenId: analisis.id,
            },
          });
          idiomasNuevos++;
        }
      } catch (err) {
        this.logger.warn(`[callback] No se pudo procesar idioma "${idioma}": ${(err as Error).message}`);
      }
    }
    this.logger.log(`[callback] Idiomas: ${idiomasNuevos} nuevos de ${idiomas.length}`);

    // 7. Registrar en historial de análisis
    const duracionMs = Date.now() - startMs;
    await this.prisma.historialAnalisis.create({
      data: {
        analisisDirectoId: analisis.id,
        estado:   'completado',
        detalles: `IA: ${skillsNuevas} skills, ${tecnologiasNuevas} tecno, ${expNuevas} exp, ${eduNuevas} edu, ${idiomasNuevos} idiomas — score ${score}`,
        duracionMs,
      },
    });

    this.logger.log(`[callback] Análisis ${analisis.id} procesado en ${duracionMs}ms`);
  }

  // GET /api/cv/analisis-activo — retorna el análisis más reciente con sus datos
  async getAnalisisActivo(candidatoId: string) {
    return this.prisma.analisisCvDirecto.findFirst({
      where:   { candidatoId },
      orderBy: { analizadoEl: 'desc' },
      select: {
        id:              true,
        score:           true,
        apto:            true,
        resumen:         true,
        puestoEvaluado:  true,
        analizadoEl:     true,
        educacionGenerada:   { select: { id: true, titulo: true, institucion: true } },
        experienciaGenerada: { select: { id: true, cargo: true, empresa: true } },
        idiomasGenerados:    { select: { id: true, idioma: true, nivel: true } },
      },
    });
  }

  private async upsertCandidatoHabilidad(
    candidatoId: string,
    habilidadId: string,
    nivel: string | null,
    tipo: 'habilidad' | 'tecnologia',
    analisisOrigenId: string | null = null,
  ): Promise<{ created: boolean }> {
    try {
      await this.prisma.candidatoHabilidad.upsert({
        where:  { candidatoId_habilidadId: { candidatoId, habilidadId } },
        create: { candidatoId, habilidadId, nivel, tipo, analisisOrigenId },
        update: { tipo },
      });
      return { created: true };
    } catch (err) {
      this.logger.error(`[upsert] habilidadId=${habilidadId}: ${(err as Error).message}`);
      return { created: false };
    }
  }
}
