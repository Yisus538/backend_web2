import { NextRequest } from 'next/server';
import * as authService from '@/lib/services/auth.service';
import { loginSchema, formatZodErrors } from '@/lib/validations/auth.validations';
import { loginLimiter } from '@/lib/utils/rate-limiter';
import {
  ok,
  badRequest,
  unauthorized,
  forbidden,
  locked,
  serverError,
  tooManyRequests,
} from '@/lib/utils/api-response';

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
// Pantalla: Iniciar sesión
// ─────────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {

  // Rate limit
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  const rl = loginLimiter(ip);
  if (!rl.allowed) return tooManyRequests(rl.message!);

  // Parsear y validar body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('El cuerpo de la solicitud es inválido');
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest('Datos inválidos', formatZodErrors(parsed.error));
  }

  // Lógica de negocio
  try {
    const result = await authService.login(parsed.data);
    return ok('Sesión iniciada', result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    const [code, detail] = msg.split(':');

    if (code === 'ACCOUNT_LOCKED') {
      return locked(`Cuenta bloqueada. Intentá en ${detail} minuto(s).`);
    }
    if (code === 'ACCOUNT_DISABLED') {
      return forbidden('Tu cuenta está deshabilitada. Contactá soporte.');
    }

    const hint = detail ? ` (${detail} intentos restantes)` : '';
    return unauthorized(`Credenciales inválidas${hint}`);
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
