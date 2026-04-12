-- ================================================================
-- MIGRACIÓN FASE 1 — ReclutaIA ATS
-- Rama:    feature/refactor-db-auth
-- Fecha:   2026-04-07
-- Autor:   Arquitecto DB Senior
-- Ticket:  refactor-db-phase1
--
-- POLÍTICA: 100% ADITIVA. Cero cambios destructivos.
-- Cada sección puede ejecutarse de forma independiente.
--
-- NOTA SOBRE NOMBRES DE COLUMNAS:
--   Prisma genera columnas en camelCase sin @map() explícito.
--   Los campos isActive, lockedUntil, updatedAt, passwordHash, etc.
--   existen en la DB como "isActive", "lockedUntil", "updatedAt".
--   Los índices de este archivo usan esos nombres exactos.
--   Las excepciones son token_verificacion_hash y token_reset_hash
--   que sí tienen @map() explícito en el schema Prisma.
-- ================================================================
BEGIN;

-- ──────────────────────────────────────────────────────────────
-- SECCIÓN 1: SEGURIDAD — Tokens hasheados
-- Problema:  tokens guardados en texto plano → vulnerabilidad
--            crítica si la DB es comprometida.
-- Solución:  agregar columnas *_hash. Las viejas se eliminan en FASE 3.
-- ──────────────────────────────────────────────────────────────
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS token_verificacion_hash TEXT,
  ADD COLUMN IF NOT EXISTS token_reset_hash        TEXT;

-- Índices UNIQUE parciales (solo cuando el valor no es NULL).
-- Un UNIQUE ya actúa como índice de búsqueda en PostgreSQL —
-- NO se crean índices _lookup adicionales (serían duplicados exactos
-- que pagarían el costo de escritura dos veces sin ningún beneficio).
CREATE UNIQUE INDEX IF NOT EXISTS uidx_usuarios_token_verif_hash
  ON usuarios(token_verificacion_hash)
  WHERE token_verificacion_hash IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uidx_usuarios_token_reset_hash
  ON usuarios(token_reset_hash)
  WHERE token_reset_hash IS NOT NULL;

COMMENT ON COLUMN usuarios.token_verificacion_hash IS
  'SHA-256 hex (64 chars) del token de verificación de email. Reemplaza token_verificacion desde FASE 2.';
COMMENT ON COLUMN usuarios.token_reset_hash IS
  'SHA-256 hex (64 chars) del token de reset de contraseña. Reemplaza token_reset desde FASE 2.';

-- ──────────────────────────────────────────────────────────────
-- SECCIÓN 2: CONSISTENCIA — Domain + CHECK para roles en nav/catálogos
-- Problema:  menu_config_rol, roles_menu y roles_catalogo usan
--            VARCHAR(50) sin ningún constraint. Un typo como
--            'Company' o 'COMPANY' pasa silenciosamente y el
--            sidebar queda vacío en producción.
-- ──────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dom_rol_usuario') THEN
    CREATE DOMAIN dom_rol_usuario AS VARCHAR(50)
      CHECK (VALUE IN ('candidate', 'company', 'administrativo'));
    COMMENT ON DOMAIN dom_rol_usuario IS
      'Domain que restringe roles al mismo conjunto del ENUM rol_usuario.';
  END IF;
END $$;

ALTER TABLE menu_config_rol
  DROP CONSTRAINT IF EXISTS chk_menu_config_rol_rol,
  ADD  CONSTRAINT chk_menu_config_rol_rol
    CHECK (rol IN ('candidate', 'company', 'administrativo'));

ALTER TABLE roles_menu
  DROP CONSTRAINT IF EXISTS chk_roles_menu_rol,
  ADD  CONSTRAINT chk_roles_menu_rol
    CHECK (rol IN ('candidate', 'company', 'administrativo'));

ALTER TABLE roles_catalogo
  DROP CONSTRAINT IF EXISTS chk_roles_catalogo_rol,
  ADD  CONSTRAINT chk_roles_catalogo_rol
    CHECK (rol IN ('candidate', 'company', 'administrativo'));

