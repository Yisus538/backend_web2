import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const STATUS_META: Record<string, any> = {
  pendiente:  { label: 'Pendiente',   class: 'blue',   nextStep: 'En espera de revisión', nextStepType: 'pending' },
  revision:   { label: 'En Revisión', class: 'blue',   nextStep: 'Pendiente RRHH',        nextStepType: 'pending' },
  entrevista: { label: 'Entrevista',  class: 'yellow', nextStep: 'Entrevista programada', nextStepType: 'urgent'  },
  finalista:  { label: 'Finalista',   class: 'green',  nextStep: 'Oferta enviada',        nextStepType: 'success' },
  contratado: { label: 'Contratado',  class: 'green',  nextStep: 'Proceso completado',    nextStepType: 'success' },
  rechazado:  { label: 'Rechazado',   class: 'slate',  nextStep: 'Proceso cerrado',       nextStepType: 'closed'  },
};

@Injectable()
export class PostulacionesService {
  constructor(private prisma: PrismaService) {}

  // ────────────────────────────────────────────────────────────
  // GET /api/postulaciones
  // ────────────────────────────────────────────────────────────
  async listar(userId: string, estado?: string) {
    const where: any = { candidatoId: userId };

    if (estado && estado !== 'todas') {
      const MAP: Record<string, string[]> = {
        'en-curso':   ['pendiente', 'revision', 'entrevista'],
        'entrevista': ['entrevista'],
        'finalista':  ['finalista', 'rechazado', 'contratado'],
      };
      if (MAP[estado]) where.estado = { in: MAP[estado] };
    }

    const rows = await this.prisma.postulacion.findMany({
      where,
      orderBy: { creadaEl: 'desc' },
      select: {
        id:       true,
        estado:   true,
        creadaEl: true,
        oferta: {
          select: {
            titulo: true,
            empresa: {
              select: {
                nombreEmpresa: true,
                usuario: { select: { fullName: true } },
              },
            },
          },
        },
        analisis: { select: { puntuacion: true } },
      },
    });

    const candidaturas = rows.map((r) => {
      const meta = STATUS_META[r.estado] ?? STATUS_META.pendiente;
      return {
        id:           r.id,
        title:        r.oferta.titulo,
        company:      r.oferta.empresa.nombreEmpresa || r.oferta.empresa.usuario.fullName,
        date:         r.creadaEl,
        status:       r.estado,
        statusLabel:  meta.label,
        statusClass:  meta.class,
        matchScore:   r.analisis?.puntuacion ?? null,
        nextStep:     meta.nextStep,
        nextStepType: meta.nextStepType,
      };
    });

    return { candidaturas, total: candidaturas.length };
  }

  // ────────────────────────────────────────────────────────────
  // POST /api/postulaciones
  // ────────────────────────────────────────────────────────────
  async crear(userId: string, ofertaId: string) {
    if (!ofertaId || typeof ofertaId !== 'string') {
      throw new BadRequestException('ofertaId es requerido');
    }

    const oferta = await this.prisma.ofertaLaboral.findFirst({
      where: { id: ofertaId, estado: 'abierta' },
    });
    if (!oferta) throw new NotFoundException('La vacante no existe o no está disponible');

    // Auto-crear perfil candidato si no existe
    const candidato = await this.prisma.candidato.findUnique({
      where: { usuarioId: userId },
    });
    if (!candidato) {
      await this.prisma.candidato.create({ data: { usuarioId: userId } });
    }

    // Verificar duplicado
    const existente = await this.prisma.postulacion.findUnique({
      where: { ofertaId_candidatoId: { ofertaId, candidatoId: userId } },
    });
    if (existente) throw new ConflictException('Ya te postulaste a esta vacante');

    return this.prisma.postulacion.create({
      data: {
        ofertaId,
        candidatoId: userId,
        urlCv:       '',
        estado:      'pendiente',
      },
      select: {
        id:       true,
        estado:   true,
        creadaEl: true,
        oferta:   { select: { titulo: true } },
      },
    });
  }

  // ────────────────────────────────────────────────────────────
  // DELETE /api/postulaciones?id=xxx
  // ────────────────────────────────────────────────────────────
  async retirar(userId: string, id: string) {
    if (!id) throw new BadRequestException('id es requerido');

    const postulacion = await this.prisma.postulacion.findFirst({
      where: { id, candidatoId: userId },
    });
    if (!postulacion) throw new NotFoundException('Postulación no encontrada');

    await this.prisma.postulacion.delete({ where: { id } });
  }
}
