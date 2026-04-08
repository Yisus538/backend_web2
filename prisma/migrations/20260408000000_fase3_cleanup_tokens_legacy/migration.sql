-- FASE 3: eliminar tokens en texto plano
--
-- Solo se eliminan las columnas que guardaban el token raw.
-- Las columnas *ExpiresAt se mantienen porque el backend las sigue
-- leyendo para validar la expiración de los tokens hash.
--
-- Columnas que quedan: verificationTokenHash, resetTokenHash,
--                      verificationTokenExpiresAt, resetTokenExpiresAt

ALTER TABLE "usuarios"
  DROP COLUMN IF EXISTS "verificationToken",
  DROP COLUMN IF EXISTS "resetToken";
