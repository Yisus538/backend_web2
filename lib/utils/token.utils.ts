import crypto from 'crypto';
import { config } from '../config';

// ─────────────────────────────────────────────────────────────
// FASE 2 — Token utilities con SHA-256
//
// Flujo seguro:
//   1. generateToken()     → token aleatorio (va al email)
//   2. hashToken(token)    → hash SHA-256 (va a la DB)
//   3. Al validar:         → hashToken(tokenRecibido) === hashGuardado
//
// NUNCA se guarda el token original en la base de datos.
// ─────────────────────────────────────────────────────────────

/**
 * Genera un token criptográficamente seguro.
 * 32 bytes = 64 chars hex. Suficiente entropía para tokens de un solo uso.
 *
 * @returns Token en hex — este es el que se envía por email.
 */
export const generateToken = (): string =>
  crypto.randomBytes(32).toString('hex');

/**
 * Hashea un token con SHA-256.
 * Operación unidireccional: no se puede revertir al original.
 *
 * @param token - Token en texto plano (recibido por email o URL)
 * @returns Hash hex de 64 chars — este es el que se guarda en DB
 */
export const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

// ─── Alias para compatibilidad con código existente ──────────
/** @deprecated Usar generateToken() */
export const generateResetToken = generateToken;

// ─── Expiración ──────────────────────────────────────────────

/** Expiry para reset de contraseña (configurable via config) */
export const getResetTokenExpiry = (): Date => {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + config.resetToken.expiresMinutes);
  return expiresAt;
};

/** Expiry para verificación de email (24 horas fijo) */
export const getVerificationTokenExpiry = (): Date =>
  new Date(Date.now() + 24 * 60 * 60 * 1000);

/** Verifica si el token todavía es válido comparando con la fecha actual */
export const isTokenValid = (expiresAt: Date | null): boolean => {
  if (!expiresAt) return false;
  return expiresAt > new Date();
};

/** @deprecated Usar isTokenValid() */
export const isResetTokenValid = isTokenValid;