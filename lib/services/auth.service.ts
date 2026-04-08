import * as UserModel from '../models/user.model';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password.utils';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.utils';
import {
  generateToken,
  hashToken,
  getResetTokenExpiry,
  getVerificationTokenExpiry,
  isTokenValid,
} from '../utils/token.utils';
import { sendPasswordResetEmail, sendVerificationEmail } from './email.service';
import { config } from '../config';
import {
  RegisterDTO,
  LoginDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  AuthTokens,
  UserPublic,
  UserRole,
} from '../types';

// ─── Helper interno ───────────────────────────────────────────

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
    avatarUrl: user.avatarUrl,
  };
};

// ─────────────────────────────────────────────────────────────
// Registro
// ─────────────────────────────────────────────────────────────

export const register = async (dto: RegisterDTO): Promise<UserPublic> => {
  if (dto.password !== dto.confirmPassword) {
    throw new Error('PASSWORDS_DONT_MATCH');
  }

  const existingUser = await UserModel.findByEmail(dto.email);
  if (existingUser) throw new Error('EMAIL_TAKEN');

  const { valid, errors } = validatePasswordStrength(dto.password);
  if (!valid) throw new Error(`PASSWORD_WEAK:${errors.join('|')}`);

  const passwordHash = await hashPassword(dto.password);
  const user = await UserModel.createUser({
    fullName: dto.fullName,
    email: dto.email,
    passwordHash,
    role: dto.role,
  });

  // FASE 2: generar token → hashear → guardar hash, enviar token
  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = getVerificationTokenExpiry();

  await UserModel.saveVerificationToken(user.id, rawToken, tokenHash, expiresAt);

  // Enviar el token ORIGINAL por email (nunca el hash)
  sendVerificationEmail(user.email, user.fullName, rawToken).catch(
    (err) => console.error('[email] Error enviando verificación:', err),
  );

  return toPublicUser(user);
};

// ─────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────

export const login = async (
  dto: LoginDTO,
): Promise<{ user: UserPublic; tokens: AuthTokens }> => {
  const user = await UserModel.findByEmail(dto.email);

  if (!user) throw new Error('INVALID_CREDENTIALS');
  if (!user.isActive) throw new Error('ACCOUNT_DISABLED');

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

    throw new Error(`INVALID_CREDENTIALS:${config.account.maxFailedAttempts - attempts}`);
  }

  await UserModel.resetFailedAttempts(user.id);

  if (!user.isEmailVerified) {
    throw new Error('EMAIL_NOT_VERIFIED');
  }

  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role as UserRole,
  });

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
// Forgot password
// ─────────────────────────────────────────────────────────────

export const forgotPassword = async (dto: ForgotPasswordDTO): Promise<void> => {
  const user = await UserModel.findByEmail(dto.email);
  if (!user || !user.isActive) return; // Respuesta genérica anti-enumeración

  // FASE 2: generar token → hashear → guardar hash, enviar token
  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = getResetTokenExpiry();

  await UserModel.saveResetToken(user.id, rawToken, tokenHash, expiresAt);

  // Enviar el token ORIGINAL por email (nunca el hash)
  sendPasswordResetEmail(user.email, rawToken).catch((err) =>
    console.error('[forgotPassword] Error al enviar email:', err),
  );
};

// ─────────────────────────────────────────────────────────────
// Reset password
// ─────────────────────────────────────────────────────────────

export const resetPassword = async (dto: ResetPasswordDTO): Promise<void> => {
  if (dto.newPassword !== dto.confirmPassword) {
    throw new Error('PASSWORDS_DONT_MATCH');
  }

  // FASE 2: hashear el token recibido y buscar por hash en DB
  const tokenHash = hashToken(dto.token);
  const user = await UserModel.findByResetTokenHash(tokenHash);

  if (!user) throw new Error('INVALID_RESET_TOKEN');

  // La expiración se lee del campo viejo (compatible con ambas fases)
  if (!isTokenValid(user.resetTokenExpiresAt)) {
    throw new Error('EXPIRED_RESET_TOKEN');
  }

  const { valid, errors } = validatePasswordStrength(dto.newPassword);
  if (!valid) throw new Error(`PASSWORD_WEAK:${errors.join('|')}`);

  const passwordHash = await hashPassword(dto.newPassword);

  // updatePassword limpia resetToken, resetTokenExpiresAt y resetTokenHash
  await UserModel.updatePassword(user.id, passwordHash);
};

// ─────────────────────────────────────────────────────────────
// Reenviar email de verificación
// ─────────────────────────────────────────────────────────────

export const resendVerification = async (email: string): Promise<void> => {
  const user = await UserModel.findByEmail(email);
  if (!user || !user.isActive || user.isEmailVerified) return;

  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = getVerificationTokenExpiry();

  await UserModel.saveVerificationToken(user.id, rawToken, tokenHash, expiresAt);

  sendVerificationEmail(user.email, user.fullName, rawToken).catch((err) =>
    console.error('[resendVerification] Error al enviar email:', err),
  );
};