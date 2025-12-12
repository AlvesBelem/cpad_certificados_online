import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { jwt } from "better-auth/plugins";
import { getAppUrl } from "@/lib/app-url";
import { prisma } from "@/lib/prisma";
import { normalizeRole } from "@/lib/roles";

const appUrl = getAppUrl();

export const auth = betterAuth({
  appName: "AdiGreja",
  baseURL: appUrl,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "USER",
      },
      igrejaId: {
        type: "string",
        required: false,
      },
      igrejaStatus: {
        type: "string",
        required: true,
        defaultValue: "ATIVA",
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
    storeSessionInDatabase: false,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (user.igrejaId) return false;

          const { cookies } = await import("next/headers");
          const cookieStore = await cookies();
          const storedName = cookieStore.get("registration-church-name")?.value;
          
          let churchName = "Nova Igreja";
          if (storedName) {
            churchName = decodeURIComponent(storedName);
          } else if (user.name) {
            churchName = `Igreja de ${user.name}`;
          } else if (user.email) {
             churchName = `Igreja de ${user.email.split("@")[0]}`;
          }

          const trialEndsAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
          
          const igreja = await prisma.igreja.create({
            data: {
              nome: churchName,
              plano: "BASIC", // Usando string direta para evitar problema de import
              status: "ATIVA",
              trial: true,
              dataExpira: trialEndsAt,
            },
          });

          return {
            data: {
              ...user,
              igrejaId: igreja.id,
              igrejaStatus: igreja.status,
              role: "ADMIN", // Primeiro usuario criado vira ADMIN
            },
          };
        },
      },
    },
  },
  plugins: [
    jwt({
      jwt: {
        issuer: appUrl,
        definePayload: async ({ user }) => {
          const igreja = user.igrejaId
            ? await prisma.igreja.findUnique({
                where: { id: user.igrejaId },
                select: { id: true, status: true },
              })
            : null;

          return {
            sub: user.id,
            email: user.email,
            igrejaId: igreja?.id ?? user.igrejaId ?? null,
            role: normalizeRole(user.role),
            igrejaStatus: igreja?.status ?? user.igrejaStatus ?? null,
          };
        },
      },
    }),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
