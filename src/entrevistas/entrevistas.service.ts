import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class EntrevistasService {
  constructor(
    private prisma: PrismaService,
    private email:  EmailService,
  ) {}

  // ── GET /api/entrevistas — empresa ve sus entrevistas ──────
  async listarEmpresa(empresaUserId: string) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { usuarioId: empresaUserId },
    });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');

    const entrevistas = await this.prisma.entrevista.findMany({
      where: {
        postulacion: { oferta: { empresaId: empresa.usuarioId } },
      },
      orderBy: { fecha: 'asc' },
      include: {
        postulacion: {
          include: {
            candidato: {
              include: {
                usuario: {
                  select: { fullName: true, email: true, avatarUrl: true },
                },
              },
            },
            oferta:   { select: { titulo: true } },
            analisis: { select: { puntuacion: true, apto: true, fortalezas: true, debilidades: true, resumen: true } },
          },
        },
      },
    });

    return entrevistas.map(e => ({
      id:           e.id,
      fecha:        e.fecha,
      duracionMin:  e.duracionMin,
      tipo:         e.tipo,
      linkMeet:     e.linkMeet,
      ubicacion:    e.ubicacion,
      notas:        e.notas,
      estado:       e.estado,
      candidato: {
        nombre:      e.postulacion.candidato.usuario.fullName,
        email:       e.postulacion.candidato.usuario.email,
        avatar:      e.postulacion.candidato.usuario.avatarUrl,
        candidatoId: e.postulacion.candidato.usuarioId,
      },
      vacante:      e.postulacion.oferta.titulo,
      matchScore:   e.postulacion.analisis?.puntuacion ?? null,
      apto:         e.postulacion.analisis?.apto ?? null,
      fortalezas:   e.postulacion.analisis?.fortalezas ?? [],
      debilidades:  e.postulacion.analisis?.debilidades ?? [],
      resumenIA:    e.postulacion.analisis?.resumen ?? null,
      postulacionId: e.postulacionId,
    }));
  }

  // ── GET /api/entrevistas/candidato — candidato ve las suyas ─
  async listarCandidato(candidatoUserId: string) {
    const entrevistas = await this.prisma.entrevista.findMany({
      where: {
        postulacion: { candidatoId: candidatoUserId },
      },
      orderBy: { fecha: 'asc' },
      include: {
        postulacion: {
          include: {
            oferta: {
              include: {
                empresa: {
                  include: {
                    usuario: { select: { fullName: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    return entrevistas.map(e => ({
      id:          e.id,
      fecha:       e.fecha,
      duracionMin: e.duracionMin,
      tipo:        e.tipo,
      linkMeet:    e.linkMeet,
      ubicacion:   e.ubicacion,
      estado:      e.estado,
      vacante:     e.postulacion.oferta.titulo,
      empresa:     e.postulacion.oferta.empresa.nombreEmpresa
                     ?? e.postulacion.oferta.empresa.usuario.fullName,
    }));
  }

  // ── PATCH /api/entrevistas/:id — empresa confirma detalles ──
  async confirmar(
    empresaUserId: string,
    entrevistaId: string,
    dto: {
      fecha?:       Date;
      duracionMin?: number;
      tipo?:        string;
      linkMeet?:    string;
      ubicacion?:   string;
      notas?:       string;
      estado?:      string;
    },
  ) {
    const TIPOS_VALIDOS   = ['presencial', 'remota', 'pendiente'];
    const ESTADOS_VALIDOS = ['pendiente', 'confirmada', 'realizada', 'cancelada'];

    if (dto.tipo   && !TIPOS_VALIDOS.includes(dto.tipo)) {
      throw new BadRequestException('Tipo inválido');
    }
    if (dto.estado && !ESTADOS_VALIDOS.includes(dto.estado)) {
      throw new BadRequestException('Estado de entrevista inválido');
    }

    const entrevista = await this.prisma.entrevista.findFirst({
      where: {
        id: entrevistaId,
        postulacion: { oferta: { empresa: { usuarioId: empresaUserId } } },
      },
      include: {
        postulacion: {
          include: {
            candidato: { include: { usuario: { select: { email: true, fullName: true } } } },
            oferta:    { select: { titulo: true } },
          },
        },
      },
    });
    if (!entrevista) throw new NotFoundException('Entrevista no encontrada');

    const estabaConfirmada = entrevista.estado === 'confirmada';

    const updated = await this.prisma.entrevista.update({
      where: { id: entrevistaId },
      data: {
        ...(dto.fecha       !== undefined && { fecha:       dto.fecha }),
        ...(dto.duracionMin !== undefined && { duracionMin: dto.duracionMin }),
        ...(dto.tipo        !== undefined && { tipo:        dto.tipo }),
        ...(dto.linkMeet    !== undefined && { linkMeet:    dto.linkMeet }),
        ...(dto.ubicacion   !== undefined && { ubicacion:   dto.ubicacion }),
        ...(dto.notas       !== undefined && { notas:       dto.notas }),
        ...(dto.estado      !== undefined && { estado:      dto.estado }),
      },
    });

    const candidatoEmail  = entrevista.postulacion.candidato.usuario.email;
    const candidatoNombre = entrevista.postulacion.candidato.usuario.fullName;
    const vacanteNombre   = entrevista.postulacion.oferta.titulo;

    if (dto.estado === 'confirmada' && !estabaConfirmada) {
      this.email.sendConfirmacionEntrevista(
        candidatoEmail,
        candidatoNombre,
        vacanteNombre,
        updated.fecha ?? null,
        updated.linkMeet ?? null,
        updated.ubicacion ?? null,
        updated.tipo,
      ).catch(err => console.error('[entrevista/confirmar] email:', err));
    }

    return updated;
  }
}
