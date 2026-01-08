import { NextResponse } from "next/server";
import { requireSessionForAction } from "@/lib/session";
import Stripe from "stripe";
import { assertStripe } from "@/lib/stripe";
import { getCartForUser } from "@/lib/cart-store";
import { prisma } from "@/lib/prisma";
import { persistOrderItems } from "@/lib/order-items";

const DEFAULT_APP_URL = process.env.APP_URL || "http://localhost:3000";

const DEFAULT_PAYMENT_METHODS = ["card", "pix", "link"];
const allowPixCheckout = process.env.STRIPE_ENABLE_PIX === "true";
const checkoutSubmitMessage = process.env.STRIPE_CHECKOUT_SUBMIT_MESSAGE?.trim();
const checkoutAfterMessage = process.env.STRIPE_CHECKOUT_AFTER_MESSAGE?.trim();
const checkoutNoteLabel = process.env.STRIPE_CHECKOUT_NOTE_LABEL?.trim();
const checkoutNoteOptional = process.env.STRIPE_CHECKOUT_NOTE_OPTIONAL !== "false";
const checkoutNoteMaxLength = Number.parseInt(process.env.STRIPE_CHECKOUT_NOTE_MAX_LENGTH ?? "120", 10);
const checkoutNoteDefaultValue = process.env.STRIPE_CHECKOUT_NOTE_DEFAULT?.trim() ?? "";

function resolvePaymentMethodTypes(): Stripe.Checkout.SessionCreateParams.PaymentMethodType[] {
  const raw = process.env.STRIPE_PAYMENT_METHODS;
  const parsed = raw
    ? raw
        .split(",")
        .map((method) => method.trim())
        .filter(Boolean)
    : DEFAULT_PAYMENT_METHODS;

  const filtered = parsed.filter((method) => {
    const normalized = method.toLowerCase();
    if (normalized === "boleto") return false;
    if (!allowPixCheckout && normalized === "pix") return false;
    return true;
  });
  const unique = Array.from(new Set(filtered));

  return unique.length > 0 ? (unique as Stripe.Checkout.SessionCreateParams.PaymentMethodType[]) : ["card"];
}

function buildCustomText(): Stripe.Checkout.SessionCreateParams.CustomText | undefined {
  const customText: Stripe.Checkout.SessionCreateParams.CustomText = {};
  if (checkoutSubmitMessage) {
    customText.submit = { message: checkoutSubmitMessage };
  }
  if (checkoutAfterMessage) {
    customText.after_submit = { message: checkoutAfterMessage };
  }
  return Object.keys(customText).length ? customText : undefined;
}

function buildCustomFields(): Stripe.Checkout.SessionCreateParams.CustomField[] {
  if (!checkoutNoteLabel) return [];
  const maximumLength = Number.isFinite(checkoutNoteMaxLength) && checkoutNoteMaxLength > 0 ? checkoutNoteMaxLength : 120;
  return [
    {
      key: "igreja_observacoes",
      label: {
        type: "custom",
        custom: checkoutNoteLabel,
      },
      type: "text",
      optional: checkoutNoteOptional,
      text: {
        default_value: checkoutNoteDefaultValue,
        maximum_length: maximumLength,
      },
    },
  ];
}

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

    await persistOrderItems(
      order.id,
      cart.items.map((item) => ({
        certificateSlug: item.certificateSlug,
        title: item.title,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        summary: item.summary,
      })),
    );

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

    const customFields = buildCustomFields();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: resolvePaymentMethodTypes(),
      line_items: lineItems,
      metadata,
      client_reference_id: order.id,
      customer_email: session.user.email ?? undefined,
      custom_text: buildCustomText(),
      custom_fields: customFields.length ? customFields : undefined,
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
