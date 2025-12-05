-- Create enum for church types
CREATE TYPE "TipoIgreja" AS ENUM ('MATRIZ', 'CONGREGACAO', 'INDEPENDENTE');

-- Add hierarchy columns
ALTER TABLE "Igreja"
ADD COLUMN "tipoEstrutura" "TipoIgreja" NOT NULL DEFAULT 'INDEPENDENTE',
ADD COLUMN "matrizId" TEXT;

-- Self relation for matrix/congregation
ALTER TABLE "Igreja"
ADD CONSTRAINT "Igreja_matrizId_fkey"
FOREIGN KEY ("matrizId") REFERENCES "Igreja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Igreja_matrizId_idx" ON "Igreja"("matrizId");
