export type CartPricing = {
  unitPriceCents: number;
  totalCents: number;
  totalQuantity: number;
  nextThreshold?: number;
  nextUnitPriceCents?: number;
  missingForNext?: number;
  upsell?: {
    missing: number;
    newUnitPriceCents: number;
    newTotalCents: number;
  };
};

export type RawCartItem = {
  id: string;
  certificateSlug: string;
  title: string;
  quantity: number;
  summary?: string | null;
};

export type PricedCartItem = RawCartItem & {
  unitPriceCents: number;
  totalCents: number;
};

const TIERS = [
  { min: 51, price: 180 },
  { min: 11, price: 200 },
  { min: 1, price: 250 },
] as const;

export function getUnitPriceCents(quantity: number): number {
  if (quantity >= TIERS[0].min) return TIERS[0].price;
  if (quantity >= TIERS[1].min) return TIERS[1].price;
  if (quantity >= TIERS[2].min) return TIERS[2].price;
  return 0;
}

function getNextThreshold(quantity: number) {
  if (quantity < 11) return 11;
  if (quantity < 51) return 51;
  return undefined;
}

export function computeCart(items: RawCartItem[]): { items: PricedCartItem[]; pricing: CartPricing } {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const unitPriceCents = getUnitPriceCents(totalQuantity);
  const pricedItems: PricedCartItem[] = items.map((item) => ({
    ...item,
    unitPriceCents,
    totalCents: unitPriceCents * item.quantity,
  }));
  const totalCents = unitPriceCents * totalQuantity;

  const nextThreshold = getNextThreshold(totalQuantity);
  const nextUnitPriceCents = nextThreshold ? getUnitPriceCents(nextThreshold) : undefined;
  const missingForNext = nextThreshold ? nextThreshold - totalQuantity : undefined;

  const upsell =
    missingForNext === 1 && nextUnitPriceCents
      ? {
          missing: 1,
          newUnitPriceCents: nextUnitPriceCents,
          newTotalCents: nextUnitPriceCents * (totalQuantity + 1),
        }
      : undefined;

  return {
    items: pricedItems,
    pricing: {
      unitPriceCents,
      totalCents,
      totalQuantity,
      nextThreshold,
      nextUnitPriceCents,
      missingForNext,
      upsell,
    },
  };
}
