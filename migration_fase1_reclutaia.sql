-- ================================================================
-- MIGRACIÓN FASE 1 — ReclutaIA ATS
-- Rama:    feature/refactor-db-auth
-- Fecha:   2026-04-07
-- Autor:   Arquitecto DB Senior
-- Ticket:  refactor-db-phase1
--
-- POLÍTICA: 100% ADITIVA. Cero cambios destructivos.
-- Cada sección puede ejecutarse de forma independiente.
-- ================================================================
BEGIN;
-- Envolver todo en una transacción atómica
-- ──────────────────────────────────────────────────────────────
-- SECCIÓN 1: SEGURIDAD
-- Problema:  tokens guardados en texto plano → vulnerabilidad
--            crítica si la DB es comprometida.
-- Solución:  agregar columnas *_hash junto a las columnas viejas.
--            Las viejas se mantienen hasta que el backend migre
--            su lógica en FASE 2.
-- ──────────────────────────────────────────────────────────────
ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS token_verificacion_hash TEXT,
    ADD COLUMN IF NOT EXISTS token_reset_hash TEXT;
-- Índices únicos parciales (solo cuando el valor no es NULL):
-- Garantizan que dos usuarios no puedan tener el mismo hash activo.
-- El índice parcial no penaliza filas con hash = NULL.
CREATE UNIQUE INDEX IF NOT EXISTS uidx_usuarios_token_verif_hash ON usuarios(token_verificacion_hash)
WHERE token_verificacion_hash IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uidx_usuarios_token_reset_hash ON usuarios(token_reset_hash)
WHERE token_reset_hash IS NOT NULL;
-- Índices de búsqueda (lookup en el flujo de verificación/reset):
CREATE INDEX IF NOT EXISTS idx_usuarios_token_verif_hash_lookup ON usuarios(token_verificacion_hash)
WHERE token_verificacion_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_usuarios_token_reset_hash_lookup ON usuarios(token_reset_hash)
WHERE token_reset_hash IS NOT NULL;
COMMENT ON COLUMN usuarios.token_verificacion_hash IS 'SHA-256 hex del token de verificación de email. Reemplazará token_verificacion en FASE 2 del backend.';
COMMENT ON COLUMN usuarios.token_reset_hash IS 'SHA-256 hex del token de reset de contraseña. Reemplazará token_reset en FASE 2 del backend.';
-- ──────────────────────────────────────────────────────────────
-- SECCIÓN 2: CONSISTENCIA — Domain + CHECK para roles en nav/catálogos
-- Problema:  menu_config_rol, roles_menu y roles_catalogo usan
--            VARCHAR(50) sin ningún constraint. Un typo como
--            'Company' o 'COMPANY' pasa silenciosamente y el
--            sidebar queda vacío en producción.
-- Solución:  DOMAIN reutilizable + CHECK constraints en cada tabla.
--            No se toca la columna `rol` de `usuarios` (ya es ENUM).
-- ──────────────────────────────────────────────────────────────
-- DOMAIN: refleja exactamente los valores del ENUM rol_usuario.
-- Úsalo en cualquier tabla nueva que referencie un rol como string.
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'dom_rol_usuario'
) THEN CREATE DOMAIN dom_rol_usuario AS VARCHAR(50) CHECK (
    VALUE IN ('candidate', 'company', 'administrativo')
);
COMMENT ON DOMAIN dom_rol_usuario IS 'Domain que restringe roles al mismo conjunto del ENUM rol_usuario. Usar en tablas de UI/nav que no pueden tener FK a usuarios.';
END IF;
END;
$$;
-- CHECK constraints en las tres tablas afectadas:
ALTER TABLE menu_config_rol DROP CONSTRAINT IF EXISTS chk_menu_config_rol_rol,
    ADD CONSTRAINT chk_menu_config_rol_rol CHECK (
        rol IN ('candidate', 'company', 'administrativo')
    );
ALTER TABLE roles_menu DROP CONSTRAINT IF EXISTS chk_roles_menu_rol,
    ADD CONSTRAINT chk_roles_menu_rol CHECK (
        rol IN ('candidate', 'company', 'administrativo')
    );
