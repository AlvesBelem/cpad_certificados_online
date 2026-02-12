import { randomUUID } from "crypto";
import { computeCart, type RawCartItem } from "./cart-pricing";

type AddItemInput = {
  certificateSlug: string;
  title: string;
  quantity?: number;
  summary?: string | null;
  previewImage?: string | null;
  entries?: Array<{
    quantity?: number;
    summary?: string | null;
    previewImage?: string | null;
  }>;
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
  const state = carts.get(userId)!;
  state.items = state.items.map((item) => (item.entries ? item : { ...item, entries: [] }));
  return state;
}

export function getCartForUser(userId: string) {
  const state = getState(userId);
  return computeCart(state.items);
}

export function addItemToCart(userId: string, input: AddItemInput) {
  const state = getState(userId);
  const existing = state.items.find((item) => item.certificateSlug === input.certificateSlug);

  const entriesToAdd =
    input.entries && input.entries.length
      ? input.entries.map((entry) => ({
          id: randomUUID(),
          quantity: Math.max(1, entry.quantity ?? 1),
          summary: entry.summary?.trim() || undefined,
          previewImage: entry.previewImage ?? undefined,
        }))
      : [
          {
            id: randomUUID(),
            quantity: Math.max(1, input.quantity ?? 1),
            summary: input.summary?.trim() || undefined,
            previewImage: input.previewImage ?? undefined,
          },
        ];

  const quantity = entriesToAdd.reduce((sum, entry) => sum + entry.quantity, 0);

  if (existing) {
    existing.quantity += quantity;
    existing.entries.push(...entriesToAdd);
    const latestSummary = [...entriesToAdd].reverse().find((entry) => entry.summary)?.summary;
    const latestPreview = [...entriesToAdd].reverse().find((entry) => entry.previewImage)?.previewImage;
    if (latestSummary) {
      existing.summary = latestSummary;
    }
    if (latestPreview) {
      existing.previewImage = latestPreview;
    }
  } else {
    state.items.push({
      id: randomUUID(),
      certificateSlug: input.certificateSlug,
      title: input.title,
      quantity,
      summary: [...entriesToAdd].find((entry) => entry.summary)?.summary,
      previewImage: [...entriesToAdd].find((entry) => entry.previewImage)?.previewImage,
      entries: entriesToAdd,
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
