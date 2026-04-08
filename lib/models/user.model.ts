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

// ─── Compatibilidad FASE 1 (eliminada en FASE 3) ─────────────

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
// Guardar tokens — FASE 3: solo hash, dual-write eliminado
// ─────────────────────────────────────────────────────────────

/**
 * Guarda token de verificación (solo hash desde FASE 3).
 * rawToken ya NO se recibe — nunca se persiste en texto plano.
 */
export const saveVerificationToken = (
  id: string,
  tokenHash: string,
  expiresAt: Date,
) =>
  prisma.user.update({
    where: { id },
    data: {
      verificationTokenExpiresAt: expiresAt,
      verificationTokenHash: tokenHash,
    },
  });

/**
 * Guarda token de reset (solo hash desde FASE 3).
 * rawToken ya NO se recibe — nunca se persiste en texto plano.
 */
export const saveResetToken = (
  id: string,
  tokenHash: string,
  expiresAt: Date,
) =>
  prisma.user.update({
    where: { id },
    data: {
      resetTokenExpiresAt: expiresAt,
      resetTokenHash: tokenHash,
    },
  });

// ─── Operaciones post-uso ─────────────────────────────────────

export const markEmailVerified = (id: string) =>
  prisma.user.update({
    where: { id },
    data: {
      isEmailVerified: true,
      verificationTokenExpiresAt: null,
      verificationTokenHash: null,
    },
  });

export const updatePassword = (id: string, passwordHash: string) =>
  prisma.user.update({
    where: { id },
    data: {
      passwordHash,
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