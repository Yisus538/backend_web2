import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/utils/auth.utils';
import { ok, unauthorized, serverError, badRequest } from '@/lib/utils/api-response';
import { prisma } from '@/lib/models/user.model'; // IMPORTACIÓN CORREGIDA 🚀

export async function GET(req: NextRequest) {
  const { user, error } = getAuthUser(req);

  if (!user) {
    if (error === 'NO_TOKEN') return unauthorized('Token no proporcionado');
    if (error === 'EXPIRED') return unauthorized('Token expirado');
    return unauthorized('Token inválido');
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId }, // CORREGIDO: userId en lugar de id 🚀
      select: { 
        id: true, fullName: true, email: true, role: true, 
        avatarUrl: true, telefono: true, ubicacion: true, titulo: true,
        isEmailVerified: true
      }
    });

    if (!dbUser) return unauthorized('Usuario no encontrado');

    return ok('Usuario autenticado', { user: dbUser });
  } catch (err) {
    console.error(err);
    return serverError('Error al obtener los datos');
  }
}

// app/api/auth/me/route.ts - PATCH handler

export async function PATCH(req: NextRequest) {
  const { user } = getAuthUser(req);
  if (!user) return unauthorized('No autorizado');

  try {
    const body = await req.json();
    const { fullName, telefono, ubicacion, titulo, avatarUrl } = body;

    // 🔧 CORRECCIÓN: Validar avatarUrl si viene, pero sin schema Zod
    if (avatarUrl !== undefined && avatarUrl !== null && avatarUrl !== '') {
      // Validar que sea una URL válida (si viene)
      try {
        new URL(avatarUrl);
      } catch {
        return badRequest('avatarUrl debe ser una URL válida');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: {
        ...(fullName && { fullName }),
        ...(telefono !== undefined && { telefono }),
        ...(ubicacion !== undefined && { ubicacion }),
        ...(titulo !== undefined && { titulo }),
        ...(avatarUrl !== undefined && { avatarUrl: avatarUrl || null }), 
      },
      select: { 
        id: true, 
        fullName: true, 
        email: true, 
        role: true, 
        avatarUrl: true, 
        telefono: true, 
        ubicacion: true, 
        titulo: true 
      }
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