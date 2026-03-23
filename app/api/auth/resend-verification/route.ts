import { NextRequest } from 'next/server';
import * as UserModel from '@/lib/models/user.model';
import { generateResetToken } from '@/lib/utils/token.utils';
import { sendVerificationEmail } from '@/lib/services/email.service';
import { getAuthUser } from '@/lib/utils/auth.utils';
import { ok, badRequest, unauthorized, tooManyRequests } from '@/lib/utils/api-response';

// Rate limit simple en memoria: 1 reenvío cada 2 minutos por usuario
const resendCooldown = new Map<string, number>();

// POST /api/auth/resend-verification
export async function POST(req: NextRequest) {
  // Requiere estar logueado
  const { user, error } = getAuthUser(req);
  if (!user) {
    if (error === 'EXPIRED') return unauthorized('Token expirado');
    return unauthorized('Token no proporcionado');
  }

  // Buscar usuario en DB
  const dbUser = await UserModel.findById(user.userId);
  if (!dbUser || !dbUser.isActive) {
    return unauthorized('Usuario no encontrado');
  }

  // Si ya está verificado no hace falta reenviar
  if (dbUser.isEmailVerified) {
    return ok('Tu cuenta ya está verificada. Podés iniciar sesión.');
  }

  // Cooldown: no permitir más de 1 reenvío cada 2 minutos
  const lastSent = resendCooldown.get(user.userId);
  const now = Date.now();
  const COOLDOWN_MS = 2 * 60 * 1000; // 2 minutos

  if (lastSent && now - lastSent < COOLDOWN_MS) {
    const secondsLeft = Math.ceil((COOLDOWN_MS - (now - lastSent)) / 1000);
    return tooManyRequests(`Esperá ${secondsLeft} segundos antes de reenviar.`);
  }

  // Generar nuevo token y enviarlo
  const verificationToken = generateResetToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24hs

  await UserModel.saveVerificationToken(dbUser.id, verificationToken, expiresAt);

  await sendVerificationEmail(dbUser.email, dbUser.fullName, verificationToken);

  resendCooldown.set(user.userId, now);

  return ok('Enlace de verificación reenviado. Revisá tu correo.');
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}