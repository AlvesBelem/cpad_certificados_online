import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { TipoIgreja } from "@prisma/client";
import { auth } from "@/lib/auth";
import type { AuthSession } from "@/lib/auth";
import { buildIgrejaScope } from "@/lib/igreja-scope";

export type SessionWithScope = AuthSession & {
  user: AuthSession["user"] & {
    igrejasPermitidas: string[];
    igrejaTipo?: TipoIgreja;
    igrejaMatrizId?: string | null;
    assinaturaPausada?: boolean;
    assinaturaPausadaPorMatriz?: boolean;
    assinaturaRestrita?: boolean;
  };
};

export async function getSession() {
  try {
    const headerList = await headers();
    const headerObject = new Headers();
    for (const [key, value] of headerList.entries()) {
      headerObject.append(key, value);
    }
    return await auth.api.getSession({
      headers: headerObject,
    });
  } catch (error) {
    console.error("Falha ao carregar sessao:", error);
    return null;
  }
}

async function enrichSession(session: AuthSession): Promise<SessionWithScope> {
  if (!session.user.igrejaId) {
    return {
      ...session,
      user: {
        ...session.user,
        igrejasPermitidas: [],
      },
    };
  }

  const scope = await buildIgrejaScope(session.user.igrejaId);
  const assinaturaRestrita = scope.assinaturaPausada || scope.assinaturaPausadaPorMatriz;

  return {
    ...session,
    user: {
      ...session.user,
      igrejasPermitidas: scope.igrejasPermitidas,
      igrejaTipo: scope.tipo,
      igrejaMatrizId: scope.matrizId,
      assinaturaPausada: scope.assinaturaPausada,
      assinaturaPausadaPorMatriz: scope.assinaturaPausadaPorMatriz,
      assinaturaRestrita,
      igrejaStatus: scope.status ?? session.user.igrejaStatus ?? null,
    },
  };
}

export async function requireSession(): Promise<SessionWithScope> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (!session.user.igrejaId) {
    throw new Error("Usuario sem igreja vinculada.");
  }
  return enrichSession(session);
}

export async function requireSessionForAction(): Promise<SessionWithScope> {
  const session = await getSession();
  if (!session) {
    throw new Error("Sessao expirada. Faca login novamente.");
  }
  if (!session.user.igrejaId) {
    throw new Error("Usuario sem igreja vinculada.");
  }
  return enrichSession(session);
}
