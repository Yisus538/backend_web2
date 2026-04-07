-- ================================================================
-- RECLUTAIA ATS — SCHEMA DEFINITIVO DESDE CERO
-- ================================================================
-- Este script destruye todo lo que Prisma gestionaba y reconstruye
-- la base de datos completa con un diseño limpio y sin redundancia.
--
-- EJECUTAR EN ORDEN. Una sola vez sobre una DB vacía (o tras DROP).
-- ================================================================

-- ──────────────────────────────────────────────────────────────
-- PASO 0: LIMPIEZA TOTAL
-- Borra todo lo que Prisma había creado, más cualquier tabla
-- de migraciones anteriores que pudiera existir.
-- ──────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS
    habilidades_detectadas,
    analisis_cv_ats,
    historial_analisis,
    analisis_cv_directo,
    postulaciones,
    ofertas_laborales,
    roles_catalogo,
    opciones_catalogo,
    catalogos,
    roles_menu,
    menu_items,
    menu_config_rol,
    administrativos,
    candidatos,
    empresas,
    habilidades,
    candidatos_cv,     -- tabla legacy de Prisma
    "User",            -- tabla principal de Prisma (comillas por camelCase)
    "_prisma_migrations"
CASCADE;

DROP TYPE IF EXISTS
    rol_usuario,
    estado_postulacion,
    estado_log
CASCADE;

DROP VIEW IF EXISTS v_nav_por_rol;


-- ──────────────────────────────────────────────────────────────
-- PASO 1: TIPOS ENUMERADOS
-- ──────────────────────────────────────────────────────────────

-- Roles de la plataforma.
-- Los valores coinciden exactamente con los que espera el frontend
-- y con los que valida Zod en auth.validations.ts.
CREATE TYPE rol_usuario AS ENUM (
    'candidate',       -- portal del candidato
    'company',         -- portal empresa / reclutador
    'administrativo'   -- panel maestro (Fase 1)
);

CREATE TYPE estado_postulacion AS ENUM (
    'pendiente',
    'analizando',
    'analizado',
    'rechazada',
    'aceptada'
);

CREATE TYPE estado_log AS ENUM (
    'enviado_a_make',
    'recibido_con_exito',
    'error_en_make'
);


-- ================================================================
-- BLOQUE A: AUTENTICACION Y USUARIOS
--
-- DECISION DE DISENO (Costal Costa, sec. 3.8):
--   'usuarios' es la entidad SUPERCLASE.
--   'empresas', 'candidatos', 'administrativos' son SUBCLASES.
--   Cada subclase hereda el id de usuarios como PK+FK.
--
-- SIN REDUNDANCIA:
--   - correo, contrasena_hash, avatar_url, telefono, ubicacion,
--     titulo_profesional viven SOLO en usuarios (datos comunes).
--   - Los campos de bloqueo, tokens de verificacion y reset
--     viven SOLO en usuarios (una sola tabla de seguridad).
--   - Las subclases solo tienen campos exclusivos de ese rol.
--   - 'titulo_profesional' reemplaza tanto 'titulo' (User de Prisma)
--     como 'titular' (candidatos del schema anterior): UN SOLO CAMPO.
-- ================================================================

CREATE TABLE usuarios (
    id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_completo           VARCHAR(150) NOT NULL,
    correo                    VARCHAR(150) NOT NULL,
    contrasena_hash           VARCHAR(255) NOT NULL,
    rol                       rol_usuario  NOT NULL,

    -- ── Perfil publico (comun a todos los roles) ─────────────
    avatar_url                TEXT,
    telefono                  VARCHAR(30),
    ubicacion                 VARCHAR(150),
    -- Titular profesional: "Desarrollador Senior", "Head of Talent", etc.
    -- Reemplaza 'titulo' de User (Prisma) y 'titular' de candidatos (schema v1).
    -- UN SOLO CAMPO — sin redundancia entre superclase y subclase.
    titulo_profesional        VARCHAR(150),

    -- ── Estado de la cuenta ───────────────────────────────────
    is_activo                 BOOLEAN NOT NULL DEFAULT true,
    is_email_verificado       BOOLEAN NOT NULL DEFAULT false,
    intentos_fallidos         INT     NOT NULL DEFAULT 0,
    -- NULL = no bloqueado. Timestamp futuro = bloqueado hasta esa fecha.
    bloqueado_hasta           TIMESTAMPTZ,

    -- ── Tokens de verificacion de email ──────────────────────
    -- token_verificacion: hex aleatorio de 32 bytes (crypto.randomBytes)
    -- Expira en 24h segun el servicio de email actual.
    token_verificacion        TEXT,
    token_verificacion_expira TIMESTAMPTZ,

    -- ── Tokens de reset de contrasena ────────────────────────
    -- token_reset: hex aleatorio de 32 bytes.
    -- Expira segun RESET_TOKEN_EXPIRES_MINUTES (default 60 min).
    token_reset               TEXT,
    token_reset_expira        TIMESTAMPTZ,

    -- ── Timestamps ───────────────────────────────────────────
    creado_el                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_el            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_usuarios_correo UNIQUE (correo)
);

