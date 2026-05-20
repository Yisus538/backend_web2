import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NavService } from '../navigation/nav.service';
import {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
} from '../common/utils/password.utils';
import {
  generateToken,
  hashToken,
  getResetTokenExpiry,
  getVerificationTokenExpiry,
  isTokenValid,
} from '../common/utils/token.utils';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const MAX_FAILED    = 5;
const LOCK_MINUTES  = 15;
// ⚠️  Lazy getters: ConfigModule carga .env después del module-load time.
//     Leer process.env dentro de la función garantiza que ya está disponible.
const jwtSecret    = () => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET no está configurado en las variables de entorno');
  return s;
};
const jwtRefSec    = () => {
  const s = process.env.JWT_REFRESH_SECRET;
  if (!s) throw new Error('JWT_REFRESH_SECRET no está configurado en las variables de entorno');
  return s;
};
const jwtExp       = () => process.env.JWT_EXPIRES_IN        || '1h';
const jwtRefExp    = () => process.env.JWT_REFRESH_EXPIRES_IN || '7d';

@Injectable()
export class AuthService {
  private resendCooldown = new Map<string, number>();
  private readonly COOLDOWN_MS = 2 * 60 * 1000; // 2 min

  constructor(
    private prisma:     PrismaService,
    private email:      EmailService,
    private navService: NavService,
  ) {
    // Purge expired cooldown entries every 10 minutes to avoid indefinite growth
    setInterval(() => {
      const now = Date.now();
      for (const [key, ts] of this.resendCooldown) {
        if (now - ts > this.COOLDOWN_MS) this.resendCooldown.delete(key);
      }
    }, 10 * 60 * 1000).unref();
  }

  // ────────────────────────────────────────────────────────────
  // Helpers privados
  // ────────────────────────────────────────────────────────────
  private generateTokens(payload: { userId: string; email: string; role: string }) {
    return {
      accessToken:  jwt.sign(payload, jwtSecret(),  { expiresIn: jwtExp()     } as any),
      refreshToken: jwt.sign(payload, jwtRefSec(), { expiresIn: jwtRefExp() } as any),
    };
  }

  private toPublicUser(user: any) {
    return {
      id:              user.id,
      fullName:        user.fullName,
      email:           user.email,
      role:            user.role,
      isEmailVerified: user.isEmailVerified,
      createdAt:       user.createdAt,
      avatarUrl:       user.avatarUrl ?? null,
      theme:           user.theme ?? 'auto',
    };
  }

  // ────────────────────────────────────────────────────────────
  // POST /api/auth/register
  // ────────────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('El correo electrónico ya está registrado');

    const { valid, errors } = validatePasswordStrength(dto.password);
    if (!valid) {
      throw new BadRequestException({
        message: 'La contraseña no es segura',
        errors:  errors.map((m) => ({ field: 'password', message: m })),
      });
    }

