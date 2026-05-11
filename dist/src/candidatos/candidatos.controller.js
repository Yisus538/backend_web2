"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CandidatosController", {
    enumerable: true,
    get: function() {
        return CandidatosController;
    }
});
const _common = require("@nestjs/common");
const _candidatosservice = require("./candidatos.service");
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
let CandidatosController = class CandidatosController {
    // ────────────────────────────────────────────────────────────
    // GET /api/candidatos  — solo empresas
    // Query: search, vacanteId, page, limit
    // ────────────────────────────────────────────────────────────
    async listar(u, q) {
        const data = await this.svc.listar(u.userId, q);
        return {
            ok: true,
            message: 'Candidatos obtenidos',
            data
        };
    }
    // ────────────────────────────────────────────────────────────
    // GET /api/candidatos/habilidades  — candidatos
    // ────────────────────────────────────────────────────────────
    async habilidades(u) {
        const data = await this.svc.getHabilidades(u.userId);
        return {
            ok: true,
            message: 'Habilidades obtenidas',
            data
        };
    }
    // ══════════════════ IDIOMAS ══════════════════════════════════
    async getIdiomas(u) {
        const idiomas = await this.svc.getIdiomas(u.userId);
        return {
            ok: true,
            message: 'Idiomas obtenidos',
            data: {
                idiomas
            }
        };
    }
    async addIdioma(u, body) {
        const idioma = await this.svc.addIdioma(u.userId, body);
        return {
            ok: true,
            message: 'Idioma agregado',
            data: {
                idioma
            }
        };
    }
    async updateIdioma(u, body) {
        const idioma = await this.svc.updateIdioma(u.userId, body);
        return {
            ok: true,
            message: 'Idioma actualizado',
            data: {
                idioma
            }
        };
    }
    // DELETE /api/candidatos/idiomas?id=xxx
    async deleteIdioma(u, id) {
        await this.svc.deleteIdioma(u.userId, id);
        return {
            ok: true,
            message: 'Idioma eliminado'
        };
    }
    // ══════════════════ EXPERIENCIA ══════════════════════════════
    async getExperiencia(u) {
        const experiencia = await this.svc.getExperiencia(u.userId);
        return {
            ok: true,
            message: 'Experiencia obtenida',
            data: {
                experiencia
            }
        };
    }
    async addExperiencia(u, body) {
        const experiencia = await this.svc.addExperiencia(u.userId, body);
        return {
            ok: true,
            message: 'Experiencia agregada',
            data: {
                experiencia
            }
        };
    }
    async updateExperiencia(u, body) {
        const experiencia = await this.svc.updateExperiencia(u.userId, body);
        return {
            ok: true,
            message: 'Experiencia actualizada',
            data: {
                experiencia
            }
        };
    }
    // DELETE /api/candidatos/experiencia?id=xxx
    async deleteExperiencia(u, id) {
        await this.svc.deleteExperiencia(u.userId, id);
        return {
            ok: true,
            message: 'Experiencia eliminada'
        };
    }
    // ══════════════════ EDUCACIÓN ════════════════════════════════
    async getEducacion(u) {
        const educacion = await this.svc.getEducacion(u.userId);
        return {
            ok: true,
            message: 'Educación obtenida',
            data: {
                educacion
            }
        };
    }
    async addEducacion(u, body) {
        const educacion = await this.svc.addEducacion(u.userId, body);
        return {
            ok: true,
            message: 'Educación agregada',
            data: {
                educacion
            }
        };
    }
    async updateEducacion(u, body) {
        const educacion = await this.svc.updateEducacion(u.userId, body);
        return {
            ok: true,
            message: 'Educación actualizada',
            data: {
                educacion
            }
        };
    }
    // DELETE /api/candidatos/educacion?id=xxx
    async deleteEducacion(u, id) {
        await this.svc.deleteEducacion(u.userId, id);
        return {
            ok: true,
            message: 'Educación eliminada'
        };
    }
    // ────────────────────────────────────────────────────────────
    // GET /api/candidatos/:id  — empresa ve perfil público + cvUrl
    // Va al final para que las rutas específicas (/habilidades, etc.) tengan prioridad
    // ────────────────────────────────────────────────────────────
    async getPerfilPublico(u, id) {
        const data = await this.svc.getPerfilPublico(u.userId, id);
        return {
            ok: true,
            message: 'Perfil obtenido',
            data
        };
    }
    constructor(svc){
        this.svc = svc;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    (0, _rolesdecorator.Roles)('company'),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(1, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], CandidatosController.prototype, "listar", null);
_ts_decorate([
    (0, _common.Get)('habilidades'),
    (0, _rolesdecorator.Roles)('candidate'),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload
    ]),
    _ts_metadata("design:returntype", Promise)
], CandidatosController.prototype, "habilidades", null);
_ts_decorate([
    (0, _common.Get)('idiomas'),
    (0, _rolesdecorator.Roles)('candidate'),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload
    ]),
    _ts_metadata("design:returntype", Promise)
], CandidatosController.prototype, "getIdiomas", null);
_ts_decorate([
    (0, _common.Post)('idiomas'),
    (0, _rolesdecorator.Roles)('candidate'),
    (0, _common.HttpCode)(_common.HttpStatus.CREATED),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], CandidatosController.prototype, "addIdioma", null);
_ts_decorate([
    (0, _common.Patch)('idiomas'),
    (0, _rolesdecorator.Roles)('candidate'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], CandidatosController.prototype, "updateIdioma", null);
_ts_decorate([
    (0, _common.Delete)('idiomas'),
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
], CandidatosController.prototype, "deleteIdioma", null);
_ts_decorate([
    (0, _common.Get)('experiencia'),
    (0, _rolesdecorator.Roles)('candidate'),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload
    ]),
    _ts_metadata("design:returntype", Promise)
], CandidatosController.prototype, "getExperiencia", null);
_ts_decorate([
    (0, _common.Post)('experiencia'),
    (0, _rolesdecorator.Roles)('candidate'),
    (0, _common.HttpCode)(_common.HttpStatus.CREATED),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], CandidatosController.prototype, "addExperiencia", null);
_ts_decorate([
    (0, _common.Patch)('experiencia'),
    (0, _rolesdecorator.Roles)('candidate'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], CandidatosController.prototype, "updateExperiencia", null);
_ts_decorate([
    (0, _common.Delete)('experiencia'),
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
], CandidatosController.prototype, "deleteExperiencia", null);
_ts_decorate([
    (0, _common.Get)('educacion'),
    (0, _rolesdecorator.Roles)('candidate'),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload
    ]),
    _ts_metadata("design:returntype", Promise)
], CandidatosController.prototype, "getEducacion", null);
_ts_decorate([
    (0, _common.Post)('educacion'),
    (0, _rolesdecorator.Roles)('candidate'),
    (0, _common.HttpCode)(_common.HttpStatus.CREATED),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], CandidatosController.prototype, "addEducacion", null);
_ts_decorate([
    (0, _common.Patch)('educacion'),
    (0, _rolesdecorator.Roles)('candidate'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], CandidatosController.prototype, "updateEducacion", null);
_ts_decorate([
    (0, _common.Delete)('educacion'),
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
], CandidatosController.prototype, "deleteEducacion", null);
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
], CandidatosController.prototype, "getPerfilPublico", null);
CandidatosController = _ts_decorate([
    (0, _common.Controller)('candidatos'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _candidatosservice.CandidatosService === "undefined" ? Object : _candidatosservice.CandidatosService
    ])
], CandidatosController);

//# sourceMappingURL=candidatos.controller.js.map