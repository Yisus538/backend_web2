import { NextRequest } from 'next/server';
import * as UserModel from '@/lib/models/user.model';
import { ok, badRequest } from '@/lib/utils/api-response';

// GET /api/auth/verify-email?token=xxxx
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) return badRequest('Token requerido');

  // 👇 1. Agregamos el await aquí
  const user = await UserModel.findByVerificationToken(token);

  if (!user) return badRequest('El enlace de verificación es inválido');

  if (user.verificationTokenExpiresAt && user.verificationTokenExpiresAt < new Date()) {
    return badRequest('El enlace expiró. Registrate nuevamente.');
  }

  if (user.isEmailVerified) {
    return ok('Tu cuenta ya estaba verificada');
  }

  // 👇 2. Agregamos el await aquí
  await UserModel.markEmailVerified(user.id);

  return ok('Cuenta verificada exitosamente. Ya podés iniciar sesión.');
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}