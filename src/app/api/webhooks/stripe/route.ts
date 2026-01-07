import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { assertStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function markOrderAs(
  orderId: string,
  status: string,
  data: Partial<{ paymentMethod: string; totalAmountInCents: number; paymentIntentId: string }>,
) {
  await prisma.certificateOrder.update({
    where: { id: orderId },
    data: {
      status,
      paymentMethod: data.paymentMethod ?? "STRIPE",
      totalAmountInCents: data.totalAmountInCents ?? undefined,
      notes: data.paymentIntentId ?? undefined,
    },
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId || session.client_reference_id;
  if (!orderId) return;

  await markOrderAs(orderId, "PAID", {
    paymentMethod: session.payment_method_types?.[0]?.toUpperCase(),
    totalAmountInCents: session.amount_total ?? undefined,
    paymentIntentId:
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
  });
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId || session.client_reference_id;
  if (!orderId) return;
  await markOrderAs(orderId, "CANCELED", {});
}

export async function POST(request: NextRequest) {
  const stripe = assertStripe();
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !signature) {
    return NextResponse.json({ message: "Webhook nao configurado." }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error("Falha ao validar webhook do Stripe:", error);
    return NextResponse.json({ message: "Assinatura invalida." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "checkout.session.expired":
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
        break;
      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const orderId = intent.metadata?.orderId;
        if (orderId) {
          await markOrderAs(orderId, "FAILED", {
            paymentMethod: intent.payment_method_types?.[0]?.toUpperCase(),
            paymentIntentId: intent.id,
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("Erro ao processar webhook do Stripe:", error);
    return NextResponse.json({ message: "Erro ao processar webhook." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
