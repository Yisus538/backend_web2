import { prisma } from './user.model';

export interface VacanteCreateData {
  titulo:            string;
  descripcion:       string;
  estado:            string;
  categoria?:        string;
  modalidad?:        string;
  experienciaMinima: number;
  requisitos?:       object;
  matchingWeights?:  object;
}

export interface VacanteUpdateData extends Partial<VacanteCreateData> {}

const VACANTE_SELECT = {
  id:                true,
  titulo:            true,
  descripcion:       true,
  estado:            true,
  categoria:         true,
  modalidad:         true,
  experienciaMinima: true,
  requisitos:        true,
  matchingWeights:   true,
  creadaEl:          true,
  actualizadoEl:     true,
  empresaId:         true,
  _count: { select: { postulaciones: true } },
};

export const findAllByEmpresa = (
  empresaId: string,
  filters: { estado?: string; search?: string },
) => {
  const where: any = { empresaId };

  if (filters.estado && filters.estado !== 'todas') {
    where.estado = filters.estado;
  }

  if (filters.search) {
    where.OR = [
      { titulo:    { contains: filters.search, mode: 'insensitive' } },
      { categoria: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return prisma.ofertaLaboral.findMany({
    where,
    select:  VACANTE_SELECT,
    orderBy: { creadaEl: 'desc' },
  });
};

export const findById = (id: string, empresaId: string) =>
  prisma.ofertaLaboral.findFirst({
    where:  { id, empresaId },
    select: VACANTE_SELECT,
  });

export const createVacante = (empresaId: string, data: VacanteCreateData) =>
  prisma.ofertaLaboral.create({
    data:   { empresaId, ...data },
    select: VACANTE_SELECT,
  });

export const updateVacante = (id: string, empresaId: string, data: VacanteUpdateData) =>
  prisma.ofertaLaboral.updateMany({
    where: { id, empresaId },
    data,
  });

export const updateEstado = (id: string, empresaId: string, estado: string) =>
  prisma.ofertaLaboral.updateMany({
    where: { id, empresaId },
    data:  { estado },
  });

export const deleteVacante = (id: string, empresaId: string) =>
  prisma.ofertaLaboral.deleteMany({
    where: { id, empresaId },
  });

export const belongsToEmpresa = async (id: string, empresaId: string): Promise<boolean> => {
  const count = await prisma.ofertaLaboral.count({ where: { id, empresaId } });
  return count > 0;
};