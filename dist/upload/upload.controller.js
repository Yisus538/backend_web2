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
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const cloudinary_1 = require("cloudinary");
const sharp = require("sharp");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
let UploadController = class UploadController {
    async uploadAvatar(user, file) {
        if (!file) {
            throw new common_1.BadRequestException('No se envió imagen');
        }
        try {
            const webpBuffer = await sharp(file.buffer)
                .resize(500, 500, { fit: 'cover' })
                .webp({ quality: 80 })
                .toBuffer();
            const result = await new Promise((resolve, reject) => {
                cloudinary_1.v2.uploader
                    .upload_stream({
                    folder: 'avatars',
                    public_id: `${user.userId}-${Date.now()}`,
                    resource_type: 'image',
                }, (error, res) => {
                    if (error || !res)
                        return reject(error);
                    resolve(res);
                })
                    .end(webpBuffer);
            });
            return {
                success: true,
                data: { url: result.secure_url },
                message: 'Avatar subido correctamente',
            };
        }
        catch (error) {
            console.error('[upload-avatar] Error procesando imagen:', error);
            throw new common_1.InternalServerErrorException('Error en el servidor al procesar la imagen');
        }
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar', {
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new common_1.BadRequestException('Solo se permiten imágenes'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadAvatar", null);
exports.UploadController = UploadController = __decorate([
    (0, common_1.Controller)('upload-avatar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)
], UploadController);
//# sourceMappingURL=upload.controller.js.map