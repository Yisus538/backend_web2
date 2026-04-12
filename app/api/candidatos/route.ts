import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/utils/auth.utils';
import { ok, unauthorized, forbidden, serverError } from '@/lib/utils/api-response';
import { prisma } from '@/lib/models/user.model';


function calcMatchScore(candidateSkills: string[], requisitos: any): number {
  const techSkills: string[] = (requisitos?.techSkills ?? [])
    .filter((s: any) => s.selected)
    .map((s: any) => s.label.toLowerCase());
  const softSkills: string[] = (requisitos?.softSkills ?? [])
    .filter((s: any) => s.selected)
    .map((s: any) => s.label.toLowerCase());

  const allRequired = [...techSkills, ...softSkills];
  if (allRequired.length === 0) return 75;

  const lower = candidateSkills.map((s) => s.toLowerCase());
  const matches = allRequired.filter((r) => lower.includes(r));
  return Math.round((matches.length / allRequired.length) * 100);
}

export async function GET(req: NextRequest) {
  const { user, error } = getAuthUser(req);
  if (!user) return error === 'EXPIRED' ? unauthorized('Token expirado') : unauthorized('No autorizado');
  if (user.role !== 'company') return forbidden('Solo empresas pueden ver candidatos');

  try {
    const { searchParams } = new URL(req.url);
    const search    = searchParams.get('search') ?? '';
    const vacanteId = searchParams.get('vacanteId') ?? null;
    const page      = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit     = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const skip      = (page - 1) * limit;

    // ── Where: solo candidatos con perfil completo ──────────
    const where: any = {
      role: 'candidate',
      isActive: true,
      AND: [
        { fullName:  { not: '' } },
        { telefono:  { not: null } }, { telefono:  { not: '' } },
        { ubicacion: { not: null } }, { ubicacion: { not: '' } },
        { titulo:    { not: null } }, { titulo:    { not: '' } },
        { avatarUrl: { not: null } }, { avatarUrl: { not: '' } },
      ],
    };

    if (search.trim()) {
      where.AND.push({
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { titulo:   { contains: search, mode: 'insensitive' } },
          { email:    { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // ── Vacante seleccionada (para match + postulados) ──────
    let vacante: any = null;
    let postulacionesSet = new Set<string>();

    if (vacanteId) {
      vacante = await prisma.ofertaLaboral.findFirst({
        where: { id: vacanteId, empresaId: user.userId },
        select: { id: true, requisitos: true },
      });

      if (vacante) {
        const postulaciones = await prisma.postulacion.findMany({
          where: { ofertaId: vacanteId },
          select: { candidatoId: true },
        });
        postulacionesSet = new Set(postulaciones.map((p) => p.candidatoId));
      }
    }

    // ── Query principal ─────────────────────────────────────
    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id:        true,
          fullName:  true,
          email:     true,
          avatarUrl: true,
          titulo:    true,
          ubicacion: true,
          createdAt: true,
          candidato: {
            select: {
              habilidades: {
                select: {
                  nivel:    true,
                  aniosExp: true,
                  habilidad: { select: { nombre: true } },
                },
                orderBy: { aniosExp: 'desc' },
              },
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // ── Mapear resultados ───────────────────────────────────
    const candidatos = rows.map((u) => {
      const skills     = u.candidato?.habilidades ?? [];
      const skillNames = skills.map((h) => h.habilidad.nombre);
      const topSkills  = skillNames.slice(0, 4);
      const techInitials = topSkills.map((s) =>
        s.length <= 3
          ? s.toUpperCase()
          : s.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2),
      );
      const totalExp = skills.reduce((max, h) => Math.max(max, h.aniosExp ?? 0), 0);

      const score = vacante
        ? calcMatchScore(skillNames, vacante.requisitos)
        : null;

      const postulado = vacante ? postulacionesSet.has(u.id) : false;

      return {
        id:           u.id,
        name:         u.fullName,
        role:         u.titulo ?? 'Candidato',
        avatar:       u.avatarUrl ?? null,
        available:    true,
        skills:       topSkills,
        location:     u.ubicacion ?? 'Sin ubicación',
        experience:   totalExp > 0 ? `${totalExp} años de experiencia` : 'Sin experiencia registrada',
        techInitials,
        score,
        postulado,
        createdAt:    u.createdAt,
      };
    });

    // Si hay vacante, ordenar: postulados primero, luego por score desc
    if (vacante) {
      candidatos.sort((a, b) => {
        if (a.postulado && !b.postulado) return -1;
        if (!a.postulado && b.postulado) return 1;
        return (b.score ?? 0) - (a.score ?? 0);
      });
    }

    return ok('Candidatos obtenidos', {
      candidatos,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[GET /api/candidatos]', err);
    return serverError();
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}