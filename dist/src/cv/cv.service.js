"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CvService", {
    enumerable: true,
    get: function() {
        return CvService;
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
// Normaliza el string "periodo" de Make al formato interno.
// Ej: "Ene 2020 - Jun 2022", "2020-03 - Actualidad", "2018 - 2022"
function parsePeriodo(periodo) {
    const CURRENT = [
        'actualidad',
        'actual',
        'presente',
        'present',
        'current',
        'hoy',
        'today'
    ];
    const parts = (periodo ?? '').split(/\s*[-–]\s*/);
    if (parts.length < 2) {
        return {
            fechaInicio: parts[0]?.trim() || 'Sin fecha',
            fechaFin: null,
            actual: false
        };
    }
    const finRaw = parts[parts.length - 1].trim();
    const actual = CURRENT.some((m)=>finRaw.toLowerCase().includes(m));
    return {
        fechaInicio: parts[0].trim() || 'Sin fecha',
        fechaFin: actual ? null : finRaw,
        actual
    };
}
// Mapea el nivel de idioma de Make a los valores válidos del sistema.
function normalizarNivelIdioma(nivel) {
    const n = (nivel ?? '').toLowerCase().trim();
    if (/nativ|native|c2/.test(n)) return 'nativo';
    if (/avanzad|advanced|c1|b2/.test(n)) return 'avanzado';
    if (/intermed|intermediate|b1|a2/.test(n)) return 'intermedio';
    return 'basico';
}
// Parsea confianza_datos → Int (0-100). Acepta "85", "85%", "0.85".
function parseScore(raw) {
    if (!raw) return null;
    const n = parseFloat(String(raw).replace('%', '').trim());
    if (isNaN(n)) return null;
    return Math.round(n <= 1 ? n * 100 : n);
}
let CvService = class CvService {
    // GET /api/cv/analisis — devuelve el último análisis del candidato
    async getAnalisis(candidatoId) {
        return this.prisma.analisisCvDirecto.findFirst({
            where: {
                candidatoId
            },
            orderBy: {
                analizadoEl: 'desc'
            }
        });
    }
    // Llamado desde el callback de Make.com con el análisis procesado.
    // Graba el análisis en AnalisisCvDirecto y enriche el perfil del candidato
    // (skills, experiencia, educación, idiomas) sin borrar datos existentes.
    async procesarAnalisis(candidatoId, payload) {
        const startMs = Date.now();
        this.logger.log(`[callback] Procesando análisis para candidato ${candidatoId}`);
        // 1. Asegurar que existe el perfil de candidato (puede no existir aún)
        await this.prisma.candidato.upsert({
            where: {
                usuarioId: candidatoId
            },
            create: {
                usuarioId: candidatoId
            },
            update: {}
        });
        // 2. Crear registro de análisis con score y payload completo
        const score = parseScore(payload.confianza_datos);
        const analisis = await this.prisma.analisisCvDirecto.create({
            data: {
                candidatoId,
                score,
                apto: score !== null ? score >= 60 : null,
                cvCompleto: payload,
                evaluacionCompleta: payload
            }
        });
        this.logger.log(`[callback] AnalisisCvDirecto creado: ${analisis.id} — score: ${score}`);
        // 3. Habilidades — upsert sin sobrescribir datos manuales
        let skillsNuevas = 0;
        for (const s of payload.skills_detectadas ?? []){
            const nombre = s.skill?.trim();
            if (!nombre) continue;
            try {
                const habilidad = await this.prisma.habilidad.upsert({
                    where: {
                        nombre
                    },
                    create: {
                        nombre
                    },
                    update: {}
                });
                const { created } = await this.upsertCandidatoHabilidad(candidatoId, habilidad.id, s.nivel_estimado ?? null);
                if (created) skillsNuevas++;
            } catch (err) {
                this.logger.warn(`[callback] No se pudo procesar skill "${nombre}": ${err.message}`);
            }
        }
        this.logger.log(`[callback] Skills procesadas: ${skillsNuevas} nuevas de ${(payload.skills_detectadas ?? []).length}`);
        // 4. Experiencia — insertar solo si no existe ya (misma empresa + cargo)
        let expNuevas = 0;
        for (const exp of payload.experiencia_laboral ?? []){
            const { empresa, cargo, periodo, descripcion } = exp;
            if (!empresa?.trim() || !cargo?.trim()) continue;
            try {
                const existe = await this.prisma.experienciaLaboral.findFirst({
                    where: {
                        candidatoId,
                        empresa: {
                            equals: empresa.trim(),
                            mode: 'insensitive'
                        },
                        cargo: {
                            equals: cargo.trim(),
                            mode: 'insensitive'
                        }
                    }
                });
                if (!existe) {
                    const { fechaInicio, fechaFin, actual } = parsePeriodo(periodo);
                    const desc = Array.isArray(descripcion) ? descripcion.filter(Boolean).join('\n') : descripcion ?? null;
                    await this.prisma.experienciaLaboral.create({
                        data: {
                            candidatoId,
                            empresa: empresa.trim(),
                            cargo: cargo.trim(),
                            fechaInicio,
                            fechaFin,
                            actual,
                            descripcion: desc
                        }
                    });
                    expNuevas++;
                }
            } catch (err) {
                this.logger.warn(`[callback] No se pudo procesar experiencia "${empresa}/${cargo}": ${err.message}`);
            }
        }
        this.logger.log(`[callback] Experiencia: ${expNuevas} nuevas de ${(payload.experiencia_laboral ?? []).length}`);
        // 5. Educación — insertar solo si no existe ya (misma institución + título)
        let eduNuevas = 0;
        for (const edu of payload.educacion ?? []){
            const { institucion, titulo, periodo, observaciones } = edu;
            if (!institucion?.trim() || !titulo?.trim()) continue;
            try {
                const existe = await this.prisma.educacion.findFirst({
                    where: {
                        candidatoId,
                        institucion: {
                            equals: institucion.trim(),
                            mode: 'insensitive'
                        },
                        titulo: {
                            equals: titulo.trim(),
                            mode: 'insensitive'
                        }
                    }
                });
                if (!existe) {
                    const { fechaInicio, fechaFin, actual: cursando } = parsePeriodo(periodo);
                    await this.prisma.educacion.create({
                        data: {
                            candidatoId,
                            institucion: institucion.trim(),
                            titulo: titulo.trim(),
                            fechaInicio,
                            fechaFin,
                            cursando,
                            descripcion: observaciones?.trim() || null
                        }
                    });
                    eduNuevas++;
                }
            } catch (err) {
                this.logger.warn(`[callback] No se pudo procesar educación "${institucion}/${titulo}": ${err.message}`);
            }
        }
        this.logger.log(`[callback] Educación: ${eduNuevas} nuevas de ${(payload.educacion ?? []).length}`);
        // 6. Idiomas — insertar solo si el candidato no tiene ese idioma ya
        let idiomasNuevos = 0;
        for (const id of payload.idiomas ?? []){
            const { idioma, nivel } = id;
            if (!idioma?.trim()) continue;
            try {
                const existe = await this.prisma.idioma.findFirst({
                    where: {
                        candidatoId,
                        idioma: {
                            equals: idioma.trim(),
                            mode: 'insensitive'
                        }
                    }
                });
                if (!existe) {
                    await this.prisma.idioma.create({
                        data: {
                            candidatoId,
                            idioma: idioma.trim(),
                            nivel: normalizarNivelIdioma(nivel)
                        }
                    });
                    idiomasNuevos++;
                }
            } catch (err) {
                this.logger.warn(`[callback] No se pudo procesar idioma "${idioma}": ${err.message}`);
            }
        }
        this.logger.log(`[callback] Idiomas: ${idiomasNuevos} nuevos de ${(payload.idiomas ?? []).length}`);
        // 7. Registrar en historial de análisis
        const duracionMs = Date.now() - startMs;
        await this.prisma.historialAnalisis.create({
            data: {
                analisisDirectoId: analisis.id,
                estado: 'completado',
                detalles: `IA: ${skillsNuevas} skills, ${expNuevas} exp, ${eduNuevas} edu, ${idiomasNuevos} idiomas — score ${score}`,
                webhookPayload: payload,
                duracionMs
            }
        });
        this.logger.log(`[callback] Análisis ${analisis.id} procesado en ${duracionMs}ms`);
    }
    // Upsert de CandidatoHabilidad: inserta si no existe, no sobrescribe nivel manual.
    // Retorna { created: boolean }.
    async upsertCandidatoHabilidad(candidatoId, habilidadId, nivel) {
        try {
            await this.prisma.candidatoHabilidad.upsert({
                where: {
                    candidatoId_habilidadId: {
                        candidatoId,
                        habilidadId
                    }
                },
                create: {
                    candidatoId,
                    habilidadId,
                    nivel
                },
                update: {}
            });
            return {
                created: true
            };
        } catch  {
            return {
                created: false
            };
        }
    }
    constructor(prisma){
        this.prisma = prisma;
        this.logger = new _common.Logger(CvService.name);
    }
};
CvService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], CvService);

//# sourceMappingURL=cv.service.js.map