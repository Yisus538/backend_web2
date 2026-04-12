// ─────────────────────────────────────────────────────────────
// app/api/candidatos/experiencia/route.ts
// CRUD de experiencia laboral del candidato autenticado
// ─────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/utils/auth.utils';
import { ok, created, badRequest, unauthorized, forbidden, serverError } from '@/lib/utils/api-response';
import { prisma } from '@/lib/models/user.model';

export async function GET(req: NextRequest) {
  const { user, error } = getAuthUser(req);
  if (!user) return error === 'EXPIRED' ? unauthorized('Token expirado') : unauthorized('No autorizado');
  if (user.role !== 'candidate') return forbidden('Solo candidatos');

  try {
    const items = await prisma.experienciaLaboral.findMany({
      where: { candidatoId: user.userId },
      orderBy: { fechaInicio: 'desc' },
    });
    return ok('Experiencia obtenida', { experiencia: items });
  } catch (err) {
    console.error('[GET /api/candidatos/experiencia]', err);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = getAuthUser(req);
  if (!user) return error === 'EXPIRED' ? unauthorized('Token expirado') : unauthorized('No autorizado');
  if (user.role !== 'candidate') return forbidden('Solo candidatos');

  let body: any;
  try { body = await req.json(); }
  catch { return badRequest('Cuerpo inválido'); }

  const { empresa, cargo, fechaInicio, fechaFin, actual, descripcion, modalidad } = body;
  if (!empresa || !cargo || !fechaInicio) {
    return badRequest('Empresa, cargo y fecha de inicio son requeridos');
  }

  try {
    const item = await prisma.experienciaLaboral.create({
      data: {
        candidatoId: user.userId,
        empresa, cargo, fechaInicio,
        fechaFin: actual ? null : (fechaFin || null),
        actual: !!actual,
        descripcion: descripcion || null,
        modalidad: modalidad || null,
      },
    });
    return created('Experiencia agregada', { experiencia: item });
  } catch (err) {
    console.error('[POST /api/candidatos/experiencia]', err);
    return serverError();
  }
}

export async function DELETE(req: NextRequest) {
  const { user, error } = getAuthUser(req);
  if (!user) return error === 'EXPIRED' ? unauthorized('Token expirado') : unauthorized('No autorizado');
  if (user.role !== 'candidate') return forbidden('Solo candidatos');

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return badRequest('id es requerido');

  try {
    const item = await prisma.experienciaLaboral.findFirst({
      where: { id, candidatoId: user.userId },
    });
    if (!item) return badRequest('Registro no encontrado');

    await prisma.experienciaLaboral.delete({ where: { id } });
    return ok('Experiencia eliminada');
  } catch (err) {
    console.error('[DELETE /api/candidatos/experiencia]', err);
    return serverError();
  }
}

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
    const item = await prisma.experienciaLaboral.findFirst({
      where: { id, candidatoId: user.userId },
    });
    if (!item) return badRequest('Registro no encontrado');

    if (updates.actual) updates.fechaFin = null;

    const updated = await prisma.experienciaLaboral.update({
      where: { id },
      data: updates,
    });
    return ok('Experiencia actualizada', { experiencia: updated });
  } catch (err) {
    console.error('[PATCH /api/candidatos/experiencia]', err);
    return serverError();
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}