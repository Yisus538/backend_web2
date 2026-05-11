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
    async analyze(file) {
        if (!file) throw new _common.BadRequestException('No se recibió el archivo del CV');
        this.sendToMake(file).catch((err)=>console.error('[cv/analyze] Error enviando a Make.com:', err));
        return {
            ok: true,
            message: 'CV recibido, procesando...'
        };
    }
    // GET /api/cv/analisis?candidatoId=<uuid>
    // Si candidatoId no se pasa, devuelve el análisis del usuario autenticado.
    async getAnalisis(candidatoId, user) {
        const id = candidatoId || user.userId;
        const data = await this.cvService.getAnalisis(id);
        return {
            ok: true,
            data
        };
    }
    async sendToMake(file) {
        const boundary = `----FormBoundary${Date.now()}`;
        const header = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="documento_cv"; filename="${file.originalname}"\r\nContent-Type: ${file.mimetype}\r\n\r\n`);
        const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
        const body = Buffer.concat([
            header,
            file.buffer,
            footer
        ]);
        await fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'x-make-apikey': MAKE_API_KEY,
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': String(body.length)
            },
            body: body,
            signal: AbortSignal.timeout(15_000)
        });
    }
    constructor(cvService){
        this.cvService = cvService;
    }
};
_ts_decorate([
    (0, _common.Post)('analyze'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    (0, _common.UseInterceptors)((0, _platformexpress.FileInterceptor)('documento_cv', {
        limits: {
            fileSize: 10 * 1024 * 1024
        }
    })),
    _ts_param(0, (0, _common.UploadedFile)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Express === "undefined" || typeof Express.Multer === "undefined" || typeof Express.Multer.File === "undefined" ? Object : Express.Multer.File
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
CvController = _ts_decorate([
    (0, _common.Controller)('cv'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cvservice.CvService === "undefined" ? Object : _cvservice.CvService
    ])
], CvController);

//# sourceMappingURL=cv.controller.js.map