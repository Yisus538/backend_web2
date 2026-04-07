import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { UserRole } from '../types';

// Prisma 7 usa engine WASM — requiere un adapter de base de datos
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter, log: ['error'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ─── Queries base ─────────────────────────────────────────────

export const findByEmail = (email: string) =>
  prisma.user.findUnique({ where: { email: email.toLowerCase() } });

export const findById = (id: string) =>
  prisma.user.findUnique({ where: { id } });

// ─────────────────────────────────────────────────────────────
// FASE 2 — Búsqueda por HASH (campo nuevo)
// La migración SQL ya agregó: token_verificacion_hash, token_reset_hash
// ─────────────────────────────────────────────────────────────

/**
 * Busca por hash SHA-256 del token de verificación.
 * Usa el campo seguro agregado en la migración FASE 1.
 */
export const findByVerificationTokenHash = (tokenHash: string) =>
  prisma.user.findFirst({ where: { verificationTokenHash: tokenHash } });

/**
 * Busca por hash SHA-256 del token de reset.
 * Usa el campo seguro agregado en la migración FASE 1.
 */
export const findByResetTokenHash = (tokenHash: string) =>
  prisma.user.findFirst({ where: { resetTokenHash: tokenHash } });

// ─── Compatibilidad FASE 1 (texto plano, mantener hasta FASE 3) ──

/** @deprecated FASE 1 compat — eliminar en FASE 3 */
export const findByResetToken = (token: string) =>
  prisma.user.findFirst({ where: { resetToken: token } });

/** @deprecated FASE 1 compat — eliminar en FASE 3 */
export const findByVerificationToken = (token: string) =>
  prisma.user.findFirst({ where: { verificationToken: token } });

// ─────────────────────────────────────────────────────────────
// Crear usuario
// ─────────────────────────────────────────────────────────────

export const createUser = (data: {
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}) =>
  prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role,
    },
  });

// ─────────────────────────────────────────────────────────────
// FASE 2 — Guardar tokens con dual-write
//
// Durante la migración se escribe TANTO en el campo de texto plano
// (campo viejo) COMO en el campo hash (campo nuevo).
// Cuando FASE 3 elimine los campos viejos, solo quedan los _hash.
// ─────────────────────────────────────────────────────────────

/**
 * Guarda token de verificación con dual-write:
 * - verificationToken:     texto plano (compatibilidad FASE 1)
 * - verificationTokenHash: SHA-256 del token (nuevo, seguro)
 */
export const saveVerificationToken = (
  id: string,
  rawToken: string,
  tokenHash: string,
  expiresAt: Date,
) =>
  prisma.user.update({
    where: { id },
    data: {
      // Campo viejo — mantener hasta FASE 3
      verificationToken: rawToken,
      verificationTokenExpiresAt: expiresAt,
      // Campo nuevo — seguro, usado en FASE 2+
      verificationTokenHash: tokenHash,
    },
  });

/**
 * Guarda token de reset con dual-write:
 * - resetToken:     texto plano (compatibilidad FASE 1)
 * - resetTokenHash: SHA-256 del token (nuevo, seguro)
 */
export const saveResetToken = (
  id: string,
  rawToken: string,
  tokenHash: string,
  expiresAt: Date,
) =>
  prisma.user.update({
    where: { id },
    data: {
      // Campo viejo — mantener hasta FASE 3
      resetToken: rawToken,
      resetTokenExpiresAt: expiresAt,
      // Campo nuevo — seguro, usado en FASE 2+
      resetTokenHash: tokenHash,
    },
  });

// ─── Operaciones post-uso ─────────────────────────────────────

export const markEmailVerified = (id: string) =>
  prisma.user.update({
    where: { id },
    data: {
      isEmailVerified: true,
      // Limpiar ambos campos (viejo y nuevo) al verificar
      verificationToken: null,
      verificationTokenExpiresAt: null,
      verificationTokenHash: null,
    },
  });

export const updatePassword = (id: string, passwordHash: string) =>
  prisma.user.update({
    where: { id },
    data: {
      passwordHash,
      // Limpiar ambos campos (viejo y nuevo) al resetear
      resetToken: null,
      resetTokenExpiresAt: null,
      resetTokenHash: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

// ─── Account management ───────────────────────────────────────

export const updateFailedAttempts = (id: string, attempts: number) =>
  prisma.user.update({ where: { id }, data: { failedLoginAttempts: attempts } });

export const lockAccount = (id: string, until: Date) =>
  prisma.user.update({ where: { id }, data: { lockedUntil: until } });

export const resetFailedAttempts = (id: string) =>
  prisma.user.update({
    where: { id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });