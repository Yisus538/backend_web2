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
const _emailservice = require("../email/email.service");
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
    analizando: {
        label: 'Analizando',
        class: 'blue',
        nextStep: 'IA evaluando candidatura',
        nextStepType: 'pending'
    },
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
                    'entrevista',
                    'analizando'
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
            },
            include: {
                empresa: {
                    include: {
                        usuario: {
                            select: {
                                fullName: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
        if (!oferta) throw new _common.NotFoundException('La vacante no existe o no está disponible');
        const profileInclude = {
            usuario: {
                select: {
                    email: true,
                    fullName: true
                }
            },
            habilidades: {
                include: {
                    habilidad: {
                        select: {
                            nombre: true
                        }
                    }
                }
            },
            educacion: true,
            experiencia: true,
            idiomas: true
        };
        // Auto-crear perfil candidato si no existe
        let candidato = await this.prisma.candidato.findUnique({
            where: {
                usuarioId: userId
            },
            include: profileInclude
        });
        if (!candidato) {
            await this.prisma.candidato.create({
                data: {
                    usuarioId: userId
                }
            });
            candidato = await this.prisma.candidato.findUnique({
                where: {
                    usuarioId: userId
                },
                include: profileInclude
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
        // La URL del CV se persiste en candidato.urlCv por cv.controller.ts
        // tras cada upload exitoso a Cloudinary.
        const cvUrl = candidato.urlCv ?? null;
        if (!cvUrl) {
            throw new _common.BadRequestException('Necesitás subir tu CV antes de postularte. ' + 'Podés hacerlo desde tu perfil en la sección "Gestión de CV".');
        }
        const postulacion = await this.prisma.postulacion.create({
            data: {
                ofertaId,
                candidatoId: userId,
                urlCv: cvUrl,
                estado: 'analizando'
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
        // Email inmediato al candidato: confirmación de recepción
        this.email.sendPostulacionRecibida(candidato.usuario.email, candidato.usuario.fullName, oferta.titulo, oferta.empresa.nombreEmpresa ?? oferta.empresa.usuario.fullName).catch((err)=>console.error('[postulacion/crear] email error:', err));
        const candidatoData = {
            nombre: candidato.usuario.fullName,
            habilidades: (candidato.habilidades ?? []).map((h)=>h.habilidad.nombre),
            educacion: (candidato.educacion ?? []).map((e)=>({
                    institucion: e.institucion,
                    titulo: e.titulo,
                    fechaInicio: e.fechaInicio,
                    fechaFin: e.fechaFin,
                    cursando: e.cursando
                })),
            experiencia: (candidato.experiencia ?? []).map((e)=>({
                    empresa: e.empresa,
                    cargo: e.cargo,
                    fechaInicio: e.fechaInicio,
                    fechaFin: e.fechaFin,
                    actual: e.actual,
                    descripcion: e.descripcion ?? null
                })),
            idiomas: (candidato.idiomas ?? []).map((i)=>({
                    idioma: i.idioma,
                    nivel: i.nivel
                }))
        };
        // Fire-and-forget a Make.com — cvUrl garantizado
        this.enviarAMake(postulacion.id, cvUrl, oferta, candidatoData).catch((err)=>console.error('[postulacion/crear] make error:', err));
        return postulacion;
    }
    // ────────────────────────────────────────────────────────────
    // POST /api/postulaciones/callback  — procesado Make.com
    // ────────────────────────────────────────────────────────────
    async procesarCallback(dto) {
        const { postulacionId, matchScore, apto, resumen, fortalezas, debilidades, motivoRechazo, recomendacion, datosCrudos } = dto;
        const postulacion = await this.prisma.postulacion.findUnique({
            where: {
                id: postulacionId
            },
            include: {
                candidato: {
                    include: {
                        usuario: {
                            select: {
                                email: true,
                                fullName: true
                            }
                        }
                    }
                },
                oferta: {
                    include: {
                        empresa: {
                            include: {
                                usuario: {
                                    select: {
                                        email: true,
                                        fullName: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!postulacion) throw new _common.NotFoundException('Postulación no encontrada');
        await this.prisma.analisisCvPostulacion.upsert({
            where: {
                postulacionId
            },
            create: {
                postulacionId,
                puntuacion: matchScore,
                resumen,
                datosCrudos: datosCrudos ?? {},
                apto,
                motivo: motivoRechazo ?? null,
                fortalezas: fortalezas ?? [],
                debilidades: debilidades ?? [],
                riesgos: []
            },
            update: {
                puntuacion: matchScore,
                resumen,
                datosCrudos: datosCrudos ?? {},
                apto,
                motivo: motivoRechazo ?? null,
                fortalezas: fortalezas ?? [],
                debilidades: debilidades ?? []
            }
        });
        const candidatoEmail = postulacion.candidato.usuario.email;
        const candidatoNombre = postulacion.candidato.usuario.fullName;
        const vacanteNombre = postulacion.oferta.titulo;
        const empresaNombre = postulacion.oferta.empresa.nombreEmpresa ?? postulacion.oferta.empresa.usuario.fullName;
        const empresaEmail = postulacion.oferta.empresa.usuario.email;
        const UMBRAL = Number(process.env.MATCH_SCORE_UMBRAL ?? 70);
        if (matchScore >= UMBRAL) {
            await this.prisma.postulacion.update({
                where: {
                    id: postulacionId
                },
                data: {
                    estado: 'entrevista'
                }
            });
            const fechaTentativa = this.sumarDiasHabiles(new Date(), 3);
            await this.prisma.entrevista.create({
                data: {
                    postulacionId,
                    fecha: fechaTentativa,
                    estado: 'pendiente',
                    tipo: 'pendiente',
                    notas: `Auto-agendada por análisis IA. Score: ${matchScore}%. ${recomendacion ?? ''}`
                }
            });
            this.email.sendEntrevistaAgendada(candidatoEmail, candidatoNombre, vacanteNombre, empresaNombre, matchScore, fechaTentativa).catch((err)=>console.error('[callback] email candidato:', err));
            if (empresaEmail) {
                this.email.sendCandidatoAceptadoEmpresa(empresaEmail, postulacion.oferta.empresa.usuario.fullName, candidatoNombre, vacanteNombre, matchScore, fortalezas ?? []).catch((err)=>console.error('[callback] email empresa:', err));
            }
        } else {
            await this.prisma.postulacion.update({
                where: {
                    id: postulacionId
                },
                data: {
                    estado: 'pendiente'
                }
            });
            if (empresaEmail) {
                this.email.sendPostulantePendiente(empresaEmail, vacanteNombre, candidatoNombre).catch((err)=>console.error('[callback] email empresa pending:', err));
            }
        }
        return {
            ok: true
        };
    }
    // ────────────────────────────────────────────────────────────
    // PATCH /api/postulaciones/:id/estado  — empresa cambia estado
    // ────────────────────────────────────────────────────────────
    async cambiarEstadoEmpresa(empresaUserId, postulacionId, nuevoEstado) {
        const ESTADOS_VALIDOS = [
            'revision',
            'entrevista',
            'aceptado',
            'finalista',
            'contratado',
            'rechazado',
            'pendiente'
        ];
        if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
            throw new _common.BadRequestException(`Estado inválido. Opciones: ${ESTADOS_VALIDOS.join(', ')}`);
        }
        // "aceptado" es un alias de "entrevista" — compatibilidad con el frontend
        const estadoReal = nuevoEstado === 'aceptado' ? 'entrevista' : nuevoEstado;
        const empresa = await this.prisma.empresa.findUnique({
            where: {
                usuarioId: empresaUserId
            }
        });
        if (!empresa) throw new _common.NotFoundException('Empresa no encontrada');
        const postulacion = await this.prisma.postulacion.findFirst({
            where: {
                id: postulacionId,
                oferta: {
                    empresaId: empresa.usuarioId
                }
            },
            include: {
                candidato: {
                    include: {
                        usuario: {
                            select: {
                                email: true,
                                fullName: true
                            }
                        }
                    }
                },
                oferta: {
                    select: {
                        titulo: true
                    }
                }
            }
        });
        if (!postulacion) throw new _common.NotFoundException('Postulación no encontrada');
        await this.prisma.postulacion.update({
            where: {
                id: postulacionId
            },
            data: {
                estado: estadoReal
            }
        });
        if (estadoReal === 'entrevista') {
            const existeEntrevista = await this.prisma.entrevista.findUnique({
                where: {
                    postulacionId
                }
            });
            if (!existeEntrevista) {
                const fechaTentativa = this.sumarDiasHabiles(new Date(), 3);
                await this.prisma.entrevista.create({
                    data: {
                        postulacionId,
                        fecha: fechaTentativa,
                        estado: 'pendiente',
                        tipo: 'pendiente'
                    }
                });
            }
        }
        const candidatoEmail = postulacion.candidato.usuario.email;
        const candidatoNombre = postulacion.candidato.usuario.fullName;
        const vacanteNombre = postulacion.oferta.titulo;
        switch(estadoReal){
            case 'entrevista':
                this.email.sendEntrevistaAgendada(candidatoEmail, candidatoNombre, vacanteNombre, '', null, null).catch(()=>{});
                break;
            case 'finalista':
                this.email.sendFinalistaNotification(candidatoEmail, candidatoNombre, vacanteNombre).catch(()=>{});
                break;
            case 'contratado':
                this.email.sendContratadoNotification(candidatoEmail, candidatoNombre, vacanteNombre).catch(()=>{});
                break;
            case 'rechazado':
                {
                    const analisis = await this.prisma.analisisCvPostulacion.findUnique({
                        where: {
                            postulacionId
                        }
                    });
                    this.email.sendRechazoPostulacion(candidatoEmail, candidatoNombre, vacanteNombre, analisis?.fortalezas ?? [], analisis?.debilidades ?? []).catch(()=>{});
                    break;
                }
        }
        return {
            postulacionId,
            nuevoEstado: estadoReal
        };
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
                urlCv: true,
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
                },
                analisis: {
                    select: {
                        puntuacion: true,
                        apto: true,
                        fortalezas: true,
                        debilidades: true,
                        resumen: true
                    }
                }
            }
        });
        return rows.map((p)=>({
                id: p.id,
                estado: p.estado,
                creadaEl: p.creadaEl,
                urlCv: p.urlCv,
                candidato: {
                    id: p.candidato.usuario.id,
                    fullName: p.candidato.usuario.fullName,
                    email: p.candidato.usuario.email
                },
                analisis: p.analisis ? {
                    puntuacion: p.analisis.puntuacion,
                    apto: p.analisis.apto,
                    fortalezas: p.analisis.fortalezas,
                    debilidades: p.analisis.debilidades,
                    resumen: p.analisis.resumen
                } : null
            }));
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
    // ────────────────────────────────────────────────────────────
    // Privados
    // ────────────────────────────────────────────────────────────
    async enviarAMake(postulacionId, cvUrl, oferta, candidatoData) {
        const webhookUrl = process.env.MAKE_POSTULACION_WEBHOOK_URL;
        if (!webhookUrl) {
            console.warn('[make] MAKE_POSTULACION_WEBHOOK_URL no configurada — saltando análisis IA');
            return;
        }
        const payload = {
            postulacionId,
            cvUrl,
            candidato: candidatoData,
            vacante: {
                titulo: oferta.titulo,
                descripcion: oferta.descripcion,
                requisitos: oferta.requisitos,
                matchingWeights: oferta.matchingWeights,
                experienciaMinima: oferta.experienciaMinima,
                categoria: oferta.categoria,
                modalidad: oferta.modalidad
            },
            callbackUrl: `${process.env.API_BASE_URL}/api/postulaciones/callback`,
            webhookSecret: process.env.WEBHOOK_SECRET
        };
        await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
    }
    sumarDiasHabiles(fecha, dias) {
        const resultado = new Date(fecha);
        let agregados = 0;
        while(agregados < dias){
            resultado.setDate(resultado.getDate() + 1);
            const diaSemana = resultado.getDay();
            if (diaSemana !== 0 && diaSemana !== 6) {
                agregados++;
            }
        }
        return resultado;
    }
    constructor(prisma, email){
        this.prisma = prisma;
        this.email = email;
    }
};
PostulacionesService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _emailservice.EmailService === "undefined" ? Object : _emailservice.EmailService
    ])
], PostulacionesService);

//# sourceMappingURL=postulaciones.service.js.map