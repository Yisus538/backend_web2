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

-- CHECK constraints de seguridad requeridos en FASE 3:
-- Garantizan que datos corruptos (hash truncado, string vacío) no
-- entren silenciosamente a la DB rompiendo el flujo de verificación.
ALTER TABLE "usuarios"
  ADD CONSTRAINT chk_token_verif_hash_len
    CHECK ("token_verificacion_hash" IS NULL OR char_length("token_verificacion_hash") = 64),
  ADD CONSTRAINT chk_token_reset_hash_len
    CHECK ("token_reset_hash" IS NULL OR char_length("token_reset_hash") = 64),
  ADD CONSTRAINT chk_password_hash_len
    CHECK (char_length("passwordHash") >= 60);
