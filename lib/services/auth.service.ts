import * as UserModel from '../models/user.model';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password.utils';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.utils';
import { generateResetToken, getResetTokenExpiry, isResetTokenValid } from '../utils/token.utils';
import { sendPasswordResetEmail, sendVerificationEmail } from './email.service';
import { config } from '../config';
import {
  RegisterDTO,
  LoginDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  AuthTokens,
  UserPublic,
  UserRole
} from '../types';

// ─────────────────────────────────────────────────────────────
// Helpers internos
// ─────────────────────────────────────────────────────────────

// Obtenemos el tipo real del usuario resolviendo la Promesa de Prisma
type PrismaUser = NonNullable<Awaited<ReturnType<typeof UserModel.findById>>>;

const toPublicUser = (user: PrismaUser): UserPublic => {
  if (!user) throw new Error('USER_NOT_FOUND');
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role as UserRole,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  };
};

// ─────────────────────────────────────────────────────────────
// Registro — pantalla "Crear tu cuenta"
// ─────────────────────────────────────────────────────────────

export const register = async (dto: RegisterDTO): Promise<UserPublic> => {
  if (dto.password !== dto.confirmPassword) {
    throw new Error('PASSWORDS_DONT_MATCH');
  }

  const existingUser = await UserModel.findByEmail(dto.email);
  if (existingUser) {
    throw new Error('EMAIL_TAKEN');
  }

  const { valid, errors } = validatePasswordStrength(dto.password);
  if (!valid) throw new Error(`PASSWORD_WEAK:${errors.join('|')}`);

  const passwordHash = await hashPassword(dto.password);

  const user = await UserModel.createUser({
    fullName: dto.fullName,
    email: dto.email,
    passwordHash,
    role: dto.role,
  });

  const verificationToken = generateResetToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await UserModel.saveVerificationToken(user.id, verificationToken, expiresAt);

  // Mandar mail (no bloqueamos si falla)
  sendVerificationEmail(user.email, user.fullName, verificationToken).catch(
    (err) => console.error('[email] Error enviando verificación:', err),
  );

  return toPublicUser(user);
};

// ─────────────────────────────────────────────────────────────
// Login — pantalla "Iniciar sesión"
// ─────────────────────────────────────────────────────────────

export const login = async (
  dto: LoginDTO,
): Promise<{ user: UserPublic; tokens: AuthTokens }> => {
  const user = await UserModel.findByEmail(dto.email);

  // Respuesta genérica: no revelar si el email existe o no
  if (!user) throw new Error('INVALID_CREDENTIALS');
  if (!user.isActive) throw new Error('ACCOUNT_DISABLED');

  // Verificar si la cuenta está bloqueada por intentos fallidos
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    throw new Error(`ACCOUNT_LOCKED:${minutesLeft}`);
  }

  const isValid = await comparePassword(dto.password, user.passwordHash);

  if (!isValid) {
    const attempts = user.failedLoginAttempts + 1;
    await UserModel.updateFailedAttempts(user.id, attempts);

    if (attempts >= config.account.maxFailedAttempts) {
      const lockUntil = new Date(
        Date.now() + config.account.lockDurationMinutes * 60 * 1000,
      );
      await UserModel.lockAccount(user.id, lockUntil);
      throw new Error(`ACCOUNT_LOCKED:${config.account.lockDurationMinutes}`);
    }

    throw new Error(
      `INVALID_CREDENTIALS:${config.account.maxFailedAttempts - attempts}`,
    );
  }

  await UserModel.resetFailedAttempts(user.id);

  const tokens = generateTokens({ userId: user.id, email: user.email, role: user.role as UserRole });

  return { user: toPublicUser(user), tokens };
};

// ─────────────────────────────────────────────────────────────
// Refresh tokens
// ─────────────────────────────────────────────────────────────

export const refreshTokens = async (refreshToken: string): Promise<AuthTokens> => {
  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await UserModel.findById(payload.userId);
    if (!user || !user.isActive) throw new Error();
    return generateTokens({ userId: user.id, email: user.email, role: user.role as UserRole });
  } catch {
    throw new Error('INVALID_REFRESH_TOKEN');
  }
};

// ─────────────────────────────────────────────────────────────
// Olvidé mi contraseña — pantalla "¿Olvidaste tu contraseña?"
// ─────────────────────────────────────────────────────────────

export const forgotPassword = async (dto: ForgotPasswordDTO): Promise<void> => {
  const user = await UserModel.findByEmail(dto.email);

  // Siempre responder con éxito para no revelar si el email existe
  if (!user || !user.isActive) return;

  const resetToken = generateResetToken();
  const expiresAt = getResetTokenExpiry();

  await UserModel.saveResetToken(user.id, resetToken, expiresAt);
  await sendPasswordResetEmail(user.email, resetToken);
};

// ─────────────────────────────────────────────────────────────
// Restablecer contraseña (con el token del email)
// ─────────────────────────────────────────────────────────────

export const resetPassword = async (dto: ResetPasswordDTO): Promise<void> => {
  if (dto.newPassword !== dto.confirmPassword) {
    throw new Error('PASSWORDS_DONT_MATCH');
  }

  const user = await UserModel.findByResetToken(dto.token);
  if (!user) throw new Error('INVALID_RESET_TOKEN');

  if (!isResetTokenValid(user.resetTokenExpiresAt)) {
    throw new Error('EXPIRED_RESET_TOKEN');
  }

  const { valid, errors } = validatePasswordStrength(dto.newPassword);
  if (!valid) throw new Error(`PASSWORD_WEAK:${errors.join('|')}`);

  const passwordHash = await hashPassword(dto.newPassword);
  await UserModel.updatePassword(user.id, passwordHash);
};