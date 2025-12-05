import { PrismaClient, Plano, StatusIgreja } from "@prisma/client";
import { cookies } from "next/headers";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

const userIgrejaMiddlewareFlag = Symbol("userIgrejaMiddlewareFlag");

type PrismaWithMiddlewareFlag = PrismaClient & {
  [userIgrejaMiddlewareFlag]?: boolean;
};

function ensureUserHasIgreja(client: PrismaClient) {
  const typedClient = client as PrismaWithMiddlewareFlag;
  if (typedClient[userIgrejaMiddlewareFlag]) {
    return;
  }

  typedClient.$use(async (params, next) => {
    if (
      params.model === "User" &&
      params.action === "create" &&
      params.args?.data
    ) {
      type UserCreateData = {
        igrejaId?: string | null;
        igreja?: unknown;
        name?: string | null;
        email?: string | null;
        igrejaStatus?: StatusIgreja;
        [key: string]: unknown;
      };
      const data = params.args.data as UserCreateData;
      const hasIgrejaRelation = data.igrejaId ?? data.igreja;

      if (!hasIgrejaRelation) {
        const trialEndsAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
        const nameCandidate =
          typeof data.name === "string" && data.name.trim().length
            ? data.name.trim()
            : typeof data.email === "string" && data.email.trim().length
              ? data.email.split("@")[0] ?? "Nova Igreja"
              : "Nova Igreja";

        let churchName = `Igreja de ${nameCandidate}`;

        try {
          // Tenta recuperar o nome da igreja do cookie (definido no front antes do OAuth)
          const cookieStore = await cookies();
          const storedName = cookieStore.get("registration-church-name")?.value;
          if (storedName) {
            churchName = decodeURIComponent(storedName);
          }
        } catch {
          // Ignora erros ao tentar ler cookies (ex: fora de contexto de request)
        }

        const igreja = await typedClient.igreja.create({
          data: {
            nome: churchName,
            plano: Plano.BASIC,
            status: StatusIgreja.ATIVA,
            trial: true,
            dataExpira: trialEndsAt,
          },
        });

        data.igrejaId = igreja.id;
        if (!data.igrejaStatus) {
          data.igrejaStatus = igreja.status;
        }
      }
    }

    return next(params);
  });

  typedClient[userIgrejaMiddlewareFlag] = true;
}

ensureUserHasIgreja(prisma);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