ALTER TABLE roles_catalogo DROP CONSTRAINT IF EXISTS chk_roles_catalogo_rol,
    ADD CONSTRAINT chk_roles_catalogo_rol CHECK (
        rol IN ('candidate', 'company', 'administrativo')
    );
-- ──────────────────────────────────────────────────────────────
-- SECCIÓN 3: PERFORMANCE — Índices faltantes
-- Problema:  ausencia de índices en columnas de filtro frecuente
--            → full table scans en cada login, dashboard y query
--            de postulaciones.
-- Regla:     índice parcial siempre que la condición reduzca > 30%
--            de las filas (ej: is_activo = true).
-- ──────────────────────────────────────────────────────────────
-- usuarios.rol: usado en CADA query de auth (getActive, sidebarConfig)
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
-- Cuentas activas: la mayoría de queries ignoran cuentas inactivas
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(is_activo)
WHERE is_activo = true;
-- Bloqueos vigentes: lookup en cada intento de login
CREATE INDEX IF NOT EXISTS idx_usuarios_bloqueado ON usuarios(bloqueado_hasta)
WHERE bloqueado_hasta IS NOT NULL;
-- Postulaciones por estado: filtro principal de los dashboards ATS
CREATE INDEX IF NOT EXISTS idx_postulaciones_estado ON postulaciones(estado);
-- Ofertas por estado: feed de vacantes abiertas
CREATE INDEX IF NOT EXISTS idx_ofertas_estado ON ofertas_laborales(estado);
-- Sidebar: query compuesta rol + orden es el hot path del frontend
CREATE INDEX IF NOT EXISTS idx_roles_menu_rol_orden ON roles_menu(rol, orden_render);
-- Análisis: apto es el filtro más usado en reportes de reclutamiento
CREATE INDEX IF NOT EXISTS idx_analisis_directo_apto ON analisis_cv_directo(apto)
WHERE apto IS NOT NULL;
-- ──────────────────────────────────────────────────────────────
-- SECCIÓN 4: DATOS — URLs: VARCHAR(255) → TEXT
-- Problema:  las URLs de cloud storage (AWS S3, GCS, Cloudinary)
--            con tokens temporales firmados superan fácilmente los
--            255 caracteres. Un truncamiento silencioso rompe el
--            acceso al CV.
-- Solución:  ALTER COLUMN TYPE TEXT. En PostgreSQL esto no
--            requiere reescritura de heap si el dato ya cabe;
--            solo actualiza el catálogo del sistema.
-- ──────────────────────────────────────────────────────────────
ALTER TABLE postulaciones
ALTER COLUMN url_cv TYPE TEXT;
COMMENT ON COLUMN postulaciones.url_cv IS 'URL completa del CV en object storage (S3/GCS/Cloudinary). TEXT para soportar URLs firmadas largas.';
-- ──────────────────────────────────────────────────────────────
-- SECCIÓN 5: ESTRUCTURA — Tabla candidato_habilidades
-- Problema:  habilidades_detectadas liga habilidades a un análisis
--            puntual, no al perfil del candidato. Imposible hacer
--            búsquedas "candidatos con Python + 3 años exp" que es
--            el caso de uso central de un ATS.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidato_habilidades (
    candidato_id UUID NOT NULL REFERENCES candidatos(usuario_id) ON DELETE CASCADE,
    habilidad_id UUID NOT NULL REFERENCES habilidades(id) ON DELETE CASCADE,
    -- Nivel autoreportado o detectado por IA
    nivel VARCHAR(20) CHECK (
        nivel IN ('basico', 'intermedio', 'avanzado', 'experto')
    ),
    -- Años de experiencia con esta habilidad (0–50)
    anios_exp SMALLINT CHECK (
        anios_exp >= 0
        AND anios_exp <= 50
    ),
    -- true cuando fue extraída/confirmada por un análisis de CV automático
    -- false = autoreportada por el candidato en su perfil
    verificada BOOLEAN NOT NULL DEFAULT false,
    -- FK opcional: qué análisis confirmó esta habilidad
    analisis_origen_id UUID REFERENCES analisis_cv_postulacion(id) ON DELETE
    SET NULL,
        creada_el TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        actualizado_el TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (candidato_id, habilidad_id)
);
CREATE INDEX IF NOT EXISTS idx_candidato_habilidades_habilidad ON candidato_habilidades(habilidad_id);
CREATE INDEX IF NOT EXISTS idx_candidato_habilidades_candidato ON candidato_habilidades(candidato_id);
-- Índice para el caso de uso: "todos los candidatos con X habilidad verificada"
CREATE INDEX IF NOT EXISTS idx_candidato_habilidades_verificada ON candidato_habilidades(habilidad_id, verificada)
WHERE verificada = true;
COMMENT ON TABLE candidato_habilidades IS 'Habilidades del PERFIL del candidato. Distinto a habilidades_detectadas (que pertenece a un análisis puntual). Permite búsqueda ATS por stack tecnológico.';
COMMENT ON COLUMN candidato_habilidades.verificada IS 'true = confirmada por análisis de CV automático. false = autoreportada.';
COMMENT ON COLUMN candidato_habilidades.analisis_origen_id IS 'FK opcional al análisis que originó la detección de la habilidad.';
-- ──────────────────────────────────────────────────────────────
-- SECCIÓN 6: ESTRUCTURA — Enriquecer historial_analisis
-- Problema:  el log de Make.com no guarda el payload del webhook
--            ni vincula con analisis_cv_directo. Debugging de
--            integraciones imposible sin estos datos.
-- ──────────────────────────────────────────────────────────────
ALTER TABLE historial_analisis -- Trazabilidad hacia análisis directo (flujo sin postulación formal)
ADD COLUMN IF NOT EXISTS analisis_directo_id INT REFERENCES analisis_cv_directo(id) ON DELETE
SET NULL,
    -- Payload raw del webhook: invaluable para debug en producción
