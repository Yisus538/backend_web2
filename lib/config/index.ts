const env = (key: string, fallback?: string): string => {
  const value = process.env[key] || fallback;
  if (!value) throw new Error(`Variable de entorno requerida: ${key}`);
  return value;
};

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5500',

  jwt: {
    secret: env('JWT_SECRET', 'dev_secret_change_in_production_min32chars'),
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: env('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_in_production_32c'),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),   // 15 min
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5', 10),
  },

  account: {
    maxFailedAttempts: 5,
    lockDurationMinutes: 15,
  },

  resetToken: {
    expiresMinutes: parseInt(process.env.RESET_TOKEN_EXPIRES_MINUTES || '60', 10),
  },
};
