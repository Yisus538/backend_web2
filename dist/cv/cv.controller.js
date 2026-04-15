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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CvController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/r7dc3o8jguw9t7olo1byd40knnfco6ks';
const MAKE_API_KEY = 'jitKx-t9QAJBR2_';
let CvController = class CvController {
    async analyze(file) {
        if (!file)
            throw new common_1.BadRequestException('No se recibió el archivo del CV');
        this.sendToMake(file).catch(err => console.error('[cv/analyze] Error enviando a Make.com:', err));
        return { ok: true, message: 'CV recibido, procesando...' };
    }
    async sendToMake(file) {
        const boundary = `----FormBoundary${Date.now()}`;
        const header = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="documento_cv"; filename="${file.originalname}"\r\nContent-Type: ${file.mimetype}\r\n\r\n`);
        const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
        const body = Buffer.concat([header, file.buffer, footer]);
        await fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'x-make-apikey': MAKE_API_KEY,
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': String(body.length),
            },
            body: body,
        });
    }
};
exports.CvController = CvController;
__decorate([
    (0, common_1.Post)('analyze'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('documento_cv', { limits: { fileSize: 10 * 1024 * 1024 } })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CvController.prototype, "analyze", null);
exports.CvController = CvController = __decorate([
    (0, common_1.Controller)('cv')
], CvController);
//# sourceMappingURL=cv.controller.js.map