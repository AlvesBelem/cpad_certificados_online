import { NextResponse, type NextRequest } from "next/server";
import { addItemToCart, clearCart, getCartForUser, updateCartItemQuantity } from "@/lib/cart-store";
import { computeCart } from "@/lib/cart-pricing";
import { getSession, requireSessionForAction } from "@/lib/session";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

function handleError(error: unknown) {
  const message = error instanceof Error ? error.message : "Nao foi possivel acessar o carrinho.";
  const status = message.toLowerCase().includes("sessao") ? 401 : 500;
  return NextResponse.json({ message }, { status });
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user?.id) {
      // visitante sem sessão: devolve carrinho vazio calculado para manter o formato esperado
      return NextResponse.json(computeCart([]));
    }
    const cart = getCartForUser(session.user.id);
    return NextResponse.json(cart);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSessionForAction();
    const body = await request.json().catch(() => ({}));
    const { certificateSlug, title, quantity, summary, previewImage } = body as {
      certificateSlug?: string;
      title?: string;
      quantity?: number;
      summary?: string;
      previewImage?: string;
    };

    if (!certificateSlug || !title) {
      return badRequest("Informe o certificado (slug e titulo) para adicionar ao carrinho.");
    }

    const cart = addItemToCart(session.user.id, { certificateSlug, title, quantity, summary, previewImage });

    return NextResponse.json(cart, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSessionForAction();
    const body = await request.json().catch(() => ({}));
    const { itemId, quantity } = body as { itemId?: string; quantity?: number };

    if (!itemId || typeof quantity !== "number") {
      return badRequest("Informe o item e a quantidade.");
    }

    const cart = updateCartItemQuantity(session.user.id, { itemId, quantity });
    return NextResponse.json(cart);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE() {
  try {
    const session = await requireSessionForAction();
    const cart = clearCart(session.user.id);
    return NextResponse.json(cart);
  } catch (error) {
    return handleError(error);
  }
}
