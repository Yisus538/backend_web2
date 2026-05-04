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
exports.CandidatosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
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
let CandidatosService = class CandidatosService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPerfilPublico(companyId, candidatoId) {
        const user = await this.prisma.user.findFirst({
            where: { id: candidatoId, role: 'candidate', isActive: true },
            select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
                titulo: true,
                ubicacion: true,
                candidato: {
                    select: {
                        biografia: true,
                        habilidades: {
                            select: {
                                nivel: true,
                                aniosExp: true,
                                habilidad: { select: { nombre: true } },
                            },
                            orderBy: { aniosExp: 'desc' },
                        },
                        idiomas: { orderBy: { creadaEl: 'asc' } },
                        experiencia: { orderBy: { fechaInicio: 'desc' } },
                        educacion: { orderBy: { fechaInicio: 'desc' } },
                    },
                },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('Candidato no encontrado');
        const postulacion = await this.prisma.postulacion.findFirst({
            where: {
                candidatoId: candidatoId,
                oferta: { empresaId: companyId },
            },
            select: { urlCv: true },
            orderBy: { creadaEl: 'desc' },
        });
        const skills = user.candidato?.habilidades ?? [];
        const skillNames = skills.map((h) => h.habilidad.nombre);
        const totalExp = skills.reduce((max, h) => Math.max(max, h.aniosExp ?? 0), 0);
        return {
            id: user.id,
            name: user.fullName,
            email: user.email,
            avatar: user.avatarUrl ?? null,
            role: user.titulo ?? 'Candidato',
            location: user.ubicacion ?? '',
            biografia: user.candidato?.biografia ?? null,
            experience: totalExp > 0 ? `${totalExp} años` : 'Sin experiencia registrada',
            skills: skillNames,
            idiomas: user.candidato?.idiomas ?? [],
            educacion: user.candidato?.educacion ?? [],
            experiencia: user.candidato?.experiencia ?? [],
            cvUrl: postulacion?.urlCv ?? null,
        };
    }
    async listar(userId, q) {
        const search = (q.search ?? '');
        const vacanteId = (q.vacanteId ?? null);
        const page = Math.max(1, parseInt(q.page ?? '1', 10));
        const limit = Math.min(50, Math.max(1, parseInt(q.limit ?? '20', 10)));
        const skip = (page - 1) * limit;
        const where = {
            role: 'candidate',
            isActive: true,
            AND: [
                { fullName: { not: '' } },
                { telefono: { not: null } }, { telefono: { not: '' } },
                { ubicacion: { not: null } }, { ubicacion: { not: '' } },
                { titulo: { not: null } }, { titulo: { not: '' } },
                { avatarUrl: { not: null } }, { avatarUrl: { not: '' } },
            ],
        };
        if (search.trim()) {
            where.AND.push({
                OR: [
                    { fullName: { contains: search, mode: 'insensitive' } },
                    { titulo: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ],
            });
        }
        let vacante = null;
        let postulacionesSet = new Set();
        if (vacanteId) {
            vacante = await this.prisma.ofertaLaboral.findFirst({
                where: { id: vacanteId, empresaId: userId },
                select: { id: true, requisitos: true },
            });
            if (vacante) {
                const posts = await this.prisma.postulacion.findMany({
                    where: { ofertaId: vacanteId },
                    select: { candidatoId: true },
                });
                postulacionesSet = new Set(posts.map((p) => p.candidatoId));
            }
        }
        const [rows, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    avatarUrl: true,
                    titulo: true,
                    ubicacion: true,
                    createdAt: true,
                    candidato: {
                        select: {
                            habilidades: {
                                select: {
                                    nivel: true,
                                    aniosExp: true,
                                    habilidad: { select: { nombre: true } },
                                },
                                orderBy: { aniosExp: 'desc' },
                            },
                        },
                    },
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        const candidatos = rows.map((u) => {
            const skills = u.candidato?.habilidades ?? [];
            const skillNames = skills.map((h) => h.habilidad.nombre);
            const topSkills = skillNames.slice(0, 4);
            const techInitials = topSkills.map((s) => s.length <= 3
                ? s.toUpperCase()
                : s.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2));
            const totalExp = skills.reduce((max, h) => Math.max(max, h.aniosExp ?? 0), 0);
            const score = vacante ? calcMatchScore(skillNames, vacante.requisitos) : null;
            const postulado = vacante ? postulacionesSet.has(u.id) : false;
            return {
                id: u.id,
                name: u.fullName,
                role: u.titulo ?? 'Candidato',
                avatar: u.avatarUrl ?? null,
                available: true,
                skills: topSkills,
                location: u.ubicacion ?? 'Sin ubicación',
                experience: totalExp > 0 ? `${totalExp} años de experiencia` : 'Sin experiencia registrada',
                techInitials,
                score,
                postulado,
                createdAt: u.createdAt,
            };
        });
        if (vacante) {
            candidatos.sort((a, b) => {
                if (a.postulado && !b.postulado)
                    return -1;
                if (!a.postulado && b.postulado)
                    return 1;
                return (b.score ?? 0) - (a.score ?? 0);
            });
        }
        return {
            candidatos,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async getHabilidades(userId) {
        const habilidades = await this.prisma.candidatoHabilidad.findMany({
            where: { candidatoId: userId },
            select: {
                nivel: true,
                aniosExp: true,
                verificada: true,
                habilidad: { select: { id: true, nombre: true } },
            },
            orderBy: { aniosExp: 'desc' },
        });
        const skills = habilidades.map((h) => ({
            id: h.habilidad.id,
            nombre: h.habilidad.nombre,
            nivel: h.nivel,
            aniosExp: h.aniosExp,
            verificada: h.verificada,
        }));
        return { skills };
    }
    async getIdiomas(userId) {
        return this.prisma.idioma.findMany({
            where: { candidatoId: userId },
            orderBy: { creadaEl: 'asc' },
        });
    }
    async addIdioma(userId, body) {
        const { idioma, nivel, certificacion } = body;
        if (!idioma || !nivel)
            throw new common_1.BadRequestException('Idioma y nivel son requeridos');
        const validNiveles = ['basico', 'intermedio', 'avanzado', 'nativo'];
        if (!validNiveles.includes(nivel)) {
            throw new common_1.BadRequestException(`Nivel inválido. Opciones: ${validNiveles.join(', ')}`);
        }
        const dup = await this.prisma.idioma.findFirst({
            where: { candidatoId: userId, idioma },
        });
        if (dup)
            throw new common_1.ConflictException('Ya tenés ese idioma registrado');
        return this.prisma.idioma.create({
            data: {
                candidatoId: userId,
                idioma,
                nivel,
                certificacion: certificacion || null,
            },
        });
    }
    async updateIdioma(userId, body) {
        const { id, ...updates } = body;
        if (!id)
            throw new common_1.BadRequestException('id es requerido');
        const item = await this.prisma.idioma.findFirst({ where: { id, candidatoId: userId } });
        if (!item)
            throw new common_1.NotFoundException('Registro no encontrado');
        return this.prisma.idioma.update({ where: { id }, data: updates });
    }
    async deleteIdioma(userId, id) {
        if (!id)
            throw new common_1.BadRequestException('id es requerido');
        const item = await this.prisma.idioma.findFirst({ where: { id, candidatoId: userId } });
        if (!item)
            throw new common_1.NotFoundException('Registro no encontrado');
        await this.prisma.idioma.delete({ where: { id } });
    }
    async getExperiencia(userId) {
        return this.prisma.experienciaLaboral.findMany({
            where: { candidatoId: userId },
            orderBy: { fechaInicio: 'desc' },
        });
    }
    async addExperiencia(userId, body) {
        const { empresa, cargo, fechaInicio, fechaFin, actual, descripcion, modalidad } = body;
        if (!empresa || !cargo || !fechaInicio) {
            throw new common_1.BadRequestException('Empresa, cargo y fecha de inicio son requeridos');
        }
        return this.prisma.experienciaLaboral.create({
            data: {
                candidatoId: userId,
                empresa,
                cargo,
                fechaInicio,
                fechaFin: actual ? null : (fechaFin || null),
                actual: !!actual,
                descripcion: descripcion || null,
                modalidad: modalidad || null,
            },
        });
    }
    async updateExperiencia(userId, body) {
        const { id, ...updates } = body;
        if (!id)
            throw new common_1.BadRequestException('id es requerido');
        const item = await this.prisma.experienciaLaboral.findFirst({
            where: { id, candidatoId: userId },
        });
        if (!item)
            throw new common_1.NotFoundException('Registro no encontrado');
        if (updates.actual)
            updates.fechaFin = null;
        return this.prisma.experienciaLaboral.update({ where: { id }, data: updates });
    }
    async deleteExperiencia(userId, id) {
        if (!id)
            throw new common_1.BadRequestException('id es requerido');
        const item = await this.prisma.experienciaLaboral.findFirst({
            where: { id, candidatoId: userId },
        });
        if (!item)
            throw new common_1.NotFoundException('Registro no encontrado');
        await this.prisma.experienciaLaboral.delete({ where: { id } });
    }
    async getEducacion(userId) {
        return this.prisma.educacion.findMany({
            where: { candidatoId: userId },
            orderBy: { fechaInicio: 'desc' },
        });
    }
    async addEducacion(userId, body) {
        const { institucion, titulo, campo, fechaInicio, fechaFin, cursando, descripcion } = body;
        if (!institucion || !titulo || !fechaInicio) {
            throw new common_1.BadRequestException('Institución, título y fecha de inicio son requeridos');
        }
        return this.prisma.educacion.create({
            data: {
                candidatoId: userId,
                institucion,
                titulo,
                campo: campo || null,
                fechaInicio,
                fechaFin: cursando ? null : (fechaFin || null),
                cursando: !!cursando,
                descripcion: descripcion || null,
            },
        });
    }
    async updateEducacion(userId, body) {
        const { id, ...updates } = body;
        if (!id)
            throw new common_1.BadRequestException('id es requerido');
        const item = await this.prisma.educacion.findFirst({ where: { id, candidatoId: userId } });
        if (!item)
            throw new common_1.NotFoundException('Registro no encontrado');
        if (updates.cursando)
            updates.fechaFin = null;
        return this.prisma.educacion.update({ where: { id }, data: updates });
    }
    async deleteEducacion(userId, id) {
        if (!id)
            throw new common_1.BadRequestException('id es requerido');
        const item = await this.prisma.educacion.findFirst({ where: { id, candidatoId: userId } });
        if (!item)
            throw new common_1.NotFoundException('Registro no encontrado');
        await this.prisma.educacion.delete({ where: { id } });
    }
};
exports.CandidatosService = CandidatosService;
exports.CandidatosService = CandidatosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CandidatosService);
//# sourceMappingURL=candidatos.service.js.map