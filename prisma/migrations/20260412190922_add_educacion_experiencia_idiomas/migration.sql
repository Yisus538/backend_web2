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

-- AddForeignKey
ALTER TABLE "educacion" ADD CONSTRAINT "educacion_candidato_id_fkey" FOREIGN KEY ("candidato_id") REFERENCES "candidatos"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiencia_laboral" ADD CONSTRAINT "experiencia_laboral_candidato_id_fkey" FOREIGN KEY ("candidato_id") REFERENCES "candidatos"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idiomas" ADD CONSTRAINT "idiomas_candidato_id_fkey" FOREIGN KEY ("candidato_id") REFERENCES "candidatos"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;
