import { NextResponse } from "next/server";
import { requireSessionForAction } from "@/lib/session";
import { assertStripe } from "@/lib/stripe";
import { getCartForUser } from "@/lib/cart-store";
import { prisma } from "@/lib/prisma";

const DEFAULT_APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function POST() {
  try {
    const session = await requireSessionForAction();
    const stripe = assertStripe();

    const cart = getCartForUser(session.user.id);
    if (!cart.items.length) {
      return NextResponse.json({ message: "Carrinho vazio." }, { status: 400 });
    }

    const order = await prisma.certificateOrder.create({
      data: {
        customerId: session.user.id,
        paymentMethod: "STRIPE",
        status: "PENDING",
        quantity: cart.pricing.totalQuantity,
        totalAmountInCents: cart.pricing.totalCents,
      },
    });

    const lineItems = cart.items.map((item) => ({
      price_data: {
        currency: "brl",
        unit_amount: item.unitPriceCents,
        product_data: {
          name: item.title,
          description: item.summary ?? undefined,
        },
      },
      quantity: item.quantity,
    }));

    const metadata: Record<string, string> = {
      orderId: order.id,
      userId: session.user.id,
      totalQuantity: String(cart.pricing.totalQuantity),
      unitPriceCents: String(cart.pricing.unitPriceCents),
    };

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata,
      client_reference_id: order.id,
      customer_email: session.user.email ?? undefined,
      success_url: `${DEFAULT_APP_URL}/obrigado?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${DEFAULT_APP_URL}/certificados?checkout=cancelado`,
    });

    if (!checkoutSession.url) {
      return NextResponse.json({ message: "Nao conseguimos iniciar o checkout. Tente novamente." }, { status: 400 });
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Erro ao iniciar checkout:", error);
    const message = error instanceof Error ? error.message : "Nao foi possivel iniciar o checkout.";
    const status = message.toLowerCase().includes("sessao") ? 401 : 400;
    return NextResponse.json({ message }, { status });
  }
}