-- Indices para las busquedas mas frecuentes del auth service
CREATE UNIQUE INDEX idx_usuarios_correo             ON usuarios(correo);
CREATE INDEX        idx_usuarios_token_verificacion ON usuarios(token_verificacion) WHERE token_verificacion IS NOT NULL;
CREATE INDEX        idx_usuarios_token_reset        ON usuarios(token_reset)        WHERE token_reset IS NOT NULL;

COMMENT ON TABLE  usuarios                      IS 'Superclase de todos los usuarios autenticados. Reemplaza "User" de Prisma.';
COMMENT ON COLUMN usuarios.titulo_profesional   IS 'Titular del puesto o headline profesional. Comun a todos los roles sin excepcion.';
COMMENT ON COLUMN usuarios.bloqueado_hasta      IS 'NULL = cuenta desbloqueada. Valor futuro = bloqueada por intentos fallidos.';
COMMENT ON COLUMN usuarios.token_verificacion   IS 'Token hex para verificar el correo electronico al registrarse.';
COMMENT ON COLUMN usuarios.token_reset          IS 'Token hex para el flujo de restablecimiento de contrasena.';


-- ── Subclase: empresa / reclutador ────────────────────────────
-- Datos exclusivos del rol 'company'.
-- Hereda correo, telefono, avatar, etc. de usuarios — sin duplicar.
CREATE TABLE empresas (
    usuario_id     UUID        PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre_empresa VARCHAR(150),
    descripcion    TEXT
);

COMMENT ON TABLE empresas IS 'Subclase de usuarios para el rol company. Solo contiene datos exclusivos de empresa.';


-- ── Subclase: candidato ───────────────────────────────────────
-- Datos exclusivos del rol 'candidate'.
-- titulo_profesional ya esta en usuarios — no se repite aqui.
CREATE TABLE candidatos (
    usuario_id UUID PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    biografia  TEXT
);

COMMENT ON TABLE candidatos IS 'Subclase de usuarios para el rol candidate. titulo_profesional vive en usuarios, sin redundancia.';


-- ── Subclase: administrativo ──────────────────────────────────
-- Datos exclusivos del rol 'administrativo' (Fase 1).
CREATE TABLE administrativos (
    usuario_id     UUID PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    departamento   VARCHAR(150),
    nivel_acceso   INT NOT NULL DEFAULT 1,  -- 1=basico 2=supervisor 3=superadmin
    permisos_extra JSONB                    -- extensible sin ALTER TABLE
);

COMMENT ON TABLE  administrativos             IS 'Subclase de usuarios para el rol administrativo.';
COMMENT ON COLUMN administrativos.nivel_acceso IS '1=basico | 2=supervisor | 3=superadmin';


-- ================================================================
-- BLOQUE B: ANALISIS DE CV
--
-- DECISION DE DISENO:
-- Existen DOS flujos de analisis completamente distintos:
--
--   1) analisis_cv_directo
--      Make.com recibe un CV y devuelve el resultado.
--      Puede o no estar ligado a un usuario registrado.
--      Reemplaza 'candidatos_cv' de Prisma (mismo proposito, diseno limpio).
--      Los campos de contacto son snapshot del CV, no del perfil del usuario
--      (por eso NO son redundantes con usuarios.correo etc.).
--
--   2) analisis_cv_postulacion
--      Analisis ligado a una postulacion formal dentro del ATS.
--      Reemplaza 'analisis_cv' del schema anterior.
--
-- SIN REDUNDANCIA entre las dos tablas: tienen propositos distintos,
-- ninguna comparte columnas con la otra ni con 'usuarios'.
-- ================================================================

