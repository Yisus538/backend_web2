import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calcMatchScore } from '../common/utils/match-score.utils';

function calcMatchScoreDetailed(
  skillNames: string[],
  totalExp: number,
  requisitos: any,
  experienciaMinima: number,
): { skillsScore: number; expScore: number | null; total: number } {
  const techSkills: string[] = (requisitos?.techSkills ?? [])
    .filter((s: any) => s.selected)
    .map((s: any) => s.label.toLowerCase());
  const softSkills: string[] = (requisitos?.softSkills ?? [])
    .filter((s: any) => s.selected)
    .map((s: any) => s.label.toLowerCase());
  const allRequired = [...techSkills, ...softSkills];
  const lower = skillNames.map((s) => s.toLowerCase());
  const skillsScore = allRequired.length === 0
    ? 75
    : Math.round((allRequired.filter((r) => lower.includes(r)).length / allRequired.length) * 100);

  if (!experienciaMinima) {
    return { skillsScore, expScore: null, total: skillsScore };
  }

  const expScore = Math.round(Math.min(totalExp / experienciaMinima, 1) * 100);
  const total    = Math.round(skillsScore * 0.7 + expScore * 0.3);
  return { skillsScore, expScore, total };
}

@Injectable()
export class CandidatosService {
  constructor(private prisma: PrismaService) {}

