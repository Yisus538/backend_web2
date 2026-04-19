"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VacantesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const PAGE_LIMIT_MAX = 100;
function calcMatchScore(candidateSkills, requisitos) {
    const techSkills = (requisitos?.techSkills ?? [])
        .filter((s) => s.selected)
        .map((s) => s.label.toLowerCase());
    const softSkills = (requisitos?.softSkills ?? [])
        .filter((s) => s.selected)
        .map((s) => s.label.toLowerCase());
    const allRequired = [...techSkills, ...softSkills];
    if (allRequired.length === 0)
        return 75;
    const lower = candidateSkills.map((s) => s.toLowerCase());
    const matches = allRequired.filter((r) => lower.includes(r));
    return Math.round((matches.length / allRequired.length) * 100);
}
function formatSalary(amount) {
    if (!amount)
        return '';
    if (amount >= 1_000_000)
        return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000)
        return `$${Math.round(amount / 1_000)}K`;
    return `$${amount}`;
}
function matchColor(score) {
    if (score >= 85)
        return 'green';
    if (score >= 70)
        return 'blue';
    return 'yellow';
}
const CATEGORY_ICON = {
    tech: 'code',
    mkt: 'campaign',
    hr: 'group',
};
let VacantesService = class VacantesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async ensureEmpresa(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'company')
            throw new common_1.ForbiddenException('NOT_EMPRESA');
        const empresa = await this.prisma.empresa.findUnique({ where: { usuarioId: userId } });
        if (!empresa)
            await this.prisma.empresa.create({ data: { usuarioId: userId } });
        return userId;
    }
    async listar(userId, filters, pagination) {
        const empresaId = await this.ensureEmpresa(userId);
        const page = Math.max(1, pagination.page);
        const limit = Math.min(PAGE_LIMIT_MAX, Math.max(1, pagination.limit));
        const skip = (page - 1) * limit;
        const where = { empresaId };
        if (filters.estado)
            where.estado = filters.estado;
        if (filters.search) {
            where.OR = [
                { titulo: { contains: filters.search, mode: 'insensitive' } },
                { descripcion: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.ofertaLaboral.findMany({
                where,
                skip,
                take: limit,
                orderBy: { creadaEl: 'desc' },
                include: {
                    _count: { select: { postulaciones: true } },
                },
            }),
            this.prisma.ofertaLaboral.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async obtener(userId, id) {
        const empresaId = await this.ensureEmpresa(userId);
        const vacante = await this.prisma.ofertaLaboral.findFirst({ where: { id, empresaId } });
        if (!vacante)
            throw new common_1.NotFoundException('Vacante no encontrada');
        return vacante;
    }
    async crear(userId, dto) {
        const empresaId = await this.ensureEmpresa(userId);
        return this.prisma.ofertaLaboral.create({
            data: {
                empresaId,
                titulo: dto.titulo,
                descripcion: dto.descripcion,
                estado: dto.estado ?? 'borrador',
                categoria: dto.categoria,
                modalidad: dto.modalidad,
                experienciaMinima: dto.experienciaMinima ?? 0,
                salarioMin: dto.salarioMin,
                salarioMax: dto.salarioMax,
                requisitos: dto.requisitos,
                matchingWeights: dto.matchingWeights,
            },
        });
    }
    async actualizar(userId, id, dto) {
        const empresaId = await this.ensureEmpresa(userId);
        const exists = await this.prisma.ofertaLaboral.findFirst({ where: { id, empresaId } });
        if (!exists)
            throw new common_1.NotFoundException('Vacante no encontrada');
        await this.prisma.ofertaLaboral.update({
            where: { id },
            data: {
                ...(dto.titulo !== undefined && { titulo: dto.titulo }),
                ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
                ...(dto.estado !== undefined && { estado: dto.estado }),
                ...(dto.categoria !== undefined && { categoria: dto.categoria }),
                ...(dto.modalidad !== undefined && { modalidad: dto.modalidad }),
                ...(dto.experienciaMinima !== undefined && { experienciaMinima: dto.experienciaMinima }),
                ...(dto.salarioMin !== undefined && { salarioMin: dto.salarioMin }),
                ...(dto.salarioMax !== undefined && { salarioMax: dto.salarioMax }),
                ...(dto.requisitos !== undefined && { requisitos: dto.requisitos }),
                ...(dto.matchingWeights !== undefined && { matchingWeights: dto.matchingWeights }),
            },
        });
        return this.prisma.ofertaLaboral.findUnique({ where: { id } });
    }
    async cambiarEstado(userId, id, estado) {
        const ESTADOS_VALIDOS = ['borrador', 'abierta', 'pausada', 'cerrada'];
        if (!ESTADOS_VALIDOS.includes(estado)) {
            throw new common_1.BadRequestException('Estado inválido');
        }
        const empresaId = await this.ensureEmpresa(userId);
        const exists = await this.prisma.ofertaLaboral.findFirst({ where: { id, empresaId } });
        if (!exists)
            throw new common_1.NotFoundException('Vacante no encontrada');
        return this.prisma.ofertaLaboral.update({ where: { id }, data: { estado } });
    }
    async eliminar(userId, id) {
        const empresaId = await this.ensureEmpresa(userId);
        const vacante = await this.prisma.ofertaLaboral.findFirst({
            where: { id, empresaId },
            include: { _count: { select: { postulaciones: true } } },
        });
        if (!vacante)
            throw new common_1.NotFoundException('Vacante no encontrada');
        if (vacante._count.postulaciones > 0) {
            throw new common_1.BadRequestException('No se puede eliminar una vacante con postulaciones');
        }
        await this.prisma.ofertaLaboral.delete({ where: { id } });
    }
    async publicas(userId, search, page = 1, limit = 10) {
        limit = Math.min(limit, 50);
        const skip = (page - 1) * limit;
        const where = { estado: 'abierta' };
        if (search) {
            where.OR = [
                { titulo: { contains: search, mode: 'insensitive' } },
                { descripcion: { contains: search, mode: 'insensitive' } },
                { categoria: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.ofertaLaboral.findMany({
                where,
                skip,
                take: limit,
                orderBy: { creadaEl: 'desc' },
                select: {
                    id: true, titulo: true, descripcion: true,
                    categoria: true, modalidad: true, experienciaMinima: true, creadaEl: true,
                    empresa: {
                        select: {
                            nombreEmpresa: true,
                            usuario: { select: { ubicacion: true } },
                        },
                    },
                },
            }),
            this.prisma.ofertaLaboral.count({ where }),
        ]);
        const ofertaIds = items.map((i) => i.id);
        const postulaciones = await this.prisma.postulacion.findMany({
            where: { candidatoId: userId, ofertaId: { in: ofertaIds } },
            select: { ofertaId: true },
        });
        const aplicadas = new Set(postulaciones.map((p) => p.ofertaId));
        const vacantes = items.map((v) => ({
            id: v.id,
            titulo: v.titulo,
            descripcion: v.descripcion,
            categoria: v.categoria,
            modalidad: v.modalidad ?? 'Sin especificar',
            empresa: v.empresa?.nombreEmpresa ?? 'Empresa',
            ubicacion: v.empresa?.usuario?.ubicacion ?? 'Sin ubicación',
            creadaEl: v.creadaEl,
            yaAplico: aplicadas.has(v.id),
        }));
        return {
            vacantes,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async recomendadas(userId, limit = 6) {
        limit = Math.min(limit, 20);
        const habilidades = await this.prisma.candidatoHabilidad.findMany({
            where: { candidatoId: userId },
            select: { habilidad: { select: { nombre: true } } },
        });
        const candidateSkills = habilidades.map((h) => h.habilidad.nombre);
        const postulaciones = await this.prisma.postulacion.findMany({
            where: { candidatoId: userId },
            select: { ofertaId: true },
        });
        const appliedIds = postulaciones.map((p) => p.ofertaId);
        const vacantes = await this.prisma.ofertaLaboral.findMany({
            where: {
                estado: 'abierta',
                ...(appliedIds.length > 0 ? { id: { notIn: appliedIds } } : {}),
            },
            select: {
                id: true, titulo: true, categoria: true,
                modalidad: true, ubicacion: true,
                salarioMin: true, salarioMax: true, requisitos: true,
                empresa: {
                    select: {
                        nombreEmpresa: true,
                        usuario: { select: { fullName: true } },
                    },
                },
            },
        });
        const scored = vacantes.map((v) => {
            const req = v.requisitos;
            const score = candidateSkills.length > 0
                ? calcMatchScore(candidateSkills, req)
                : null;
            const topSkills = (req?.techSkills ?? [])
                .filter((s) => s.selected)
                .map((s) => s.label)
                .slice(0, 4);
            return {
                id: v.id,
                icon: CATEGORY_ICON[v.categoria ?? ''] ?? 'work',
                title: v.titulo,
                company: v.empresa.nombreEmpresa || v.empresa.usuario.fullName,
                location: v.ubicacion ?? v.modalidad ?? '',
                skills: topSkills,
                salaryMin: formatSalary(v.salarioMin),
                salaryMax: formatSalary(v.salarioMax),
                matchScore: score,
                matchColor: score != null ? matchColor(score) : 'blue',
            };
        });
        scored.sort((a, b) => {
            if (a.matchScore == null && b.matchScore == null)
                return 0;
            if (a.matchScore == null)
                return 1;
            if (b.matchScore == null)
                return -1;
            return b.matchScore - a.matchScore;
        });
        return { jobs: scored.slice(0, limit) };
    }
    async publicaById(userId, id) {
        const item = await this.prisma.ofertaLaboral.findFirst({
            where: { id, estado: 'abierta' },
            select: {
                id: true,
                titulo: true,
                descripcion: true,
                categoria: true,
                modalidad: true,
                experienciaMinima: true,
                salarioMin: true,
                salarioMax: true,
                requisitos: true,
                creadaEl: true,
                empresa: {
                    select: {
                        nombreEmpresa: true,
                        usuario: { select: { ubicacion: true } },
                    },
                },
                _count: { select: { postulaciones: true } },
            },
        });
        if (!item)
            throw new common_1.NotFoundException('Vacante no encontrada o no disponible');
        const postulacion = await this.prisma.postulacion.findUnique({
            where: { ofertaId_candidatoId: { ofertaId: id, candidatoId: userId } },
            select: { id: true },
        });
        const candidato = await this.prisma.candidato.findUnique({
            where: { usuarioId: userId },
            select: {
                habilidades: {
                    select: {
                        habilidad: { select: { nombre: true } },
                    },
                },
            },
        });
        const candidateSkills = (candidato?.habilidades ?? [])
            .map((h) => h.habilidad.nombre);
        const matchScore = calcMatchScore(candidateSkills, item.requisitos);
        const req = item.requisitos;
        const techSkills = (req?.techSkills ?? [])
            .filter((s) => s.selected)
            .map((s) => ({
            nombre: s.label,
            nivel: s.nivel ?? null,
            matched: candidateSkills
                .map((c) => c.toLowerCase())
                .includes(s.label.toLowerCase()),
        }));
        let salario = null;
        if (item.salarioMin && item.salarioMax) {
            salario = `${formatSalary(item.salarioMin)} - ${formatSalary(item.salarioMax)}`;
        }
        else if (item.salarioMin) {
            salario = `Desde ${formatSalary(item.salarioMin)}`;
        }
        return {
            id: item.id,
            titulo: item.titulo,
            descripcion: item.descripcion,
            categoria: item.categoria,
            modalidad: item.modalidad ?? 'Sin especificar',
            experienciaMinima: item.experienciaMinima,
            requisitos: techSkills,
            salario,
            empresa: item.empresa?.nombreEmpresa ?? 'Empresa',
            ubicacion: item.empresa?.usuario?.ubicacion ?? null,
            creadaEl: item.creadaEl,
            postulantes: item._count.postulaciones,
            matchScore,
            yaAplico: !!postulacion,
        };
    }
};
exports.VacantesService = VacantesService;
exports.VacantesService = VacantesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VacantesService);
//# sourceMappingURL=vacantes.service.js.map