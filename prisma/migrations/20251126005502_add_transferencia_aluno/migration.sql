-- DropIndex
DROP INDEX "Igreja_matrizId_idx";

-- CreateTable
CREATE TABLE "TransferenciaAluno" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "turmaAnteriorId" TEXT,
    "turmaNovaId" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "dataTransferencia" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registradoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransferenciaAluno_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TransferenciaAluno_alunoId_idx" ON "TransferenciaAluno"("alunoId");

-- CreateIndex
CREATE INDEX "TransferenciaAluno_turmaNovaId_idx" ON "TransferenciaAluno"("turmaNovaId");

-- AddForeignKey
ALTER TABLE "TransferenciaAluno" ADD CONSTRAINT "TransferenciaAluno_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferenciaAluno" ADD CONSTRAINT "TransferenciaAluno_turmaAnteriorId_fkey" FOREIGN KEY ("turmaAnteriorId") REFERENCES "Turma"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferenciaAluno" ADD CONSTRAINT "TransferenciaAluno_turmaNovaId_fkey" FOREIGN KEY ("turmaNovaId") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferenciaAluno" ADD CONSTRAINT "TransferenciaAluno_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
