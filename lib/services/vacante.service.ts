import * as VacanteModel from '../models/vacante.model';
import type { CreateVacanteDTO, UpdateVacanteDTO, UpdateEstadoDTO } from '../validations/vacante.validations.ts';
import { findById as findUser } from '../models/user.model';
import { prisma } from '../models/user.model';

async function getEmpresaId(userId: string): Promise<string> {
  const user = await findUser(userId);
  if (!user || user.role !== 'company') throw new Error('NOT_EMPRESA');

  const empresa = await prisma.empresa.findUnique({ where: { usuarioId: userId } });
  if (!empresa) {
    await prisma.empresa.create({ data: { usuarioId: userId } });
  }

  return userId;
}

export const listarVacantes = async (
  userId:  string,
  filters: { estado?: string; search?: string },
) => {
  const empresaId = await getEmpresaId(userId);
  return VacanteModel.findAllByEmpresa(empresaId, filters);
};

export const obtenerVacante = async (userId: string, id: string) => {
  const empresaId = await getEmpresaId(userId);
  const vacante   = await VacanteModel.findById(id, empresaId);
  if (!vacante) throw new Error('VACANTE_NOT_FOUND');
  return vacante;
};


export const crearVacante = async (userId: string, dto: CreateVacanteDTO) => {
  const empresaId = await getEmpresaId(userId);
  return VacanteModel.createVacante(empresaId, {
    titulo:            dto.titulo,
    descripcion:       dto.descripcion,
    estado:            dto.estado ?? 'borrador',
    categoria:         dto.categoria,
    modalidad:         dto.modalidad,
    experienciaMinima: dto.experienciaMinima ?? 0,
    requisitos:        dto.requisitos   as object | undefined,
    matchingWeights:   dto.matchingWeights as object | undefined,
  });
};

export const actualizarVacante = async (userId: string, id: string, dto: UpdateVacanteDTO) => {
  const empresaId = await getEmpresaId(userId);
  const exists    = await VacanteModel.belongsToEmpresa(id, empresaId);
  if (!exists) throw new Error('VACANTE_NOT_FOUND');

  await VacanteModel.updateVacante(id, empresaId, {
    ...(dto.titulo            !== undefined && { titulo:            dto.titulo }),
    ...(dto.descripcion       !== undefined && { descripcion:       dto.descripcion }),
    ...(dto.estado            !== undefined && { estado:            dto.estado }),
    ...(dto.categoria         !== undefined && { categoria:         dto.categoria }),
    ...(dto.modalidad         !== undefined && { modalidad:         dto.modalidad }),
    ...(dto.experienciaMinima !== undefined && { experienciaMinima: dto.experienciaMinima }),
    ...(dto.requisitos        !== undefined && { requisitos:        dto.requisitos as object }),
    ...(dto.matchingWeights   !== undefined && { matchingWeights:   dto.matchingWeights as object }),
  });

  return VacanteModel.findById(id, empresaId);
};

export const cambiarEstado = async (userId: string, id: string, dto: UpdateEstadoDTO) => {
  const empresaId = await getEmpresaId(userId);
  const exists    = await VacanteModel.belongsToEmpresa(id, empresaId);
  if (!exists) throw new Error('VACANTE_NOT_FOUND');
  await VacanteModel.updateEstado(id, empresaId, dto.estado);
  return VacanteModel.findById(id, empresaId);
};

export const eliminarVacante = async (userId: string, id: string) => {
  const empresaId = await getEmpresaId(userId);
  const vacante   = await VacanteModel.findById(id, empresaId);
  if (!vacante) throw new Error('VACANTE_NOT_FOUND');
  if ((vacante as any)._count?.postulaciones > 0) throw new Error('VACANTE_HAS_POSTULACIONES');
  await VacanteModel.deleteVacante(id, empresaId);
};