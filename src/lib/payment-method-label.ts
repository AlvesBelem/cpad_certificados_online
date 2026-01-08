const PAYMENT_METHOD_LABELS: Record<string, string> = {
  STRIPE: "Cartão",
  CARD: "Cartão",
  DINHEIRO: "Dinheiro",
  PIX: "Pix",
  PIX_MANUAL: "Pix (manual)",
  TRANSFERENCIA: "Transferência",
  TRANSFERÊNCIA: "Transferência",
  CASH: "Dinheiro",
  INDIFERENTE: "Indiferente",
};

export function formatPaymentMethodLabel(method?: string | null) {
  if (!method) return "Indefinido";
  const normalized = method.toUpperCase();
  if (PAYMENT_METHOD_LABELS[normalized]) {
    return PAYMENT_METHOD_LABELS[normalized];
  }
  const cleaned = method
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  if (!cleaned) {
    return "Indefinido";
  }
  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
}
