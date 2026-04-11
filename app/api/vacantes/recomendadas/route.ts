import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/utils/auth.utils';
import { ok, unauthorized, forbidden, serverError } from '@/lib/utils/api-response';
import { prisma } from '@/lib/models/user.model';

// ─────────────────────────────────────────────────────────────
// GET /api/vacantes/recomendadas
// Devuelve vacantes abiertas donde el candidato NO se postuló,
// ordenadas por match score (habilidades del candidato vs requisitos)
// ─────────────────────────────────────────────────────────────

const CATEGORY_ICON: Record<string, string> = {
    tech: 'code',
    mkt: 'campaign',
    hr: 'group',
};

function calcMatchScore(
    candidateSkills: string[],
    requisitos: any,
): number {
    const techSkills: string[] = (requisitos?.techSkills ?? [])
        .filter((s: any) => s.selected)
        .map((s: any) => s.label.toLowerCase());

    const softSkills: string[] = (requisitos?.softSkills ?? [])
        .filter((s: any) => s.selected)
        .map((s: any) => s.label.toLowerCase());

    const allRequired = [...techSkills, ...softSkills];
    if (allRequired.length === 0) return 75; // sin requisitos → match genérico

    const lowerCandidate = candidateSkills.map((s) => s.toLowerCase());
    const matches = allRequired.filter((r) => lowerCandidate.includes(r));

    return Math.round((matches.length / allRequired.length) * 100);
}

function matchColor(score: number): string {
    if (score >= 85) return 'green';
    if (score >= 70) return 'blue';
    return 'yellow';
}

function formatSalary(amount: number | null): string {
    if (!amount) return '';
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${Math.round(amount / 1000)}K`;
    return `$${amount}`;
}

export async function GET(req: NextRequest) {
    const { user, error } = getAuthUser(req);
    if (!user) return error === 'EXPIRED' ? unauthorized('Token expirado') : unauthorized('No autorizado');
    if (user.role !== 'candidate') return forbidden('Solo candidatos');

    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get('limit') ?? '6', 10), 20);

        // 1. Habilidades del candidato
        const habilidades = await prisma.candidatoHabilidad.findMany({
            where: { candidatoId: user.userId },
            select: { habilidad: { select: { nombre: true } } },
        });
        const candidateSkills = habilidades.map((h) => h.habilidad.nombre);

        // 2. IDs de ofertas donde ya se postuló
        const postulaciones = await prisma.postulacion.findMany({
            where: { candidatoId: user.userId },
            select: { ofertaId: true },
        });
        const appliedIds = postulaciones.map((p) => p.ofertaId);

        // 3. Vacantes abiertas excluyendo donde ya se postuló
        const vacantes = await prisma.ofertaLaboral.findMany({
            where: {
                estado: 'abierta',
                ...(appliedIds.length > 0 ? { id: { notIn: appliedIds } } : {}),
            },
            select: {
                id: true,
                titulo: true,
                categoria: true,
                modalidad: true,
                ubicacion: true,
                salarioMin: true,
                salarioMax: true,
                requisitos: true,
                empresa: {
                    select: {
                        nombreEmpresa: true,
                        usuario: { select: { fullName: true } },
                    },
                },
            },
        });

        // 4. Calcular match y ordenar
        const scored = vacantes.map((v) => {
            const score = candidateSkills.length > 0
                ? calcMatchScore(candidateSkills, v.requisitos)
                : null;

            const techSkills = ((v.requisitos as any)?.techSkills ?? [])
                .filter((s: any) => s.selected)
                .map((s: any) => s.label)
                .slice(0, 4);

            return {
                id: v.id,
                icon: CATEGORY_ICON[v.categoria ?? ''] ?? 'work',
                title: v.titulo,
                company: v.empresa.nombreEmpresa || v.empresa.usuario.fullName,
                location: v.ubicacion ?? v.modalidad ?? '',
                skills: techSkills,
                salaryMin: formatSalary(v.salarioMin),
                salaryMax: formatSalary(v.salarioMax),
                matchScore: score,
                matchColor: score != null ? matchColor(score) : 'blue',
            };
        });

        // Ordenar: los que tienen score primero (desc), luego los sin score
        scored.sort((a, b) => {
            if (a.matchScore == null && b.matchScore == null) return 0;
            if (a.matchScore == null) return 1;
            if (b.matchScore == null) return -1;
            return b.matchScore - a.matchScore;
        });

        return ok('Vacantes recomendadas', { jobs: scored.slice(0, limit) });
    } catch (err) {
        console.error('[GET /api/vacantes/recomendadas]', err);
        return serverError();
    }
}

export async function OPTIONS() {
    return new Response(null, { status: 204 });
}