import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { jwt } from "better-auth/plugins";
import type { SocialProviders } from "@better-auth/core/social-providers";
import { prisma } from "@/lib/prisma";
import { StatusIgreja } from "@prisma/client";

const defaultAppUrl = "http://localhost:3000";
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? defaultAppUrl;

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const socialProviders: SocialProviders | undefined =
  googleClientId && googleClientSecret
    ? {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        },
      }
    : undefined;

export const auth = betterAuth({
  appName: "AdiGreja",
  baseURL: appUrl,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders,
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
        defaultValue: StatusIgreja.ATIVA,
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
              status: StatusIgreja.ATIVA,
              trial: true,
              dataExpira: trialEndsAt,
            },
          });

          return {
            data: {
              ...user,
              igrejaId: igreja.id,
              igrejaStatus: igreja.status,
              role: "ADMIN", // Primeiro usuário via social deve ser ADMIN
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
            role: user.role ?? null,
            igrejaStatus: igreja?.status ?? user.igrejaStatus ?? null,
          };
        },
      },
    }),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