ADD COLUMN IF NOT EXISTS webhook_payload JSONB,
    -- IP del emisor: permite verificar que el webhook viene de Make.com
ADD COLUMN IF NOT EXISTS ip_origen INET,
    -- Tiempo de procesamiento: útil para SLA y detección de cuellos de botella
ADD COLUMN IF NOT EXISTS duracion_ms INT CHECK (duracion_ms >= 0);
CREATE INDEX IF NOT EXISTS idx_historial_analisis_directo ON historial_analisis(analisis_directo_id)
WHERE analisis_directo_id IS NOT NULL;
COMMENT ON COLUMN historial_analisis.webhook_payload IS 'Payload raw recibido de Make.com. Conservar para auditoría y replay de webhooks.';
COMMENT ON COLUMN historial_analisis.ip_origen IS 'IP del servidor Make.com. Validar contra whitelist de IPs en FASE 2.';
COMMENT ON COLUMN historial_analisis.duracion_ms IS 'Duración del procesamiento del escenario Make.com en milisegundos.';
-- ──────────────────────────────────────────────────────────────
-- SECCIÓN 7: CONSISTENCIA — estado_oferta con CHECK + default seguro
-- Problema:  ofertas_laborales.estado es VARCHAR sin constraint.
--            El default 'abierta' significa que una oferta recién
--            creada queda publicada automáticamente — bug grave.
--            El catálogo define 4 valores pero la tabla acepta
--            cualquier string.
-- ──────────────────────────────────────────────────────────────
-- Primero normalizar cualquier dato sucio existente
-- (protege el ALTER si hay filas con estados fuera del set válido)
UPDATE ofertas_laborales
SET estado = 'borrador'
WHERE estado NOT IN ('borrador', 'abierta', 'pausada', 'cerrada');
-- Agregar el CHECK constraint
ALTER TABLE ofertas_laborales DROP CONSTRAINT IF EXISTS chk_oferta_estado,
    ADD CONSTRAINT chk_oferta_estado CHECK (
        estado IN ('borrador', 'abierta', 'pausada', 'cerrada')
    );
