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
exports.PostulacionesController = void 0;
const common_1 = require("@nestjs/common");
const postulaciones_service_1 = require("./postulaciones.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let PostulacionesController = class PostulacionesController {
    constructor(svc) {
        this.svc = svc;
    }
    async listarPorVacante(u, vacanteId) {
        const data = await this.svc.listarPorVacante(u.userId, vacanteId);
        return { ok: true, message: 'Postulantes obtenidos', data };
    }
    async actualizarEstado(u, id, estado) {
        const data = await this.svc.actualizarEstado(u.userId, id, estado);
        return { ok: true, message: 'Estado actualizado', data };
    }
    async listar(u, estado) {
        const data = await this.svc.listar(u.userId, estado);
        return { ok: true, message: 'Candidaturas obtenidas', data };
    }
    async crear(u, ofertaId) {
        const postulacion = await this.svc.crear(u.userId, ofertaId);
        return {
            ok: true,
            message: 'Postulación creada exitosamente',
            data: { postulacion },
        };
    }
    async retirar(u, id) {
        await this.svc.retirar(u.userId, id);
        return { ok: true, message: 'Postulación retirada exitosamente' };
    }
};
exports.PostulacionesController = PostulacionesController;
__decorate([
    (0, common_1.Get)('vacante/:vacanteId'),
    (0, roles_decorator_1.Roles)('company'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('vacanteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PostulacionesController.prototype, "listarPorVacante", null);
__decorate([
    (0, common_1.Patch)(':id/estado'),
    (0, roles_decorator_1.Roles)('company'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('estado')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PostulacionesController.prototype, "actualizarEstado", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('candidate'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('estado')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PostulacionesController.prototype, "listar", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('candidate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('ofertaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PostulacionesController.prototype, "crear", null);
__decorate([
    (0, common_1.Delete)(),
    (0, roles_decorator_1.Roles)('candidate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PostulacionesController.prototype, "retirar", null);
exports.PostulacionesController = PostulacionesController = __decorate([
    (0, common_1.Controller)('postulaciones'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [postulaciones_service_1.PostulacionesService])
], PostulacionesController);
//# sourceMappingURL=postulaciones.controller.js.map