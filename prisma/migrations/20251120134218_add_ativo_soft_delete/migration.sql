-- AlterTable
ALTER TABLE "Aluno" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ResponsavelEscola" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Turma" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true;
