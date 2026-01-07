import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeRole, UserRole } from "@/lib/roles";
import { requireSessionForAction } from "@/lib/session";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  const session = await requireSessionForAction();
  if (normalizeRole(session.user.role) !== UserRole.ADMIN) {
    return NextResponse.json({ message: "Acesso negado." }, { status: 403 });
  }

  if (!session.user.igrejaId) {
    return NextResponse.json({ message: "Administrador sem igreja vinculada." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!name || !email) {
    return NextResponse.json({ message: "Informe nome e email do funcionario." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ message: "Email invalido." }, { status: 400 });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      if (existing.igrejaId !== session.user.igrejaId) {
        return NextResponse.json(
          { message: "Email ja utilizado por outro usuario de uma igreja diferente." },
          { status: 409 },
        );
      }

      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name,
          role: UserRole.FUNCIONARIO,
        },
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
    }

    const created = await prisma.user.create({
      data: {
        name,
        email,
        role: UserRole.FUNCIONARIO,
        igrejaId: session.user.igrejaId,
        igrejaStatus: session.user.igrejaStatus ?? "ATIVA",
      },
    });

    return NextResponse.json({
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        role: normalizeRole(created.role),
        createdAt: created.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Erro ao criar funcionario:", error);
    return NextResponse.json({ message: "Nao foi possivel criar o funcionario." }, { status: 500 });
  }
}
