import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnviarMensajeDto } from './dto/enviar-mensaje.dto';
import { CrearConversacionDto } from './dto/crear-conversacion.dto';

const iniciales = (nombre: string) =>
  nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

@Injectable()
export class MensajesService {
  constructor(private prisma: PrismaService) {}

  // ── GET /mensajes/conversaciones ──────────────────────────────────
  async listar(userId: string, role: string) {
    const where =
      role === 'company'
        ? { postulacion: { oferta: { empresaId: userId } } }
        : { postulacion: { candidatoId: userId } };

    const convs = await this.prisma.conversacion.findMany({
      where,
      include: {
        postulacion: {
          include: {
            oferta: {
              select: {
                id: true,
                titulo: true,
                empresa: {
                  include: { usuario: { select: { id: true, fullName: true } } },
                },
              },
            },
            candidato: {
              include: { usuario: { select: { id: true, fullName: true } } },
            },
          },
        },
        mensajes: {
          orderBy: { creadoEn: 'desc' },
          take: 1,
          select: { texto: true, creadoEn: true },
        },
      },
    });

    if (convs.length === 0) return [];

    const unreadCounts = await this.prisma.mensaje.groupBy({
      by: ['conversacionId'],
      where: {
        conversacionId: { in: convs.map((c) => c.id) },
        autorId: { not: userId },
        leido: false,
      },
      _count: { id: true },
    });

    const unreadMap = new Map(
      unreadCounts.map((u) => [u.conversacionId, u._count.id]),
    );

    return convs
      .map((conv) => {
        const lastMsg = conv.mensajes[0] ?? null;
        const noLeidos = unreadMap.get(conv.id) ?? 0;

        let participante: { id: string; nombre: string; iniciales: string };
        if (role === 'company') {
          const u = conv.postulacion.candidato.usuario;
          participante = { id: u.id, nombre: u.fullName, iniciales: iniciales(u.fullName) };
        } else {
          const emp = conv.postulacion.oferta.empresa;
          const nombre = emp.nombreEmpresa ?? emp.usuario.fullName;
          participante = { id: emp.usuarioId, nombre, iniciales: iniciales(nombre) };
        }

        return {
          id: conv.id,
          participante,
          vacanteId: conv.postulacion.oferta.id,
          vacanteTitulo: conv.postulacion.oferta.titulo,
          ultimoMensaje: lastMsg?.texto ?? '',
          ultimaFecha: (lastMsg?.creadoEn ?? conv.creadaEl).toISOString(),
          noLeidos,
        };
      })
      .sort(
        (a, b) => new Date(b.ultimaFecha).getTime() - new Date(a.ultimaFecha).getTime(),
      );
  }

  // ── GET /mensajes/conversaciones/:convId ─────────────────────────
  async obtenerMensajes(userId: string, convId: string) {
    await this.verificarParticipante(userId, convId);

    const mensajes = await this.prisma.mensaje.findMany({
      where: { conversacionId: convId },
      orderBy: { creadoEn: 'asc' },
      select: {
        id: true,
        texto: true,
        creadoEn: true,
        autorId: true,
      },
    });

    return mensajes.map((m) => ({
      id: m.id,
      texto: m.texto,
      creadoEn: m.creadoEn.toISOString(),
      esPropio: m.autorId === userId,
    }));
  }

  // ── POST /mensajes ────────────────────────────────────────────────
  async enviar(userId: string, dto: EnviarMensajeDto) {
    if (!dto.texto?.trim()) throw new BadRequestException('El texto no puede estar vacío');

    await this.verificarParticipante(userId, dto.conversacionId);

    const msg = await this.prisma.mensaje.create({
      data: {
        conversacionId: dto.conversacionId,
        autorId: userId,
        texto: dto.texto.trim(),
      },
      select: { id: true, texto: true, creadoEn: true },
    });

    return {
      id: msg.id,
      texto: msg.texto,
      creadoEn: msg.creadoEn.toISOString(),
      esPropio: true,
    };
  }

  // ── PATCH /mensajes/conversaciones/:convId/leer ───────────────────
  async marcarLeidos(userId: string, convId: string) {
    await this.verificarParticipante(userId, convId);

    await this.prisma.mensaje.updateMany({
      where: { conversacionId: convId, autorId: { not: userId }, leido: false },
      data: { leido: true },
    });
  }

  // ── GET /mensajes/no-leidos ───────────────────────────────────────
  async contarNoLeidos(userId: string) {
    const total = await this.prisma.mensaje.count({
      where: {
        leido: false,
        autorId: { not: userId },
        conversacion: {
          OR: [
            { postulacion: { candidatoId: userId } },
            { postulacion: { oferta: { empresaId: userId } } },
          ],
        },
      },
    });

    return { total };
  }

  // ── POST /mensajes/conversaciones ────────────────────────────────
  async crearConversacion(userId: string, role: string, dto: CrearConversacionDto) {
    const { postulacionId } = dto;

    const postulacion = await this.prisma.postulacion.findUnique({
      where: { id: postulacionId },
      include: { oferta: { select: { empresaId: true } } },
    });

    if (!postulacion) throw new NotFoundException('Postulación no encontrada');

    const esCandidato = postulacion.candidatoId === userId;
    const esEmpresa   = postulacion.oferta.empresaId === userId;

    if (!esCandidato && !esEmpresa) {
      throw new ForbiddenException('No tenés acceso a esta postulación');
    }

    const existente = await this.prisma.conversacion.findUnique({
      where: { postulacionId },
    });
    if (existente) return { id: existente.id };

    const nueva = await this.prisma.conversacion.create({
      data: { postulacionId },
      select: { id: true },
    });

    return { id: nueva.id };
  }

  // ── Privado ───────────────────────────────────────────────────────
  private async verificarParticipante(userId: string, convId: string) {
    const conv = await this.prisma.conversacion.findUnique({
      where: { id: convId },
      include: { postulacion: { include: { oferta: { select: { empresaId: true } } } } },
    });

    if (!conv) throw new NotFoundException('Conversación no encontrada');

    const esCandidato = conv.postulacion.candidatoId === userId;
    const esEmpresa   = conv.postulacion.oferta.empresaId === userId;

    if (!esCandidato && !esEmpresa) {
      throw new ForbiddenException('No tenés acceso a esta conversación');
    }
  }
}
