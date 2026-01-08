import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSessionForAction } from "@/lib/session";
import { persistOrderItems } from "@/lib/order-items";

const orderItemSchema = z.object({
  certificateSlug: z.string().min(1, "Informe o certificado."),
  title: z.string().min(1, "Informe o titulo do certificado."),
  quantity: z.number().int().positive(),
  unitPriceCents: z.number().int().nonnegative(),
  summary: z.string().optional().nullable(),
});

const createOrderSchema = z.object({
  paymentMethod: z.string().min(2, "Informe a forma de pagamento."),
  status: z.string().default("PAID"),
  quantity: z.number().int().positive().default(1),
  totalAmountInCents: z.number().int().nonnegative().default(0),
  notes: z.string().optional(),
  customerId: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Informe os itens do pedido."),
});

export async function POST(request: NextRequest) {
  const session = await requireSessionForAction();

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
        customerId: parsed.customerId ?? session.user.id ?? null,
      },
      include: {
        customer: { select: { email: true } },
      },
    });

    await persistOrderItems(order.id, parsed.items);

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
