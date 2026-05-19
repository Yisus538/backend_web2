import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calcMatchScore } from '../common/utils/match-score.utils';

@Injectable()
export class FavoritosService {
  constructor(private readonly prisma: PrismaService) {}

  // GET /api/favoritos
  async listar(candidatoId: string) {
    const rows = await this.prisma.vacanteFavorita.findMany({
      where:   { candidatoId },
      orderBy: { guardadoEl: 'desc' },
      include: {
        oferta: {
          select: {
            id:          true,
            titulo:      true,
            descripcion: true,
            categoria:   true,
            modalidad:   true,
            ubicacion:   true,
            creadaEl:    true,
            requisitos:  true,
            empresa: {
              select: {
                nombreEmpresa: true,
                usuario:       { select: { ubicacion: true } },
              },
            },
          },
        },
      },
    });

    if (rows.length === 0) return { favoritos: [] };

    // Match score: habilidades del candidato una sola vez
    const habilidades = await this.prisma.candidatoHabilidad.findMany({
      where:  { candidatoId },
      select: { habilidad: { select: { nombre: true } } },
    });
    const candidateSkills = habilidades.map((h) => h.habilidad.nombre);

    // Verificar cuáles ya tienen postulación
    const ofertaIds = rows.map((r) => r.ofertaId);
    const postulaciones = await this.prisma.postulacion.findMany({
      where:  { candidatoId, ofertaId: { in: ofertaIds } },
      select: { ofertaId: true },
    });
    const aplicadas = new Set(postulaciones.map((p) => p.ofertaId));

    const favoritos = rows.map((r) => ({
      id:          r.oferta.id,
      titulo:      r.oferta.titulo,
      descripcion: r.oferta.descripcion,
      categoria:   r.oferta.categoria,
      modalidad:   r.oferta.modalidad ?? 'Sin especificar',
      empresa:     r.oferta.empresa?.nombreEmpresa ?? 'Empresa',
      ubicacion:   r.oferta.empresa?.usuario?.ubicacion ?? r.oferta.ubicacion ?? 'Sin ubicación',
      creadaEl:    r.oferta.creadaEl,
      savedAt:     r.guardadoEl,
      matchScore:  calcMatchScore(candidateSkills, r.oferta.requisitos),
      yaAplico:    aplicadas.has(r.ofertaId),
    }));

    return { favoritos };
  }

  // POST /api/favoritos/:ofertaId
  async guardar(candidatoId: string, ofertaId: string) {
    const oferta = await this.prisma.ofertaLaboral.findFirst({
      where: { id: ofertaId, estado: 'abierta' },
      select: {
        id: true, titulo: true, descripcion: true,
        categoria: true, modalidad: true, ubicacion: true, creadaEl: true, requisitos: true,
        empresa: {
          select: {
            nombreEmpresa: true,
            usuario:       { select: { ubicacion: true } },
          },
        },
      },
    });
    if (!oferta) throw new NotFoundException('Vacante no encontrada o no está activa');

    try {
      const fav = await this.prisma.vacanteFavorita.create({
        data: { candidatoId, ofertaId },
      });

      const habilidades = await this.prisma.candidatoHabilidad.findMany({
        where:  { candidatoId },
        select: { habilidad: { select: { nombre: true } } },
      });
      const candidateSkills = habilidades.map((h) => h.habilidad.nombre);

      const postulacion = await this.prisma.postulacion.findFirst({
        where:  { candidatoId, ofertaId },
        select: { id: true },
      });

      return {
        favorito: {
          id:          oferta.id,
          titulo:      oferta.titulo,
          descripcion: oferta.descripcion,
          categoria:   oferta.categoria,
          modalidad:   oferta.modalidad ?? 'Sin especificar',
          empresa:     oferta.empresa?.nombreEmpresa ?? 'Empresa',
          ubicacion:   oferta.empresa?.usuario?.ubicacion ?? oferta.ubicacion ?? 'Sin ubicación',
          creadaEl:    oferta.creadaEl,
          savedAt:     fav.guardadoEl,
          matchScore:  calcMatchScore(candidateSkills, oferta.requisitos),
          yaAplico:    !!postulacion,
        },
      };
    } catch (err: any) {
      // Unique constraint violation → ya existe
      if (err?.code === 'P2002') throw new ConflictException('La vacante ya está en favoritos');
      throw err;
    }
  }

  // DELETE /api/favoritos/:ofertaId
  async eliminar(candidatoId: string, ofertaId: string) {
    const existing = await this.prisma.vacanteFavorita.findUnique({
      where: { candidatoId_ofertaId: { candidatoId, ofertaId } },
    });
    if (!existing) throw new NotFoundException('El favorito no existe');

    await this.prisma.vacanteFavorita.delete({
      where: { candidatoId_ofertaId: { candidatoId, ofertaId } },
    });
  }
}
