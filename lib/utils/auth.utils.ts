import { NextRequest } from 'next/server';
import { verifyAccessToken } from './jwt.utils';
import { TokenPayload } from '../types';

// ─────────────────────────────────────────────────────────────
// Equivalente al middleware `authenticate` de Express
// Se usa directamente dentro de cada Route Handler protegido
// ─────────────────────────────────────────────────────────────

export interface AuthResult {
  user: TokenPayload | null;
  error?: 'NO_TOKEN' | 'EXPIRED' | 'INVALID';
}

export const getAuthUser = (req: NextRequest): AuthResult => {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) return { user: null, error: 'NO_TOKEN' };

  try {
    const user = verifyAccessToken(token);
    return { user };
  } catch (error) {
    const expired =
      error instanceof Error && error.name === 'TokenExpiredError';
    return { user: null, error: expired ? 'EXPIRED' : 'INVALID' };
  }
};
