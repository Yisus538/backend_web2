import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/utils/auth.utils';
import { prisma } from '@/lib/models/user.model';
import { ok, unauthorized, badRequest, serverError } from '@/lib/utils/api-response';
import { UserPublic, UserRole } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { user, error } = getAuthUser(req);

  if (!user) {
    if (error === 'NO_TOKEN')  return unauthorized('Token no proporcionado');
    if (error === 'EXPIRED')   return unauthorized('Token expirado');
    return unauthorized('Token inválido');
  }

  return ok('Usuario autenticado', { user });
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/auth/me
// Actualiza datos del perfil del usuario autenticado
// ─────────────────────────────────────────────────────────────

const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Entre 2 y 100 caracteres')
    .max(100, 'Entre 2 y 100 caracteres')
    .optional(),
  email: z
    .string()
    .trim()
    .email('Correo inválido')
    .toLowerCase()
    .optional(),
});

export async function PATCH(req: NextRequest) {
  const { user, error } = getAuthUser(req);

  if (!user) {
    if (error === 'NO_TOKEN')  return unauthorized('Token no proporcionado');
    if (error === 'EXPIRED')   return unauthorized('Token expirado');
    return unauthorized('Token inválido');
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('El cuerpo de la solicitud es inválido');
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest('Datos inválidos', parsed.error.errors.map(e => ({
      field: e.path.join('.') || 'unknown',
      message: e.message,
    })));
  }

  if (!parsed.data.fullName && !parsed.data.email) {
    return badRequest('Debés enviar al menos un campo para actualizar');
  }

  try {
    const updated = await prisma.user.update({
      where: { id: user.userId },
      data: {
        ...(parsed.data.fullName && { fullName: parsed.data.fullName }),
        ...(parsed.data.email    && { email: parsed.data.email }),
      },
    });

    const publicUser: UserPublic = {
      id: updated.id,
      fullName: updated.fullName,
      email: updated.email,
      role: updated.role as UserRole,
      isEmailVerified: updated.isEmailVerified,
      createdAt: updated.createdAt,
    };

    return ok('Perfil actualizado correctamente', { user: publicUser });
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e?.code === 'P2002') {
      return badRequest('El correo electrónico ya está en uso');
    }
    console.error('[PATCH /api/auth/me]', err);
    return serverError();
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
