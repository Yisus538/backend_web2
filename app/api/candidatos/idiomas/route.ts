
import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/utils/auth.utils';
import { ok, created, badRequest, unauthorized, forbidden, conflict, serverError } from '@/lib/utils/api-response';
import { prisma } from '@/lib/models/user.model';

export async function GET(req: NextRequest) {
  const { user, error } = getAuthUser(req);
  if (!user) return error === 'EXPIRED' ? unauthorized('Token expirado') : unauthorized('No autorizado');
  if (user.role !== 'candidate') return forbidden('Solo candidatos');

  try {
    const items = await prisma.idioma.findMany({
      where: { candidatoId: user.userId },
      orderBy: { creadaEl: 'asc' },
    });
    return ok('Idiomas obtenidos', { idiomas: items });
  } catch (err) {
    console.error('[GET /api/candidatos/idiomas]', err);
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

  const { idioma, nivel, certificacion } = body;
  if (!idioma || !nivel) return badRequest('Idioma y nivel son requeridos');

  const validNiveles = ['basico', 'intermedio', 'avanzado', 'nativo'];
  if (!validNiveles.includes(nivel)) {
    return badRequest(`Nivel inválido. Opciones: ${validNiveles.join(', ')}`);
  }

  try {
    // Verificar duplicado
    const existente = await prisma.idioma.findFirst({
      where: { candidatoId: user.userId, idioma },
    });
    if (existente) return conflict('Ya tenés ese idioma registrado');

    const item = await prisma.idioma.create({
      data: {
        candidatoId: user.userId,
        idioma, nivel,
        certificacion: certificacion || null,
      },
    });
    return created('Idioma agregado', { idioma: item });
  } catch (err) {
    console.error('[POST /api/candidatos/idiomas]', err);
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
    const item = await prisma.idioma.findFirst({
      where: { id, candidatoId: user.userId },
    });
    if (!item) return badRequest('Registro no encontrado');

    await prisma.idioma.delete({ where: { id } });
    return ok('Idioma eliminado');
  } catch (err) {
    console.error('[DELETE /api/candidatos/idiomas]', err);
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
    const item = await prisma.idioma.findFirst({
      where: { id, candidatoId: user.userId },
    });
    if (!item) return badRequest('Registro no encontrado');

    const updated = await prisma.idioma.update({
      where: { id },
      data: updates,
    });
    return ok('Idioma actualizado', { idioma: updated });
  } catch (err) {
    console.error('[PATCH /api/candidatos/idiomas]', err);
    return serverError();
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}