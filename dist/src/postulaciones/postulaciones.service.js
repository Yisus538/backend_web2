"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PostulacionesService", {
    enumerable: true,
    get: function() {
        return PostulacionesService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../prisma/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
const STATUS_META = {
    pendiente: {
        label: 'Pendiente',
        class: 'blue',
        nextStep: 'En espera de revisión',
        nextStepType: 'pending'
    },
    revision: {
        label: 'En Revisión',
        class: 'blue',
        nextStep: 'Pendiente RRHH',
        nextStepType: 'pending'
    },
    entrevista: {
        label: 'Entrevista',
        class: 'yellow',
        nextStep: 'Entrevista programada',
        nextStepType: 'urgent'
    },
    finalista: {
        label: 'Finalista',
        class: 'green',
        nextStep: 'Oferta enviada',
        nextStepType: 'success'
    },
    contratado: {
        label: 'Contratado',
        class: 'green',
        nextStep: 'Proceso completado',
        nextStepType: 'success'
    },
    rechazado: {
        label: 'Rechazado',
        class: 'slate',
        nextStep: 'Proceso cerrado',
        nextStepType: 'closed'
    }
};
let PostulacionesService = class PostulacionesService {
    // ────────────────────────────────────────────────────────────
    // GET /api/postulaciones
    // ────────────────────────────────────────────────────────────
    async listar(userId, estado) {
        const where = {
            candidatoId: userId
        };
        if (estado && estado !== 'todas') {
            const MAP = {
                'en-curso': [
                    'pendiente',
                    'revision',
                    'entrevista'
                ],
                'entrevista': [
                    'entrevista'
                ],
                'finalista': [
                    'finalista',
                    'rechazado',
                    'contratado'
                ]
            };
            if (MAP[estado]) where.estado = {
                in: MAP[estado]
            };
        }
        const rows = await this.prisma.postulacion.findMany({
            where,
            orderBy: {
                creadaEl: 'desc'
            },
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
                                usuario: {
                                    select: {
                                        fullName: true
                                    }
                                }
                            }
                        }
                    }
                },
                analisis: {
                    select: {
                        puntuacion: true
                    }
                }
            }
        });
        const candidaturas = rows.map((r)=>{
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
                nextStepType: meta.nextStepType
            };
        });
        return {
            candidaturas,
            total: candidaturas.length
        };
    }
    // ────────────────────────────────────────────────────────────
    // POST /api/postulaciones
    // ────────────────────────────────────────────────────────────
    async crear(userId, ofertaId) {
        if (!ofertaId || typeof ofertaId !== 'string') {
            throw new _common.BadRequestException('ofertaId es requerido');
        }
        const oferta = await this.prisma.ofertaLaboral.findFirst({
            where: {
                id: ofertaId,
                estado: 'abierta'
            }
        });
        if (!oferta) throw new _common.NotFoundException('La vacante no existe o no está disponible');
        // Auto-crear perfil candidato si no existe
        const candidato = await this.prisma.candidato.findUnique({
            where: {
                usuarioId: userId
            }
        });
        if (!candidato) {
            await this.prisma.candidato.create({
                data: {
                    usuarioId: userId
                }
            });
        }
        // Verificar duplicado
        const existente = await this.prisma.postulacion.findUnique({
            where: {
                ofertaId_candidatoId: {
                    ofertaId,
                    candidatoId: userId
                }
            }
        });
        if (existente) throw new _common.ConflictException('Ya te postulaste a esta vacante');
        return this.prisma.postulacion.create({
            data: {
                ofertaId,
                candidatoId: userId,
                urlCv: '',
                estado: 'pendiente'
            },
            select: {
                id: true,
                estado: true,
                creadaEl: true,
                oferta: {
                    select: {
                        titulo: true
                    }
                }
            }
        });
    }
    // ────────────────────────────────────────────────────────────
    // GET /api/postulaciones/vacante/:vacanteId  (empresa)
    // ────────────────────────────────────────────────────────────
    async listarPorVacante(empresaUserId, vacanteId) {
        const oferta = await this.prisma.ofertaLaboral.findFirst({
            where: {
                id: vacanteId,
                empresaId: empresaUserId
            }
        });
        if (!oferta) throw new _common.NotFoundException('Vacante no encontrada');
        const rows = await this.prisma.postulacion.findMany({
            where: {
                ofertaId: vacanteId
            },
            orderBy: {
                creadaEl: 'desc'
            },
            select: {
                id: true,
                estado: true,
                creadaEl: true,
                candidato: {
                    select: {
                        usuario: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
        return rows.map((p)=>({
                id: p.id,
                estado: p.estado,
                creadaEl: p.creadaEl,
                candidato: {
                    id: p.candidato.usuario.id,
                    fullName: p.candidato.usuario.fullName,
                    email: p.candidato.usuario.email
                }
            }));
    }
    // ────────────────────────────────────────────────────────────
    // PATCH /api/postulaciones/:id/estado  (empresa)
    // ────────────────────────────────────────────────────────────
    async actualizarEstado(empresaUserId, postulacionId, estado) {
        const ESTADOS_VALIDOS = [
            'pendiente',
            'revision',
            'entrevista',
            'finalista',
            'contratado',
            'rechazado',
            'aceptado'
        ];
        if (!ESTADOS_VALIDOS.includes(estado)) {
            throw new _common.BadRequestException('Estado inválido');
        }
        const postulacion = await this.prisma.postulacion.findFirst({
            where: {
                id: postulacionId,
                oferta: {
                    empresaId: empresaUserId
                }
            }
        });
        if (!postulacion) throw new _common.NotFoundException('Postulación no encontrada');
        return this.prisma.postulacion.update({
            where: {
                id: postulacionId
            },
            data: {
                estado
            },
            select: {
                id: true,
                estado: true
            }
        });
    }
    // ────────────────────────────────────────────────────────────
    // DELETE /api/postulaciones?id=xxx
    // ────────────────────────────────────────────────────────────
    async retirar(userId, id) {
        if (!id) throw new _common.BadRequestException('id es requerido');
        const postulacion = await this.prisma.postulacion.findFirst({
            where: {
                id,
                candidatoId: userId
            }
        });
        if (!postulacion) throw new _common.NotFoundException('Postulación no encontrada');
        await this.prisma.postulacion.delete({
            where: {
                id
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
PostulacionesService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], PostulacionesService);

//# sourceMappingURL=postulaciones.service.js.map