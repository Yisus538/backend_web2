-- ============================================================
-- ROLLBACK — sesión 2026-05-13
-- Deshace los cambios de schema aplicados en esta sesión.
-- Ejecutar MANUALMENTE con psql o el cliente de Railway.
-- ============================================================

-- 1. Quitar columna "resumen" de analisis_cv_directo
--    (agregada en migration 20260513000000)
ALTER TABLE "analisis_cv_directo" DROP COLUMN IF EXISTS "resumen";

-- 2. Quitar columna "tipo" de candidato_habilidades
--    (agregada en migration 20260513000001)
ALTER TABLE "candidato_habilidades" DROP COLUMN IF EXISTS "tipo";

-- ============================================================
-- NOTA: La migration 20260513000002 limpió los campos JSON:
--   UPDATE analisis_cv_directo SET cv_completo = NULL, evaluacion_completa = NULL
--   UPDATE historial_analisis    SET webhook_payload = NULL
-- Esos datos no son recuperables desde aquí (se perdió el contenido).
-- Las columnas siguen existiendo en la BD — no se borraron.
-- ============================================================

-- Opcional: registrar en _prisma_migrations que estas migraciones
-- fueron revertidas (si querés volver a aplicarlas después limpio).
-- DELETE FROM "_prisma_migrations"
-- WHERE migration_name IN (
--   '20260513000000_agregar_resumen_analisis_cv',
--   '20260513000001_agregar_tipo_candidato_habilidades',
--   '20260513000002_limpiar_json_blobs'
-- );
