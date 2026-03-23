import { NextRequest } from 'next/server';
import * as authService from '@/lib/services/auth.service';
import { badRequest, ok, unauthorized } from '@/lib/utils/api-response';

// ─────────────────────────────────────────────────────────────
// POST /api/auth/refresh
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: { refreshToken?: string };
  try {
    body = await req.json();
  } catch {
    return badRequest('El cuerpo de la solicitud es inválido');
  }

  if (!body.refreshToken) {
    return badRequest('Refresh token requerido');
  }

  try {
    const tokens = await authService.refreshTokens(body.refreshToken);
    return ok('Tokens renovados', { tokens });
  } catch {
    return unauthorized('Refresh token inválido o expirado');
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}