  // ────────────────────────────────────────────────────────────
  // GET /api/candidatos/:id  — empresa ve perfil público de candidato + cvUrl
  // ────────────────────────────────────────────────────────────
  async getPerfilPublico(companyId: string, candidatoId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: candidatoId, role: 'candidate', isActive: true },
      select: {
        id:        true,
        fullName:  true,
        email:     true,
        avatarUrl: true,
        titulo:    true,
        ubicacion: true,
        candidato: {
          select: {
            biografia: true,
            habilidades: {
              select: {
                nivel:    true,
                aniosExp: true,
                habilidad: { select: { nombre: true } },
              },
              orderBy: { aniosExp: 'desc' },
            },
            idiomas:    { orderBy: { creadaEl: 'asc' } },
            experiencia: { orderBy: { fechaInicio: 'desc' } },
            educacion:   { orderBy: { fechaInicio: 'desc' } },
            analisisDirectos: {
              select:  { resumen: true, score: true, analizadoEl: true },
              orderBy: { analizadoEl: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Candidato no encontrado');

    // Buscar cvUrl y postulacionId: postulación más reciente de este candidato a una vacante de esta empresa
    const postulacion = await this.prisma.postulacion.findFirst({
      where: {
        candidatoId: candidatoId,
        oferta: { empresaId: companyId },
      },
      select: { id: true, urlCv: true },
      orderBy: { creadaEl: 'desc' },
    });

    const skills = user.candidato?.habilidades ?? [];
    const skillNames = skills.map((h) => h.habilidad.nombre);
    const totalExp = skills.reduce((max, h) => Math.max(max, h.aniosExp ?? 0), 0);
    const ultimoAnalisis = user.candidato?.analisisDirectos?.[0] ?? null;

    return {
      id:         user.id,
      name:       user.fullName,
      email:      user.email,
      avatar:     user.avatarUrl ?? null,
      role:       user.titulo ?? 'Candidato',
      location:   user.ubicacion ?? '',
      biografia:  user.candidato?.biografia ?? null,
      resumen_ia: ultimoAnalisis?.resumen ?? null,
      score_ia:   ultimoAnalisis?.score   ?? null,
      experience: totalExp > 0 ? `${totalExp} años` : 'Sin experiencia registrada',
      skills:     skillNames,
      idiomas:    user.candidato?.idiomas   ?? [],
      educacion:  user.candidato?.educacion ?? [],
      experiencia: user.candidato?.experiencia ?? [],
      cvUrl:         postulacion?.urlCv ?? null,
      postulacionId: postulacion?.id    ?? null,
    };
  }

  // ────────────────────────────────────────────────────────────
  // GET /api/candidatos  — empresas ven candidatos
  // ────────────────────────────────────────────────────────────
  async listar(userId: string, q: any) {
    const search      = (q.search      ?? '') as string;
    const vacanteId   = (q.vacanteId   ?? null) as string | null;
    const ubicacion   = (q.ubicacion   ?? '') as string;
    const aniosExpMin = q.aniosExpMin ? parseInt(q.aniosExpMin, 10) : null;
    const page        = Math.max(1, parseInt(q.page  ?? '1',  10));
    const limit       = Math.min(50, Math.max(1, parseInt(q.limit ?? '20', 10)));
    const skip        = (page - 1) * limit;

    // Solo candidatos con perfil completo
    const where: any = {
      role:     'candidate',
      isActive: true,
      AND: [
        { fullName:  { not: '' } },
        { telefono:  { not: null } }, { telefono:  { not: '' } },
        { ubicacion: { not: null } }, { ubicacion: { not: '' } },
        { titulo:    { not: null } }, { titulo:    { not: '' } },
        { avatarUrl: { not: null } }, { avatarUrl: { not: '' } },
      ],
    };

    if (search.trim()) {
      where.AND.push({
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { titulo:   { contains: search, mode: 'insensitive' } },
          { email:    { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (ubicacion.trim()) {
      where.AND.push({ ubicacion: { contains: ubicacion.trim(), mode: 'insensitive' } });
    }

    if (aniosExpMin !== null && aniosExpMin > 0) {
      where.AND.push({
        candidato: {
          habilidades: {
            some: { aniosExp: { gte: aniosExpMin } },
          },
        },
      });
    }

    // Vacante seleccionada → match score + marcar postulados
    let vacante: any      = null;
    let postulacionesSet  = new Set<string>();
    let postulacionIdMap  = new Map<string, string>();

    if (vacanteId) {
      vacante = await this.prisma.ofertaLaboral.findFirst({
        where:  { id: vacanteId, empresaId: userId },
        select: { id: true, requisitos: true, experienciaMinima: true },
      });
      if (vacante) {
        const posts = await this.prisma.postulacion.findMany({
          where:  { ofertaId: vacanteId },
          select: { id: true, candidatoId: true },
        });
        postulacionesSet = new Set(posts.map((p) => p.candidatoId));
        postulacionIdMap = new Map(posts.map((p) => [p.candidatoId, p.id]));
      }
    }

    const [rows, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take:    limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id:        true,
          fullName:  true,
          email:     true,
          avatarUrl: true,
          titulo:    true,
          ubicacion: true,
          createdAt: true,
          candidato: {
            select: {
              habilidades: {
                select: {
                  nivel:     true,
                  aniosExp:  true,
                  habilidad: { select: { nombre: true } },
                },
                orderBy: { aniosExp: 'desc' },
              },
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const candidatos = rows.map((u) => {
      const skills     = u.candidato?.habilidades ?? [];
      const skillNames = skills.map((h) => h.habilidad.nombre);
      const topSkills  = skillNames.slice(0, 4);
      const techInitials = topSkills.map((s) =>
        s.length <= 3
          ? s.toUpperCase()
          : s.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2),
      );
      const totalExp = skills.reduce((max, h) => Math.max(max, h.aniosExp ?? 0), 0);
      const scoreDetalle = vacante
        ? calcMatchScoreDetailed(skillNames, totalExp, vacante.requisitos, vacante.experienciaMinima ?? 0)
        : null;
      const score        = scoreDetalle?.total ?? null;
      const scoreDesglose = scoreDetalle
        ? { habilidades: scoreDetalle.skillsScore, experiencia: scoreDetalle.expScore }
        : null;
      const postulado     = vacante ? postulacionesSet.has(u.id) : false;
      const postulacionId = vacante ? (postulacionIdMap.get(u.id) ?? null) : null;

      return {
        id:            u.id,
        name:          u.fullName,
        role:          u.titulo ?? 'Candidato',
        avatar:        u.avatarUrl ?? null,
        available:     true,
        skills:        topSkills,
        location:      u.ubicacion ?? 'Sin ubicación',
        experience:    totalExp > 0 ? `${totalExp} años de experiencia` : 'Sin experiencia registrada',
        techInitials,
        score,
        scoreDesglose,
        postulado,
        postulacionId,
        createdAt:     u.createdAt,
      };
    });

    // Si hay vacante: postulados primero, luego por score desc
    if (vacante) {
      candidatos.sort((a, b) => {
        if (a.postulado && !b.postulado) return -1;
        if (!a.postulado && b.postulado) return 1;
        return (b.score ?? 0) - (a.score ?? 0);
      });
    }

    return {
      candidatos,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ────────────────────────────────────────────────────────────
  // GET /api/candidatos/habilidades
  // ────────────────────────────────────────────────────────────
  async getHabilidades(userId: string) {
    const habilidades = await this.prisma.candidatoHabilidad.findMany({
      where:   { candidatoId: userId },
      select: {
        nivel:      true,
        aniosExp:   true,
        verificada: true,
        habilidad:  { select: { id: true, nombre: true } },
      },
      orderBy: { aniosExp: 'desc' },
    });
    const skills = habilidades.map((h) => ({
      id:         h.habilidad.id,
      nombre:     h.habilidad.nombre,
      nivel:      h.nivel,
      aniosExp:   h.aniosExp,
      verificada: h.verificada,
    }));
    return { skills };
  }
}
