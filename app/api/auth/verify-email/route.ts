import { NextRequest } from 'next/server';
import * as UserModel from '@/lib/models/user.model';
import { hashToken, isTokenValid } from '@/lib/utils/token.utils';
import { ok, badRequest } from '@/lib/utils/api-response';

// GET /api/auth/verify-email?token=xxxx

export async function GET(req: NextRequest) {
  const rawToken = req.nextUrl.searchParams.get('token');

  if (!rawToken) return badRequest('Token requerido');

  // Hashear el token recibido para comparar contra la DB
  const tokenHash = hashToken(rawToken);

  // Buscar por hash (campo nuevo, seguro)
  const user = await UserModel.findByVerificationTokenHash(tokenHash);

  if (!user) return badRequest('El enlace de verificación es inválido');

  if (!isTokenValid(user.verificationTokenExpiresAt)) {
    return badRequest('El enlace expiró. Registrate nuevamente.');
  }

  if (user.isEmailVerified) {
    return ok('Tu cuenta ya estaba verificada');
  }

  // Marcar como verificado y limpiar ambos campos de token (viejo + hash)
  await UserModel.markEmailVerified(user.id);

  return ok('Cuenta verificada exitosamente. Ya podés iniciar sesión.');
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}