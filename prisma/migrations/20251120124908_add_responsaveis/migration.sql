/*
  Warnings:

  - You are about to drop the column `coordenadorId` on the `Turma` table. All the data in the column will be lost.
  - You are about to drop the column `professorId` on the `Turma` table. All the data in the column will be lost.
  - You are about to drop the column `secretarioId` on the `Turma` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Turma" DROP CONSTRAINT "Turma_coordenadorId_fkey";

-- DropForeignKey
ALTER TABLE "Turma" DROP CONSTRAINT "Turma_professorId_fkey";

-- DropForeignKey
ALTER TABLE "Turma" DROP CONSTRAINT "Turma_secretarioId_fkey";

-- AlterTable
ALTER TABLE "Turma" DROP COLUMN "coordenadorId",
DROP COLUMN "professorId",
DROP COLUMN "secretarioId",
ADD COLUMN     "coordenadorResponsavelId" TEXT,
ADD COLUMN     "professorResponsavelId" TEXT,
ADD COLUMN     "secretarioResponsavelId" TEXT;

-- CreateTable
CREATE TABLE "ResponsavelEscola" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "tipo" "TipoUsuario" NOT NULL,
    "igrejaId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResponsavelEscola_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResponsavelEscola_userId_key" ON "ResponsavelEscola"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ResponsavelEscola_igrejaId_email_key" ON "ResponsavelEscola"("igrejaId", "email");

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_professorResponsavelId_fkey" FOREIGN KEY ("professorResponsavelId") REFERENCES "ResponsavelEscola"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_coordenadorResponsavelId_fkey" FOREIGN KEY ("coordenadorResponsavelId") REFERENCES "ResponsavelEscola"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_secretarioResponsavelId_fkey" FOREIGN KEY ("secretarioResponsavelId") REFERENCES "ResponsavelEscola"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResponsavelEscola" ADD CONSTRAINT "ResponsavelEscola_igrejaId_fkey" FOREIGN KEY ("igrejaId") REFERENCES "Igreja"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResponsavelEscola" ADD CONSTRAINT "ResponsavelEscola_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
