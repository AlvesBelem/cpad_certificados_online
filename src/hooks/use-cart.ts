"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type CartCertificateEntry = {
  id: string;
  quantity: number;
  summary?: string | null;
  previewImage?: string | null;
};

type CartItem = {
  id: string;
  certificateSlug: string;
  title: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  summary?: string | null;
  previewImage?: string | null;
  entries?: CartCertificateEntry[];
};

type CartPricing = {
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

type CartResponse = {
  items: CartItem[];
  pricing: CartPricing;
};

type AddPayload = {
  certificateSlug: string;
  title: string;
  quantity?: number;
  summary?: string | null;
  previewImage?: string | null;
};

async function parseResponse(response: Response) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || "Falha ao atualizar o carrinho.";
    throw new Error(message);
  }
  return data as CartResponse;
}

export function useCart() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/cart", { cache: "no-store" });
      const data = await parseResponse(response);
      setCart(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel carregar o carrinho.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  const mutate = useCallback(
    async (method: "POST" | "PATCH" | "DELETE", payload?: unknown) => {
      setMutating(true);
      setError(null);
      try {
        const response = await fetch("/api/cart", {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: payload ? JSON.stringify(payload) : undefined,
        });
        const data = await parseResponse(response);
        setCart(data);
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Falha ao atualizar o carrinho.";
        setError(message);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [],
  );

  const addItem = useCallback(
    async (payload: AddPayload) => {
      return mutate("POST", payload);
    },
    [mutate],
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => mutate("PATCH", { itemId, quantity }),
    [mutate],
  );

  const clear = useCallback(async () => mutate("DELETE"), [mutate]);

  const formatted = useMemo(() => {
    if (!cart) return null;
    const formatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
    return {
      ...cart,
      pricing: {
        ...cart.pricing,
        unitPrice: formatter.format(cart.pricing.unitPriceCents / 100),
        total: formatter.format(cart.pricing.totalCents / 100),
        nextUnitPrice: cart.pricing.nextUnitPriceCents
          ? formatter.format(cart.pricing.nextUnitPriceCents / 100)
          : undefined,
        upsellTotal: cart.pricing.upsell ? formatter.format(cart.pricing.upsell.newTotalCents / 100) : undefined,
      },
    };
  }, [cart]);

  return {
    cart,
    formatted,
    loading,
    mutating,
    error,
    refresh: fetchCart,
    addItem,
    updateQuantity,
    clear,
  };
}
