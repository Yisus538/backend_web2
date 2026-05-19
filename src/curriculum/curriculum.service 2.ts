import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CurriculumService {
  constructor(private prisma: PrismaService) {}

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
    const { idioma, nivel, certificacion, analisisOrigenId } = body;
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
        candidatoId:      userId,
        idioma,
        nivel,
        certificacion:    certificacion    || null,
        analisisOrigenId: analisisOrigenId || null,
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
    const { empresa, cargo, fechaInicio, fechaFin, actual, descripcion, modalidad, analisisOrigenId } = body;
    if (!empresa || !cargo || !fechaInicio) {
      throw new BadRequestException('Empresa, cargo y fecha de inicio son requeridos');
    }
    return this.prisma.experienciaLaboral.create({
      data: {
        candidatoId:      userId,
        empresa,
        cargo,
        fechaInicio,
        fechaFin:         actual ? null : (fechaFin || null),
        actual:           !!actual,
        descripcion:      descripcion      || null,
        modalidad:        modalidad        || null,
        analisisOrigenId: analisisOrigenId || null,
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
    const { institucion, titulo, campo, fechaInicio, fechaFin, cursando, descripcion, analisisOrigenId } = body;
    if (!institucion || !titulo || !fechaInicio) {
      throw new BadRequestException('Institución, título y fecha de inicio son requeridos');
    }
    return this.prisma.educacion.create({
      data: {
        candidatoId:      userId,
        institucion,
        titulo,
        campo:            campo            || null,
        fechaInicio,
        fechaFin:         cursando ? null : (fechaFin || null),
        cursando:         !!cursando,
        descripcion:      descripcion      || null,
        analisisOrigenId: analisisOrigenId || null,
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
