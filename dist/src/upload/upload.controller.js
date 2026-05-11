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
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
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
// Lazy-load both heavy native modules so they don't block NestJS startup.
// cloudinary v2 and sharp both hang the event loop for several seconds on macOS
// when required at module load time.
let cloudinaryLib = null;
let sharpLib = null;
async function getCloudinary() {
    if (!cloudinaryLib) {
        cloudinaryLib = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("cloudinary")));
        cloudinaryLib.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
    }
    return cloudinaryLib.v2;
}
async function getSharp() {
    if (!sharpLib) sharpLib = (await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("sharp")))).default;
    return sharpLib;
}
let UploadController = class UploadController {
    async uploadAvatar(user, file) {
        if (!file) {
            throw new _common.BadRequestException('No se envió imagen');
        }
        try {
            const sharp = await getSharp();
            const cloudinary = await getCloudinary();
            const webpBuffer = await sharp(file.buffer).resize(500, 500, {
                fit: 'cover'
            }).webp({
                quality: 80
            }).toBuffer();
            const result = await new Promise((resolve, reject)=>{
                cloudinary.uploader.upload_stream({
                    folder: 'avatars',
                    public_id: `${user.userId}-${Date.now()}`,
                    resource_type: 'image'
                }, (error, res)=>{
                    if (error || !res) return reject(error);
                    resolve(res);
                }).end(webpBuffer);
            });
            return {
                success: true,
                data: {
                    url: result.secure_url
                },
                message: 'Avatar subido correctamente'
            };
        } catch (error) {
            console.error('[upload-avatar] Error procesando imagen:', error);
            throw new _common.InternalServerErrorException('Error en el servidor al procesar la imagen');
        }
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
            if (!file.mimetype.startsWith('image/')) {
                return cb(new _common.BadRequestException('Solo se permiten imágenes'), false);
            }
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
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard)
], UploadController);

//# sourceMappingURL=upload.controller.js.map