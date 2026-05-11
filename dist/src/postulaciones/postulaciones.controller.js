"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PostulacionesController", {
    enumerable: true,
    get: function() {
        return PostulacionesController;
    }
});
const _common = require("@nestjs/common");
const _postulacionesservice = require("./postulaciones.service");
const _jwtauthguard = require("../common/guards/jwt-auth.guard");
const _rolesguard = require("../common/guards/roles.guard");
const _rolesdecorator = require("../common/decorators/roles.decorator");
const _currentuserdecorator = require("../common/decorators/current-user.decorator");
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
let PostulacionesController = class PostulacionesController {
    // ────────────────────────────────────────────────────────────
    // GET /api/postulaciones/vacante/:vacanteId  — empresa: postulantes de una vacante
    // IMPORTANTE: ruta estática antes del dinámico GET()
    // ────────────────────────────────────────────────────────────
    async listarPorVacante(u, vacanteId) {
        const data = await this.svc.listarPorVacante(u.userId, vacanteId);
        return {
            ok: true,
            message: 'Postulantes obtenidos',
            data
        };
    }
    // ────────────────────────────────────────────────────────────
    // PATCH /api/postulaciones/:id/estado  — empresa: actualiza estado
    // ────────────────────────────────────────────────────────────
    async actualizarEstado(u, id, estado) {
        const data = await this.svc.actualizarEstado(u.userId, id, estado);
        return {
            ok: true,
            message: 'Estado actualizado',
            data
        };
    }
    // ────────────────────────────────────────────────────────────
    // GET /api/postulaciones?estado=en-curso
    // ────────────────────────────────────────────────────────────
    async listar(u, estado) {
        const data = await this.svc.listar(u.userId, estado);
        return {
            ok: true,
            message: 'Candidaturas obtenidas',
            data
        };
    }
    // ────────────────────────────────────────────────────────────
    // POST /api/postulaciones
    // ────────────────────────────────────────────────────────────
    async crear(u, ofertaId) {
        const postulacion = await this.svc.crear(u.userId, ofertaId);
        return {
            ok: true,
            message: 'Postulación creada exitosamente',
            data: {
                postulacion
            }
        };
    }
    // ────────────────────────────────────────────────────────────
    // DELETE /api/postulaciones?id=xxx
    // ────────────────────────────────────────────────────────────
    async retirar(u, id) {
        await this.svc.retirar(u.userId, id);
        return {
            ok: true,
            message: 'Postulación retirada exitosamente'
        };
    }
    constructor(svc){
        this.svc = svc;
    }
};
_ts_decorate([
    (0, _common.Get)('vacante/:vacanteId'),
    (0, _rolesdecorator.Roles)('company'),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(1, (0, _common.Param)('vacanteId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PostulacionesController.prototype, "listarPorVacante", null);
_ts_decorate([
    (0, _common.Patch)(':id/estado'),
    (0, _rolesdecorator.Roles)('company'),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_param(2, (0, _common.Body)('estado')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload,
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PostulacionesController.prototype, "actualizarEstado", null);
_ts_decorate([
    (0, _common.Get)(),
    (0, _rolesdecorator.Roles)('candidate'),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(1, (0, _common.Query)('estado')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PostulacionesController.prototype, "listar", null);
_ts_decorate([
    (0, _common.Post)(),
    (0, _rolesdecorator.Roles)('candidate'),
    (0, _common.HttpCode)(_common.HttpStatus.CREATED),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(1, (0, _common.Body)('ofertaId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PostulacionesController.prototype, "crear", null);
_ts_decorate([
    (0, _common.Delete)(),
    (0, _rolesdecorator.Roles)('candidate'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(1, (0, _common.Query)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PostulacionesController.prototype, "retirar", null);
PostulacionesController = _ts_decorate([
    (0, _common.Controller)('postulaciones'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _postulacionesservice.PostulacionesService === "undefined" ? Object : _postulacionesservice.PostulacionesService
    ])
], PostulacionesController);

//# sourceMappingURL=postulaciones.controller.js.map