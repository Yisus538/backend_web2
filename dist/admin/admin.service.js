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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats() {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const [candidatosTotales, candidatosNuevos, empresasTotales, empresasNuevas, vacantesActivas, vacantesCerradas, vacantesBorrador, postulacionesTotales, postulacionesAceptadas, cvAnalizados, cvSinAnalizar, scoreAggregate, topEmpresasRaw, habilidadesDemandadas, habilidadesOfrecidas, allScores, pendientes, revisados, aceptados,] = await Promise.all([
            this.prisma.user.count({ where: { role: 'candidate' } }),
            this.prisma.user.count({ where: { role: 'candidate', createdAt: { gte: oneWeekAgo } } }),
            this.prisma.user.count({ where: { role: 'company' } }),
            this.prisma.user.count({ where: { role: 'company', createdAt: { gte: oneWeekAgo } } }),
            this.prisma.ofertaLaboral.count({ where: { estado: 'abierta' } }),
            this.prisma.ofertaLaboral.count({ where: { estado: 'cerrada' } }),
            this.prisma.ofertaLaboral.count({ where: { estado: 'borrador' } }),
            this.prisma.postulacion.count(),
            this.prisma.postulacion.count({ where: { estado: 'aceptado' } }),
            this.prisma.analisisCvPostulacion.count(),
            this.prisma.postulacion.count({ where: { analisis: null } }),
            this.prisma.analisisCvPostulacion.aggregate({ _avg: { puntuacion: true } }),
            this.prisma.ofertaLaboral.groupBy({
                by: ['empresaId'],
                where: { estado: 'abierta' },
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 5,
            }),
            this.prisma.habilidadDetectada.groupBy({
                by: ['habilidadId'],
                _count: { habilidadId: true },
                orderBy: { _count: { habilidadId: 'desc' } },
                take: 10,
            }),
            this.prisma.candidatoHabilidad.groupBy({
                by: ['habilidadId'],
                _count: { habilidadId: true },
                orderBy: { _count: { habilidadId: 'desc' } },
                take: 10,
            }),
            this.prisma.analisisCvPostulacion.findMany({
                select: { puntuacion: true },
                where: { puntuacion: { not: null } },
            }),
            this.prisma.postulacion.count({ where: { estado: 'pendiente' } }),
            this.prisma.postulacion.count({ where: { estado: 'revisado' } }),
            this.prisma.postulacion.count({ where: { estado: 'aceptado' } }),
        ]);
        const tasaAceptacion = postulacionesTotales > 0
            ? Math.round((postulacionesAceptadas / postulacionesTotales) * 100)
            : 0;
        const scorePromedio = Math.round(scoreAggregate._avg.puntuacion ?? 0);
        const empresaIds = topEmpresasRaw.map((e) => e.empresaId);
        const [empresasData, habNames] = await Promise.all([
            empresaIds.length > 0
                ? this.prisma.empresa.findMany({
                    where: { usuarioId: { in: empresaIds } },
                    select: { usuarioId: true, nombreEmpresa: true },
                })
                : Promise.resolve([]),
            (() => {
                const allHabIds = [
                    ...new Set([
                        ...habilidadesDemandadas.map((h) => h.habilidadId),
                        ...habilidadesOfrecidas.map((h) => h.habilidadId),
                    ]),
                ];
                return allHabIds.length > 0
                    ? this.prisma.habilidad.findMany({
                        where: { id: { in: allHabIds } },
                        select: { id: true, nombre: true },
                    })
                    : Promise.resolve([]);
            })(),
        ]);
        const empresaNameMap = new Map(empresasData.map((e) => [e.usuarioId, e.nombreEmpresa ?? 'Sin nombre']));
        const topEmpresas = topEmpresasRaw.map((e) => ({
            nombre: empresaNameMap.get(e.empresaId) ?? 'Sin nombre',
            vacantes: e._count.id,
        }));
        const habNameMap = new Map(habNames.map((h) => [h.id, h.nombre]));
        const maxLen = Math.max(habilidadesDemandadas.length, habilidadesOfrecidas.length);
        const habilidades = Array.from({ length: maxLen }, (_, i) => ({
            demandada: habNameMap.get(habilidadesDemandadas[i]?.habilidadId) ?? '—',
            ofrecida: habNameMap.get(habilidadesOfrecidas[i]?.habilidadId) ?? '—',
        }));
        const scoreRanges = [
            { rango: '0-49%', min: 0, max: 49 },
            { rango: '50-69%', min: 50, max: 69 },
            { rango: '70-89%', min: 70, max: 89 },
            { rango: '90-100%', min: 90, max: 100 },
        ];
        const totalScores = allScores.length || 1;
        const scores = scoreRanges.map((range) => {
            const cantidad = allScores.filter((s) => s.puntuacion >= range.min && s.puntuacion <= range.max).length;
            return {
                rango: range.rango,
                cantidad,
                porcentaje: Math.round((cantidad / totalScores) * 100),
            };
        });
        return {
            candidatosTotales,
            candidatosVariacion: `+${candidatosNuevos}`,
            empresasTotales,
            empresasVariacion: `+${empresasNuevas}`,
            vacantesActivas,
            vacantesCerradas,
            vacantesBorrador,
            postulacionesTotales,
            tasaAceptacion,
            cvAnalizados,
            cvSinAnalizar,
            scorePromedio,
            topEmpresas,
            habilidades: habilidades.length > 0 ? habilidades : [
                { demandada: 'Sin datos aún', ofrecida: 'Sin datos aún' },
            ],
            scores,
            funnel: { pendientes, revisados, aceptados },
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map