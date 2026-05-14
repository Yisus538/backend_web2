-- AlterTable
ALTER TABLE "educacion" ADD COLUMN     "analisis_origen_id" TEXT;

-- AlterTable
ALTER TABLE "experiencia_laboral" ADD COLUMN     "analisis_origen_id" TEXT;

-- AlterTable
ALTER TABLE "idiomas" ADD COLUMN     "analisis_origen_id" TEXT;

-- AddForeignKey
ALTER TABLE "educacion" ADD CONSTRAINT "educacion_analisis_origen_id_fkey" FOREIGN KEY ("analisis_origen_id") REFERENCES "analisis_cv_directo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiencia_laboral" ADD CONSTRAINT "experiencia_laboral_analisis_origen_id_fkey" FOREIGN KEY ("analisis_origen_id") REFERENCES "analisis_cv_directo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idiomas" ADD CONSTRAINT "idiomas_analisis_origen_id_fkey" FOREIGN KEY ("analisis_origen_id") REFERENCES "analisis_cv_directo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