-- ──────────────────────────────────────────────────────────────
-- SECCIÓN 3: PERFORMANCE — Índices faltantes
-- Regla: índice parcial siempre que la condición reduzca > 30% filas.
--
-- NOTA: las columnas de usuarios usan camelCase porque Prisma las
-- genera sin @map() explícito ("isActive", "lockedUntil", etc.).
-- ──────────────────────────────────────────────────────────────

-- rol: usado en CADA query de auth (getActive, sidebarConfig)
CREATE INDEX IF NOT EXISTS idx_usuarios_rol
  ON usuarios(rol);

-- Cuentas activas: la mayoría de queries ignoran cuentas inactivas.
-- Columna generada por Prisma como "isActive" (camelCase).
CREATE INDEX IF NOT EXISTS idx_usuarios_activo
  ON usuarios("isActive")
  WHERE "isActive" = true;

-- Bloqueos vigentes: lookup en cada intento de login.
-- Columna generada por Prisma como "lockedUntil" (camelCase).
CREATE INDEX IF NOT EXISTS idx_usuarios_bloqueado
  ON usuarios("lockedUntil")
  WHERE "lockedUntil" IS NOT NULL;

-- Postulaciones por estado: filtro principal de los dashboards ATS
CREATE INDEX IF NOT EXISTS idx_postulaciones_estado
  ON postulaciones(estado);

-- Ofertas por estado: feed de vacantes abiertas
CREATE INDEX IF NOT EXISTS idx_ofertas_estado
  ON ofertas_laborales(estado);

-- Sidebar: query compuesta rol + orden es el hot path del frontend
CREATE INDEX IF NOT EXISTS idx_roles_menu_rol_orden
  ON roles_menu(rol, orden_render);

-- Análisis: apto es el filtro más usado en reportes de reclutamiento
CREATE INDEX IF NOT EXISTS idx_analisis_directo_apto
  ON analisis_cv_directo(apto)
  WHERE apto IS NOT NULL;

-- ──────────────────────────────────────────────────────────────
-- SECCIÓN 4: DATOS — URLs: VARCHAR(255) → TEXT
-- Problema:  URLs de cloud storage con tokens firmados superan
--            fácilmente los 255 caracteres.
-- ──────────────────────────────────────────────────────────────
ALTER TABLE postulaciones
  ALTER COLUMN url_cv TYPE TEXT;

COMMENT ON COLUMN postulaciones.url_cv IS
  'URL completa del CV en object storage (S3/GCS/Cloudinary). TEXT para soportar URLs firmadas largas.';

-- ──────────────────────────────────────────────────────────────
-- SECCIÓN 5: ESTRUCTURA — Tabla candidato_habilidades
-- Permite búsquedas ATS del tipo "candidatos con Python + 3 años exp".
-- habilidades_detectadas solo vincula habilidades a un análisis puntual;
-- esta tabla las vincula al PERFIL del candidato.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidato_habilidades (
  candidato_id       UUID        NOT NULL REFERENCES candidatos(usuario_id)          ON DELETE CASCADE,
  habilidad_id       UUID        NOT NULL REFERENCES habilidades(id)                 ON DELETE CASCADE,
  nivel              VARCHAR(20) CHECK (nivel IN ('basico', 'intermedio', 'avanzado', 'experto')),
  anios_exp          SMALLINT    CHECK (anios_exp >= 0 AND anios_exp <= 50),
  verificada         BOOLEAN     NOT NULL DEFAULT false,
  analisis_origen_id UUID        REFERENCES analisis_cv_postulacion(id)              ON DELETE SET NULL,
  creada_el          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_el     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (candidato_id, habilidad_id)
);

-- idx_candidato_habilidades_candidato NO se crea:
-- la PK compuesta (candidato_id, habilidad_id) ya actúa como índice
-- con candidato_id como columna líder — un índice adicional sería
-- un duplicado exacto con doble costo de escritura.

-- habilidad_id sí necesita índice propio (no es columna líder en la PK)
CREATE INDEX IF NOT EXISTS idx_candidato_habilidades_habilidad
  ON candidato_habilidades(habilidad_id);

