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
const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/r7dc3o8jguw9t7olo1byd40knnfco6ks';
const MAKE_API_KEY = 'jitKx-t9QAJBR2_';
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
        this.logger.log('[callback] Payload crudo recibido: ' + JSON.stringify(rawPayload));
        const candidatoId = rawPayload?.candidatoId || rawPayload?.candidato_id || rawPayload?.CandidatoId || rawPayload?.CANDIDATOID || candidatoIdQuery || '';
        if (!candidatoId) {
            this.logger.error('[callback] candidatoId ausente. Campos recibidos: [' + Object.keys(rawPayload ?? {}).join(', ') + ']');
            throw new _common.BadRequestException('candidatoId requerido en el payload');
        }
        const payload = {
            ...rawPayload,
            candidatoId
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
        const url = `${MAKE_WEBHOOK_URL}?candidatoId=${encodeURIComponent(candidatoId)}`;
        this.logger.log(`[sendToMake] Enviando CV a Make para candidato ${candidatoId}`);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'x-make-apikey': MAKE_API_KEY
            },
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