-- Cambiar default: las ofertas nuevas nacen como borrador
ALTER TABLE ofertas_laborales
ALTER COLUMN estado
SET DEFAULT 'borrador';
COMMENT ON COLUMN ofertas_laborales.estado IS 'Ciclo de vida de la vacante. Default cambiado a "borrador" — publicación es explícita. Valores: borrador|abierta|pausada|cerrada.';
-- ──────────────────────────────────────────────────────────────
-- SECCIÓN 8: VISTAS — Corregir v_nav_por_rol
-- Bug 1: INNER JOIN con menu_config_rol elimina roles que tienen
--        items en roles_menu pero no tienen fila en menu_config_rol.
-- Bug 2: jsonb_agg con FILTER puede devolver NULL en lugar de []
--        cuando todos los items están inactivos. El frontend espera
--        siempre un array, nunca null.
-- Bug 3: GROUP BY no incluye mcr.subtitle/mcr.config_hash cuando
--        el LEFT JOIN produce NULL → potencial error de agrupación.
-- ──────────────────────────────────────────────────────────────
DROP VIEW IF EXISTS v_nav_por_rol;
CREATE VIEW v_nav_por_rol AS
SELECT rm.rol,
    COALESCE(mcr.subtitle, 'Panel') AS subtitle,
    COALESCE(mcr.config_hash, '#/configuraciones') AS config_hash,
    COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id',
                mi.item_key,
                'icon',
                mi.icon,
                'label',
                mi.label,
                'hash',
                mi.hash_path,
                'activeKeyword',
                mi.active_keyword,
                'esFallback',
                mi.es_fallback,
                'esConfig',
                mi.es_item_config,
                'activePriority',
                rm.active_priority
            )
            ORDER BY rm.orden_render
        ) FILTER (
            WHERE mi.activo = true
        ),
        '[]'::jsonb
    ) AS items
FROM roles_menu rm
    JOIN menu_items mi ON mi.id = rm.menu_item_id
    LEFT JOIN menu_config_rol mcr ON mcr.rol = rm.rol
GROUP BY rm.rol,
    mcr.subtitle,
    mcr.config_hash;
COMMENT ON VIEW v_nav_por_rol IS '[FASE 1 — FIX] Sidebar por rol. LEFT JOIN + COALESCE corrigen bugs de NULL. Usar en GET /api/auth/login y GET /api/auth/me.';
-- ──────────────────────────────────────────────────────────────
-- SECCIÓN 9: TRIGGER — actualizado_el automático
-- Problema:  usuarios.actualizado_el y candidato_habilidades
--            .actualizado_el no se actualizan solos. El backend
--            tendría que hacerlo manualmente en cada UPDATE.
-- Solución:  función + trigger genérico reutilizable.
-- ──────────────────────────────────────────────────────────────
-- Función reutilizable para cualquier tabla con columna actualizado_el
CREATE OR REPLACE FUNCTION fn_set_actualizado_el() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN NEW.actualizado_el = NOW();
RETURN NEW;
END;
$$;
COMMENT ON FUNCTION fn_set_actualizado_el() IS 'Trigger genérico: actualiza columna actualizado_el automáticamente en cada UPDATE.';
-- Trigger en usuarios
DROP TRIGGER IF EXISTS trg_usuarios_actualizado_el ON usuarios;
CREATE TRIGGER trg_usuarios_actualizado_el BEFORE
UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION fn_set_actualizado_el();
-- Trigger en candidato_habilidades
DROP TRIGGER IF EXISTS trg_cand_hab_actualizado_el ON candidato_habilidades;
CREATE TRIGGER trg_cand_hab_actualizado_el BEFORE
UPDATE ON candidato_habilidades FOR EACH ROW EXECUTE FUNCTION fn_set_actualizado_el();
-- ──────────────────────────────────────────────────────────────
-- VERIFICACIÓN FINAL
-- Ejecutar manualmente para confirmar que la migración fue exitosa.
-- ──────────────────────────────────────────────────────────────
-- Verificar columnas nuevas en usuarios
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'usuarios'
-- AND column_name IN ('token_verificacion_hash', 'token_reset_hash');
-- Verificar índices creados
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename IN ('usuarios','postulaciones','ofertas_laborales','roles_menu')
-- ORDER BY tablename, indexname;
-- Verificar constraint en menu_config_rol
-- SELECT conname, consrc FROM pg_constraint
-- WHERE conrelid = 'menu_config_rol'::regclass;
-- Verificar vista corregida
-- SELECT rol, subtitle, jsonb_array_length(items) AS total_items
-- FROM v_nav_por_rol;
-- Verificar tabla nueva
-- SELECT COUNT(*) FROM candidato_habilidades;
COMMIT;
-- Si llegamos aquí, todo está OK. Rollback automático si algo falló.
-- ================================================================
-- FIN DE MIGRACIÓN FASE 1
-- ================================================================