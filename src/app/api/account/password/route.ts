import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireSessionForAction } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { upsertCredentialAccount } from "@/lib/credential-account";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Informe a senha atual."),
  newPassword: z.string().min(8, "A nova senha deve ter pelo menos 8 caracteres."),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireSessionForAction();
    const body = await request.json().catch(() => null);
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Dados invalidos.";
      return NextResponse.json({ message }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json({ message: "Nao foi possivel validar a senha atual." }, { status: 400 });
    }

    const isValid = await verifyPassword({ password: parsed.data.currentPassword, hash: user.password });
    if (!isValid) {
      return NextResponse.json({ message: "Senha atual incorreta." }, { status: 400 });
    }

    const hashed = await hashPassword(parsed.data.newPassword);
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          password: hashed,
          mustChangePassword: false,
        },
      });

      await upsertCredentialAccount(tx, session.user.id, hashed);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    return NextResponse.json({ message: "Nao foi possivel atualizar a senha." }, { status: 500 });
  }
}
