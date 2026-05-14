"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthService", {
    enumerable: true,
    get: function() {
        return AuthService;
    }
});
const _common = require("@nestjs/common");
const _jsonwebtoken = /*#__PURE__*/ _interop_require_wildcard(require("jsonwebtoken"));
const _prismaservice = require("../prisma/prisma.service");
const _emailservice = require("../email/email.service");
const _navservice = require("./nav.service");
const _passwordutils = require("../common/utils/password.utils");
const _tokenutils = require("../common/utils/token.utils");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
const MAX_FAILED = 5;
const LOCK_MINUTES = 15;
// ⚠️  These MUST be read lazily (via getter) because at module-load time
//     ConfigModule hasn't loaded .env yet, so process.env.JWT_SECRET is undefined.
//     jwt.strategy.ts reads them inside its constructor (after DI), causing a
//     secret mismatch → "invalid signature" on every authenticated request.
const jwtSecret = ()=>process.env.JWT_SECRET || 'dev_secret_change_in_production_min32chars';
const jwtRefSec = ()=>process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_in_production_32c';
const jwtExp = ()=>process.env.JWT_EXPIRES_IN || '1h';
const jwtRefExp = ()=>process.env.JWT_REFRESH_EXPIRES_IN || '7d';
let AuthService = class AuthService {
    // ────────────────────────────────────────────────────────────
    // Helpers privados
    // ────────────────────────────────────────────────────────────
    generateTokens(payload) {
        return {
            accessToken: _jsonwebtoken.sign(payload, jwtSecret(), {
                expiresIn: jwtExp()
            }),
            refreshToken: _jsonwebtoken.sign(payload, jwtRefSec(), {
                expiresIn: jwtRefExp()
            })
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
            avatarUrl: user.avatarUrl ?? null
        };
    }
    // ────────────────────────────────────────────────────────────
    // POST /api/auth/register
    // ────────────────────────────────────────────────────────────
    async register(dto) {
        if (dto.password !== dto.confirmPassword) {
            throw new _common.BadRequestException('Las contraseñas no coinciden');
        }
        const existing = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        });
        if (existing) throw new _common.ConflictException('El correo electrónico ya está registrado');
        const { valid, errors } = (0, _passwordutils.validatePasswordStrength)(dto.password);
        if (!valid) {
            throw new _common.BadRequestException({
                message: 'La contraseña no es segura',
                errors: errors.map((m)=>({
                        field: 'password',
                        message: m
                    }))
            });
        }
        const passwordHash = await (0, _passwordutils.hashPassword)(dto.password);
        const user = await this.prisma.user.create({
            data: {
                fullName: dto.fullName,
                email: dto.email,
                passwordHash,
                role: dto.role
            }
        });
        // Token de verificación (SHA-256, nunca texto plano en DB)
        const rawToken = (0, _tokenutils.generateToken)();
        const tokenHash = (0, _tokenutils.hashToken)(rawToken);
        const expiresAt = (0, _tokenutils.getVerificationTokenExpiry)();
        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                verificationTokenHash: tokenHash,
                verificationTokenExpiresAt: expiresAt
            }
        });
        // Fire-and-forget — no bloquear la respuesta
        this.email.sendVerificationEmail(user.email, user.fullName, rawToken).catch((err)=>console.error('[register] Error enviando email:', err));
        return this.toPublicUser(user);
    }
    // ────────────────────────────────────────────────────────────
    // POST /api/auth/login
    // ────────────────────────────────────────────────────────────
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        });
        if (!user) throw new _common.UnauthorizedException('Credenciales inválidas');
        if (!user.isActive) {
            throw new _common.ForbiddenException('Tu cuenta está deshabilitada. Contactá soporte.');
        }
        // Cuenta bloqueada
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
            throw new _common.HttpException({
                ok: false,
                message: `Cuenta bloqueada. Intentá en ${minutesLeft} minuto(s).`
            }, 423);
        }
        const isValid = await (0, _passwordutils.comparePassword)(dto.password, user.passwordHash);
        if (!isValid) {
            const attempts = user.failedLoginAttempts + 1;
            await this.prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    failedLoginAttempts: attempts
                }
            });
            if (attempts >= MAX_FAILED) {
                const lockUntil = new Date(Date.now() + LOCK_MINUTES * 60_000);
                await this.prisma.user.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        lockedUntil: lockUntil
                    }
                });
                throw new _common.HttpException({
                    ok: false,
                    message: `Cuenta bloqueada. Intentá en ${LOCK_MINUTES} minuto(s).`
                }, 423);
            }
            const remaining = MAX_FAILED - attempts;
            throw new _common.UnauthorizedException(`Credenciales inválidas (${remaining} intentos restantes)`);
        }
        // Credenciales correctas → resetear contador
        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                failedLoginAttempts: 0,
                lockedUntil: null
            }
        });
        if (!user.isEmailVerified) {
            throw new _common.HttpException({
                ok: false,
                message: 'Verificá tu correo electrónico antes de iniciar sesión.',
                code: 'EMAIL_NOT_VERIFIED',
                data: {
                    email: user.email
                }
            }, _common.HttpStatus.FORBIDDEN);
        }
        const tokens = this.generateTokens({
            userId: user.id,
            email: user.email,
            role: user.role
        });
        const nav = await this.navService.getNavForRole(user.role);
        return {
            user: this.toPublicUser(user),
            tokens,
            nav
        };
    }
    // ────────────────────────────────────────────────────────────
    // POST /api/auth/refresh
    // ────────────────────────────────────────────────────────────
    async refreshTokens(refreshToken) {
        if (!refreshToken) throw new _common.BadRequestException('Refresh token requerido');
        try {
            const payload = _jsonwebtoken.verify(refreshToken, jwtRefSec());
            const user = await this.prisma.user.findUnique({
                where: {
                    id: payload.userId
                }
            });
            if (!user || !user.isActive) throw new Error();
            return this.generateTokens({
                userId: user.id,
                email: user.email,
                role: user.role
            });
        } catch  {
            throw new _common.UnauthorizedException('Refresh token inválido o expirado');
        }
    }
    // ────────────────────────────────────────────────────────────
    // GET /api/auth/me
    // ────────────────────────────────────────────────────────────
    async getMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                avatarUrl: true,
                telefono: true,
                ubicacion: true,
                titulo: true,
                isEmailVerified: true,
                candidato: {
                    select: {
                        biografia: true,
                        habilidades: {
                            select: {
                                nivel: true,
                                aniosExp: true,
                                habilidad: {
                                    select: {
                                        id: true,
                                        nombre: true
                                    }
                                }
                            },
                            orderBy: {
                                aniosExp: 'desc'
                            }
                        },
                        idiomas: {
                            orderBy: {
                                creadaEl: 'asc'
                            }
                        },
                        experiencia: {
                            orderBy: {
                                fechaInicio: 'desc'
                            }
                        },
                        educacion: {
                            orderBy: {
                                fechaInicio: 'desc'
                            }
                        },
                        analisisDirectos: {
                            select: {
                                resumen: true,
                                score: true,
                                analizadoEl: true
                            },
                            orderBy: {
                                analizadoEl: 'desc'
                            },
                            take: 1
                        }
                    }
                }
            }
        });
        if (!user) throw new _common.UnauthorizedException('Usuario no encontrado');
        const nav = await this.navService.getNavForRole(user.role);
        const { candidato, ...baseUser } = user;
        const perfil = candidato ? {
            biografia: candidato.biografia ?? null,
            resumen_ia: candidato.analisisDirectos?.[0]?.resumen ?? null,
            score_ia: candidato.analisisDirectos?.[0]?.score ?? null,
            habilidades: candidato.habilidades.map((h)=>({
                    id: h.habilidad.id,
                    nombre: h.habilidad.nombre,
                    nivel: h.nivel,
                    aniosExp: h.aniosExp
                })),
            idiomas: candidato.idiomas,
            experiencia: candidato.experiencia,
            educacion: candidato.educacion
        } : null;
        return {
            user: {
                ...baseUser,
                perfil
            },
            nav
        };
    }
    // ────────────────────────────────────────────────────────────
    // PATCH /api/auth/me
    // ────────────────────────────────────────────────────────────
    // ────────────────────────────────────────────────────────────
    // DELETE /api/auth/me
    // Elimina la cuenta del usuario y todo su contenido (cascade).
    // ────────────────────────────────────────────────────────────
    async deleteAccount(userId) {
        await this.prisma.user.delete({
            where: {
                id: userId
            }
        });
    }
    async updateMe(userId, dto) {
        const { fullName, telefono, ubicacion, titulo, avatarUrl } = dto;
        if (avatarUrl !== undefined && avatarUrl !== null && avatarUrl !== '') {
            try {
                new URL(avatarUrl);
            } catch  {
                throw new _common.BadRequestException('avatarUrl debe ser una URL https válida');
            }
        }
        const updated = await this.prisma.user.update({
            where: {
                id: userId
            },
            data: {
                ...fullName ? {
                    fullName
                } : {},
                ...telefono !== undefined ? {
                    telefono
                } : {},
                ...ubicacion !== undefined ? {
                    ubicacion
                } : {},
                ...titulo !== undefined ? {
                    titulo
                } : {},
                ...avatarUrl !== undefined ? {
                    avatarUrl: avatarUrl || null
                } : {}
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                avatarUrl: true,
                telefono: true,
                ubicacion: true,
                titulo: true
            }
        });
        return updated;
    }
    // ────────────────────────────────────────────────────────────
    // GET /api/auth/verify-email?token=xxx
    // ────────────────────────────────────────────────────────────
    async verifyEmail(rawToken) {
        if (!rawToken) throw new _common.BadRequestException('Token requerido');
        const tokenHash = (0, _tokenutils.hashToken)(rawToken);
        const user = await this.prisma.user.findFirst({
            where: {
                verificationTokenHash: tokenHash
            }
        });
        if (!user) throw new _common.BadRequestException('El enlace de verificación es inválido');
        if (!(0, _tokenutils.isTokenValid)(user.verificationTokenExpiresAt)) {
            throw new _common.BadRequestException('El enlace expiró. Registrate nuevamente.');
        }
        if (user.isEmailVerified) return 'Tu cuenta ya estaba verificada';
        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                isEmailVerified: true,
                verificationTokenHash: null,
                verificationTokenExpiresAt: null
            }
        });
        return 'Cuenta verificada exitosamente. Ya podés iniciar sesión.';
    }
    // ────────────────────────────────────────────────────────────
    // POST /api/auth/forgot-password
    // ────────────────────────────────────────────────────────────
    async forgotPassword(dto) {
        // Siempre responder con éxito (no revelar si el email existe)
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        });
        if (!user || !user.isActive) return;
        const rawToken = (0, _tokenutils.generateToken)();
        const tokenHash = (0, _tokenutils.hashToken)(rawToken);
        const expiresAt = (0, _tokenutils.getResetTokenExpiry)();
        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                resetTokenHash: tokenHash,
                resetTokenExpiresAt: expiresAt
            }
        });
        this.email.sendPasswordResetEmail(user.email, rawToken).catch((err)=>console.error('[forgotPassword] Error email:', err));
    }
    // ────────────────────────────────────────────────────────────
    // POST /api/auth/reset-password
    // ────────────────────────────────────────────────────────────
    async resetPassword(dto) {
        if (dto.newPassword !== dto.confirmPassword) {
            throw new _common.BadRequestException('Las contraseñas no coinciden');
        }
        const tokenHash = (0, _tokenutils.hashToken)(dto.token);
        const user = await this.prisma.user.findFirst({
            where: {
                resetTokenHash: tokenHash
            }
        });
        if (!user) throw new _common.BadRequestException('El enlace de restablecimiento es inválido');
        if (!(0, _tokenutils.isTokenValid)(user.resetTokenExpiresAt)) {
            throw new _common.BadRequestException('El enlace expiró. Solicitá uno nuevo.');
        }
        const { valid, errors } = (0, _passwordutils.validatePasswordStrength)(dto.newPassword);
        if (!valid) {
            throw new _common.BadRequestException({
                message: 'La contraseña no es segura',
                errors: errors.map((m)=>({
                        field: 'newPassword',
                        message: m
                    }))
            });
        }
        const passwordHash = await (0, _passwordutils.hashPassword)(dto.newPassword);
        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                passwordHash,
                resetTokenHash: null,
                resetTokenExpiresAt: null,
                failedLoginAttempts: 0,
                lockedUntil: null
            }
        });
    }
    // ────────────────────────────────────────────────────────────
    // POST /api/auth/resend-verification
    // ────────────────────────────────────────────────────────────
    async resendVerification(email, userId) {
        let user = null;
        if (email) {
            user = await this.prisma.user.findUnique({
                where: {
                    email
                }
            });
        } else if (userId) {
            user = await this.prisma.user.findUnique({
                where: {
                    id: userId
                }
            });
        }
        // Respuesta genérica: no revelar si el email existe
        if (!user || !user.isActive) {
            return 'Si el correo existe, se envió un nuevo enlace de verificación.';
        }
        if (user.isEmailVerified) {
            return 'Tu cuenta ya está verificada. Podés iniciar sesión.';
        }
        // Cooldown de 2 minutos por usuario
        const lastSent = this.resendCooldown.get(user.id);
        const now = Date.now();
        if (lastSent && now - lastSent < this.COOLDOWN_MS) {
            const secs = Math.ceil((this.COOLDOWN_MS - (now - lastSent)) / 1000);
            throw new _common.HttpException({
                ok: false,
                message: `Esperá ${secs} segundos antes de reenviar.`
            }, _common.HttpStatus.TOO_MANY_REQUESTS);
        }
        const rawToken = (0, _tokenutils.generateToken)();
        const tokenHash = (0, _tokenutils.hashToken)(rawToken);
        const expiresAt = (0, _tokenutils.getVerificationTokenExpiry)();
        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                verificationTokenHash: tokenHash,
                verificationTokenExpiresAt: expiresAt
            }
        });
        try {
            await this.email.sendVerificationEmail(user.email, user.fullName, rawToken);
        } catch  {
            throw new _common.BadRequestException('Error al enviar el correo. Intentá de nuevo en unos minutos.');
        }
        this.resendCooldown.set(user.id, now);
        return 'Enlace de verificación reenviado. Revisá tu correo.';
    }
    constructor(prisma, email, navService){
        this.prisma = prisma;
        this.email = email;
        this.navService = navService;
        this.resendCooldown = new Map();
        this.COOLDOWN_MS = 2 * 60 * 1000; // 2 min
        // Purge expired cooldown entries every 10 minutes to avoid indefinite growth
        setInterval(()=>{
            const now = Date.now();
            for (const [key, ts] of this.resendCooldown){
                if (now - ts > this.COOLDOWN_MS) this.resendCooldown.delete(key);
            }
        }, 10 * 60 * 1000).unref();
    }
};
AuthService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _emailservice.EmailService === "undefined" ? Object : _emailservice.EmailService,
        typeof _navservice.NavService === "undefined" ? Object : _navservice.NavService
    ])
], AuthService);

//# sourceMappingURL=auth.service.js.map