-- Caso de uso frecuente: "todos los candidatos con X habilidad verificada"
CREATE INDEX IF NOT EXISTS idx_candidato_habilidades_verificada
  ON candidato_habilidades(habilidad_id, verificada)
  WHERE verificada = true;

COMMENT ON TABLE candidato_habilidades IS
  'Habilidades del PERFIL del candidato. Distinto a habilidades_detectadas (análisis puntual). Permite búsqueda ATS por stack tecnológico.';
COMMENT ON COLUMN candidato_habilidades.verificada IS
  'true = confirmada por análisis de CV automático. false = autoreportada.';
COMMENT ON COLUMN candidato_habilidades.analisis_origen_id IS
  'FK opcional al análisis que originó la detección de la habilidad.';

-- ──────────────────────────────────────────────────────────────
-- SECCIÓN 6: ESTRUCTURA — Enriquecer historial_analisis
-- Permite debug de integraciones Make.com y trazabilidad completa.
--
-- FIX: analisis_directo_id es UUID (no INT) para mantener consistencia
-- con el resto del schema donde todas las PKs son UUID.
-- ──────────────────────────────────────────────────────────────
ALTER TABLE historial_analisis
  ADD COLUMN IF NOT EXISTS analisis_directo_id UUID  REFERENCES analisis_cv_directo(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS webhook_payload     JSONB,
  ADD COLUMN IF NOT EXISTS ip_origen           INET,
  ADD COLUMN IF NOT EXISTS duracion_ms         INT   CHECK (duracion_ms >= 0);

CREATE INDEX IF NOT EXISTS idx_historial_analisis_directo
  ON historial_analisis(analisis_directo_id)
  WHERE analisis_directo_id IS NOT NULL;

COMMENT ON COLUMN historial_analisis.webhook_payload IS
  'Payload raw recibido de Make.com. Conservar para auditoría y replay de webhooks.';
COMMENT ON COLUMN historial_analisis.ip_origen IS
  'IP del servidor Make.com. Validar contra whitelist de IPs en el backend.';
COMMENT ON COLUMN historial_analisis.duracion_ms IS
  'Duración del procesamiento del escenario Make.com en milisegundos.';

-- ──────────────────────────────────────────────────────────────
-- SECCIÓN 7: CONSISTENCIA — estado_oferta con CHECK + default seguro
-- Bug: default 'abierta' → oferta recién creada queda publicada
--      automáticamente. Cambiado a 'borrador'.
-- ──────────────────────────────────────────────────────────────
UPDATE ofertas_laborales
  SET estado = 'borrador'
  WHERE estado NOT IN ('borrador', 'abierta', 'pausada', 'cerrada');

ALTER TABLE ofertas_laborales
  DROP CONSTRAINT IF EXISTS chk_oferta_estado,
  ADD  CONSTRAINT chk_oferta_estado
    CHECK (estado IN ('borrador', 'abierta', 'pausada', 'cerrada'));

ALTER TABLE ofertas_laborales
  ALTER COLUMN estado SET DEFAULT 'borrador';

COMMENT ON COLUMN ofertas_laborales.estado IS
  'Ciclo de vida de la vacante. Default "borrador" — publicación es explícita. Valores: borrador|abierta|pausada|cerrada.';

-- ──────────────────────────────────────────────────────────────
-- SECCIÓN 8: VISTAS — Corregir v_nav_por_rol
-- Fix 1: LEFT JOIN → roles sin fila en menu_config_rol ya no desaparecen.
-- Fix 2: COALESCE(..., '[]') → nunca devuelve NULL al frontend.
-- Fix 3: GROUP BY incluye columnas del LEFT JOIN para evitar errores.
-- ──────────────────────────────────────────────────────────────
DROP VIEW IF EXISTS v_nav_por_rol;

CREATE VIEW v_nav_por_rol AS
SELECT
  rm.rol,
  COALESCE(mcr.subtitle,     'Panel')            AS subtitle,
  COALESCE(mcr.config_hash,  '#/configuraciones') AS config_hash,
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id',             mi.item_key,
        'icon',           mi.icon,
        'label',          mi.label,
        'hash',           mi.hash_path,
        'activeKeyword',  mi.active_keyword,
        'esFallback',     mi.es_fallback,
        'esConfig',       mi.es_item_config,
        'activePriority', rm.active_priority
      )
      ORDER BY rm.orden_render
    ) FILTER (WHERE mi.activo = true),
    '[]'::jsonb
  ) AS items
