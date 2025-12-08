import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeRole, UserRole } from "@/lib/roles";
import { requireSessionForAction } from "@/lib/session";

const ALLOWED_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.USER];

type RouteParams<T extends string> = { params: Promise<Record<T, string>> };

export async function PATCH(request: NextRequest, context: RouteParams<"userId">) {
  const session = await requireSessionForAction();
  if (normalizeRole(session.user.role) !== UserRole.ADMIN) {
    return NextResponse.json({ message: "Acesso negado." }, { status: 403 });
  }

  const { userId } = await context.params;
  if (!userId) {
    return NextResponse.json({ message: "Usuario nao encontrado." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const role = (body?.role as UserRole | undefined) ?? null;

  if (!role || !ALLOWED_ROLES.includes(role)) {
    return NextResponse.json({ message: "Role invalida." }, { status: 400 });
  }

  if (userId === session.user.id && role !== UserRole.ADMIN) {
    return NextResponse.json(
      { message: "Nao e possivel remover o proprio acesso de administrador." },
      { status: 400 },
    );
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return NextResponse.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: normalizeRole(updated.role),
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar role:", error);
    return NextResponse.json({ message: "Nao foi possivel atualizar o usuario." }, { status: 500 });
  }
}
