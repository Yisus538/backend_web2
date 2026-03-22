import { NextRequest } from 'next/server';
import { z } from 'zod';
import * as authService from '@/lib/services/auth.service';
import { registerSchema, formatZodErrors } from '@/lib/validations/auth.validations';
import { registerLimiter } from '@/lib/utils/rate-limiter';
import { seedDatabase } from '@/lib/seed';
import {
  created,
  badRequest,
  conflict,
  serverError,
  tooManyRequests,
} from '@/lib/utils/api-response';

// ─────────────────────────────────────────────────────────────
// POST /api/auth/register
// Pantalla: Crear tu cuenta
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  await seedDatabase();

  // Rate limit
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  const rl = registerLimiter(ip);
  if (!rl.allowed) return tooManyRequests(rl.message!);

  // Parsear y validar body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('El cuerpo de la solicitud es inválido');
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest('Datos inválidos', formatZodErrors(parsed.error));
  }

  // Lógica de negocio
  try {
    const user = await authService.register(parsed.data);
    return created('Cuenta creada exitosamente', { user });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    const [code, detail] = msg.split(':');

    if (code === 'PASSWORD_WEAK') {
      return badRequest(
        'La contraseña no es segura',
        detail?.split('|').map(m => ({ field: 'password', message: m })),
      );
    }

    if (code === 'EMAIL_TAKEN')         return conflict('El correo electrónico ya está registrado');
    if (code === 'PASSWORDS_DONT_MATCH') return badRequest('Las contraseñas no coinciden');

    console.error('[register]', error);
    return serverError();
  }
}

// Preflight CORS
export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
