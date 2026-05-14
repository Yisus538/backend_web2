"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CandidatosService", {
    enumerable: true,
    get: function() {
        return CandidatosService;
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
function calcMatchScoreDetailed(skillNames, totalExp, requisitos, experienciaMinima) {
    const techSkills = (requisitos?.techSkills ?? []).filter((s)=>s.selected).map((s)=>s.label.toLowerCase());
    const softSkills = (requisitos?.softSkills ?? []).filter((s)=>s.selected).map((s)=>s.label.toLowerCase());
    const allRequired = [
        ...techSkills,
        ...softSkills
    ];
    const lower = skillNames.map((s)=>s.toLowerCase());
    const skillsScore = allRequired.length === 0 ? 75 : Math.round(allRequired.filter((r)=>lower.includes(r)).length / allRequired.length * 100);
    if (!experienciaMinima) {
        return {
            skillsScore,
            expScore: null,
            total: skillsScore
        };
    }
    const expScore = Math.round(Math.min(totalExp / experienciaMinima, 1) * 100);
    const total = Math.round(skillsScore * 0.7 + expScore * 0.3);
    return {
        skillsScore,
        expScore,
        total
    };
}
let CandidatosService = class CandidatosService {
    // ────────────────────────────────────────────────────────────
    // GET /api/candidatos/:id  — empresa ve perfil público de candidato + cvUrl
    // ────────────────────────────────────────────────────────────
    async getPerfilPublico(companyId, candidatoId) {
        const user = await this.prisma.user.findFirst({
            where: {
                id: candidatoId,
                role: 'candidate',
                isActive: true
            },
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
                                habilidad: {
                                    select: {
                                        nombre: true
                                    }
                                }
                            },
                            orderBy: {
                                aniosExp: 'desc'
                            }
                        },
                        idiomas: {
                            orderBy: {
                                creadaEl: 'asc'
                            }
                        },
                        experiencia: {
                            orderBy: {
                                fechaInicio: 'desc'
                            }
                        },
                        educacion: {
                            orderBy: {
                                fechaInicio: 'desc'
                            }
                        },
                        analisisDirectos: {
                            select: {
                                resumen: true,
                                score: true,
                                analizadoEl: true
                            },
                            orderBy: {
                                analizadoEl: 'desc'
                            },
                            take: 1
                        }
                    }
                }
            }
        });
        if (!user) throw new _common.NotFoundException('Candidato no encontrado');
        // Buscar cvUrl: postulación más reciente de este candidato a una vacante de esta empresa
        const postulacion = await this.prisma.postulacion.findFirst({
            where: {
                candidatoId: candidatoId,
                oferta: {
                    empresaId: companyId
                }
            },
            select: {
                urlCv: true
            },
            orderBy: {
                creadaEl: 'desc'
            }
        });
        const skills = user.candidato?.habilidades ?? [];
        const skillNames = skills.map((h)=>h.habilidad.nombre);
        const totalExp = skills.reduce((max, h)=>Math.max(max, h.aniosExp ?? 0), 0);
        const ultimoAnalisis = user.candidato?.analisisDirectos?.[0] ?? null;
        return {
            id: user.id,
            name: user.fullName,
            email: user.email,
            avatar: user.avatarUrl ?? null,
            role: user.titulo ?? 'Candidato',
            location: user.ubicacion ?? '',
            biografia: user.candidato?.biografia ?? null,
            resumen_ia: ultimoAnalisis?.resumen ?? null,
            score_ia: ultimoAnalisis?.score ?? null,
            experience: totalExp > 0 ? `${totalExp} años` : 'Sin experiencia registrada',
            skills: skillNames,
            idiomas: user.candidato?.idiomas ?? [],
            educacion: user.candidato?.educacion ?? [],
            experiencia: user.candidato?.experiencia ?? [],
            cvUrl: postulacion?.urlCv ?? null
        };
    }
    // ────────────────────────────────────────────────────────────
    // GET /api/candidatos  — empresas ven candidatos
    // ────────────────────────────────────────────────────────────
    async listar(userId, q) {
        const search = q.search ?? '';
        const vacanteId = q.vacanteId ?? null;
        const ubicacion = q.ubicacion ?? '';
        const aniosExpMin = q.aniosExpMin ? parseInt(q.aniosExpMin, 10) : null;
        const page = Math.max(1, parseInt(q.page ?? '1', 10));
        const limit = Math.min(50, Math.max(1, parseInt(q.limit ?? '20', 10)));
        const skip = (page - 1) * limit;
        // Solo candidatos con perfil completo
        const where = {
            role: 'candidate',
            isActive: true,
            AND: [
                {
                    fullName: {
                        not: ''
                    }
                },
                {
                    telefono: {
                        not: null
                    }
                },
                {
                    telefono: {
                        not: ''
                    }
                },
                {
                    ubicacion: {
                        not: null
                    }
                },
                {
                    ubicacion: {
                        not: ''
                    }
                },
                {
                    titulo: {
                        not: null
                    }
                },
                {
                    titulo: {
                        not: ''
                    }
                },
                {
                    avatarUrl: {
                        not: null
                    }
                },
                {
                    avatarUrl: {
                        not: ''
                    }
                }
            ]
        };
        if (search.trim()) {
            where.AND.push({
                OR: [
                    {
                        fullName: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    },
                    {
                        titulo: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    },
                    {
                        email: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                ]
            });
        }
        if (ubicacion.trim()) {
            where.AND.push({
                ubicacion: {
                    contains: ubicacion.trim(),
                    mode: 'insensitive'
                }
            });
        }
        if (aniosExpMin !== null && aniosExpMin > 0) {
            where.AND.push({
                candidato: {
                    habilidades: {
                        some: {
                            aniosExp: {
                                gte: aniosExpMin
                            }
                        }
                    }
                }
            });
        }
        // Vacante seleccionada → match score + marcar postulados
        let vacante = null;
        let postulacionesSet = new Set();
        if (vacanteId) {
            vacante = await this.prisma.ofertaLaboral.findFirst({
                where: {
                    id: vacanteId,
                    empresaId: userId
                },
                select: {
                    id: true,
                    requisitos: true,
                    experienciaMinima: true
                }
            });
            if (vacante) {
                const posts = await this.prisma.postulacion.findMany({
                    where: {
                        ofertaId: vacanteId
                    },
                    select: {
                        candidatoId: true
                    }
                });
                postulacionesSet = new Set(posts.map((p)=>p.candidatoId));
            }
        }
        const [rows, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                },
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
                                    habilidad: {
                                        select: {
                                            nombre: true
                                        }
                                    }
                                },
                                orderBy: {
                                    aniosExp: 'desc'
                                }
                            }
                        }
                    }
                }
            }),
            this.prisma.user.count({
                where
            })
        ]);
        const candidatos = rows.map((u)=>{
            const skills = u.candidato?.habilidades ?? [];
            const skillNames = skills.map((h)=>h.habilidad.nombre);
            const topSkills = skillNames.slice(0, 4);
            const techInitials = topSkills.map((s)=>s.length <= 3 ? s.toUpperCase() : s.split(' ').map((w)=>w[0]).join('').toUpperCase().slice(0, 2));
            const totalExp = skills.reduce((max, h)=>Math.max(max, h.aniosExp ?? 0), 0);
            const scoreDetalle = vacante ? calcMatchScoreDetailed(skillNames, totalExp, vacante.requisitos, vacante.experienciaMinima ?? 0) : null;
            const score = scoreDetalle?.total ?? null;
            const scoreDesglose = scoreDetalle ? {
                habilidades: scoreDetalle.skillsScore,
                experiencia: scoreDetalle.expScore
            } : null;
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
                scoreDesglose,
                postulado,
                createdAt: u.createdAt
            };
        });
        // Si hay vacante: postulados primero, luego por score desc
        if (vacante) {
            candidatos.sort((a, b)=>{
                if (a.postulado && !b.postulado) return -1;
                if (!a.postulado && b.postulado) return 1;
                return (b.score ?? 0) - (a.score ?? 0);
            });
        }
        return {
            candidatos,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    // ────────────────────────────────────────────────────────────
    // GET /api/candidatos/habilidades
    // ────────────────────────────────────────────────────────────
    async getHabilidades(userId) {
        const habilidades = await this.prisma.candidatoHabilidad.findMany({
            where: {
                candidatoId: userId
            },
            select: {
                nivel: true,
                aniosExp: true,
                verificada: true,
                habilidad: {
                    select: {
                        id: true,
                        nombre: true
                    }
                }
            },
            orderBy: {
                aniosExp: 'desc'
            }
        });
        const skills = habilidades.map((h)=>({
                id: h.habilidad.id,
                nombre: h.habilidad.nombre,
                nivel: h.nivel,
                aniosExp: h.aniosExp,
                verificada: h.verificada
            }));
        return {
            skills
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
CandidatosService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], CandidatosService);

//# sourceMappingURL=candidatos.service.js.map