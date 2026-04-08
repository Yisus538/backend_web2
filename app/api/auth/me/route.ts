import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/utils/auth.utils';
import { ok, unauthorized, serverError, badRequest } from '@/lib/utils/api-response';
import { prisma } from '@/lib/models/user.model';
import { getNavForRole } from '@/lib/models/nav.model';

// ─────────────────────────────────────────────────────────────
// GET /api/auth/me
// Devuelve datos del usuario + nav actualizada desde DB
// ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { user, error } = getAuthUser(req);

  if (!user) {
    if (error === 'NO_TOKEN') return unauthorized('Token no proporcionado');
    if (error === 'EXPIRED')  return unauthorized('Token expirado');
    return unauthorized('Token inválido');
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true, fullName: true, email: true, role: true,
        avatarUrl: true, telefono: true, ubicacion: true, titulo: true,
        isEmailVerified: true,
      },
    });

    if (!dbUser) return unauthorized('Usuario no encontrado');

    // Nav fresca desde DB (por si cambió desde el login)
    const nav = await getNavForRole(dbUser.role);

    return ok('Usuario autenticado', { user: dbUser, nav });
  } catch (err) {
    console.error(err);
    return serverError('Error al obtener los datos');
  }
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/auth/me
// Actualiza campos del perfil
// ─────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const { user } = getAuthUser(req);
  if (!user) return unauthorized('No autorizado');

  try {
    const body = await req.json();
    const { fullName, telefono, ubicacion, titulo, avatarUrl } = body;

    if (avatarUrl !== undefined && avatarUrl !== null && avatarUrl !== '') {
      const parsed = (() => { try { return new URL(avatarUrl); } catch { return null; } })();
      if (!parsed || !['https:', 'http:'].includes(parsed.protocol)) {
        return badRequest('avatarUrl debe ser una URL https válida');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: {
        ...(fullName  && { fullName }),
        ...(telefono  !== undefined && { telefono }),
        ...(ubicacion !== undefined && { ubicacion }),
        ...(titulo    !== undefined && { titulo }),
        ...(avatarUrl !== undefined && { avatarUrl: avatarUrl || null }),
      },
      select: {
        id: true, fullName: true, email: true, role: true,
        avatarUrl: true, telefono: true, ubicacion: true, titulo: true,
      },
    });

    return ok('Perfil actualizado', { user: updatedUser });
  } catch (err) {
    console.error(err);
    return serverError('Error al guardar en la base de datos');
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
