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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const nav_service_1 = require("./nav.service");
const password_utils_1 = require("../common/utils/password.utils");
const token_utils_1 = require("../common/utils/token.utils");
const MAX_FAILED = 5;
const LOCK_MINUTES = 15;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_production_min32chars';
const JWT_REF_SEC = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_in_production_32c';
const JWT_EXP = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REF_EXP = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
let AuthService = class AuthService {
    constructor(prisma, email, navService) {
        this.prisma = prisma;
        this.email = email;
        this.navService = navService;
        this.resendCooldown = new Map();
        this.COOLDOWN_MS = 2 * 60 * 1000;
    }
    generateTokens(payload) {
        return {
            accessToken: jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXP }),
            refreshToken: jwt.sign(payload, JWT_REF_SEC, { expiresIn: JWT_REF_EXP }),
        };
    }
    toPublicUser(user) {
        return {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
            avatarUrl: user.avatarUrl ?? null,
        };
    }
    async register(dto) {
        if (dto.password !== dto.confirmPassword) {
            throw new common_1.BadRequestException('Las contraseñas no coinciden');
        }
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing)
            throw new common_1.ConflictException('El correo electrónico ya está registrado');
        const { valid, errors } = (0, password_utils_1.validatePasswordStrength)(dto.password);
        if (!valid) {
            throw new common_1.BadRequestException({
                message: 'La contraseña no es segura',
                errors: errors.map((m) => ({ field: 'password', message: m })),
            });
        }
        const passwordHash = await (0, password_utils_1.hashPassword)(dto.password);
        const user = await this.prisma.user.create({
            data: {
                fullName: dto.fullName,
                email: dto.email,
                passwordHash,
                role: dto.role,
            },
        });
        const rawToken = (0, token_utils_1.generateToken)();
        const tokenHash = (0, token_utils_1.hashToken)(rawToken);
        const expiresAt = (0, token_utils_1.getVerificationTokenExpiry)();
        await this.prisma.user.update({
            where: { id: user.id },
            data: { verificationTokenHash: tokenHash, verificationTokenExpiresAt: expiresAt },
        });
        this.email
            .sendVerificationEmail(user.email, user.fullName, rawToken)
            .catch((err) => console.error('[register] Error enviando email:', err));
        return this.toPublicUser(user);
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user)
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        if (!user.isActive) {
            throw new common_1.ForbiddenException('Tu cuenta está deshabilitada. Contactá soporte.');
        }
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
            throw new common_1.HttpException({ ok: false, message: `Cuenta bloqueada. Intentá en ${minutesLeft} minuto(s).` }, 423);
        }
        const isValid = await (0, password_utils_1.comparePassword)(dto.password, user.passwordHash);
        if (!isValid) {
            const attempts = user.failedLoginAttempts + 1;
            await this.prisma.user.update({
                where: { id: user.id },
                data: { failedLoginAttempts: attempts },
            });
            if (attempts >= MAX_FAILED) {
                const lockUntil = new Date(Date.now() + LOCK_MINUTES * 60_000);
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { lockedUntil: lockUntil },
                });
                throw new common_1.HttpException({ ok: false, message: `Cuenta bloqueada. Intentá en ${LOCK_MINUTES} minuto(s).` }, 423);
            }
            const remaining = MAX_FAILED - attempts;
            throw new common_1.UnauthorizedException(`Credenciales inválidas (${remaining} intentos restantes)`);
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockedUntil: null },
        });
        if (!user.isEmailVerified) {
            throw new common_1.HttpException({
                ok: false,
                message: 'Verificá tu correo electrónico antes de iniciar sesión.',
                code: 'EMAIL_NOT_VERIFIED',
                data: { email: user.email },
            }, common_1.HttpStatus.FORBIDDEN);
        }
        const tokens = this.generateTokens({ userId: user.id, email: user.email, role: user.role });
        const nav = await this.navService.getNavForRole(user.role);
        return { user: this.toPublicUser(user), tokens, nav };
    }
    async refreshTokens(refreshToken) {
        if (!refreshToken)
            throw new common_1.BadRequestException('Refresh token requerido');
        try {
            const payload = jwt.verify(refreshToken, JWT_REF_SEC);
            const user = await this.prisma.user.findUnique({ where: { id: payload.userId } });
            if (!user || !user.isActive)
                throw new Error();
            return this.generateTokens({ userId: user.id, email: user.email, role: user.role });
        }
        catch {
            throw new common_1.UnauthorizedException('Refresh token inválido o expirado');
        }
    }
    async getMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, fullName: true, email: true, role: true,
                avatarUrl: true, telefono: true, ubicacion: true, titulo: true,
                isEmailVerified: true,
            },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Usuario no encontrado');
        const nav = await this.navService.getNavForRole(user.role);
        return { user, nav };
    }
    async updateMe(userId, dto) {
        const { fullName, telefono, ubicacion, titulo, avatarUrl } = dto;
        if (avatarUrl !== undefined && avatarUrl !== null && avatarUrl !== '') {
            try {
                new URL(avatarUrl);
            }
            catch {
                throw new common_1.BadRequestException('avatarUrl debe ser una URL https válida');
            }
        }
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...(fullName ? { fullName } : {}),
                ...(telefono !== undefined ? { telefono } : {}),
                ...(ubicacion !== undefined ? { ubicacion } : {}),
                ...(titulo !== undefined ? { titulo } : {}),
                ...(avatarUrl !== undefined ? { avatarUrl: avatarUrl || null } : {}),
            },
            select: {
                id: true, fullName: true, email: true, role: true,
                avatarUrl: true, telefono: true, ubicacion: true, titulo: true,
            },
        });
        return updated;
    }
    async verifyEmail(rawToken) {
        if (!rawToken)
            throw new common_1.BadRequestException('Token requerido');
        const tokenHash = (0, token_utils_1.hashToken)(rawToken);
        const user = await this.prisma.user.findFirst({
            where: { verificationTokenHash: tokenHash },
        });
        if (!user)
            throw new common_1.BadRequestException('El enlace de verificación es inválido');
        if (!(0, token_utils_1.isTokenValid)(user.verificationTokenExpiresAt)) {
            throw new common_1.BadRequestException('El enlace expiró. Registrate nuevamente.');
        }
        if (user.isEmailVerified)
            return 'Tu cuenta ya estaba verificada';
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                isEmailVerified: true,
                verificationTokenHash: null,
                verificationTokenExpiresAt: null,
            },
        });
        return 'Cuenta verificada exitosamente. Ya podés iniciar sesión.';
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user || !user.isActive)
            return;
        const rawToken = (0, token_utils_1.generateToken)();
        const tokenHash = (0, token_utils_1.hashToken)(rawToken);
        const expiresAt = (0, token_utils_1.getResetTokenExpiry)();
        await this.prisma.user.update({
            where: { id: user.id },
            data: { resetTokenHash: tokenHash, resetTokenExpiresAt: expiresAt },
        });
        this.email
            .sendPasswordResetEmail(user.email, rawToken)
            .catch((err) => console.error('[forgotPassword] Error email:', err));
    }
    async resetPassword(dto) {
        if (dto.newPassword !== dto.confirmPassword) {
            throw new common_1.BadRequestException('Las contraseñas no coinciden');
        }
        const tokenHash = (0, token_utils_1.hashToken)(dto.token);
        const user = await this.prisma.user.findFirst({ where: { resetTokenHash: tokenHash } });
        if (!user)
            throw new common_1.BadRequestException('El enlace de restablecimiento es inválido');
        if (!(0, token_utils_1.isTokenValid)(user.resetTokenExpiresAt)) {
            throw new common_1.BadRequestException('El enlace expiró. Solicitá uno nuevo.');
        }
        const { valid, errors } = (0, password_utils_1.validatePasswordStrength)(dto.newPassword);
        if (!valid) {
            throw new common_1.BadRequestException({
                message: 'La contraseña no es segura',
                errors: errors.map((m) => ({ field: 'newPassword', message: m })),
            });
        }
        const passwordHash = await (0, password_utils_1.hashPassword)(dto.newPassword);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetTokenHash: null,
                resetTokenExpiresAt: null,
                failedLoginAttempts: 0,
                lockedUntil: null,
            },
        });
    }
    async resendVerification(email, userId) {
        let user = null;
        if (email) {
            user = await this.prisma.user.findUnique({ where: { email } });
        }
        else if (userId) {
            user = await this.prisma.user.findUnique({ where: { id: userId } });
        }
        if (!user || !user.isActive) {
            return 'Si el correo existe, se envió un nuevo enlace de verificación.';
        }
        if (user.isEmailVerified) {
            return 'Tu cuenta ya está verificada. Podés iniciar sesión.';
        }
        const lastSent = this.resendCooldown.get(user.id);
        const now = Date.now();
        if (lastSent && now - lastSent < this.COOLDOWN_MS) {
            const secs = Math.ceil((this.COOLDOWN_MS - (now - lastSent)) / 1000);
            throw new common_1.HttpException({ ok: false, message: `Esperá ${secs} segundos antes de reenviar.` }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        const rawToken = (0, token_utils_1.generateToken)();
        const tokenHash = (0, token_utils_1.hashToken)(rawToken);
        const expiresAt = (0, token_utils_1.getVerificationTokenExpiry)();
        await this.prisma.user.update({
            where: { id: user.id },
            data: { verificationTokenHash: tokenHash, verificationTokenExpiresAt: expiresAt },
        });
        try {
            await this.email.sendVerificationEmail(user.email, user.fullName, rawToken);
        }
        catch {
            throw new common_1.BadRequestException('Error al enviar el correo. Intentá de nuevo en unos minutos.');
        }
        this.resendCooldown.set(user.id, now);
        return 'Enlace de verificación reenviado. Revisá tu correo.';
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        nav_service_1.NavService])
], AuthService);
//# sourceMappingURL=auth.service.js.map