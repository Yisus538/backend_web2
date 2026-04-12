import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/utils/auth.utils';
import { ok, unauthorized, forbidden, serverError } from '@/lib/utils/api-response';
import { prisma } from '@/lib/models/user.model';

// ─────────────────────────────────────────────────────────────
// GET /api/candidatos/habilidades
// Devuelve las habilidades del candidato autenticado
// ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { user, error } = getAuthUser(req);
  if (!user) return error === 'EXPIRED' ? unauthorized('Token expirado') : unauthorized('No autorizado');
  if (user.role !== 'candidate') return forbidden('Solo candidatos');

  try {
    const habilidades = await prisma.candidatoHabilidad.findMany({
      where: { candidatoId: user.userId },
      select: {
        nivel:    true,
        aniosExp: true,
        verificada: true,
        habilidad: { select: { id: true, nombre: true } },
      },
      orderBy: { aniosExp: 'desc' },
    });

    const skills = habilidades.map((h) => ({
      id:        h.habilidad.id,
      nombre:    h.habilidad.nombre,
      nivel:     h.nivel,
      aniosExp:  h.aniosExp,
      verificada: h.verificada,
    }));

    return ok('Habilidades obtenidas', { skills });
  } catch (err) {
    console.error('[GET /api/candidatos/habilidades]', err);
    return serverError();
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}