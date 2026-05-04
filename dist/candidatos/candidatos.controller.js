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
exports.CandidatosController = void 0;
const common_1 = require("@nestjs/common");
const candidatos_service_1 = require("./candidatos.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let CandidatosController = class CandidatosController {
    constructor(svc) {
        this.svc = svc;
    }
    async listar(u, q) {
        const data = await this.svc.listar(u.userId, q);
        return { ok: true, message: 'Candidatos obtenidos', data };
    }
    async habilidades(u) {
        const data = await this.svc.getHabilidades(u.userId);
        return { ok: true, message: 'Habilidades obtenidas', data };
    }
    async getIdiomas(u) {
        const idiomas = await this.svc.getIdiomas(u.userId);
        return { ok: true, message: 'Idiomas obtenidos', data: { idiomas } };
    }
    async addIdioma(u, body) {
        const idioma = await this.svc.addIdioma(u.userId, body);
        return { ok: true, message: 'Idioma agregado', data: { idioma } };
    }
    async updateIdioma(u, body) {
        const idioma = await this.svc.updateIdioma(u.userId, body);
        return { ok: true, message: 'Idioma actualizado', data: { idioma } };
    }
    async deleteIdioma(u, id) {
        await this.svc.deleteIdioma(u.userId, id);
        return { ok: true, message: 'Idioma eliminado' };
    }
    async getExperiencia(u) {
        const experiencia = await this.svc.getExperiencia(u.userId);
        return { ok: true, message: 'Experiencia obtenida', data: { experiencia } };
    }
    async addExperiencia(u, body) {
        const experiencia = await this.svc.addExperiencia(u.userId, body);
        return { ok: true, message: 'Experiencia agregada', data: { experiencia } };
    }
    async updateExperiencia(u, body) {
        const experiencia = await this.svc.updateExperiencia(u.userId, body);
        return { ok: true, message: 'Experiencia actualizada', data: { experiencia } };
    }
    async deleteExperiencia(u, id) {
        await this.svc.deleteExperiencia(u.userId, id);
        return { ok: true, message: 'Experiencia eliminada' };
    }
    async getEducacion(u) {
        const educacion = await this.svc.getEducacion(u.userId);
        return { ok: true, message: 'Educación obtenida', data: { educacion } };
    }
    async addEducacion(u, body) {
        const educacion = await this.svc.addEducacion(u.userId, body);
        return { ok: true, message: 'Educación agregada', data: { educacion } };
    }
    async updateEducacion(u, body) {
        const educacion = await this.svc.updateEducacion(u.userId, body);
        return { ok: true, message: 'Educación actualizada', data: { educacion } };
    }
    async deleteEducacion(u, id) {
        await this.svc.deleteEducacion(u.userId, id);
        return { ok: true, message: 'Educación eliminada' };
    }
    async getPerfilPublico(u, id) {
        const data = await this.svc.getPerfilPublico(u.userId, id);
        return { ok: true, message: 'Perfil obtenido', data };
    }
};
exports.CandidatosController = CandidatosController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('company'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CandidatosController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)('habilidades'),
    (0, roles_decorator_1.Roles)('candidate'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CandidatosController.prototype, "habilidades", null);
__decorate([
    (0, common_1.Get)('idiomas'),
    (0, roles_decorator_1.Roles)('candidate'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CandidatosController.prototype, "getIdiomas", null);
__decorate([
    (0, common_1.Post)('idiomas'),
    (0, roles_decorator_1.Roles)('candidate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CandidatosController.prototype, "addIdioma", null);
__decorate([
    (0, common_1.Patch)('idiomas'),
    (0, roles_decorator_1.Roles)('candidate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CandidatosController.prototype, "updateIdioma", null);
__decorate([
    (0, common_1.Delete)('idiomas'),
    (0, roles_decorator_1.Roles)('candidate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CandidatosController.prototype, "deleteIdioma", null);
__decorate([
    (0, common_1.Get)('experiencia'),
    (0, roles_decorator_1.Roles)('candidate'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CandidatosController.prototype, "getExperiencia", null);
__decorate([
    (0, common_1.Post)('experiencia'),
    (0, roles_decorator_1.Roles)('candidate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CandidatosController.prototype, "addExperiencia", null);
__decorate([
    (0, common_1.Patch)('experiencia'),
    (0, roles_decorator_1.Roles)('candidate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CandidatosController.prototype, "updateExperiencia", null);
__decorate([
    (0, common_1.Delete)('experiencia'),
    (0, roles_decorator_1.Roles)('candidate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CandidatosController.prototype, "deleteExperiencia", null);
__decorate([
    (0, common_1.Get)('educacion'),
    (0, roles_decorator_1.Roles)('candidate'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CandidatosController.prototype, "getEducacion", null);
__decorate([
    (0, common_1.Post)('educacion'),
    (0, roles_decorator_1.Roles)('candidate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CandidatosController.prototype, "addEducacion", null);
__decorate([
    (0, common_1.Patch)('educacion'),
    (0, roles_decorator_1.Roles)('candidate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CandidatosController.prototype, "updateEducacion", null);
__decorate([
    (0, common_1.Delete)('educacion'),
    (0, roles_decorator_1.Roles)('candidate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CandidatosController.prototype, "deleteEducacion", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('company'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CandidatosController.prototype, "getPerfilPublico", null);
exports.CandidatosController = CandidatosController = __decorate([
    (0, common_1.Controller)('candidatos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [candidatos_service_1.CandidatosService])
], CandidatosController);
//# sourceMappingURL=candidatos.controller.js.map