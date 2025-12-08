"use client";

import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useCartContext } from "@/components/cart/cart-provider";
import { useCartSheet } from "@/components/cart/cart-sheet-context";

type AddOptions = {
  summary?: string | null;
  quantity?: number;
  previewImage?: string | null;
};

export function useCertificateCartAction(slug: string, title: string) {
  const { addItem, mutating } = useCartContext();
  const { openCart } = useCartSheet();

  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }),
    [],
  );

  const handleAddToCart = useCallback(
    async (options?: AddOptions) => {
      try {
        const updated = await addItem({
          certificateSlug: slug,
          title,
          quantity: Math.max(1, options?.quantity ?? 1),
          summary: options?.summary?.trim() || undefined,
          previewImage: options?.previewImage,
        });

        toast.success("Certificado adicionado ao carrinho");
        openCart({ autoCloseMs: 5000 });

        if (updated.pricing.upsell && updated.pricing.nextUnitPriceCents) {
          const nextUnit = currencyFormatter.format(updated.pricing.nextUnitPriceCents / 100);
          const nextTotal = currencyFormatter.format(updated.pricing.upsell.newTotalCents / 100);
          toast.message("Falta 1 para reduzir o valor unitario", {
            description: `Adicionando mais 1, cada certificado sai por ${nextUnit} (total ${nextTotal}).`,
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Falha ao adicionar ao carrinho.";
        toast.error(message);
      }
    },
    [addItem, currencyFormatter, openCart, slug, title],
  );

  return {
    addCertificateToCart: handleAddToCart,
    isAddingToCart: mutating,
  };
}