    const passwordHash = await hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        fullName:     dto.fullName,
        email:        dto.email,
        passwordHash,
        role:         dto.role,
      },
    });

    // Token de verificación (SHA-256, nunca texto plano en DB)
    const rawToken  = generateToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = getVerificationTokenExpiry();
    await this.prisma.user.update({
      where: { id: user.id },
      data:  { verificationTokenHash: tokenHash, verificationTokenExpiresAt: expiresAt },
    });

    // Fire-and-forget — no bloquear la respuesta
    this.email
      .sendVerificationEmail(user.email, user.fullName, rawToken)
      .catch((err) => console.error('[register] Error enviando email:', err));

    return this.toPublicUser(user);
  }

  // ────────────────────────────────────────────────────────────
  // POST /api/auth/login
  // ────────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    if (!user.isActive) {
      throw new ForbiddenException('Tu cuenta está deshabilitada. Contactá soporte.');
    }

    // Cuenta bloqueada
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
      throw new HttpException(
        { ok: false, message: `Cuenta bloqueada. Intentá en ${minutesLeft} minuto(s).` },
        423,
      );
      
    }

    const isValid = await comparePassword(dto.password, user.passwordHash);

    if (!isValid) {
      const attempts = user.failedLoginAttempts + 1;
      await this.prisma.user.update({
        where: { id: user.id },
        data:  { failedLoginAttempts: attempts },
      });

      if (attempts >= MAX_FAILED) {
        const lockUntil = new Date(Date.now() + LOCK_MINUTES * 60_000);
        await this.prisma.user.update({
          where: { id: user.id },
          data:  { lockedUntil: lockUntil },
        });
        throw new HttpException(
          { ok: false, message: `Cuenta bloqueada. Intentá en ${LOCK_MINUTES} minuto(s).` },
          423,
        );
      }

      const remaining = MAX_FAILED - attempts;
      throw new UnauthorizedException(`Credenciales inválidas (${remaining} intentos restantes)`);
    }

    // Credenciales correctas → resetear contador
    await this.prisma.user.update({
      where: { id: user.id },
      data:  { failedLoginAttempts: 0, lockedUntil: null },
    });

    if (!user.isEmailVerified) {
      throw new HttpException(
        {
          ok:      false,
          message: 'Verificá tu correo electrónico antes de iniciar sesión.',
          code:    'EMAIL_NOT_VERIFIED',
          data:    { email: user.email },
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const tokens = this.generateTokens({ userId: user.id, email: user.email, role: user.role });
    const nav    = await this.navService.getNavForRole(user.role);

    return { user: this.toPublicUser(user), tokens, nav };
  }

  // ────────────────────────────────────────────────────────────
  // POST /api/auth/refresh
  // ────────────────────────────────────────────────────────────
  async refreshTokens(refreshToken: string) {
    if (!refreshToken) throw new BadRequestException('Refresh token requerido');
    try {
      const payload = jwt.verify(refreshToken, jwtRefSec()) as any;
      const user    = await this.prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user || !user.isActive) throw new Error();
      return this.generateTokens({ userId: user.id, email: user.email, role: user.role });
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  // ────────────────────────────────────────────────────────────
  // GET /api/auth/me
  // ────────────────────────────────────────────────────────────
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where:  { id: userId },
      select: {
        id: true, fullName: true, email: true, role: true,
        avatarUrl: true, telefono: true, ubicacion: true, titulo: true,
        isEmailVerified: true, theme: true,
        candidato: {
          select: {
            biografia: true,
            habilidades: {
              select: {
                nivel: true, aniosExp: true,
                habilidad: { select: { id: true, nombre: true } },
              },
              orderBy: { aniosExp: 'desc' },
            },
            idiomas:    { orderBy: { creadaEl: 'asc' } },
            experiencia: { orderBy: { fechaInicio: 'desc' } },
            educacion:   { orderBy: { fechaInicio: 'desc' } },
            analisisDirectos: {
              select:  { resumen: true, score: true, analizadoEl: true },
              orderBy: { analizadoEl: 'desc' },
              take: 1,
            },
          },
        },
      },
    });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const nav = await this.navService.getNavForRole(user.role);

    const { candidato, ...baseUser } = user as any;
    const perfil = candidato
      ? {
          biografia:   candidato.biografia ?? null,
          resumen_ia:  candidato.analisisDirectos?.[0]?.resumen ?? null,
          score_ia:    candidato.analisisDirectos?.[0]?.score   ?? null,
          habilidades: candidato.habilidades.map((h: any) => ({
            id:       h.habilidad.id,
            nombre:   h.habilidad.nombre,
            nivel:    h.nivel,
            aniosExp: h.aniosExp,
          })),
          idiomas:    candidato.idiomas,
          experiencia: candidato.experiencia,
          educacion:   candidato.educacion,
        }
      : null;

    return { user: { ...baseUser, perfil }, nav };
  }

  // ────────────────────────────────────────────────────────────
  // PATCH /api/auth/me
  // ────────────────────────────────────────────────────────────
  // ────────────────────────────────────────────────────────────
  // DELETE /api/auth/me
  // Elimina la cuenta del usuario y todo su contenido (cascade).
  // ────────────────────────────────────────────────────────────
  async deleteAccount(userId: string): Promise<void> {
    await this.prisma.user.delete({ where: { id: userId } });
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const { fullName, telefono, ubicacion, titulo, avatarUrl, theme } = dto;

    if (avatarUrl !== undefined && avatarUrl !== null && avatarUrl !== '') {
      try { new URL(avatarUrl); } catch {
        throw new BadRequestException('avatarUrl debe ser una URL https válida');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName  ? { fullName }   : {}),
        ...(telefono  !== undefined ? { telefono }  : {}),
        ...(ubicacion !== undefined ? { ubicacion } : {}),
        ...(titulo    !== undefined ? { titulo }    : {}),
        ...(avatarUrl !== undefined ? { avatarUrl: avatarUrl || null } : {}),
        ...(theme     !== undefined ? { theme }     : {}),
      },
      select: {
        id: true, fullName: true, email: true, role: true,
        avatarUrl: true, telefono: true, ubicacion: true, titulo: true, theme: true,
      },
    });
    return updated;
  }

  // ────────────────────────────────────────────────────────────
  // GET /api/auth/verify-email?token=xxx
  // ────────────────────────────────────────────────────────────
  async verifyEmail(rawToken: string) {
    if (!rawToken) throw new BadRequestException('Token requerido');

    const tokenHash = hashToken(rawToken);
    const user = await this.prisma.user.findFirst({
      where: { verificationTokenHash: tokenHash },
    });

    if (!user) throw new BadRequestException('El enlace de verificación es inválido');

    if (!isTokenValid(user.verificationTokenExpiresAt)) {
      throw new BadRequestException('El enlace expiró. Registrate nuevamente.');
    }

    if (user.isEmailVerified) return 'Tu cuenta ya estaba verificada';

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified:            true,
        verificationTokenHash:      null,
        verificationTokenExpiresAt: null,
      },
    });

    return 'Cuenta verificada exitosamente. Ya podés iniciar sesión.';
  }

  // ────────────────────────────────────────────────────────────
  // POST /api/auth/forgot-password
  // ────────────────────────────────────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
    // Siempre responder con éxito (no revelar si el email existe)
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.isActive) return;

    const rawToken  = generateToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = getResetTokenExpiry();

    await this.prisma.user.update({
      where: { id: user.id },
      data:  { resetTokenHash: tokenHash, resetTokenExpiresAt: expiresAt },
    });

    this.email
      .sendPasswordResetEmail(user.email, rawToken)
      .catch((err) => console.error('[forgotPassword] Error email:', err));
  }

  // ────────────────────────────────────────────────────────────
  // POST /api/auth/reset-password
  // ────────────────────────────────────────────────────────────
  async resetPassword(dto: ResetPasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const tokenHash = hashToken(dto.token);
    const user = await this.prisma.user.findFirst({ where: { resetTokenHash: tokenHash } });

    if (!user) throw new BadRequestException('El enlace de restablecimiento es inválido');

    if (!isTokenValid(user.resetTokenExpiresAt)) {
      throw new BadRequestException('El enlace expiró. Solicitá uno nuevo.');
    }

    const { valid, errors } = validatePasswordStrength(dto.newPassword);
    if (!valid) {
      throw new BadRequestException({
        message: 'La contraseña no es segura',
        errors:  errors.map((m) => ({ field: 'newPassword', message: m })),
      });
    }

    const passwordHash = await hashPassword(dto.newPassword);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetTokenHash:      null,
        resetTokenExpiresAt: null,
        failedLoginAttempts: 0,
        lockedUntil:         null,
      },
    });
  }

  // ────────────────────────────────────────────────────────────
  // POST /api/auth/resend-verification
  // ────────────────────────────────────────────────────────────
  async resendVerification(email?: string, cookieToken?: string) {
    let user: any = null;
    let userId: string | undefined;

    if (cookieToken) {
      try {
        const payload = jwt.verify(cookieToken, jwtSecret()) as any;
        userId = payload?.userId;
      } catch { /* token expirado o inválido — continuar con email */ }
    }

    if (email) {
      user = await this.prisma.user.findUnique({ where: { email } });
    } else if (userId) {
      user = await this.prisma.user.findUnique({ where: { id: userId } });
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
    const now      = Date.now();
    if (lastSent && now - lastSent < this.COOLDOWN_MS) {
      const secs = Math.ceil((this.COOLDOWN_MS - (now - lastSent)) / 1000);
      throw new HttpException(
        { ok: false, message: `Esperá ${secs} segundos antes de reenviar.` },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const rawToken  = generateToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = getVerificationTokenExpiry();

    await this.prisma.user.update({
      where: { id: user.id },
      data:  { verificationTokenHash: tokenHash, verificationTokenExpiresAt: expiresAt },
    });

    try {
      await this.email.sendVerificationEmail(user.email, user.fullName, rawToken);
    } catch {
      throw new BadRequestException('Error al enviar el correo. Intentá de nuevo en unos minutos.');
    }

    this.resendCooldown.set(user.id, now);
    return 'Enlace de verificación reenviado. Revisá tu correo.';
  }
}
