import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Réplica exacta del helper duplicado en /api/candidatos y /api/vacantes/recomendadas
function calcMatchScore(candidateSkills: string[], requisitos: any): number {
  const techSkills: string[] = (requisitos?.techSkills ?? [])
    .filter((s: any) => s.selected)
    .map((s: any) => s.label.toLowerCase());
  const softSkills: string[] = (requisitos?.softSkills ?? [])
    .filter((s: any) => s.selected)
    .map((s: any) => s.label.toLowerCase());
  const allRequired = [...techSkills, ...softSkills];
  if (allRequired.length === 0) return 75;
  const lower   = candidateSkills.map((s) => s.toLowerCase());
  const matches = allRequired.filter((r) => lower.includes(r));
  return Math.round((matches.length / allRequired.length) * 100);
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
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Candidato no encontrado');

    // Buscar cvUrl: postulación más reciente de este candidato a una vacante de esta empresa
    const postulacion = await this.prisma.postulacion.findFirst({
      where: {
        candidatoId: candidatoId,
        oferta: { empresaId: companyId },
      },
      select: { urlCv: true },
      orderBy: { creadaEl: 'desc' },
    });

    const skills = user.candidato?.habilidades ?? [];
    const skillNames = skills.map((h) => h.habilidad.nombre);
    const totalExp = skills.reduce((max, h) => Math.max(max, h.aniosExp ?? 0), 0);

    return {
      id:         user.id,
      name:       user.fullName,
      email:      user.email,
      avatar:     user.avatarUrl ?? null,
      role:       user.titulo ?? 'Candidato',
      location:   user.ubicacion ?? '',
      biografia:  user.candidato?.biografia ?? null,
      experience: totalExp > 0 ? `${totalExp} años` : 'Sin experiencia registrada',
      skills:     skillNames,
      idiomas:    user.candidato?.idiomas   ?? [],
      educacion:  user.candidato?.educacion ?? [],
      experiencia: user.candidato?.experiencia ?? [],
      cvUrl:      postulacion?.urlCv ?? null,
    };
  }

  // ────────────────────────────────────────────────────────────
  // GET /api/candidatos  — empresas ven candidatos
  // ────────────────────────────────────────────────────────────
  async listar(userId: string, q: any) {
    const search    = (q.search    ?? '') as string;
    const vacanteId = (q.vacanteId ?? null) as string | null;
    const page      = Math.max(1, parseInt(q.page  ?? '1',  10));
    const limit     = Math.min(50, Math.max(1, parseInt(q.limit ?? '20', 10)));
    const skip      = (page - 1) * limit;

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

    // Vacante seleccionada → match score + marcar postulados
    let vacante: any      = null;
    let postulacionesSet  = new Set<string>();

    if (vacanteId) {
      vacante = await this.prisma.ofertaLaboral.findFirst({
        where:  { id: vacanteId, empresaId: userId },
        select: { id: true, requisitos: true },
      });
      if (vacante) {
        const posts = await this.prisma.postulacion.findMany({
          where:  { ofertaId: vacanteId },
          select: { candidatoId: true },
        });
        postulacionesSet = new Set(posts.map((p) => p.candidatoId));
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
      const score    = vacante ? calcMatchScore(skillNames, vacante.requisitos) : null;
      const postulado = vacante ? postulacionesSet.has(u.id) : false;

      return {
        id:          u.id,
        name:        u.fullName,
        role:        u.titulo ?? 'Candidato',
        avatar:      u.avatarUrl ?? null,
        available:   true,
        skills:      topSkills,
        location:    u.ubicacion ?? 'Sin ubicación',
        experience:  totalExp > 0 ? `${totalExp} años de experiencia` : 'Sin experiencia registrada',
        techInitials,
        score,
        postulado,
        createdAt:   u.createdAt,
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

  // ────────────────────────────────────────────────────────────
  // IDIOMAS  GET / POST / PATCH / DELETE
  // ────────────────────────────────────────────────────────────
  async getIdiomas(userId: string) {
    return this.prisma.idioma.findMany({
      where:   { candidatoId: userId },
      orderBy: { creadaEl: 'asc' },
    });
  }

  async addIdioma(userId: string, body: any) {
    const { idioma, nivel, certificacion } = body;
    if (!idioma || !nivel) throw new BadRequestException('Idioma y nivel son requeridos');
    const validNiveles = ['basico', 'intermedio', 'avanzado', 'nativo'];
    if (!validNiveles.includes(nivel)) {
      throw new BadRequestException(`Nivel inválido. Opciones: ${validNiveles.join(', ')}`);
    }
    const dup = await this.prisma.idioma.findFirst({
      where: { candidatoId: userId, idioma },
    });
    if (dup) throw new ConflictException('Ya tenés ese idioma registrado');

    return this.prisma.idioma.create({
      data: {
        candidatoId:   userId,
        idioma,
        nivel,
        certificacion: certificacion || null,
      },
    });
  }

  async updateIdioma(userId: string, body: any) {
    const { id, ...updates } = body;
    if (!id) throw new BadRequestException('id es requerido');
    const item = await this.prisma.idioma.findFirst({ where: { id, candidatoId: userId } });
    if (!item) throw new NotFoundException('Registro no encontrado');
    return this.prisma.idioma.update({ where: { id }, data: updates });
  }

  async deleteIdioma(userId: string, id: string) {
    if (!id) throw new BadRequestException('id es requerido');
    const item = await this.prisma.idioma.findFirst({ where: { id, candidatoId: userId } });
    if (!item) throw new NotFoundException('Registro no encontrado');
    await this.prisma.idioma.delete({ where: { id } });
  }

  // ────────────────────────────────────────────────────────────
  // EXPERIENCIA  GET / POST / PATCH / DELETE
  // ────────────────────────────────────────────────────────────
  async getExperiencia(userId: string) {
    return this.prisma.experienciaLaboral.findMany({
      where:   { candidatoId: userId },
      orderBy: { fechaInicio: 'desc' },
    });
  }

  async addExperiencia(userId: string, body: any) {
    const { empresa, cargo, fechaInicio, fechaFin, actual, descripcion, modalidad } = body;
    if (!empresa || !cargo || !fechaInicio) {
      throw new BadRequestException('Empresa, cargo y fecha de inicio son requeridos');
    }
    return this.prisma.experienciaLaboral.create({
      data: {
        candidatoId: userId,
        empresa,
        cargo,
        fechaInicio,
        fechaFin:    actual ? null : (fechaFin || null),
        actual:      !!actual,
        descripcion: descripcion || null,
        modalidad:   modalidad   || null,
      },
    });
  }

  async updateExperiencia(userId: string, body: any) {
    const { id, ...updates } = body;
    if (!id) throw new BadRequestException('id es requerido');
    const item = await this.prisma.experienciaLaboral.findFirst({
      where: { id, candidatoId: userId },
    });
    if (!item) throw new NotFoundException('Registro no encontrado');
    if (updates.actual) updates.fechaFin = null;
    return this.prisma.experienciaLaboral.update({ where: { id }, data: updates });
  }

  async deleteExperiencia(userId: string, id: string) {
    if (!id) throw new BadRequestException('id es requerido');
    const item = await this.prisma.experienciaLaboral.findFirst({
      where: { id, candidatoId: userId },
    });
    if (!item) throw new NotFoundException('Registro no encontrado');
    await this.prisma.experienciaLaboral.delete({ where: { id } });
  }

  // ────────────────────────────────────────────────────────────
  // EDUCACIÓN  GET / POST / PATCH / DELETE
  // ────────────────────────────────────────────────────────────
  async getEducacion(userId: string) {
    return this.prisma.educacion.findMany({
      where:   { candidatoId: userId },
      orderBy: { fechaInicio: 'desc' },
    });
  }

  async addEducacion(userId: string, body: any) {
    const { institucion, titulo, campo, fechaInicio, fechaFin, cursando, descripcion } = body;
    if (!institucion || !titulo || !fechaInicio) {
      throw new BadRequestException('Institución, título y fecha de inicio son requeridos');
    }
    return this.prisma.educacion.create({
      data: {
        candidatoId: userId,
        institucion,
        titulo,
        campo:       campo       || null,
        fechaInicio,
        fechaFin:    cursando ? null : (fechaFin || null),
        cursando:    !!cursando,
        descripcion: descripcion || null,
      },
    });
  }

  async updateEducacion(userId: string, body: any) {
    const { id, ...updates } = body;
    if (!id) throw new BadRequestException('id es requerido');
    const item = await this.prisma.educacion.findFirst({ where: { id, candidatoId: userId } });
    if (!item) throw new NotFoundException('Registro no encontrado');
    if (updates.cursando) updates.fechaFin = null;
    return this.prisma.educacion.update({ where: { id }, data: updates });
  }

  async deleteEducacion(userId: string, id: string) {
    if (!id) throw new BadRequestException('id es requerido');
    const item = await this.prisma.educacion.findFirst({ where: { id, candidatoId: userId } });
    if (!item) throw new NotFoundException('Registro no encontrado');
    await this.prisma.educacion.delete({ where: { id } });
  }
}
