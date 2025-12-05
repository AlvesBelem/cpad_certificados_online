import { randomUUID } from "crypto";
import { computeCart, type RawCartItem } from "./cart-pricing";

type AddItemInput = {
  certificateSlug: string;
  title: string;
  quantity?: number;
};

type UpdateQuantityInput = {
  itemId: string;
  quantity: number;
};

type CartState = {
  items: RawCartItem[];
};

const carts = new Map<string, CartState>();

function getState(userId: string): CartState {
  if (!carts.has(userId)) {
    carts.set(userId, { items: [] });
  }
  return carts.get(userId)!;
}

export function getCartForUser(userId: string) {
  const state = getState(userId);
  return computeCart(state.items);
}

export function addItemToCart(userId: string, input: AddItemInput) {
  const state = getState(userId);
  const quantity = Math.max(1, input.quantity ?? 1);
  const existing = state.items.find((item) => item.certificateSlug === input.certificateSlug);

  if (existing) {
    existing.quantity += quantity;
  } else {
    state.items.push({
      id: randomUUID(),
      certificateSlug: input.certificateSlug,
      title: input.title,
      quantity,
    });
  }

  return computeCart(state.items);
}

export function updateCartItemQuantity(userId: string, input: UpdateQuantityInput) {
  const state = getState(userId);
  state.items = state.items
    .map((item) => (item.id === input.itemId ? { ...item, quantity: Math.max(0, input.quantity) } : item))
    .filter((item) => item.quantity > 0);

  carts.set(userId, state);
  return computeCart(state.items);
}

export function clearCart(userId: string) {
  carts.set(userId, { items: [] });
  return computeCart([]);
}
