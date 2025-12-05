import { StatusIgreja, TipoIgreja } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type IgrejaScope = {
  igrejaId: string;
  tipo: TipoIgreja;
  matrizId: string | null;
  congregacoesIds: string[];
  igrejasPermitidas: string[];
  assinaturaPausada: boolean;
  assinaturaPausadaPorMatriz: boolean;
  status: StatusIgreja;
};

export async function buildIgrejaScope(igrejaId: string): Promise<IgrejaScope> {
  const igreja = await prisma.igreja.findUnique({
    where: { id: igrejaId },
    select: {
      id: true,
      tipoEstrutura: true,
      matrizId: true,
      assinaturaPausada: true,
      status: true,
      matriz: {
        select: {
          assinaturaPausada: true,
        },
      },
      congregacoes: {
        select: { id: true },
      },
    },
  });

  if (!igreja) {
    return {
      igrejaId,
      tipo: TipoIgreja.INDEPENDENTE,
      matrizId: null,
      congregacoesIds: [],
      igrejasPermitidas: [igrejaId],
      assinaturaPausada: false,
      assinaturaPausadaPorMatriz: false,
      status: StatusIgreja.ATIVA,
    };
  }

  const congregacoesIds =
    igreja.tipoEstrutura === TipoIgreja.MATRIZ
      ? igreja.congregacoes.map((item) => item.id)
      : [];

  const igrejasPermitidas =
    igreja.tipoEstrutura === TipoIgreja.MATRIZ
      ? [igreja.id, ...congregacoesIds]
      : [igreja.id];

  return {
    igrejaId: igreja.id,
    tipo: igreja.tipoEstrutura,
    matrizId: igreja.matrizId,
    congregacoesIds,
    igrejasPermitidas,
    assinaturaPausada: igreja.assinaturaPausada,
    assinaturaPausadaPorMatriz: igreja.matriz?.assinaturaPausada ?? false,
    status: igreja.status,
  };
}
