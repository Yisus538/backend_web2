import crypto from 'crypto';
import { config } from '../config';

// Genera un token seguro para el reset de contraseña
export const generateResetToken = (): string =>
  crypto.randomBytes(32).toString('hex');

// Calcula la fecha de expiración del token
export const getResetTokenExpiry = (): Date => {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + config.resetToken.expiresMinutes);
  return expiresAt;
};

// Verifica si el token todavía es válido
export const isResetTokenValid = (expiresAt: Date | null): boolean => {
  if (!expiresAt) return false;
  return expiresAt > new Date();
};
