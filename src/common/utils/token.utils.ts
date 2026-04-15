import * as crypto from 'crypto';

const RESET_TOKEN_EXPIRES_MINUTES = parseInt(
  process.env.RESET_TOKEN_EXPIRES_MINUTES || '60',
  10,
);

export const generateToken = (): string =>
  crypto.randomBytes(32).toString('hex');

export const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

export const getResetTokenExpiry = (): Date => {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + RESET_TOKEN_EXPIRES_MINUTES);
  return expiresAt;
};

export const getVerificationTokenExpiry = (): Date =>
  new Date(Date.now() + 24 * 60 * 60 * 1000);

export const isTokenValid = (expiresAt: Date | null): boolean => {
  if (!expiresAt) return false;
  return expiresAt > new Date();
};
