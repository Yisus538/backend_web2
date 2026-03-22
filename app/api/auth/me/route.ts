import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/utils/auth.utils';
import { ok, unauthorized } from '@/lib/utils/api-response';
import { seedDatabase } from '@/lib/seed';

// ─────────────────────────────────────────────────────────────
// GET /api/auth/me
// Ruta protegida — requiere Bearer token
// ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  await seedDatabase();

  const { user, error } = getAuthUser(req);

  if (!user) {
    if (error === 'NO_TOKEN')  return unauthorized('Token no proporcionado');
    if (error === 'EXPIRED')   return unauthorized('Token expirado');
    return unauthorized('Token inválido');
  }

  return ok('Usuario autenticado', { user });
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