-- Tabla 1: Analisis directo (resultado que Make.com postea de vuelta)
CREATE TABLE analisis_cv_directo (
    id                  SERIAL      PRIMARY KEY,
    -- FK nullable: si el CV pertenece a un candidato registrado.
    -- NULL = analisis anonimo / demo / batch externo.
    candidato_id        UUID        REFERENCES candidatos(usuario_id) ON DELETE SET NULL,
    -- Datos extraidos del CV (snapshot del documento, no del perfil de usuario)
    nombre_completo     VARCHAR(255),
    correo_cv           VARCHAR(255),  -- correo en el CV, puede diferir del de la cuenta
    telefono_cv         VARCHAR(50),
    puesto_evaluado     VARCHAR(100),
    -- Resultado del analisis
    score               INT,
    apto                BOOLEAN,
    motivo_rechazo      TEXT,
    cv_completo         JSONB,         -- datos estructurados del CV completo
    evaluacion_completa JSONB,         -- resultado completo de la IA
    analizado_el        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analisis_directo_candidato ON analisis_cv_directo(candidato_id) WHERE candidato_id IS NOT NULL;

COMMENT ON TABLE  analisis_cv_directo         IS 'Resultados de analisis de CV via Make.com. Reemplaza candidatos_cv de Prisma.';
COMMENT ON COLUMN analisis_cv_directo.correo_cv IS 'Correo extraido del documento CV. Puede diferir de usuarios.correo — NO es redundante.';


-- ================================================================
-- BLOQUE C: ATS CORE
-- Vacantes, postulaciones y analisis estructurado.
-- ================================================================

CREATE TABLE ofertas_laborales (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id  UUID        NOT NULL REFERENCES empresas(usuario_id) ON DELETE CASCADE,
    titulo      VARCHAR(150) NOT NULL,
    descripcion TEXT        NOT NULL,
    estado      VARCHAR(50) NOT NULL DEFAULT 'abierta',
    creada_el   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ofertas_empresa ON ofertas_laborales(empresa_id);

CREATE TABLE postulaciones (
    id           UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    oferta_id    UUID              NOT NULL REFERENCES ofertas_laborales(id) ON DELETE CASCADE,
    candidato_id UUID              NOT NULL REFERENCES candidatos(usuario_id) ON DELETE CASCADE,
    url_cv       VARCHAR(255)      NOT NULL,
    estado       estado_postulacion NOT NULL DEFAULT 'pendiente',
    creada_el    TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_postulacion_unica UNIQUE (oferta_id, candidato_id)
);

CREATE INDEX idx_postulaciones_oferta    ON postulaciones(oferta_id);
CREATE INDEX idx_postulaciones_candidato ON postulaciones(candidato_id);

-- Analisis ligado a una postulacion formal
CREATE TABLE analisis_cv_postulacion (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    postulacion_id UUID        NOT NULL UNIQUE REFERENCES postulaciones(id) ON DELETE CASCADE,
    puntuacion     INT,
    resumen        TEXT,
    datos_crudos   JSONB,
    apto           BOOLEAN,
    motivo         TEXT,
    fortalezas     JSONB,
    debilidades    JSONB,
    riesgos        JSONB,
    analizado_el   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE habilidades (
    id     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    CONSTRAINT uq_habilidad_nombre UNIQUE (nombre)
);

CREATE TABLE habilidades_detectadas (
    analisis_id  UUID NOT NULL REFERENCES analisis_cv_postulacion(id) ON DELETE CASCADE,
    habilidad_id UUID NOT NULL REFERENCES habilidades(id)             ON DELETE CASCADE,
    PRIMARY KEY (analisis_id, habilidad_id)
);

-- Log de estados del proceso de analisis (integrado con Make.com)
CREATE TABLE historial_analisis (
    id             UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
    postulacion_id UUID       REFERENCES postulaciones(id) ON DELETE CASCADE,
    estado         estado_log NOT NULL,
    detalles       TEXT,
    creado_el      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_historial_postulacion ON historial_analisis(postulacion_id);


-- ================================================================
-- BLOQUE D: NAVEGACION DINAMICA
-- Reemplaza SIDEBAR_CONFIG hardcodeado en el frontend.
-- No usa FK a usuarios — trabaja con el string del ENUM rol_usuario
-- para no acoplar la logica de UI a la tabla de autenticacion.
-- ================================================================

-- Metadatos del sidebar por rol: subtitulo y ruta del panel de config
CREATE TABLE menu_config_rol (
    -- Valor exacto del ENUM rol_usuario
    rol         VARCHAR(50)  PRIMARY KEY,
    subtitle    VARCHAR(150) NOT NULL,
    config_hash VARCHAR(200) NOT NULL
);

-- Catalogo maestro de items de navegacion
CREATE TABLE menu_items (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 'id' del navItem en SIDEBAR_CONFIG original: "dashboard", "vacantes", etc.
    item_key       VARCHAR(100) NOT NULL,
    icon           VARCHAR(100) NOT NULL,  -- nombre del Material Symbol
    label          VARCHAR(150) NOT NULL,
    hash_path      VARCHAR(200) NOT NULL,  -- "#/dashboard", "#/vacantes", etc.
    active_keyword VARCHAR(100) NOT NULL,  -- substring para detectar item activo
    es_item_config BOOLEAN NOT NULL DEFAULT false, -- true = va en el footer del sidebar
    es_fallback    BOOLEAN NOT NULL DEFAULT false, -- true = activo cuando nada coincide
    activo         BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT uq_menu_item_key UNIQUE (item_key)
);

-- Asignacion item <-> rol con orden visual y prioridad de deteccion activa
CREATE TABLE roles_menu (
    rol              VARCHAR(50) NOT NULL,
    menu_item_id     UUID        NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    -- Posicion visual en el sidebar (ASC)
    orden_render     INT NOT NULL DEFAULT 0,
    -- Prioridad de deteccion del item activo (ASC = mayor precedencia).
    -- Emula exactamente el orden de los if-else del getActive() original.
    active_priority  INT NOT NULL DEFAULT 99,
    PRIMARY KEY (rol, menu_item_id)
);

CREATE INDEX idx_roles_menu_rol ON roles_menu(rol);


-- ================================================================
-- BLOQUE E: CATALOGOS PARA SELECTS DINAMICOS
-- Reemplaza las options hardcodeadas en Step1InfoBasica.js,
-- Step2Requisitos.js y cualquier otro formulario.
-- ================================================================

CREATE TABLE catalogos (
    id     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Clave usada por el frontend: "modalidad_trabajo", "categoria_vacante"
    clave  VARCHAR(100) NOT NULL,
    label  VARCHAR(150) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT uq_catalogo_clave UNIQUE (clave)
);

CREATE TABLE opciones_catalogo (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    catalogo_id UUID        NOT NULL REFERENCES catalogos(id) ON DELETE CASCADE,
    valor       VARCHAR(100) NOT NULL,  -- value del <option>
    label       VARCHAR(150) NOT NULL,  -- texto visible del <option>
    orden       INT         NOT NULL DEFAULT 0,
    activo      BOOLEAN     NOT NULL DEFAULT true,
    CONSTRAINT uq_opcion_por_catalogo UNIQUE (catalogo_id, valor)
);

CREATE INDEX idx_opciones_catalogo ON opciones_catalogo(catalogo_id);

-- Control de acceso por rol.
-- Sin filas = catalogo publico para todos los roles.
-- Con filas = solo los roles listados tienen acceso.
CREATE TABLE roles_catalogo (
    rol         VARCHAR(50) NOT NULL,
    catalogo_id UUID        NOT NULL REFERENCES catalogos(id) ON DELETE CASCADE,
    PRIMARY KEY (rol, catalogo_id)
);


-- ================================================================
-- BLOQUE F: INSERTS — CONFIGURACION DE NAVEGACION
-- Extraidos 1:1 de SIDEBAR_CONFIG (sin inventar nada).
-- ================================================================

INSERT INTO menu_config_rol (rol, subtitle, config_hash) VALUES
    ('company',        'Panel Admin',      '#/configuraciones'),
    ('candidate',      'Portal Candidato', '#/candidato-configuraciones'),
    ('administrativo', 'Panel Maestro',    '#/admin-configuraciones');

-- Items de menu: ROL company
INSERT INTO menu_items (item_key, icon, label, hash_path, active_keyword, es_item_config, es_fallback, activo) VALUES
    ('dashboard',      'grid_view',     'Dashboard',        '#/dashboard',       'dashboard',       false, true,  true),
    ('vacantes',       'work',          'Mis Vacantes',      '#/vacantes',        'vacantes',        false, false, true),
    ('candidatos',     'person_search', 'Buscar Candidatos', '#/candidatos',      'candidatos',      false, false, true),
    ('informes',       'bar_chart',     'Informes',          '#/informes',        'informes',        false, false, false),
    ('entrevistas',    'event',         'Entrevistas',       '#/entrevistas',     'entrevistas',     false, false, false),
    ('company-config', 'settings',      'Configuracion',     '#/configuraciones', 'configuraciones', true,  false, true);

-- Items de menu: ROL candidate
INSERT INTO menu_items (item_key, icon, label, hash_path, active_keyword, es_item_config, es_fallback, activo) VALUES
    ('candidato-dashboard',    'grid_view', 'Dashboard',        '#/candidato-dashboard',     'candidato-dashboard',    false, true,  true),
    ('candidato-perfil',       'person',    'Mi Perfil',        '#/candidato-perfil',         'candidato-perfil',       false, false, true),
    ('candidato-candidaturas', 'work',      'Mis Candidaturas', '#/candidato-candidaturas',   'candidato-candidaturas', false, false, true),
    ('candidato-matches',      'handshake', 'Mis Matches',      '#/candidato-matches',        'candidato-matches',      false, false, false),
    ('candidato-mensajes',     'forum',     'Mensajes',         '#/candidato-mensajes',       'candidato-mensajes',     false, false, false),
    ('candidato-config',       'settings',  'Configuracion',    '#/candidato-configuraciones','configuraciones',        true,  false, true);

-- Items de menu: ROL administrativo (nuevo)
INSERT INTO menu_items (item_key, icon, label, hash_path, active_keyword, es_item_config, es_fallback, activo) VALUES
    ('admin-dashboard', 'admin_panel_settings', 'Panel General', '#/admin-dashboard',         'admin-dashboard',         false, true,  true),
    ('admin-usuarios',  'manage_accounts',       'Usuarios',      '#/admin-usuarios',          'admin-usuarios',          false, false, true),
    ('admin-empresas',  'business',              'Empresas',      '#/admin-empresas',          'admin-empresas',          false, false, true),
    ('admin-reportes',  'bar_chart',             'Reportes',      '#/admin-reportes',          'admin-reportes',          false, false, true),
    ('admin-config',    'settings',              'Configuracion', '#/admin-configuraciones',   'admin-configuraciones',   true,  false, true);

-- Asignacion items -> rol
-- active_priority emula el orden exacto de los if-else del getActive() original.
-- Menor numero = se evalua primero. 99 = fallback (nunca hace match directo).

-- company
INSERT INTO roles_menu (rol, menu_item_id, orden_render, active_priority)
SELECT 'company', mi.id, t.orden, t.prio
FROM (VALUES
    ('company-config', 0,  1),
    ('dashboard',      1, 99),
    ('vacantes',       2,  2),
    ('candidatos',     3,  3),
    ('informes',       4,  4),
    ('entrevistas',    5,  5)
) AS t(key, orden, prio) JOIN menu_items mi ON mi.item_key = t.key;

-- candidate
INSERT INTO roles_menu (rol, menu_item_id, orden_render, active_priority)
SELECT 'candidate', mi.id, t.orden, t.prio
FROM (VALUES
    ('candidato-config',       0,  1),
    ('candidato-dashboard',    1, 99),
    ('candidato-perfil',       2,  2),
    ('candidato-candidaturas', 3,  3),
    ('candidato-matches',      4,  4),
    ('candidato-mensajes',     5,  5)
) AS t(key, orden, prio) JOIN menu_items mi ON mi.item_key = t.key;

-- administrativo
INSERT INTO roles_menu (rol, menu_item_id, orden_render, active_priority)
SELECT 'administrativo', mi.id, t.orden, t.prio
FROM (VALUES
    ('admin-config',    0,  1),
    ('admin-dashboard', 1, 99),
    ('admin-usuarios',  2,  2),
    ('admin-empresas',  3,  3),
    ('admin-reportes',  4,  4)
) AS t(key, orden, prio) JOIN menu_items mi ON mi.item_key = t.key;


-- ================================================================
-- BLOQUE G: INSERTS — CATALOGOS
-- Extraidos de Step1InfoBasica.js y Step2Requisitos.js
-- ================================================================

INSERT INTO catalogos (clave, label) VALUES
    ('categoria_vacante',  'Categoria de la vacante'),
    ('modalidad_trabajo',  'Modalidad de trabajo'),
    ('nivel_idioma_es',    'Nivel de Espanol'),
    ('nivel_idioma_en',    'Nivel de Ingles'),
    ('estado_oferta',      'Estado de la oferta laboral'),
    ('estado_postulacion', 'Estado de la postulacion');

INSERT INTO opciones_catalogo (catalogo_id, valor, label, orden)
SELECT c.id, v.valor, v.label, v.orden FROM catalogos c
CROSS JOIN (VALUES ('tech','Tecnologia / IT',1),('mkt','Marketing / Ventas',2),('hr','Recursos Humanos',3)) AS v(valor,label,orden)
WHERE c.clave = 'categoria_vacante';

INSERT INTO opciones_catalogo (catalogo_id, valor, label, orden)
SELECT c.id, v.valor, v.label, v.orden FROM catalogos c
CROSS JOIN (VALUES ('remoto','Remoto',1),('hibrido','Hibrido',2),('presencial','Presencial',3)) AS v(valor,label,orden)
WHERE c.clave = 'modalidad_trabajo';

INSERT INTO opciones_catalogo (catalogo_id, valor, label, orden)
SELECT c.id, v.valor, v.label, v.orden FROM catalogos c
CROSS JOIN (VALUES ('nativo','Nativo',1),('bilingue','Bilingue',2)) AS v(valor,label,orden)
WHERE c.clave = 'nivel_idioma_es';

INSERT INTO opciones_catalogo (catalogo_id, valor, label, orden)
SELECT c.id, v.valor, v.label, v.orden FROM catalogos c
CROSS JOIN (VALUES ('b1','Intermedio (B1/B2)',1),('c1','Avanzado (C1/C2)',2)) AS v(valor,label,orden)
WHERE c.clave = 'nivel_idioma_en';

INSERT INTO opciones_catalogo (catalogo_id, valor, label, orden)
SELECT c.id, v.valor, v.label, v.orden FROM catalogos c
CROSS JOIN (VALUES ('abierta','Abierta',1),('pausada','Pausada',2),('cerrada','Cerrada',3),('borrador','Borrador',4)) AS v(valor,label,orden)
WHERE c.clave = 'estado_oferta';

INSERT INTO opciones_catalogo (catalogo_id, valor, label, orden)
SELECT c.id, v.valor, v.label, v.orden FROM catalogos c
CROSS JOIN (VALUES ('pendiente','Pendiente',1),('analizando','Analizando',2),('analizado','Analizado',3),('rechazada','Rechazada',4),('aceptada','Aceptada',5)) AS v(valor,label,orden)
WHERE c.clave = 'estado_postulacion';

-- Los catalogos de creacion de vacantes son exclusivos de company y administrativo
INSERT INTO roles_catalogo (rol, catalogo_id)
SELECT r.rol, c.id FROM catalogos c
CROSS JOIN (VALUES ('company'),('administrativo')) AS r(rol)
WHERE c.clave IN ('categoria_vacante','modalidad_trabajo','nivel_idioma_es','nivel_idioma_en','estado_oferta','estado_postulacion');


-- ================================================================
-- BLOQUE H: VISTA HELPER PARA EL BACKEND
-- Una sola query devuelve el sidebar completo por rol como JSONB.
-- Uso: SELECT * FROM v_nav_por_rol WHERE rol = $1
-- ================================================================
CREATE VIEW v_nav_por_rol AS
SELECT
    rm.rol,
    mcr.subtitle,
    mcr.config_hash,
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
    ) FILTER (WHERE mi.activo = true) AS items
FROM roles_menu rm
JOIN menu_items      mi  ON mi.id  = rm.menu_item_id
JOIN menu_config_rol mcr ON mcr.rol = rm.rol
GROUP BY rm.rol, mcr.subtitle, mcr.config_hash;

COMMENT ON VIEW v_nav_por_rol IS 'Sidebar completo por rol. Usar en GET /api/auth/login y GET /api/auth/me.';