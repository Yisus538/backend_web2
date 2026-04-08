-- FASE 1: columnas de hash para tokens de verificación y reset
-- Reemplaza el flujo de tokens en texto plano por SHA-256.
-- Los campos viejos (verificationToken, resetToken) se mantienen
-- hasta FASE 3 para compatibilidad (dual-write).

ALTER TABLE "usuarios"
  ADD COLUMN IF NOT EXISTS "token_verificacion_hash" TEXT,
  ADD COLUMN IF NOT EXISTS "token_reset_hash"        TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "usuarios_token_verificacion_hash_key"
  ON "usuarios"("token_verificacion_hash")
  WHERE "token_verificacion_hash" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "usuarios_token_reset_hash_key"
  ON "usuarios"("token_reset_hash")
  WHERE "token_reset_hash" IS NOT NULL;
