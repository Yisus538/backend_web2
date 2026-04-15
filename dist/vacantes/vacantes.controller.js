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
exports.VacantesController = void 0;
const common_1 = require("@nestjs/common");
const vacantes_service_1 = require("./vacantes.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const create_vacante_dto_1 = require("./dto/create-vacante.dto");
let VacantesController = class VacantesController {
    constructor(svc) {
        this.svc = svc;
    }
    async publicas(u, search, page = 1, limit = 10) {
        const data = await this.svc.publicas(u.userId, search, +page, +limit);
        return { ok: true, message: 'Vacantes obtenidas', data };
    }
    async recomendadas(u, limit = 6) {
        const data = await this.svc.recomendadas(u.userId, +limit);
        return { ok: true, message: 'Vacantes recomendadas', data };
    }
    async listar(u, estado, search, page = 1, limit = 10) {
        const result = await this.svc.listar(u.userId, { estado, search }, { page: +page, limit: +limit });
        return {
            ok: true,
            message: 'Vacantes obtenidas',
            data: {
                vacantes: result.items,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                },
            },
        };
    }
    async crear(u, dto) {
        const vacante = await this.svc.crear(u.userId, dto);
        return { ok: true, message: 'Vacante creada exitosamente', data: { vacante } };
    }
    async obtener(u, id) {
        const vacante = await this.svc.obtener(u.userId, id);
        return { ok: true, message: 'Vacante obtenida', data: { vacante } };
    }
    async actualizar(u, id, body) {
        const keys = Object.keys(body ?? {});
        if (keys.length === 1 && keys[0] === 'estado') {
            const vacante = await this.svc.cambiarEstado(u.userId, id, body.estado);
            return { ok: true, message: 'Estado actualizado', data: { vacante } };
        }
        const vacante = await this.svc.actualizar(u.userId, id, body);
        return { ok: true, message: 'Vacante actualizada', data: { vacante } };
    }
    async eliminar(u, id) {
        await this.svc.eliminar(u.userId, id);
        return { ok: true, message: 'Vacante eliminada' };
    }
};
exports.VacantesController = VacantesController;
__decorate([
    (0, common_1.Get)('publicas'),
    (0, roles_decorator_1.Roles)('candidate'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, Object]),
    __metadata("design:returntype", Promise)
], VacantesController.prototype, "publicas", null);
__decorate([
    (0, common_1.Get)('recomendadas'),
    (0, roles_decorator_1.Roles)('candidate'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VacantesController.prototype, "recomendadas", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('company'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('estado')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], VacantesController.prototype, "listar", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_vacante_dto_1.CreateVacanteDto]),
    __metadata("design:returntype", Promise)
], VacantesController.prototype, "crear", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('company'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VacantesController.prototype, "obtener", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('company'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], VacantesController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('company'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VacantesController.prototype, "eliminar", null);
exports.VacantesController = VacantesController = __decorate([
    (0, common_1.Controller)('vacantes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [vacantes_service_1.VacantesService])
], VacantesController);
//# sourceMappingURL=vacantes.controller.js.map