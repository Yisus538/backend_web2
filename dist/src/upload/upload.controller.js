"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UploadController", {
    enumerable: true,
    get: function() {
        return UploadController;
    }
});
const _common = require("@nestjs/common");
const _platformexpress = require("@nestjs/platform-express");
const _jwtauthguard = require("../common/guards/jwt-auth.guard");
const _currentuserdecorator = require("../common/decorators/current-user.decorator");
const _cloudinaryservice = require("../cloudinary/cloudinary.service");
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
let UploadController = class UploadController {
    async uploadAvatar(user, file) {
        if (!file) throw new _common.BadRequestException('No se envió imagen');
        try {
            const { url } = await this.cloudinaryService.uploadAvatar(file.buffer, user.userId);
            return {
                success: true,
                data: {
                    url
                },
                message: 'Avatar subido correctamente'
            };
        } catch (error) {
            console.error('[upload-avatar] Error procesando imagen:', error);
            throw new _common.InternalServerErrorException('Error en el servidor al procesar la imagen');
        }
    }
    constructor(cloudinaryService){
        this.cloudinaryService = cloudinaryService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    (0, _common.UseInterceptors)((0, _platformexpress.FileInterceptor)('avatar', {
        limits: {
            fileSize: 5 * 1024 * 1024
        },
        fileFilter: (_req, file, cb)=>{
            if (!file.mimetype.startsWith('image/')) return cb(new _common.BadRequestException('Solo se permiten imágenes'), false);
            cb(null, true);
        }
    })),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(1, (0, _common.UploadedFile)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload,
        typeof Express === "undefined" || typeof Express.Multer === "undefined" || typeof Express.Multer.File === "undefined" ? Object : Express.Multer.File
    ]),
    _ts_metadata("design:returntype", Promise)
], UploadController.prototype, "uploadAvatar", null);
UploadController = _ts_decorate([
    (0, _common.Controller)('upload-avatar'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cloudinaryservice.CloudinaryService === "undefined" ? Object : _cloudinaryservice.CloudinaryService
    ])
], UploadController);

//# sourceMappingURL=upload.controller.js.map