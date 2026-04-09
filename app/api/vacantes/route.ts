import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/utils/auth.utils';
import { ok, created, badRequest, unauthorized, forbidden, serverError } from '@/lib/utils/api-response';
import * as VacanteService from '@/lib/services/vacante.service';
import { createVacanteSchema } from '@/lib/validations/vacante.validations';

export async function GET(req: NextRequest) {
  const { user, error } = getAuthUser(req);
  if (!user) return error === 'EXPIRED' ? unauthorized('Token expirado') : unauthorized('No autorizado');
  if (user.role !== 'company') return forbidden('Solo empresas pueden acceder a vacantes');

  const { searchParams } = req.nextUrl;
  const estado = searchParams.get('estado') ?? undefined;
  const search = searchParams.get('search') ?? undefined;

  const rawPage  = parseInt(searchParams.get('page')  ?? '1',  10);
  const rawLimit = parseInt(searchParams.get('limit') ?? '10', 10);
  const page     = isNaN(rawPage)  || rawPage  < 1 ? 1  : rawPage;
  const limit    = isNaN(rawLimit) || rawLimit < 1 ? 10 : rawLimit;

  try {
    const result = await VacanteService.listarVacantes(
      user.userId,
      { estado, search },
      { page, limit },
    );
    return ok('Vacantes obtenidas', {
      vacantes:   result.items,
      pagination: {
        total:      result.total,
        page:       result.page,
        limit:      result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'NOT_EMPRESA') return forbidden('Perfil de empresa no encontrado');
    console.error('[GET /api/vacantes]', err);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = getAuthUser(req);
  if (!user) return error === 'EXPIRED' ? unauthorized('Token expirado') : unauthorized('No autorizado');
  if (user.role !== 'company') return forbidden('Solo empresas pueden crear vacantes');

  let body: unknown;
  try { body = await req.json(); }
  catch { return badRequest('Cuerpo de la solicitud inválido'); }

  const parsed = createVacanteSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest('Datos inválidos', parsed.error.errors.map((e) => ({
      field:   e.path.join('.') || 'unknown',
      message: e.message,
    })));
  }

  try {
    const vacante = await VacanteService.crearVacante(user.userId, parsed.data);
    return created('Vacante creada exitosamente', { vacante });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'NOT_EMPRESA') return forbidden('Perfil de empresa no encontrado');
    console.error('[POST /api/vacantes]', err);
    return serverError();
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}