import { NextRequest } from 'next/server';
import * as UserModel from '@/lib/models/user.model';
import { generateToken, hashToken, getVerificationTokenExpiry } from '@/lib/utils/token.utils'; 
import { sendVerificationEmail } from '@/lib/services/email.service';
import { getAuthUser } from '@/lib/utils/auth.utils';
import { ok, badRequest, unauthorized, tooManyRequests } from '@/lib/utils/api-response';

const resendCooldown = new Map<string, number>();
const COOLDOWN_MS = 2 * 60 * 1000; // 2 minutos

export async function POST(req: NextRequest) {
  let dbUser: any = null;

  // ── Opción 1: por email en el body (sin auth, para post-registro) ──
  let body: any = {};
  try { body = await req.json(); } catch { /* no-op */ }

  if (body?.email) {
    dbUser = await UserModel.findByEmail(body.email);
  } else {
    // ── Opción 2: por token JWT (usuario autenticado) ──
    const { user, error } = getAuthUser(req);
    if (!user) {
      if (error === 'EXPIRED') return unauthorized('Token expirado');
      return unauthorized('Token no proporcionado o email no enviado');
    }
    dbUser = await UserModel.findById(user.userId);
  }

  // Respuesta genérica para no revelar si el email existe
  if (!dbUser || !dbUser.isActive) {
    return ok('Si el correo existe, se envió un nuevo enlace de verificación.');
  }

  if (dbUser.isEmailVerified) {
    return ok('Tu cuenta ya está verificada. Podés iniciar sesión.');
  }

  // Cooldown por usuario
  const lastSent = resendCooldown.get(dbUser.id);
  const now = Date.now();

  if (lastSent && now - lastSent < COOLDOWN_MS) {
    const secondsLeft = Math.ceil((COOLDOWN_MS - (now - lastSent)) / 1000);
    return tooManyRequests(`Esperá ${secondsLeft} segundos antes de reenviar.`);
  }

  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = getVerificationTokenExpiry();

  await UserModel.saveVerificationToken(dbUser.id, tokenHash, expiresAt);

  try {
    await sendVerificationEmail(dbUser.email, dbUser.fullName, rawToken);
  } catch (err) {
    console.error('[resend-verification] Error enviando email:', err);
    return badRequest('Error al enviar el correo. Intentá de nuevo en unos minutos.');
  }

  resendCooldown.set(dbUser.id, now);

  return ok('Enlace de verificación reenviado. Revisá tu correo.');
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}