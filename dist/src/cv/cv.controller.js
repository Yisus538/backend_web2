"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CvController", {
    enumerable: true,
    get: function() {
        return CvController;
    }
});
const _common = require("@nestjs/common");
const _platformexpress = require("@nestjs/platform-express");
const _jwtauthguard = require("../common/guards/jwt-auth.guard");
const _rolesguard = require("../common/guards/roles.guard");
const _rolesdecorator = require("../common/decorators/roles.decorator");
const _currentuserdecorator = require("../common/decorators/current-user.decorator");
const _cvservice = require("./cv.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let CvController = class CvController {
    // ────────────────────────────────────────────────────────────────
    // POST /api/cv/analyze
    // Solo candidatos autenticados. Envía el CV a Make.com (fire-and-forget).
    // ────────────────────────────────────────────────────────────────
    async analyze(file, user) {
        if (!file) throw new _common.BadRequestException('No se recibió el archivo del CV');
        this.sendToMake(file, user.userId).catch((err)=>this.logger.error('[analyze] Error enviando a Make.com:', err));
        return {
            ok: true,
            message: 'CV recibido, procesando...'
        };
    }
    // ────────────────────────────────────────────────────────────────
    // GET /api/cv/analisis-activo
    // Retorna el análisis más reciente del candidato autenticado,
    // incluyendo educación, experiencia e idiomas generados.
    // ────────────────────────────────────────────────────────────────
    async getAnalisisActivo(user) {
        const analisis = await this.cvService.getAnalisisActivo(user.userId);
        return {
            ok: true,
            message: 'Análisis obtenido',
            data: {
                analisis
            }
        };
    }
    // ────────────────────────────────────────────────────────────────
    // GET /api/cv/analisis?candidatoId=<uuid>
    // Devuelve el último análisis IA del candidato.
    // ────────────────────────────────────────────────────────────────
    async getAnalisis(candidatoId, user) {
        const id = candidatoId || user.userId;
        const data = await this.cvService.getAnalisis(id);
        return {
            ok: true,
            data
        };
    }
    // ────────────────────────────────────────────────────────────────
    // POST /api/cv/callback
    // Receptor del análisis de Make.com. Sin JWT — autenticado por header.
    // Make llama a este endpoint cuando termina de analizar el CV.
    // ────────────────────────────────────────────────────────────────
    async callback(secret, candidatoIdQuery, rawPayload) {
        const expected = process.env.WEBHOOK_SECRET ?? 'reclutaia-make-2024';
        if (!secret || secret !== expected) {
            this.logger.warn('[callback] Intento con secret inválido');
            throw new _common.UnauthorizedException('Secret inválido');
        }
        this.logger.log('[callback] v2 — Payload crudo recibido: ' + JSON.stringify(rawPayload));
        const candidatoId = rawPayload?.candidatoId || rawPayload?.candidato_id || rawPayload?.CandidatoId || rawPayload?.CANDIDATOID || candidatoIdQuery || '';
        if (!candidatoId) {
            this.logger.error('[callback] candidatoId ausente. Campos recibidos: [' + Object.keys(rawPayload ?? {}).join(', ') + ']');
            throw new _common.BadRequestException('candidatoId requerido en el payload');
        }
        const p = rawPayload;
        const datosRaw = p.datos_del_candidato ?? {};
        const datos = typeof datosRaw === 'string' && datosRaw.trim() ? (()=>{
            try {
                return JSON.parse(datosRaw);
            } catch  {
                return {};
            }
        })() : typeof datosRaw === 'object' ? datosRaw : {};
        // ── Escalares: intentar múltiples nombres que Make puede usar ──
        const nombre_completo = p.nombre_completo ?? datos.nombre ?? p.nombre ?? p.name ?? p.full_name ?? null;
        const correo_cv = p.correo_cv ?? datos.email ?? datos.correo ?? p.correo ?? p.email ?? p.mail ?? null;
        const telefono_cv = p.telefono_cv ?? datos.telefono ?? p.telefono ?? p.phone ?? p.tel ?? p.celular ?? null;
        const puesto_evaluado = p.puesto_evaluado ?? datos.puesto ?? p.puesto ?? p.cargo_actual ?? p.titulo_profesional ?? p.titulo ?? p.position ?? null;
        const motivo_rechazo = p.motivo_rechazo ?? p.motivo ?? p.rechazo ?? null;
        const resumen = p.resumen ?? p.resumen_ia ?? p.summary ?? p.descripcion_perfil ?? null;
        const confianza_datos = p.confianza_datos ?? p.confianza ?? p.score ?? p.puntuacion ?? null;
        // ── Arrays: normalizar aunque lleguen como string JSON serializado ──
        // Make a veces envía arrays como string: "{\"key\":\"val\"}, {\"key\":\"val\"}"
        const parseJsonArrayString = (v)=>{
            if (Array.isArray(v)) return v;
            if (typeof v !== 'string' || !v.trim()) return [];
            const trimmed = v.trim();
            if (trimmed.startsWith('[')) {
                try {
                    return JSON.parse(trimmed);
                } catch  {}
            }
            if (trimmed.startsWith('{')) {
                try {
                    const parts = trimmed.split(/\}\s*,\s*\{/);
                    return parts.map((part, i)=>{
                        let s = part.trim();
                        if (!s.startsWith('{')) s = '{' + s;
                        if (!s.endsWith('}')) s = s + '}';
                        return JSON.parse(s);
                    });
                } catch  {
                    return [];
                }
            }
            // Strings planos separados por coma/punto y coma (para tecnologias)
            return trimmed.split(/[,;]/).map((s)=>s.trim()).filter(Boolean);
        };
        const tecnologias_detectadas = parseJsonArrayString(p.tecnologias_detectadas ?? p.tecnologias ?? p.technologies ?? null);
        const skills_detectadas = parseJsonArrayString(p.skills_detectadas);
        const experiencia_laboral = parseJsonArrayString(p.experiencia_laboral);
        const educacion = parseJsonArrayString(p.educacion);
        const idiomas = parseJsonArrayString(p.idiomas);
        // Log para confirmar qué valores se extrajeron
        this.logger.log(`[callback] Campos extraídos — nombre: ${nombre_completo}, correo: ${correo_cv}, ` + `telefono: ${telefono_cv}, puesto: ${puesto_evaluado}, ` + `skills: ${skills_detectadas.length}, tecno: ${tecnologias_detectadas.length}, ` + `exp: ${experiencia_laboral.length}, edu: ${educacion.length}, idiomas: ${idiomas.length}`);
        const payload = {
            ...rawPayload,
            candidatoId,
            nombre_completo,
            correo_cv,
            telefono_cv,
            puesto_evaluado,
            motivo_rechazo,
            resumen,
            confianza_datos,
            tecnologias_detectadas,
            skills_detectadas,
            experiencia_laboral,
            educacion,
            idiomas
        };
        await this.cvService.procesarAnalisis(candidatoId, payload);
        return {
            ok: true,
            message: 'Análisis procesado'
        };
    }
    // ────────────────────────────────────────────────────────────────
    // Envía el CV a Make.com incluyendo candidatoId como campo de texto.
    // ────────────────────────────────────────────────────────────────
    async sendToMake(file, candidatoId) {
        const formData = new FormData();
        formData.append('candidatoId', candidatoId);
        formData.append('documento_cv', new Blob([
            file.buffer
        ], {
            type: file.mimetype
        }), file.originalname);
        const makeUrl = process.env.MAKE_CV_WEBHOOK_URL ?? '';
        if (!makeUrl) {
            this.logger.warn('[sendToMake] MAKE_CV_WEBHOOK_URL no configurada — saltando análisis IA');
            return;
        }
        const url = `${makeUrl}?candidatoId=${encodeURIComponent(candidatoId)}`;
        this.logger.log(`[sendToMake] Enviando CV a Make para candidato ${candidatoId}`);
        const apiKey = process.env.MAKE_API_KEY ?? '';
        const headers = {};
        if (apiKey) headers['x-make-apikey'] = apiKey;
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData,
            signal: AbortSignal.timeout(15_000)
        });
        this.logger.log(`[sendToMake] Respuesta de Make: ${response.status}`);
        if (!response.ok) {
            const text = await response.text();
            this.logger.error(`[sendToMake] Error de Make (${response.status}): ${text}`);
        }
    }
    constructor(cvService){
        this.cvService = cvService;
        this.logger = new _common.Logger(CvController.name);
    }
};
_ts_decorate([
    (0, _common.Post)('analyze'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _rolesdecorator.Roles)('candidate'),
    (0, _common.UseInterceptors)((0, _platformexpress.FileInterceptor)('documento_cv', {
        limits: {
            fileSize: 10 * 1024 * 1024
        }
    })),
    _ts_param(0, (0, _common.UploadedFile)()),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Express === "undefined" || typeof Express.Multer === "undefined" || typeof Express.Multer.File === "undefined" ? Object : Express.Multer.File,
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload
    ]),
    _ts_metadata("design:returntype", Promise)
], CvController.prototype, "analyze", null);
_ts_decorate([
    (0, _common.Get)('analisis-activo'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload
    ]),
    _ts_metadata("design:returntype", Promise)
], CvController.prototype, "getAnalisisActivo", null);
_ts_decorate([
    (0, _common.Get)('analisis'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_param(0, (0, _common.Query)('candidatoId')),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload
    ]),
    _ts_metadata("design:returntype", Promise)
], CvController.prototype, "getAnalisis", null);
_ts_decorate([
    (0, _common.Post)('callback'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    _ts_param(0, (0, _common.Headers)('x-webhook-secret')),
    _ts_param(1, (0, _common.Query)('candidatoId')),
    _ts_param(2, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        typeof Record === "undefined" ? Object : Record
    ]),
    _ts_metadata("design:returntype", Promise)
], CvController.prototype, "callback", null);
CvController = _ts_decorate([
    (0, _common.Controller)('cv'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cvservice.CvService === "undefined" ? Object : _cvservice.CvService
    ])
], CvController);

//# sourceMappingURL=cv.controller.js.map