-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('PROFESSOR', 'COORDENADOR', 'SECRETARIO');

-- AlterTable
ALTER TABLE "Turma" ADD COLUMN     "anoLetivo" INTEGER NOT NULL DEFAULT 2024,
ADD COLUMN     "coordenadorId" TEXT,
ADD COLUMN     "professorId" TEXT,
ADD COLUMN     "secretarioId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tipoUsuario" "TipoUsuario";

-- CreateTable
CREATE TABLE "Aula" (
    "id" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "alunosMatriculados" INTEGER NOT NULL,
    "ausentes" INTEGER NOT NULL,
    "presentes" INTEGER NOT NULL,
    "visitantes" INTEGER NOT NULL,
    "totalAssistencias" INTEGER NOT NULL,
    "biblias" INTEGER NOT NULL,
    "revistas" INTEGER NOT NULL,
    "revisao" INTEGER NOT NULL,
    "ofertas" DECIMAL(10,2) NOT NULL,
    "observacao" TEXT,

    CONSTRAINT "Aula_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Aula_professorId_idx" ON "Aula"("professorId");

-- CreateIndex
CREATE UNIQUE INDEX "Aula_turmaId_data_key" ON "Aula"("turmaId", "data");

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_coordenadorId_fkey" FOREIGN KEY ("coordenadorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_secretarioId_fkey" FOREIGN KEY ("secretarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aula" ADD CONSTRAINT "Aula_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aula" ADD CONSTRAINT "Aula_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
