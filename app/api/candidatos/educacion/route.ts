// ─────────────────────────────────────────────────────────────
// app/api/candidatos/educacion/route.ts
// CRUD de formación académica del candidato autenticado
// ─────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/utils/auth.utils';
import { ok, created, badRequest, unauthorized, forbidden, serverError } from '@/lib/utils/api-response';
import { prisma } from '@/lib/models/user.model';

// GET — Listar educación del candidato
export async function GET(req: NextRequest) {
  const { user, error } = getAuthUser(req);
  if (!user) return error === 'EXPIRED' ? unauthorized('Token expirado') : unauthorized('No autorizado');
  if (user.role !== 'candidate') return forbidden('Solo candidatos');

  try {
    const items = await prisma.educacion.findMany({
      where: { candidatoId: user.userId },
      orderBy: { fechaInicio: 'desc' },
    });
    return ok('Educación obtenida', { educacion: items });
  } catch (err) {
    console.error('[GET /api/candidatos/educacion]', err);
    return serverError();
  }
}

// POST — Agregar educación
export async function POST(req: NextRequest) {
  const { user, error } = getAuthUser(req);
  if (!user) return error === 'EXPIRED' ? unauthorized('Token expirado') : unauthorized('No autorizado');
  if (user.role !== 'candidate') return forbidden('Solo candidatos');

  let body: any;
  try { body = await req.json(); }
  catch { return badRequest('Cuerpo inválido'); }

  const { institucion, titulo, campo, fechaInicio, fechaFin, cursando, descripcion } = body;
  if (!institucion || !titulo || !fechaInicio) {
    return badRequest('Institución, título y fecha de inicio son requeridos');
  }

  try {
    const item = await prisma.educacion.create({
      data: {
        candidatoId: user.userId,
        institucion, titulo,
        campo: campo || null,
        fechaInicio,
        fechaFin: cursando ? null : (fechaFin || null),
        cursando: !!cursando,
        descripcion: descripcion || null,
      },
    });
    return created('Educación agregada', { educacion: item });
  } catch (err) {
    console.error('[POST /api/candidatos/educacion]', err);
    return serverError();
  }
}

// DELETE — Eliminar educación por id (query param)
export async function DELETE(req: NextRequest) {
  const { user, error } = getAuthUser(req);
  if (!user) return error === 'EXPIRED' ? unauthorized('Token expirado') : unauthorized('No autorizado');
  if (user.role !== 'candidate') return forbidden('Solo candidatos');

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return badRequest('id es requerido');

  try {
    const item = await prisma.educacion.findFirst({
      where: { id, candidatoId: user.userId },
    });
    if (!item) return badRequest('Registro no encontrado');

    await prisma.educacion.delete({ where: { id } });
    return ok('Educación eliminada');
  } catch (err) {
    console.error('[DELETE /api/candidatos/educacion]', err);
    return serverError();
  }
}

// PATCH — Actualizar educación
export async function PATCH(req: NextRequest) {
  const { user, error } = getAuthUser(req);
  if (!user) return error === 'EXPIRED' ? unauthorized('Token expirado') : unauthorized('No autorizado');
  if (user.role !== 'candidate') return forbidden('Solo candidatos');

  let body: any;
  try { body = await req.json(); }
  catch { return badRequest('Cuerpo inválido'); }

  const { id, ...updates } = body;
  if (!id) return badRequest('id es requerido');

  try {
    const item = await prisma.educacion.findFirst({
      where: { id, candidatoId: user.userId },
    });
    if (!item) return badRequest('Registro no encontrado');

    if (updates.cursando) updates.fechaFin = null;

    const updated = await prisma.educacion.update({
      where: { id },
      data: updates,
    });
    return ok('Educación actualizada', { educacion: updated });
  } catch (err) {
    console.error('[PATCH /api/candidatos/educacion]', err);
    return serverError();
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}