-- Agrega campos necesarios para el CRUD completo de vacantes.
-- 100% aditiva — no rompe datos existentes.

ALTER TABLE "ofertas_laborales"
  ADD COLUMN IF NOT EXISTS "categoria"          TEXT,
  ADD COLUMN IF NOT EXISTS "modalidad"          TEXT,
  ADD COLUMN IF NOT EXISTS "experiencia_minima" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "requisitos"         JSONB,
  ADD COLUMN IF NOT EXISTS "matching_weights"   JSONB,
  ADD COLUMN IF NOT EXISTS "actualizado_el"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "ofertas_laborales_estado_idx"
  ON "ofertas_laborales"("estado");

CREATE INDEX IF NOT EXISTS "ofertas_laborales_empresa_creada_idx"
  ON "ofertas_laborales"("empresa_id", "creada_el" DESC);