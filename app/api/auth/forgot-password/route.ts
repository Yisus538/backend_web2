import { NextRequest } from 'next/server';
import * as authService from '@/lib/services/auth.service';
import { forgotPasswordSchema, formatZodErrors } from '@/lib/validations/auth.validations';
import { forgotPasswordLimiter } from '@/lib/utils/rate-limiter';
import { badRequest, ok, tooManyRequests } from '@/lib/utils/api-response';
import { seedDatabase } from '@/lib/seed';

// ─────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// Pantalla: ¿Olvidaste tu contraseña?
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  await seedDatabase();

  // Rate limit
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  const rl = forgotPasswordLimiter(ip);
  if (!rl.allowed) return tooManyRequests(rl.message!);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('El cuerpo de la solicitud es inválido');
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest('Datos inválidos', formatZodErrors(parsed.error));
  }

  // Siempre responder con éxito (no revelar si el email existe)
  await authService.forgotPassword(parsed.data);

  return ok('Si el correo existe, recibirás un enlace para restablecer tu contraseña.');
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
