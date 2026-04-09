import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/utils/auth.utils';
import { ok, badRequest, unauthorized, forbidden, serverError } from '@/lib/utils/api-response';
import * as VacanteService from '@/lib/services/vacante.service';
import { updateVacanteSchema, updateEstadoSchema } from '@/lib/validations/vacante.validations.ts';

type Params = { params: { id: string } };

function authGuard(req: NextRequest) {
    const { user, error } = getAuthUser(req);
    if (!user) return { user: null, res: error === 'EXPIRED' ? unauthorized('Token expirado') : unauthorized('No autorizado') };
    if (user.role !== 'company') return { user: null, res: forbidden('Solo empresas pueden gestionar vacantes') };
    return { user, res: null };
}

function handleError(err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'NOT_EMPRESA') return forbidden('Perfil de empresa no encontrado');
    if (msg === 'VACANTE_NOT_FOUND') return badRequest('Vacante no encontrada');
    if (msg === 'VACANTE_HAS_POSTULACIONES') return badRequest('No se puede eliminar una vacante con postulaciones');
    console.error('[vacante]', err);
    return serverError();
}

export async function GET(req: NextRequest, { params }: Params) {
    const { user, res } = authGuard(req);
    if (res) return res;
    try {
        const vacante = await VacanteService.obtenerVacante(user!.userId, params.id);
        return ok('Vacante obtenida', { vacante });
    } catch (err) { return handleError(err); }
}

export async function PATCH(req: NextRequest, { params }: Params) {
    const { user, res } = authGuard(req);
    if (res) return res;

    let body: unknown;
    try { body = await req.json(); }
    catch { return badRequest('Cuerpo inválido'); }

    // Solo viene estado → cambiar estado
    const keys = Object.keys(body as object);
    if (keys.length === 1 && keys[0] === 'estado') {
        const parsed = updateEstadoSchema.safeParse(body);
        if (!parsed.success) return badRequest('Estado inválido');
        try {
            const vacante = await VacanteService.cambiarEstado(user!.userId, params.id, parsed.data);
            return ok('Estado actualizado', { vacante });
        } catch (err) { return handleError(err); }
    }

    const parsed = updateVacanteSchema.safeParse(body);
    if (!parsed.success) {
        return badRequest('Datos inválidos', parsed.error.errors.map((e) => ({
            field: e.path.join('.') || 'unknown', message: e.message,
        })));
    }
    try {
        const vacante = await VacanteService.actualizarVacante(user!.userId, params.id, parsed.data);
        return ok('Vacante actualizada', { vacante });
    } catch (err) { return handleError(err); }
}

export async function DELETE(req: NextRequest, { params }: Params) {
    const { user, res } = authGuard(req);
    if (res) return res;
    try {
        await VacanteService.eliminarVacante(user!.userId, params.id);
        return ok('Vacante eliminada');
    } catch (err) { return handleError(err); }
}

export async function OPTIONS() {
    return new Response(null, { status: 204 });
}