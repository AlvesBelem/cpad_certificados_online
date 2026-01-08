import type { Prisma } from "@prisma/client";

/**
 * Ensure Better Auth's credential account stays in sync with the user password.
 */
export async function upsertCredentialAccount(
  tx: Prisma.TransactionClient,
  userId: string,
  password: string,
) {
  await tx.account.upsert({
    where: {
      providerId_accountId: {
        providerId: "credential",
        accountId: userId,
      },
    },
    create: {
      userId,
      providerId: "credential",
      accountId: userId,
      password,
    },
    update: {
      password,
    },
  });
}
