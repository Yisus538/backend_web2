import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { UserRole } from '../types';

// 1. Ya no necesitamos importar 'Pool', le pasamos la URL directo al adaptador
const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL as string
});

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// 2. Inicializamos Prisma
export const prisma =
  globalForPrisma.prisma ?? 
  new PrismaClient({ 
    adapter,
    log: ['error'] 
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
// ─── Queries ─────────────────────────────────────────────────

export const findByEmail = (email: string) =>
  prisma.user.findUnique({ where: { email: email.toLowerCase() } });

export const findById = (id: string) =>
  prisma.user.findUnique({ where: { id } });

export const findByResetToken = (token: string) =>
  prisma.user.findFirst({ where: { resetToken: token } });

export const findByVerificationToken = (token: string) =>
  prisma.user.findFirst({ where: { verificationToken: token } });

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

export const saveVerificationToken = (id: string, token: string, expiresAt: Date) =>
  prisma.user.update({
    where: { id },
    data: { verificationToken: token, verificationTokenExpiresAt: expiresAt },
  });

export const markEmailVerified = (id: string) =>
  prisma.user.update({
    where: { id },
    data: {
      isEmailVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    },
  });

export const updateFailedAttempts = (id: string, attempts: number) =>
  prisma.user.update({ where: { id }, data: { failedLoginAttempts: attempts } });

export const lockAccount = (id: string, until: Date) =>
  prisma.user.update({ where: { id }, data: { lockedUntil: until } });

export const resetFailedAttempts = (id: string) =>
  prisma.user.update({
    where: { id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });

export const saveResetToken = (id: string, token: string, expiresAt: Date) =>
  prisma.user.update({
    where: { id },
    data: { resetToken: token, resetTokenExpiresAt: expiresAt },
  });

export const updatePassword = (id: string, passwordHash: string) =>
  prisma.user.update({
    where: { id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiresAt: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });