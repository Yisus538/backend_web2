// ─────────────────────────────────────────────────────────────
// Rate limiter en memoria — reemplaza express-rate-limit
// Para producción: usar @upstash/ratelimit con Redis
// ─────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Limpia entradas expiradas periódicamente
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) store.delete(key);
  }
}, 60_000);

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
  /** Si true, solo cuenta los requests fallidos (status >= 400) */
  skipSuccessful?: boolean;
  message: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  message?: string;
}

export const createRateLimiter = (opts: RateLimiterOptions) => {
  return (ip: string): RateLimitResult => {
    const now = Date.now();
    const key = `${ip}`;
    const entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + opts.windowMs });
      return { allowed: true, remaining: opts.max - 1, resetAt: now + opts.windowMs };
    }

    entry.count++;

    if (entry.count > opts.max) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt,
        message: opts.message,
      };
    }

    return { allowed: true, remaining: opts.max - entry.count, resetAt: entry.resetAt };
  };
};

// ─── Instancias de limiters por endpoint (equivalentes al Express original) ───

export const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,   // 15 minutos
  max: 5,
  message: 'Demasiados intentos. Esperá 15 minutos.',
});

export const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,   // 1 hora
  max: 10,
  message: 'Demasiados registros desde esta IP.',
});

export const forgotPasswordLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,   // 1 hora
  max: 5,
  message: 'Demasiados intentos. Esperá 1 hora.',
});
