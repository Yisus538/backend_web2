-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "verificationTokenExpiresAt" TIMESTAMP(3),
    "resetTokenExpiresAt" TIMESTAMP(3),
    "token_verificacion_hash" TEXT,
    "token_reset_hash" TEXT,
    "avatarUrl" TEXT,
    "telefono" TEXT,
    "ubicacion" TEXT,
    "titulo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresas" (
    "usuario_id" TEXT NOT NULL,
    "nombre_empresa" TEXT,
    "descripcion" TEXT,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "candidatos" (
    "usuario_id" TEXT NOT NULL,
    "biografia" TEXT,

    CONSTRAINT "candidatos_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "administrativos" (
    "usuario_id" TEXT NOT NULL,
    "departamento" TEXT,
    "nivel_acceso" INTEGER NOT NULL DEFAULT 1,
    "permisos_extra" JSONB,

    CONSTRAINT "administrativos_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "analisis_cv_directo" (
    "id" TEXT NOT NULL,
    "candidato_id" TEXT,
    "nombre_completo" TEXT,
    "correo_cv" TEXT,
    "telefono_cv" TEXT,
    "puesto_evaluado" TEXT,
    "score" INTEGER,
    "apto" BOOLEAN,
    "motivo_rechazo" TEXT,
    "cv_completo" JSONB,
    "evaluacion_completa" JSONB,
    "analizado_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analisis_cv_directo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analisis_cv_postulacion" (
    "id" TEXT NOT NULL,
    "postulacion_id" TEXT NOT NULL,
    "puntuacion" INTEGER,
    "resumen" TEXT,
    "datos_crudos" JSONB,
    "apto" BOOLEAN,
    "motivo" TEXT,
    "fortalezas" JSONB,
    "debilidades" JSONB,
    "riesgos" JSONB,
    "analizado_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analisis_cv_postulacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ofertas_laborales" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'borrador',
    "categoria" TEXT,
    "modalidad" TEXT,
    "experiencia_minima" INTEGER NOT NULL DEFAULT 0,
    "salario_min" INTEGER,
    "salario_max" INTEGER,
    "ubicacion" TEXT,
    "requisitos" JSONB,
    "matching_weights" JSONB,
    "creada_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ofertas_laborales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postulaciones" (
    "id" TEXT NOT NULL,
    "oferta_id" TEXT NOT NULL,
    "candidato_id" TEXT NOT NULL,
    "url_cv" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "creada_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "postulaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habilidades" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "habilidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habilidades_detectadas" (
    "analisis_id" TEXT NOT NULL,
    "habilidad_id" TEXT NOT NULL,

    CONSTRAINT "habilidades_detectadas_pkey" PRIMARY KEY ("analisis_id","habilidad_id")
);

-- CreateTable
CREATE TABLE "candidato_habilidades" (
    "candidato_id" TEXT NOT NULL,
    "habilidad_id" TEXT NOT NULL,
    "nivel" TEXT,
    "anios_exp" INTEGER,
    "verificada" BOOLEAN NOT NULL DEFAULT false,
    "analisis_origen_id" TEXT,
    "creada_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidato_habilidades_pkey" PRIMARY KEY ("candidato_id","habilidad_id")
);

-- CreateTable
CREATE TABLE "historial_analisis" (
    "id" TEXT NOT NULL,
    "postulacion_id" TEXT,
    "analisis_directo_id" TEXT,
    "estado" TEXT NOT NULL,
    "detalles" TEXT,
    "webhook_payload" JSONB,
    "ip_origen" TEXT,
    "duracion_ms" INTEGER,
    "creado_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_analisis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" TEXT NOT NULL,
    "item_key" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "hash_path" TEXT NOT NULL,
    "active_keyword" TEXT NOT NULL,
    "es_item_config" BOOLEAN NOT NULL DEFAULT false,
    "es_fallback" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_config_rol" (
    "rol" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "config_hash" TEXT NOT NULL,

    CONSTRAINT "menu_config_rol_pkey" PRIMARY KEY ("rol")
);

-- CreateTable
CREATE TABLE "roles_menu" (
    "rol" TEXT NOT NULL,
    "menu_item_id" TEXT NOT NULL,
    "orden_render" INTEGER NOT NULL,
    "active_priority" INTEGER NOT NULL DEFAULT 99,

    CONSTRAINT "roles_menu_pkey" PRIMARY KEY ("rol","menu_item_id")
);

-- CreateTable
CREATE TABLE "catalogos" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "catalogos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opciones_catalogo" (
    "id" TEXT NOT NULL,
    "catalogo_id" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "opciones_catalogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles_catalogo" (
    "rol" TEXT NOT NULL,
    "catalogo_id" TEXT NOT NULL,

    CONSTRAINT "roles_catalogo_pkey" PRIMARY KEY ("rol","catalogo_id")
);

-- CreateTable
CREATE TABLE "educacion" (
    "id" TEXT NOT NULL,
    "candidato_id" TEXT NOT NULL,
    "institucion" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "campo" TEXT,
    "fecha_inicio" TEXT NOT NULL,
    "fecha_fin" TEXT,
    "cursando" BOOLEAN NOT NULL DEFAULT false,
    "descripcion" TEXT,
    "creada_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "educacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiencia_laboral" (
    "id" TEXT NOT NULL,
    "candidato_id" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "fecha_inicio" TEXT NOT NULL,
    "fecha_fin" TEXT,
    "actual" BOOLEAN NOT NULL DEFAULT false,
    "descripcion" TEXT,
    "modalidad" TEXT,
    "creada_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "experiencia_laboral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idiomas" (
    "id" TEXT NOT NULL,
    "candidato_id" TEXT NOT NULL,
    "idioma" TEXT NOT NULL,
    "nivel" TEXT NOT NULL,
    "certificacion" TEXT,
    "creada_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idiomas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "analisis_cv_postulacion_postulacion_id_key" ON "analisis_cv_postulacion"("postulacion_id");

-- CreateIndex
CREATE UNIQUE INDEX "postulaciones_oferta_id_candidato_id_key" ON "postulaciones"("oferta_id", "candidato_id");

-- CreateIndex
CREATE UNIQUE INDEX "habilidades_nombre_key" ON "habilidades"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "menu_items_item_key_key" ON "menu_items"("item_key");

-- CreateIndex
CREATE UNIQUE INDEX "catalogos_clave_key" ON "catalogos"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "opciones_catalogo_catalogo_id_valor_key" ON "opciones_catalogo"("catalogo_id", "valor");

-- AddForeignKey
ALTER TABLE "empresas" ADD CONSTRAINT "empresas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidatos" ADD CONSTRAINT "candidatos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrativos" ADD CONSTRAINT "administrativos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analisis_cv_directo" ADD CONSTRAINT "analisis_cv_directo_candidato_id_fkey" FOREIGN KEY ("candidato_id") REFERENCES "candidatos"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analisis_cv_postulacion" ADD CONSTRAINT "analisis_cv_postulacion_postulacion_id_fkey" FOREIGN KEY ("postulacion_id") REFERENCES "postulaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ofertas_laborales" ADD CONSTRAINT "ofertas_laborales_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postulaciones" ADD CONSTRAINT "postulaciones_oferta_id_fkey" FOREIGN KEY ("oferta_id") REFERENCES "ofertas_laborales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postulaciones" ADD CONSTRAINT "postulaciones_candidato_id_fkey" FOREIGN KEY ("candidato_id") REFERENCES "candidatos"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habilidades_detectadas" ADD CONSTRAINT "habilidades_detectadas_analisis_id_fkey" FOREIGN KEY ("analisis_id") REFERENCES "analisis_cv_postulacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habilidades_detectadas" ADD CONSTRAINT "habilidades_detectadas_habilidad_id_fkey" FOREIGN KEY ("habilidad_id") REFERENCES "habilidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidato_habilidades" ADD CONSTRAINT "candidato_habilidades_candidato_id_fkey" FOREIGN KEY ("candidato_id") REFERENCES "candidatos"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidato_habilidades" ADD CONSTRAINT "candidato_habilidades_habilidad_id_fkey" FOREIGN KEY ("habilidad_id") REFERENCES "habilidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_analisis" ADD CONSTRAINT "historial_analisis_postulacion_id_fkey" FOREIGN KEY ("postulacion_id") REFERENCES "postulaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_analisis" ADD CONSTRAINT "historial_analisis_analisis_directo_id_fkey" FOREIGN KEY ("analisis_directo_id") REFERENCES "analisis_cv_directo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_menu" ADD CONSTRAINT "roles_menu_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opciones_catalogo" ADD CONSTRAINT "opciones_catalogo_catalogo_id_fkey" FOREIGN KEY ("catalogo_id") REFERENCES "catalogos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_catalogo" ADD CONSTRAINT "roles_catalogo_catalogo_id_fkey" FOREIGN KEY ("catalogo_id") REFERENCES "catalogos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educacion" ADD CONSTRAINT "educacion_candidato_id_fkey" FOREIGN KEY ("candidato_id") REFERENCES "candidatos"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiencia_laboral" ADD CONSTRAINT "experiencia_laboral_candidato_id_fkey" FOREIGN KEY ("candidato_id") REFERENCES "candidatos"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idiomas" ADD CONSTRAINT "idiomas_candidato_id_fkey" FOREIGN KEY ("candidato_id") REFERENCES "candidatos"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;
