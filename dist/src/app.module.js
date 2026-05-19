"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AppModule", {
    enumerable: true,
    get: function() {
        return AppModule;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _throttler = require("@nestjs/throttler");
const _prismamodule = require("./prisma/prisma.module");
const _authmodule = require("./auth/auth.module");
const _emailmodule = require("./email/email.module");
const _vacantesmodule = require("./vacantes/vacantes.module");
const _postulacionesmodule = require("./postulaciones/postulaciones.module");
const _candidatosmodule = require("./candidatos/candidatos.module");
const _cvmodule = require("./cv/cv.module");
const _uploadmodule = require("./upload/upload.module");
const _healthmodule = require("./health/health.module");
const _adminmodule = require("./admin/admin.module");
const _cloudinarymodule = require("./cloudinary/cloudinary.module");
const _navigationmodule = require("./navigation/navigation.module");
const _curriculummodule = require("./curriculum/curriculum.module");
const _entrevistasmodule = require("./entrevistas/entrevistas.module");
const _favoritosmodule = require("./favoritos/favoritos.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let AppModule = class AppModule {
};
AppModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _config.ConfigModule.forRoot({
                isGlobal: true
            }),
            _throttler.ThrottlerModule.forRoot([
                {
                    name: 'default',
                    ttl: 900_000,
                    limit: 100
                }
            ]),
            // ── Core ──
            _prismamodule.PrismaModule,
            _emailmodule.EmailModule,
            _cloudinarymodule.CloudinaryModule,
            _navigationmodule.NavigationModule,
            _curriculummodule.CurriculumModule,
            // ── Feature modules ──
            _authmodule.AuthModule,
            _vacantesmodule.VacantesModule,
            _postulacionesmodule.PostulacionesModule,
            _candidatosmodule.CandidatosModule,
            _cvmodule.CvModule,
            _uploadmodule.UploadModule,
            _healthmodule.HealthModule,
            _adminmodule.AdminModule,
            _entrevistasmodule.EntrevistasModule,
            _favoritosmodule.FavoritosModule
        ]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map