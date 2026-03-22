import * as UserModel from '../models/user.model';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password.utils';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.utils';
import { generateResetToken, getResetTokenExpiry, isResetTokenValid } from '../utils/token.utils';
import { sendPasswordResetEmail } from './email.service';
import { config } from '../config';
import {
  RegisterDTO,
  LoginDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  AuthTokens,
  UserPublic,
} from '../types';

// ─────────────────────────────────────────────────────────────
// Helpers internos
// ─────────────────────────────────────────────────────────────

const toPublicUser = (user: ReturnType<typeof UserModel.findById>): UserPublic => {
  if (!user) throw new Error('USER_NOT_FOUND');
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
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

  if (UserModel.findByEmail(dto.email)) {
    throw new Error('EMAIL_TAKEN');
  }

  const { valid, errors } = validatePasswordStrength(dto.password);
  if (!valid) throw new Error(`PASSWORD_WEAK:${errors.join('|')}`);

  const passwordHash = await hashPassword(dto.password);

  const user = UserModel.createUser({
    fullName: dto.fullName,
    email: dto.email,
    passwordHash,
    role: dto.role,
  });

  return toPublicUser(user);
};

// ─────────────────────────────────────────────────────────────
// Login — pantalla "Iniciar sesión"
// ─────────────────────────────────────────────────────────────

export const login = async (
  dto: LoginDTO,
): Promise<{ user: UserPublic; tokens: AuthTokens }> => {
  const user = UserModel.findByEmail(dto.email);

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
    UserModel.updateFailedAttempts(user.id, attempts);

    if (attempts >= config.account.maxFailedAttempts) {
      const lockUntil = new Date(
        Date.now() + config.account.lockDurationMinutes * 60 * 1000,
      );
      UserModel.lockAccount(user.id, lockUntil);
      throw new Error(`ACCOUNT_LOCKED:${config.account.lockDurationMinutes}`);
    }

    throw new Error(
      `INVALID_CREDENTIALS:${config.account.maxFailedAttempts - attempts}`,
    );
  }

  UserModel.resetFailedAttempts(user.id);

  const tokens = generateTokens({ userId: user.id, email: user.email, role: user.role });

  return { user: toPublicUser(user), tokens };
};

// ─────────────────────────────────────────────────────────────
// Refresh tokens
// ─────────────────────────────────────────────────────────────

export const refreshTokens = (refreshToken: string): AuthTokens => {
  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = UserModel.findById(payload.userId);
    if (!user || !user.isActive) throw new Error();
    return generateTokens({ userId: user.id, email: user.email, role: user.role });
  } catch {
    throw new Error('INVALID_REFRESH_TOKEN');
  }
};

// ─────────────────────────────────────────────────────────────
// Olvidé mi contraseña — pantalla "¿Olvidaste tu contraseña?"
// ─────────────────────────────────────────────────────────────

export const forgotPassword = async (dto: ForgotPasswordDTO): Promise<void> => {
  const user = UserModel.findByEmail(dto.email);

  // Siempre responder con éxito para no revelar si el email existe
  if (!user || !user.isActive) return;

  const resetToken = generateResetToken();
  const expiresAt = getResetTokenExpiry();

  UserModel.saveResetToken(user.id, resetToken, expiresAt);
  await sendPasswordResetEmail(user.email, resetToken);
};

// ─────────────────────────────────────────────────────────────
// Restablecer contraseña (con el token del email)
// ─────────────────────────────────────────────────────────────

export const resetPassword = async (dto: ResetPasswordDTO): Promise<void> => {
  if (dto.newPassword !== dto.confirmPassword) {
    throw new Error('PASSWORDS_DONT_MATCH');
  }

  const user = UserModel.findByResetToken(dto.token);
  if (!user) throw new Error('INVALID_RESET_TOKEN');

  if (!isResetTokenValid(user.resetTokenExpiresAt)) {
    throw new Error('EXPIRED_RESET_TOKEN');
  }

  const { valid, errors } = validatePasswordStrength(dto.newPassword);
  if (!valid) throw new Error(`PASSWORD_WEAK:${errors.join('|')}`);

  const passwordHash = await hashPassword(dto.newPassword);
  UserModel.updatePassword(user.id, passwordHash);
};
