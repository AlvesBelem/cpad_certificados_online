"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCertificateCartAction } from "@/hooks/use-certificate-cart";
import { areFieldsFilled } from "@/lib/certificate-fields";
import { useBulkImportState } from "@/lib/bulk-import-store";

type Options<T extends Record<string, unknown>> = {
  slug: string;
  title: string;
  data: T;
  requiredFields: (keyof T)[];
  summary?: string | null | ((data: T) => string | null | undefined);
  quantity?: number;
  emptyMessage?: string;
  getPreviewImage?: () => Promise<string | null>;
};

export function useCertificateCartButton<T extends Record<string, unknown>>(options: Options<T>) {
  const { slug, title, data, requiredFields, summary, quantity, emptyMessage, getPreviewImage } = options;
  const { addCertificateToCart, isAddingToCart } = useCertificateCartAction(slug, title);
  const [capturingPreview, setCapturingPreview] = useState(false);
  const bulkState = useBulkImportState(slug);

  const hasBulkRows = Boolean(bulkState.rows?.length);

  const resolveSummary = useCallback(
    (currentData: T) => {
      if (typeof summary === "function") {
        return summary(currentData) ?? undefined;
      }
      return summary?.trim() || undefined;
    },
    [summary],
  );

  const manualReady = useMemo(() => areFieldsFilled(requiredFields, data), [data, requiredFields]);
  const bulkReady = useMemo(() => {
    if (!hasBulkRows) return false;
    const rows = bulkState.rows ?? [];
    return rows.some((row) => areFieldsFilled(requiredFields, { ...(data as object), ...(row as object) } as T));
  }, [bulkState.rows, data, hasBulkRows, requiredFields]);

  const isReady = hasBulkRows ? bulkReady : manualReady;

  const handleAddToCart = useCallback(async () => {
    const waitForFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    const waitForRender = () => new Promise((resolve) => setTimeout(resolve, 120));

    if (hasBulkRows) {
      const rawRows = bulkState.rows ?? [];
      if (!rawRows.length) {
        toast.error("Importe uma planilha com dados para adicionar certificados em massa.");
        return;
      }
      if (!bulkState.applyRow) {
        toast.error("Reabra a planilha e tente novamente para aplicar os dados.");
        return;
      }

      const rowsToApply = rawRows;
      const totalQuantity = rowsToApply.length;

      setCapturingPreview(true);
      try {
        const entries = rowsToApply.map((_row, index) => ({
          quantity: 1,
          summary: `Linha ${index + 1}`,
          previewImage: undefined as string | undefined,
        }));

        for (let index = 0; index < rowsToApply.length; index += 1) {
          const row = rowsToApply[index];
          const mergedData = { ...(data as object), ...(row as object) } as T;

          await Promise.resolve(bulkState.applyRow(row));
          await waitForFrame();
          await waitForRender();

          let previewImage = getPreviewImage ? await getPreviewImage() : undefined;
          if (!previewImage) {
            await waitForRender();
            previewImage = getPreviewImage ? await getPreviewImage() : undefined;
          }
          if (!previewImage) {
            toast.error(`Nao conseguimos gerar a previa da linha ${index + 1}. Verifique os dados e tente novamente.`);
            setCapturingPreview(false);
            return;
          }
          const rowSummary = resolveSummary(mergedData) || `Linha ${index + 1}`;

          entries[index] = {
            quantity: 1,
            summary: rowSummary,
            previewImage,
          };
        }

        if (!entries.length) {
          toast.error("Nenhuma linha valida na planilha para adicionar ao carrinho.");
          return;
        }

        toast.message("Importação da planilha", {
          description: `Vamos adicionar ${entries.length} certificado(s) do arquivo.`,
        });

        await addCertificateToCart({
          entries,
          quantity: totalQuantity,
          feedbackMessage: `Adicionamos ${entries.length} certificado(s) da planilha`,
          skipUpsellToast: true,
        });
      } finally {
        setCapturingPreview(false);
      }
      return;
    }

    if (!isReady) {
      toast.error(emptyMessage ?? "Preencha o certificado antes de adicionar ao carrinho.");
      return;
    }

    const normalizedSummary = resolveSummary(data);
    setCapturingPreview(true);
    try {
      const previewImage = getPreviewImage ? await getPreviewImage() : undefined;
      await addCertificateToCart({ summary: normalizedSummary, quantity, previewImage: previewImage ?? undefined });
    } finally {
      setCapturingPreview(false);
    }
  }, [
    addCertificateToCart,
    bulkState,
    data,
    emptyMessage,
    getPreviewImage,
    hasBulkRows,
    isReady,
    quantity,
    resolveSummary,
    requiredFields,
  ]);

  return {
    isReady,
    isAddingToCart: isAddingToCart || capturingPreview,
    handleAddToCart,
  };
}
