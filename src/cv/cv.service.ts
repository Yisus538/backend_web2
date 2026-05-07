import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CvService {
  constructor(private prisma: PrismaService) {}

  async getAnalisis(candidatoId: string) {
    return this.prisma.analisisCvDirecto.findFirst({
      where: { candidatoId },
      orderBy: { analizadoEl: 'desc' },
    });
  }
}
