import jwt from 'jsonwebtoken';
import { config } from '../config';
import { TokenPayload, AuthTokens } from '../types';

export const generateTokens = (payload: TokenPayload): AuthTokens => ({
  accessToken: jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  }),
  refreshToken: jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
  }),
});

export const verifyAccessToken = (token: string): TokenPayload =>
  jwt.verify(token, config.jwt.secret) as TokenPayload;

export const verifyRefreshToken = (token: string): TokenPayload =>
  jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
