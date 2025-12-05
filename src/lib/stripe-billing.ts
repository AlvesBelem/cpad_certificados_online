import { prisma } from "@/lib/prisma";
import { assertStripe } from "@/lib/stripe";

const defaultBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const configuredPriceId = process.env.STRIPE_PRICE_ID;

type CheckoutParams = {
  igrejaId: string;
  email?: string | null;
  baseUrl?: string | null;
  priceId?: string | null;
};

export async function createCheckoutSessionForIgreja({
  igrejaId,
  email,
  baseUrl,
  priceId,
}: CheckoutParams) {
  const resolvedPriceId = priceId ?? configuredPriceId;

  if (!resolvedPriceId) {
    throw new Error("STRIPE_PRICE_ID nao configurada.");
  }

  const stripe = assertStripe();

  const igreja = await prisma.igreja.findUnique({
    where: { id: igrejaId },
    select: { id: true, nome: true, stripeCustomerId: true },
  });

  if (!igreja) {
    throw new Error("Igreja nao encontrada.");
  }

  let customerId = igreja.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: email ?? undefined,
      metadata: {
        igrejaId,
      },
      name: igreja.nome,
    });

    customerId = customer.id;

    await prisma.igreja.update({
      where: { id: igrejaId },
      data: { stripeCustomerId: customerId },
    });
  }

  const successUrl = `${baseUrl ?? defaultBaseUrl}/billing/obrigado`;
  const cancelUrl = `${baseUrl ?? defaultBaseUrl}/billing?status=cancel`;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    locale: "pt-BR",
    billing_address_collection: "required",
    payment_method_types: ["card"],
    line_items: [
      {
        price: resolvedPriceId,
        quantity: 1,
      },
    ],
    metadata: {
      igrejaId,
    },
    subscription_data: {
      metadata: {
        igrejaId,
      },
    },
    allow_promotion_codes: true,
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  if (!session.url) {
    throw new Error("Sessao de checkout sem URL.");
  }

  return session.url;
}
