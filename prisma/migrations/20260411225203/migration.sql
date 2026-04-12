-- DropIndex
DROP INDEX "ofertas_laborales_empresa_creada_idx";

-- DropIndex
DROP INDEX "ofertas_laborales_estado_idx";

-- AlterTable
ALTER TABLE "ofertas_laborales" ADD COLUMN     "salario_max" INTEGER,
ADD COLUMN     "salario_min" INTEGER,
ADD COLUMN     "ubicacion" TEXT;
