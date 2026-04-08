-- FASE 1: columnas de hash para tokens de verificación y reset
-- Agrega los campos seguros que reemplazan los tokens en texto plano.
-- Los índices UNIQUE son parciales (WHERE NOT NULL): no indexan filas
-- donde el hash es NULL, reduciendo tamaño y costo de escritura.

ALTER TABLE "usuarios"
  ADD COLUMN IF NOT EXISTS "token_verificacion_hash" TEXT,
  ADD COLUMN IF NOT EXISTS "token_reset_hash"        TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "usuarios_token_verificacion_hash_key"
  ON "usuarios"("token_verificacion_hash")
  WHERE "token_verificacion_hash" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "usuarios_token_reset_hash_key"
  ON "usuarios"("token_reset_hash")
  WHERE "token_reset_hash" IS NOT NULL;
