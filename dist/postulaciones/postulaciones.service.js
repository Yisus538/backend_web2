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
exports.PostulacionesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const STATUS_META = {
    pendiente: { label: 'Pendiente', class: 'blue', nextStep: 'En espera de revisión', nextStepType: 'pending' },
    revision: { label: 'En Revisión', class: 'blue', nextStep: 'Pendiente RRHH', nextStepType: 'pending' },
    entrevista: { label: 'Entrevista', class: 'yellow', nextStep: 'Entrevista programada', nextStepType: 'urgent' },
    finalista: { label: 'Finalista', class: 'green', nextStep: 'Oferta enviada', nextStepType: 'success' },
    contratado: { label: 'Contratado', class: 'green', nextStep: 'Proceso completado', nextStepType: 'success' },
    rechazado: { label: 'Rechazado', class: 'slate', nextStep: 'Proceso cerrado', nextStepType: 'closed' },
};
let PostulacionesService = class PostulacionesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listar(userId, estado) {
        const where = { candidatoId: userId };
        if (estado && estado !== 'todas') {
            const MAP = {
                'en-curso': ['pendiente', 'revision', 'entrevista'],
                'entrevista': ['entrevista'],
                'finalista': ['finalista', 'rechazado', 'contratado'],
            };
            if (MAP[estado])
                where.estado = { in: MAP[estado] };
        }
        const rows = await this.prisma.postulacion.findMany({
            where,
            orderBy: { creadaEl: 'desc' },
            select: {
                id: true,
                estado: true,
                creadaEl: true,
                oferta: {
                    select: {
                        titulo: true,
                        empresa: {
                            select: {
                                nombreEmpresa: true,
                                usuario: { select: { fullName: true } },
                            },
                        },
                    },
                },
                analisis: { select: { puntuacion: true } },
            },
        });
        const candidaturas = rows.map((r) => {
            const meta = STATUS_META[r.estado] ?? STATUS_META.pendiente;
            return {
                id: r.id,
                title: r.oferta.titulo,
                company: r.oferta.empresa.nombreEmpresa || r.oferta.empresa.usuario.fullName,
                date: r.creadaEl,
                status: r.estado,
                statusLabel: meta.label,
                statusClass: meta.class,
                matchScore: r.analisis?.puntuacion ?? null,
                nextStep: meta.nextStep,
                nextStepType: meta.nextStepType,
            };
        });
        return { candidaturas, total: candidaturas.length };
    }
    async crear(userId, ofertaId) {
        if (!ofertaId || typeof ofertaId !== 'string') {
            throw new common_1.BadRequestException('ofertaId es requerido');
        }
        const oferta = await this.prisma.ofertaLaboral.findFirst({
            where: { id: ofertaId, estado: 'abierta' },
        });
        if (!oferta)
            throw new common_1.NotFoundException('La vacante no existe o no está disponible');
        const candidato = await this.prisma.candidato.findUnique({
            where: { usuarioId: userId },
        });
        if (!candidato) {
            await this.prisma.candidato.create({ data: { usuarioId: userId } });
        }
        const existente = await this.prisma.postulacion.findUnique({
            where: { ofertaId_candidatoId: { ofertaId, candidatoId: userId } },
        });
        if (existente)
            throw new common_1.ConflictException('Ya te postulaste a esta vacante');
        return this.prisma.postulacion.create({
            data: {
                ofertaId,
                candidatoId: userId,
                urlCv: '',
                estado: 'pendiente',
            },
            select: {
                id: true,
                estado: true,
                creadaEl: true,
                oferta: { select: { titulo: true } },
            },
        });
    }
    async retirar(userId, id) {
        if (!id)
            throw new common_1.BadRequestException('id es requerido');
        const postulacion = await this.prisma.postulacion.findFirst({
            where: { id, candidatoId: userId },
        });
        if (!postulacion)
            throw new common_1.NotFoundException('Postulación no encontrada');
        await this.prisma.postulacion.delete({ where: { id } });
    }
};
exports.PostulacionesService = PostulacionesService;
exports.PostulacionesService = PostulacionesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PostulacionesService);
//# sourceMappingURL=postulaciones.service.js.map