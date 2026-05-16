-- CreateTable
CREATE TABLE "entrevistas" (
    "id" TEXT NOT NULL,
    "postulacion_id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3),
    "duracion_min" INTEGER DEFAULT 60,
    "tipo" TEXT NOT NULL DEFAULT 'pendiente',
    "link_meet" TEXT,
    "ubicacion" TEXT,
    "notas" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "creada_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entrevistas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "entrevistas_postulacion_id_key" ON "entrevistas"("postulacion_id");

-- AddForeignKey
ALTER TABLE "entrevistas" ADD CONSTRAINT "entrevistas_postulacion_id_fkey" FOREIGN KEY ("postulacion_id") REFERENCES "postulaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
