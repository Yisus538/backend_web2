"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "VacantesController", {
    enumerable: true,
    get: function() {
        return VacantesController;
    }
});
const _common = require("@nestjs/common");
const _vacantesservice = require("./vacantes.service");
const _jwtauthguard = require("../common/guards/jwt-auth.guard");
const _rolesguard = require("../common/guards/roles.guard");
const _rolesdecorator = require("../common/decorators/roles.decorator");
const _currentuserdecorator = require("../common/decorators/current-user.decorator");
const _createvacantedto = require("./dto/create-vacante.dto");
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
let VacantesController = class VacantesController {
    // ⚠️  IMPORTANTE: Las rutas estáticas (publicas, recomendadas) DEBEN ir
    //     ANTES del parámetro dinámico (:id) para que NestJS las resuelva bien.
    // ────────────────────────────────────────────────────────────
    // GET /api/vacantes/publicas  — candidatos: listado paginado
    // ────────────────────────────────────────────────────────────
    async publicas(u, search, page = 1, limit = 10) {
        const data = await this.svc.publicas(u.userId, search, +page, +limit);
        return {
            ok: true,
            message: 'Vacantes obtenidas',
            data
        };
    }
    // ────────────────────────────────────────────────────────────
    // GET /api/vacantes/habilidades-demandadas  — candidatos
    // ────────────────────────────────────────────────────────────
    async habilidadesDemandadas() {
        const data = await this.svc.habilidadesDemandadas();
        return {
            ok: true,
            message: 'Habilidades demandadas obtenidas',
            data
        };
    }
    // ────────────────────────────────────────────────────────────
    // GET /api/vacantes/publicas/:id  — candidatos: detalle      🆕
    // ────────────────────────────────────────────────────────────
    async publicaById(u, id) {
        const data = await this.svc.publicaById(u.userId, id);
        return {
            ok: true,
            message: 'Vacante obtenida',
            data: {
                vacante: data
            }
        };
    }
    // ────────────────────────────────────────────────────────────
    // GET /api/vacantes/recomendadas  — candidatos
    // ────────────────────────────────────────────────────────────
    async recomendadas(u, limit = 6) {
        const data = await this.svc.recomendadas(u.userId, +limit);
        return {
            ok: true,
            message: 'Vacantes recomendadas',
            data
        };
    }
    // ────────────────────────────────────────────────────────────
    // GET /api/vacantes  — empresa: lista sus propias vacantes
    // ────────────────────────────────────────────────────────────
    async listar(u, estado, search, page = 1, limit = 10) {
        const result = await this.svc.listar(u.userId, {
            estado,
            search
        }, {
            page: +page,
            limit: +limit
        });
        return {
            ok: true,
            message: 'Vacantes obtenidas',
            data: {
                vacantes: result.items,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages
                }
            }
        };
    }
    // ────────────────────────────────────────────────────────────
    // POST /api/vacantes  — empresa: crea vacante
    // ────────────────────────────────────────────────────────────
    async crear(u, dto) {
        const vacante = await this.svc.crear(u.userId, dto);
        return {
            ok: true,
            message: 'Vacante creada exitosamente',
            data: {
                vacante
            }
        };
    }
    // ────────────────────────────────────────────────────────────
    // GET /api/vacantes/:id  — empresa: detalle de su vacante
    // ────────────────────────────────────────────────────────────
    async obtener(u, id) {
        const vacante = await this.svc.obtener(u.userId, id);
        return {
            ok: true,
            message: 'Vacante obtenida',
            data: {
                vacante
            }
        };
    }
    // ────────────────────────────────────────────────────────────
    // PATCH /api/vacantes/:id  — empresa: actualiza / cambia estado
    // ────────────────────────────────────────────────────────────
    async actualizar(u, id, body) {
        const keys = Object.keys(body ?? {});
        if (keys.length === 1 && keys[0] === 'estado') {
            const vacante = await this.svc.cambiarEstado(u.userId, id, body.estado);
            return {
                ok: true,
                message: 'Estado actualizado',
                data: {
                    vacante
                }
            };
        }
        const vacante = await this.svc.actualizar(u.userId, id, body);
        return {
            ok: true,
            message: 'Vacante actualizada',
            data: {
                vacante
            }
        };
    }
    // ────────────────────────────────────────────────────────────
    // DELETE /api/vacantes/:id  — empresa: elimina vacante
    // ────────────────────────────────────────────────────────────
    async eliminar(u, id) {
        await this.svc.eliminar(u.userId, id);
        return {
            ok: true,
            message: 'Vacante eliminada'
        };
    }
    constructor(svc){
        this.svc = svc;
    }
};
_ts_decorate([
    (0, _common.Get)('publicas'),
    (0, _rolesdecorator.Roles)('candidate'),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(1, (0, _common.Query)('search')),
    _ts_param(2, (0, _common.Query)('page')),
    _ts_param(3, (0, _common.Query)('limit')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload,
        String,
        void 0,
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], VacantesController.prototype, "publicas", null);
_ts_decorate([
    (0, _common.Get)('habilidades-demandadas'),
    (0, _rolesdecorator.Roles)('candidate'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], VacantesController.prototype, "habilidadesDemandadas", null);
_ts_decorate([
    (0, _common.Get)('publicas/:id'),
    (0, _rolesdecorator.Roles)('candidate'),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], VacantesController.prototype, "publicaById", null);
_ts_decorate([
    (0, _common.Get)('recomendadas'),
    (0, _rolesdecorator.Roles)('candidate'),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(1, (0, _common.Query)('limit')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload,
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], VacantesController.prototype, "recomendadas", null);
_ts_decorate([
    (0, _common.Get)(),
    (0, _rolesdecorator.Roles)('company'),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(1, (0, _common.Query)('estado')),
    _ts_param(2, (0, _common.Query)('search')),
    _ts_param(3, (0, _common.Query)('page')),
    _ts_param(4, (0, _common.Query)('limit')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload,
        String,
        String,
        void 0,
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], VacantesController.prototype, "listar", null);
_ts_decorate([
    (0, _common.Post)(),
    (0, _rolesdecorator.Roles)('company'),
    (0, _common.HttpCode)(_common.HttpStatus.CREATED),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload,
        typeof _createvacantedto.CreateVacanteDto === "undefined" ? Object : _createvacantedto.CreateVacanteDto
    ]),
    _ts_metadata("design:returntype", Promise)
], VacantesController.prototype, "crear", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    (0, _rolesdecorator.Roles)('company'),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], VacantesController.prototype, "obtener", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    (0, _rolesdecorator.Roles)('company'),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_param(2, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload,
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], VacantesController.prototype, "actualizar", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    (0, _rolesdecorator.Roles)('company'),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], VacantesController.prototype, "eliminar", null);
VacantesController = _ts_decorate([
    (0, _common.Controller)('vacantes'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _vacantesservice.VacantesService === "undefined" ? Object : _vacantesservice.VacantesService
    ])
], VacantesController);

//# sourceMappingURL=vacantes.controller.js.map