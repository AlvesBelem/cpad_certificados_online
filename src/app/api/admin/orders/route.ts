import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeRole, UserRole } from "@/lib/roles";
import { requireSessionForAction } from "@/lib/session";

const createOrderSchema = z.object({
  paymentMethod: z.string().min(2, "Informe a forma de pagamento."),
  status: z.string().default("PAID"),
  quantity: z.number().int().positive().default(1),
  totalAmountInCents: z.number().int().nonnegative().default(0),
  notes: z.string().optional(),
  customerId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await requireSessionForAction();
  if (normalizeRole(session.user.role) !== UserRole.ADMIN) {
    return NextResponse.json({ message: "Acesso negado." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createOrderSchema.parse(body);

    const order = await prisma.certificateOrder.create({
      data: {
        paymentMethod: parsed.paymentMethod,
        status: parsed.status,
        quantity: parsed.quantity,
        totalAmountInCents: parsed.totalAmountInCents,
        notes: parsed.notes,
        customerId: parsed.customerId ?? null,
      },
      include: {
        customer: { select: { email: true } },
      },
    });

    return NextResponse.json({
      order: {
        id: order.id,
        paymentMethod: order.paymentMethod,
        status: order.status,
        quantity: order.quantity,
        totalAmount: order.totalAmountInCents / 100,
        createdAt: order.createdAt.toISOString(),
        customerEmail: order.customer?.email ?? null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro ao criar pedido manual:", message, error);
    return NextResponse.json({ message: `Nao foi possivel registrar o pedido: ${message}` }, { status: 400 });
  }
}
