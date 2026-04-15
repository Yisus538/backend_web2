"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const email_module_1 = require("./email/email.module");
const vacantes_module_1 = require("./vacantes/vacantes.module");
const postulaciones_module_1 = require("./postulaciones/postulaciones.module");
const candidatos_module_1 = require("./candidatos/candidatos.module");
const cv_module_1 = require("./cv/cv.module");
const upload_module_1 = require("./upload/upload.module");
const health_module_1 = require("./health/health.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: 'default',
                    ttl: 900_000,
                    limit: 100,
                },
            ]),
            prisma_module_1.PrismaModule,
            email_module_1.EmailModule,
            auth_module_1.AuthModule,
            vacantes_module_1.VacantesModule,
            postulaciones_module_1.PostulacionesModule,
            candidatos_module_1.CandidatosModule,
            cv_module_1.CvModule,
            upload_module_1.UploadModule,
            health_module_1.HealthModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map