"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthController", {
    enumerable: true,
    get: function() {
        return AuthController;
    }
});
const _common = require("@nestjs/common");
const _throttler = require("@nestjs/throttler");
const _express = require("express");
const _authservice = require("./auth.service");
const _jwtauthguard = require("../common/guards/jwt-auth.guard");
const _currentuserdecorator = require("../common/decorators/current-user.decorator");
const _logindto = require("./dto/login.dto");
const _registerdto = require("./dto/register.dto");
const _forgotpassworddto = require("./dto/forgot-password.dto");
const _resetpassworddto = require("./dto/reset-password.dto");
const _updateprofiledto = require("./dto/update-profile.dto");
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
// ── Helpers de cookies ────────────────────────────────────────────────────────
// SameSite: 'none' + Secure: true  → requerido para dominios cruzados en producción
//   (frontend en Railway != backend en Railway → orígenes distintos)
// SameSite: 'lax'  + Secure: false → desarrollo local (localhost)
function cookieOptions(res) {
    const isProd = process.env.NODE_ENV === 'production';
    return {
        base: {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            path: '/'
        }
    };
}
function setAuthCookies(res, tokens) {
    const { base } = cookieOptions(res);
    res.cookie('accessToken', tokens.accessToken, {
        ...base,
        maxAge: 60 * 60 * 1000
    }); // 1h
    res.cookie('refreshToken', tokens.refreshToken, {
        ...base,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }); // 7d
}
function clearAuthCookies(res) {
    const { base } = cookieOptions(res);
    res.clearCookie('accessToken', base);
    res.clearCookie('refreshToken', base);
}
let AuthController = class AuthController {
    // ── POST /api/auth/login ──────────────────────────────────────────────────
    async login(dto, res) {
        const result = await this.authService.login(dto);
        // Los tokens van en cookies HttpOnly — el navegador los adjunta
        // automáticamente en cada request. El JS del cliente nunca los ve.
        setAuthCookies(res, result.tokens);
        // Se devuelve solo la información que la UI necesita: user y nav.
        // Los tokens no se incluyen en el body intencionalmente.
        return {
            ok: true,
            message: 'Sesión iniciada',
            data: {
                user: result.user,
                nav: result.nav,
                accessToken: result.tokens.accessToken,
                refreshToken: result.tokens.refreshToken
            }
        };
    }
    // ── POST /api/auth/logout ─────────────────────────────────────────────────
    // Las cookies HttpOnly no pueden borrarse desde JS, por eso existe este endpoint.
    async logout(res) {
        clearAuthCookies(res);
        return {
            ok: true,
            message: 'Sesión cerrada'
        };
    }
    // ── POST /api/auth/register ───────────────────────────────────────────────
    async register(dto) {
        const user = await this.authService.register(dto);
        return {
            ok: true,
            message: 'Cuenta creada exitosamente',
            data: {
                user
            }
        };
    }
    // ── GET /api/auth/me ──────────────────────────────────────────────────────
    async getMe(user) {
        const data = await this.authService.getMe(user.userId);
        return {
            ok: true,
            message: 'Usuario autenticado',
            data
        };
    }
    // ── PATCH /api/auth/me ────────────────────────────────────────────────────
    async updateMe(user, dto) {
        const updated = await this.authService.updateMe(user.userId, dto);
        return {
            ok: true,
            message: 'Perfil actualizado',
            data: {
                user: updated
            }
        };
    }
    // ── GET /api/auth/verify-email?token=xxx ─────────────────────────────────
    async verifyEmail(token) {
        const message = await this.authService.verifyEmail(token);
        return {
            ok: true,
            message
        };
    }
    // ── POST /api/auth/forgot-password ───────────────────────────────────────
    async forgotPassword(dto) {
        await this.authService.forgotPassword(dto);
        return {
            ok: true,
            message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.'
        };
    }
    // ── POST /api/auth/reset-password ─────────────────────────────────────────
    async resetPassword(dto) {
        await this.authService.resetPassword(dto);
        return {
            ok: true,
            message: 'Contraseña restablecida exitosamente'
        };
    }
    // ── POST /api/auth/refresh ────────────────────────────────────────────────
    // Lee el refreshToken de la cookie (ya no del body).
    async refresh(req, res, bodyRefreshToken) {
        const refreshToken = req.cookies?.refreshToken || bodyRefreshToken;
        if (!refreshToken) throw new _common.UnauthorizedException('No hay refresh token');
        const tokens = await this.authService.refreshTokens(refreshToken);
        setAuthCookies(res, tokens);
        return {
            ok: true,
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            },
            message: 'Tokens renovados'
        };
    }
    // ── POST /api/auth/resend-verification ───────────────────────────────────
    // Intenta obtener el userId desde la cookie si el usuario está logueado.
    async resendVerification(email, req) {
        let userId;
        try {
            const token = req.cookies?.accessToken;
            if (token) {
                const jwt = require('jsonwebtoken');
                const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_in_production_min32chars');
                userId = payload?.userId;
            }
        } catch  {
        // Token expirado o ausente → se usa solo el email del body
        }
        const message = await this.authService.resendVerification(email, userId);
        return {
            ok: true,
            message
        };
    }
    constructor(authService){
        this.authService = authService;
    }
};
_ts_decorate([
    (0, _common.Post)('login'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    (0, _throttler.Throttle)({
        default: {
            ttl: 900_000,
            limit: 5
        }
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Res)({
        passthrough: true
    })),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _logindto.LoginDto === "undefined" ? Object : _logindto.LoginDto,
        typeof _express.Response === "undefined" ? Object : _express.Response
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
_ts_decorate([
    (0, _common.Post)('logout'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    _ts_param(0, (0, _common.Res)({
        passthrough: true
    })),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _express.Response === "undefined" ? Object : _express.Response
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
_ts_decorate([
    (0, _common.Post)('register'),
    (0, _throttler.Throttle)({
        default: {
            ttl: 900_000,
            limit: 5
        }
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _registerdto.RegisterDto === "undefined" ? Object : _registerdto.RegisterDto
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
_ts_decorate([
    (0, _common.Get)('me'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
_ts_decorate([
    (0, _common.Patch)('me'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.JwtPayload === "undefined" ? Object : _currentuserdecorator.JwtPayload,
        typeof _updateprofiledto.UpdateProfileDto === "undefined" ? Object : _updateprofiledto.UpdateProfileDto
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "updateMe", null);
_ts_decorate([
    (0, _common.Get)('verify-email'),
    _ts_param(0, (0, _common.Query)('token')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
_ts_decorate([
    (0, _common.Post)('forgot-password'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    (0, _throttler.Throttle)({
        default: {
            ttl: 900_000,
            limit: 3
        }
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _forgotpassworddto.ForgotPasswordDto === "undefined" ? Object : _forgotpassworddto.ForgotPasswordDto
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
_ts_decorate([
    (0, _common.Post)('reset-password'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _resetpassworddto.ResetPasswordDto === "undefined" ? Object : _resetpassworddto.ResetPasswordDto
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
_ts_decorate([
    (0, _common.Post)('refresh'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Res)({
        passthrough: true
    })),
    _ts_param(2, (0, _common.Body)('refreshToken')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _express.Request === "undefined" ? Object : _express.Request,
        typeof _express.Response === "undefined" ? Object : _express.Response,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
_ts_decorate([
    (0, _common.Post)('resend-verification'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    _ts_param(0, (0, _common.Body)('email')),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _express.Request === "undefined" ? Object : _express.Request
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "resendVerification", null);
AuthController = _ts_decorate([
    (0, _common.Controller)('auth'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _authservice.AuthService === "undefined" ? Object : _authservice.AuthService
    ])
], AuthController);

//# sourceMappingURL=auth.controller.js.map