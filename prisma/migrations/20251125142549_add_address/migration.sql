/*
  Warnings:

  - You are about to drop the column `bairro` on the `Igreja` table. All the data in the column will be lost.
  - You are about to drop the column `cep` on the `Igreja` table. All the data in the column will be lost.
  - You are about to drop the column `cidade` on the `Igreja` table. All the data in the column will be lost.
  - You are about to drop the column `complemento` on the `Igreja` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `Igreja` table. All the data in the column will be lost.
  - You are about to drop the column `logradouro` on the `Igreja` table. All the data in the column will be lost.
  - You are about to drop the column `numero` on the `Igreja` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Aluno" ADD COLUMN     "enderecoId" TEXT;

-- AlterTable
ALTER TABLE "Igreja" DROP COLUMN "bairro",
DROP COLUMN "cep",
DROP COLUMN "cidade",
DROP COLUMN "complemento",
DROP COLUMN "estado",
DROP COLUMN "logradouro",
DROP COLUMN "numero",
ADD COLUMN     "enderecoId" TEXT;

-- AlterTable
ALTER TABLE "ResponsavelEscola" ADD COLUMN     "enderecoId" TEXT;

-- CreateTable
CREATE TABLE "Endereco" (
    "id" TEXT NOT NULL,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "cep" TEXT,
    "referencia" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Endereco_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Igreja" ADD CONSTRAINT "Igreja_enderecoId_fkey" FOREIGN KEY ("enderecoId") REFERENCES "Endereco"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_enderecoId_fkey" FOREIGN KEY ("enderecoId") REFERENCES "Endereco"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResponsavelEscola" ADD CONSTRAINT "ResponsavelEscola_enderecoId_fkey" FOREIGN KEY ("enderecoId") REFERENCES "Endereco"("id") ON DELETE SET NULL ON UPDATE CASCADE;
