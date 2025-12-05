/*
  Warnings:

  - A unique constraint covering the columns `[numeroMatricula]` on the table `Aluno` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Aluno" ADD COLUMN     "numeroMatricula" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_numeroMatricula_key" ON "Aluno"("numeroMatricula");
