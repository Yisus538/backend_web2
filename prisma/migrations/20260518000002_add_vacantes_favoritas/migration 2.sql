-- CreateTable
CREATE TABLE "vacantes_favoritas" (
    "candidato_id" TEXT NOT NULL,
    "oferta_id"    TEXT NOT NULL,
    "guardado_el"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vacantes_favoritas_pkey" PRIMARY KEY ("candidato_id","oferta_id")
);

-- AddForeignKey
ALTER TABLE "vacantes_favoritas" ADD CONSTRAINT "vacantes_favoritas_candidato_id_fkey"
    FOREIGN KEY ("candidato_id") REFERENCES "candidatos"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacantes_favoritas" ADD CONSTRAINT "vacantes_favoritas_oferta_id_fkey"
    FOREIGN KEY ("oferta_id") REFERENCES "ofertas_laborales"("id") ON DELETE CASCADE ON UPDATE CASCADE;
