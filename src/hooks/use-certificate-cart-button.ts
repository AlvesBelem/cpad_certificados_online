"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCertificateCartAction } from "@/hooks/use-certificate-cart";
import { areFieldsFilled } from "@/lib/certificate-fields";

type Options<T extends Record<string, unknown>> = {
  slug: string;
  title: string;
  data: T;
  requiredFields: (keyof T)[];
  summary?: string | null;
  quantity?: number;
  emptyMessage?: string;
  getPreviewImage?: () => Promise<string | null>;
};

export function useCertificateCartButton<T extends Record<string, unknown>>(options: Options<T>) {
  const { slug, title, data, requiredFields, summary, quantity, emptyMessage, getPreviewImage } = options;
  const { addCertificateToCart, isAddingToCart } = useCertificateCartAction(slug, title);
  const [capturingPreview, setCapturingPreview] = useState(false);

  const isReady = useMemo(() => areFieldsFilled(requiredFields, data), [data, requiredFields]);

  const handleAddToCart = useCallback(
    async (override?: { quantity?: number; summary?: string | null; skipValidation?: boolean }) => {
      if (!override?.skipValidation && !isReady) {
        toast.error(emptyMessage ?? "Preencha o certificado antes de adicionar ao carrinho.");
        return;
      }

      const normalizedSummary = (override?.summary ?? summary)?.trim() || undefined;
      const finalQuantity = Math.max(1, override?.quantity ?? quantity ?? 1);
      setCapturingPreview(true);
      try {
        const previewImage = getPreviewImage ? await getPreviewImage() : undefined;
        await addCertificateToCart({
          summary: normalizedSummary,
          quantity: finalQuantity,
          previewImage: previewImage ?? undefined,
        });
      } finally {
        setCapturingPreview(false);
      }
    },
    [addCertificateToCart, emptyMessage, getPreviewImage, isReady, quantity, summary],
  );

  return {
    isReady,
    isAddingToCart: isAddingToCart || capturingPreview,
    handleAddToCart,
  };
}
