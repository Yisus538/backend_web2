-- CreateTable
CREATE TABLE "conversaciones" (
    "id" TEXT NOT NULL,
    "postulacion_id" TEXT NOT NULL,
    "creada_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensajes" (
    "id" TEXT NOT NULL,
    "conversacion_id" TEXT NOT NULL,
    "autor_id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensajes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conversaciones_postulacion_id_key" ON "conversaciones"("postulacion_id");

-- CreateIndex
CREATE INDEX "mensajes_conversacion_id_creado_en_idx" ON "mensajes"("conversacion_id", "creado_en");

-- AddForeignKey
ALTER TABLE "conversaciones" ADD CONSTRAINT "conversaciones_postulacion_id_fkey" FOREIGN KEY ("postulacion_id") REFERENCES "postulaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_conversacion_id_fkey" FOREIGN KEY ("conversacion_id") REFERENCES "conversaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
