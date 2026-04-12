import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/utils/auth.utils';
import { ok, unauthorized, forbidden, serverError } from '@/lib/utils/api-response';
import { prisma } from '@/lib/models/user.model';

// ─────────────────────────────────────────────────────────────
// GET /api/vacantes/publicas
// Lista vacantes publicadas — solo candidatos autenticados
// ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { user, error } = getAuthUser(req);
  if (!user) return error === 'EXPIRED' ? unauthorized('Token expirado') : unauthorized('No autorizado');
  if (user.role !== 'candidate') return forbidden('Solo candidatos pueden explorar vacantes');

  const { searchParams } = req.nextUrl;
  const search   = searchParams.get('search') ?? undefined;
  const rawPage  = parseInt(searchParams.get('page')  ?? '1',  10);
  const rawLimit = parseInt(searchParams.get('limit') ?? '10', 10);
  const page     = isNaN(rawPage)  || rawPage  < 1 ? 1  : rawPage;
  const limit    = isNaN(rawLimit) || rawLimit < 1 ? 10 : Math.min(rawLimit, 50);

  try {
    const where: any = { estado: 'abierta' };

    if (search) {
      where.OR = [
        { titulo:      { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
        { categoria:   { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.ofertaLaboral.findMany({
        where,
        select: {
          id:                true,
          titulo:            true,
          descripcion:       true,
          categoria:         true,
          modalidad:         true,
          experienciaMinima: true,
          creadaEl:          true,
          empresa: {
            select: {
              nombreEmpresa: true,
              usuario:       { select: { ubicacion: true } },
            },
          },
        },
        orderBy: { creadaEl: 'desc' },
        skip,
        take: limit,
      }),
      prisma.ofertaLaboral.count({ where }),
    ]);

    // Verificar cuáles ya tienen postulación de este candidato
    const ofertaIds = items.map((i) => i.id);
    const postulaciones = await prisma.postulacion.findMany({
      where: { candidatoId: user.userId, ofertaId: { in: ofertaIds } },
      select: { ofertaId: true },
    });
    const aplicadas = new Set(postulaciones.map((p) => p.ofertaId));

    const vacantes = items.map((v) => ({
      id:          v.id,
      titulo:      v.titulo,
      descripcion: v.descripcion,
      categoria:   v.categoria,
      modalidad:   v.modalidad ?? 'Sin especificar',
      empresa:     v.empresa?.nombreEmpresa ?? 'Empresa',
      ubicacion:   v.empresa?.usuario?.ubicacion ?? 'Sin ubicación',
      creadaEl:    v.creadaEl,
      yaAplico:    aplicadas.has(v.id),
    }));

    return ok('Vacantes obtenidas', {
      vacantes,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[GET /api/vacantes/publicas]', err);
    return serverError();
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}