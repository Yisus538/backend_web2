import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from '../types';

// Base de datos en memoria (singleton global en Next.js)
// En producción: reemplazar con Prisma + PostgreSQL o similar
const db = new Map<string, User>();

export const findByEmail = (email: string): User | null => {
  for (const user of db.values()) {
    if (user.email.toLowerCase() === email.toLowerCase()) return user;
  }
  return null;
};

export const findById = (id: string): User | null =>
  db.get(id) ?? null;

export const findByResetToken = (token: string): User | null => {
  for (const user of db.values()) {
    if (user.resetToken === token) return user;
  }
  return null;
};

export const createUser = (data: {
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}): User => {
  const user: User = {
    id: uuidv4(),
    fullName: data.fullName,
    email: data.email.toLowerCase(),
    passwordHash: data.passwordHash,
    role: data.role,
    createdAt: new Date(),
    updatedAt: new Date(),
    failedLoginAttempts: 0,
    lockedUntil: null,
    isActive: true,
    resetToken: null,
    resetTokenExpiresAt: null,
  };
  db.set(user.id, user);
  return user;
};

export const updateFailedAttempts = (id: string, attempts: number): void => {
  const user = db.get(id);
  if (user) db.set(id, { ...user, failedLoginAttempts: attempts, updatedAt: new Date() });
};

export const lockAccount = (id: string, until: Date): void => {
  const user = db.get(id);
  if (user) db.set(id, { ...user, lockedUntil: until, updatedAt: new Date() });
};

export const resetFailedAttempts = (id: string): void => {
  const user = db.get(id);
  if (user) db.set(id, { ...user, failedLoginAttempts: 0, lockedUntil: null, updatedAt: new Date() });
};

export const saveResetToken = (id: string, token: string, expiresAt: Date): void => {
  const user = db.get(id);
  if (user) db.set(id, { ...user, resetToken: token, resetTokenExpiresAt: expiresAt, updatedAt: new Date() });
};

export const updatePassword = (id: string, passwordHash: string): void => {
  const user = db.get(id);
  if (user) {
    db.set(id, {
      ...user,
      passwordHash,
      resetToken: null,
      resetTokenExpiresAt: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
      updatedAt: new Date(),
    });
  }
};
