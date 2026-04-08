import { NextRequest } from 'next/server';
import * as UserModel from '@/lib/models/user.model';
import { generateToken, hashToken, getVerificationTokenExpiry } from '@/lib/utils/token.utils'; // ✅ imports correctos
import { sendVerificationEmail } from '@/lib/services/email.service';
import { getAuthUser } from '@/lib/utils/auth.utils';
import { ok, unauthorized, tooManyRequests } from '@/lib/utils/api-response';

const resendCooldown = new Map<string, number>();

export async function POST(req: NextRequest) {
  const { user, error } = getAuthUser(req);
  if (!user) {
    if (error === 'EXPIRED') return unauthorized('Token expirado');
    return unauthorized('Token no proporcionado');
  }

  const dbUser = await UserModel.findById(user.userId);
  if (!dbUser || !dbUser.isActive) return unauthorized('Usuario no encontrado');

  if (dbUser.isEmailVerified) {
    return ok('Tu cuenta ya está verificada. Podés iniciar sesión.');
  }

  const lastSent = resendCooldown.get(user.userId);
  const now = Date.now();
  const COOLDOWN_MS = 2 * 60 * 1000;

  if (lastSent && now - lastSent < COOLDOWN_MS) {
    const secondsLeft = Math.ceil((COOLDOWN_MS - (now - lastSent)) / 1000);
    return tooManyRequests(`Esperá ${secondsLeft} segundos antes de reenviar.`);
  }

  // ✅ Flujo FASE 2 correcto
  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = getVerificationTokenExpiry();

  // ✅ Los 4 argumentos que espera la función
  await UserModel.saveVerificationToken(dbUser.id, rawToken, tokenHash, expiresAt);
  await sendVerificationEmail(dbUser.email, dbUser.fullName, rawToken);

  resendCooldown.set(user.userId, now);

  return ok('Enlace de verificación reenviado. Revisá tu correo.');
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}