FROM roles_menu rm
JOIN  menu_items      mi  ON mi.id  = rm.menu_item_id
LEFT  JOIN menu_config_rol mcr ON mcr.rol = rm.rol
GROUP BY rm.rol, mcr.subtitle, mcr.config_hash;

COMMENT ON VIEW v_nav_por_rol IS
  '[FASE 1 — FIX] Sidebar por rol. LEFT JOIN + COALESCE corrigen bugs de NULL. Usar en GET /api/auth/login y GET /api/auth/me.';

-- ──────────────────────────────────────────────────────────────
-- SECCIÓN 9: TRIGGER — actualizado_el automático
--
-- IMPORTANTE: este trigger NO se aplica a la tabla usuarios.
-- Prisma gestiona "updatedAt" automáticamente con @updatedAt —
-- un trigger externo entraría en conflicto y causaría doble escritura.
-- Solo se aplica a candidato_habilidades (tabla fuera de Prisma).
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_set_actualizado_el()
  RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.actualizado_el = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION fn_set_actualizado_el() IS
  'Trigger genérico: actualiza columna actualizado_el en cada UPDATE. NO usar en tablas gestionadas por Prisma (@updatedAt).';

-- Solo en candidato_habilidades (fuera de Prisma)
DROP TRIGGER IF EXISTS trg_cand_hab_actualizado_el ON candidato_habilidades;
CREATE TRIGGER trg_cand_hab_actualizado_el
  BEFORE UPDATE ON candidato_habilidades
  FOR EACH ROW EXECUTE FUNCTION fn_set_actualizado_el();

-- ──────────────────────────────────────────────────────────────
-- PENDIENTE FASE 3 (referencia — no ejecutar aún)
-- ──────────────────────────────────────────────────────────────
-- ALTER TABLE usuarios
--   DROP COLUMN IF EXISTS token_verificacion,
--   DROP COLUMN IF EXISTS token_reset,
--   ADD CONSTRAINT chk_token_verif_hash_len
--     CHECK (token_verificacion_hash IS NULL OR char_length(token_verificacion_hash) = 64),
--   ADD CONSTRAINT chk_token_reset_hash_len
--     CHECK (token_reset_hash IS NULL OR char_length(token_reset_hash) = 64),
--   ADD CONSTRAINT chk_password_hash_len
--     CHECK (char_length("passwordHash") >= 60);

-- ──────────────────────────────────────────────────────────────
-- VERIFICACIÓN FINAL (ejecutar manualmente después del COMMIT)
-- ──────────────────────────────────────────────────────────────
-- -- Columnas nuevas en usuarios:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'usuarios'
--   AND column_name IN ('token_verificacion_hash', 'token_reset_hash');
--
-- -- Índices creados (sin duplicados):
-- SELECT indexname, indexdef FROM pg_indexes
-- WHERE tablename IN ('usuarios','postulaciones','ofertas_laborales','roles_menu','candidato_habilidades')
-- ORDER BY tablename, indexname;
--
-- -- Constraints activos:
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint
-- WHERE conrelid IN ('usuarios'::regclass, 'ofertas_laborales'::regclass)
-- ORDER BY conrelid, conname;
--
-- -- Vista corregida (nunca debe devolver NULL en items):
-- SELECT rol, subtitle, jsonb_array_length(items) AS total_items FROM v_nav_por_rol;
--
-- -- Tabla nueva:
-- SELECT COUNT(*) FROM candidato_habilidades;

COMMIT;
-- ================================================================
-- FIN DE MIGRACIÓN FASE 1
-- ================================================================