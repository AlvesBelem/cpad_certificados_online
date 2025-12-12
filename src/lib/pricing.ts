export type PricingSummary = {
  quantity: number;
  unitInCents: number;
  totalInCents: number;
};

export function calculateCertificatePricing(quantity: number): PricingSummary {
  const safeQty = Math.max(0, Math.floor(quantity));
  let unit = 250; // 1 a 10
  if (safeQty >= 51) {
    unit = 180;
  } else if (safeQty >= 11) {
    unit = 200;
  }

  return {
    quantity: safeQty,
    unitInCents: unit,
    totalInCents: safeQty * unit,
  };
}
