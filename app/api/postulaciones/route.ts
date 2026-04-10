import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/utils/auth.utils';
import { ok, created, badRequest, unauthorized, forbidden, conflict, serverError } from '@/lib/utils/api-response';
import { prisma } from '@/lib/models/user.model';

// ─────────────────────────────────────────────────────────────
// GET /api/postulaciones
// Lista las candidaturas del candidato autenticado
// ─────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; class: string; nextStep: string; nextStepType: string }> = {
  pendiente:   { label: 'Pendiente',    class: 'blue',   nextStep: 'En espera de revisión', nextStepType: 'pending'  },
  revision:    { label: 'En Revisión',  class: 'blue',   nextStep: 'Pendiente RRHH',        nextStepType: 'pending'  },
  entrevista:  { label: 'Entrevista',   class: 'yellow', nextStep: 'Entrevista programada',  nextStepType: 'urgent'   },
  finalista:   { label: 'Finalista',    class: 'green',  nextStep: 'Oferta enviada',         nextStepType: 'success'  },
  contratado:  { label: 'Contratado',   class: 'green',  nextStep: 'Proceso completado',     nextStepType: 'success'  },
  rechazado:   { label: 'Rechazado',    class: 'slate',  nextStep: 'Proceso cerrado',        nextStepType: 'closed'   },
};

export async function GET(req: NextRequest) {
  const { user, error } = getAuthUser(req);
  if (!user) return error === 'EXPIRED' ? unauthorized('Token expirado') : unauthorized('No autorizado');
  if (user.role !== 'candidate') return forbidden('Solo candidatos pueden ver sus candidaturas');

  try {
    const { searchParams } = new URL(req.url);
    const estado = searchParams.get('estado');

    const where: any = { candidatoId: user.userId };
    if (estado && estado !== 'todas') {
      // "en-curso" = revision + entrevista, "finalista" = finalista + rechazado
      const MAP: Record<string, string[]> = {
        'en-curso':   ['pendiente', 'revision', 'entrevista'],
        'entrevista': ['entrevista'],
        'finalista':  ['finalista', 'rechazado', 'contratado'],
      };
      const allowed = MAP[estado];
      if (allowed) where.estado = { in: allowed };
    }

    const rows = await prisma.postulacion.findMany({
      where,
      orderBy: { creadaEl: 'desc' },
      select: {
        id:       true,
        estado:   true,
        creadaEl: true,
        oferta: {
          select: {
            titulo: true,
            empresa: {
              select: {
                nombreEmpresa: true,
                usuario:       { select: { fullName: true } },
              },
            },
          },
        },
        analisis: {
          select: { puntuacion: true },
        },
      },
    });

    const candidaturas = rows.map((r) => {
      const meta = STATUS_META[r.estado] ?? STATUS_META.pendiente;
      return {
        id:            r.id,
        title:         r.oferta.titulo,
        company:       r.oferta.empresa.nombreEmpresa || r.oferta.empresa.usuario.fullName,
        date:          r.creadaEl,
        status:        r.estado,
        statusLabel:   meta.label,
        statusClass:   meta.class,
        matchScore:    r.analisis?.puntuacion ?? null,
        nextStep:      meta.nextStep,
        nextStepType:  meta.nextStepType,
      };
    });

    return ok('Candidaturas obtenidas', { candidaturas, total: candidaturas.length });
  } catch (err) {
    console.error('[GET /api/postulaciones]', err);
    return serverError();
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/postulaciones?id=xxx
// Candidato retira su postulación
// ─────────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const { user, error } = getAuthUser(req);
  if (!user) return error === 'EXPIRED' ? unauthorized('Token expirado') : unauthorized('No autorizado');
  if (user.role !== 'candidate') return forbidden('Solo candidatos pueden retirar postulaciones');

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return badRequest('id es requerido');

  try {
    // Verificar que la postulación pertenece al candidato
    const postulacion = await prisma.postulacion.findFirst({
      where: { id, candidatoId: user.userId },
    });
    if (!postulacion) return badRequest('Postulación no encontrada');

    await prisma.postulacion.delete({ where: { id } });
    return ok('Postulación retirada exitosamente');
  } catch (err) {
    console.error('[DELETE /api/postulaciones]', err);
    return serverError();
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/postulaciones
// Candidato se postula a una vacante publicada
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { user, error } = getAuthUser(req);
  if (!user) return error === 'EXPIRED' ? unauthorized('Token expirado') : unauthorized('No autorizado');
  if (user.role !== 'candidate') return forbidden('Solo candidatos pueden postularse');

  let body: any;
  try { body = await req.json(); }
  catch { return badRequest('Cuerpo inválido'); }

  const { ofertaId } = body;
  if (!ofertaId || typeof ofertaId !== 'string') {
    return badRequest('ofertaId es requerido');
  }

  try {
    // Verificar que la oferta existe y está publicada
    const oferta = await prisma.ofertaLaboral.findFirst({
      where: { id: ofertaId, estado: 'abierta' },
    });
    if (!oferta) return badRequest('La vacante no existe o no está disponible');

    // Verificar que el candidato existe
    const candidato = await prisma.candidato.findUnique({
      where: { usuarioId: user.userId },
    });
    if (!candidato) {
      // Auto-crear perfil candidato si no existe
      await prisma.candidato.create({ data: { usuarioId: user.userId } });
    }

    // Verificar duplicado
    const existente = await prisma.postulacion.findUnique({
      where: { ofertaId_candidatoId: { ofertaId, candidatoId: user.userId } },
    });
    if (existente) return conflict('Ya te postulaste a esta vacante');

    // Crear postulación
    const postulacion = await prisma.postulacion.create({
      data: {
        ofertaId,
        candidatoId: user.userId,
        urlCv:       '',
        estado:      'pendiente',
      },
      select: {
        id:       true,
        estado:   true,
        creadaEl: true,
        oferta:   { select: { titulo: true } },
      },
    });

    return created('Postulación creada exitosamente', { postulacion });
  } catch (err: any) {
    if (err?.code === 'P2002') return conflict('Ya te postulaste a esta vacante');
    console.error('[POST /api/postulaciones]', err);
    return serverError();
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}