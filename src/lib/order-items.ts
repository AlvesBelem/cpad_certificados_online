import { prisma } from "@/lib/prisma";

type OrderItemInput = {
  certificateSlug: string;
  title: string;
  quantity: number;
  unitPriceCents: number;
  summary?: string | null;
};

export async function persistOrderItems(orderId: string, items: OrderItemInput[]) {
  if (!items.length) return;

  await prisma.certificateOrderItem.deleteMany({
    where: { orderId },
  });

  await prisma.certificateOrderItem.createMany({
    data: items.map((item) => ({
      orderId,
      certificateSlug: item.certificateSlug,
      title: item.title,
      summary: item.summary ?? null,
      quantity: Math.max(1, item.quantity),
      unitPriceInCents: Math.max(0, item.unitPriceCents),
    })),
  });
}
