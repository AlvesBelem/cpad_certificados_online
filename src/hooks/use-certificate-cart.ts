"use client";

import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useCartContext } from "@/components/cart/cart-provider";
import { useCartSheet } from "@/components/cart/cart-sheet-context";

type AddOptions = {
  summary?: string | null;
  quantity?: number;
  previewImage?: string | null;
  entries?: Array<{
    quantity?: number;
    summary?: string | null;
    previewImage?: string | null;
  }>;
  feedbackMessage?: string;
  skipUpsellToast?: boolean;
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
      const safeSlug = slug || "certificado";
      const safeTitle = title || "Certificado";
      try {
        const updated = await addItem({
          certificateSlug: safeSlug,
          title: safeTitle,
          quantity: Math.max(1, options?.quantity ?? 1),
          summary: options?.summary?.trim() || undefined,
          previewImage: options?.previewImage,
          entries: options?.entries,
        });

        toast.success(options?.feedbackMessage ?? "Certificado adicionado ao carrinho");
        openCart({ autoCloseMs: 5000 });

        if (!options?.skipUpsellToast && updated.pricing.upsell && updated.pricing.nextUnitPriceCents) {
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
