"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { ParsedRow } from "@/components/certificates/bulk-import-panel";
import { useCartContext } from "@/components/cart/cart-provider";

type AddToCartOverride = {
  quantity?: number;
  summary?: string | null;
  skipValidation?: boolean;
};

type AddToCartHandler = (override?: AddToCartOverride) => Promise<void>;

type UseBulkCartImportOptions<T> = {
  campos: T;
  setCampos: React.Dispatch<React.SetStateAction<T>>;
  handleAddToCart: AddToCartHandler;
  getSummary?: (row: Partial<T>, current: T) => string | undefined;
  emptyMessage?: string;
  successMessage?: (count: number) => string;
  summaryField?: keyof T;
};

type UseBulkCartImportResult = {
  bulkRows: ParsedRow[];
  hasBulkRows: boolean;
  bulkCertificateCount: number;
  processingBulk: boolean;
  handleApplyBulkRow: (row: Record<string, string>) => void;
  handleRowsChange: (rows: ParsedRow[]) => void;
  handleBulkAddToCart: () => Promise<void>;
  setBulkRows: React.Dispatch<React.SetStateAction<ParsedRow[]>>;
};

export function useBulkCartImport<T>({
  campos,
  setCampos,
  handleAddToCart,
  getSummary,
  emptyMessage = "Importe a planilha antes de adicionar ao carrinho.",
  successMessage = (count) => `${count} certificado(s) adicionados ao carrinho.`,
  summaryField,
}: UseBulkCartImportOptions<T>): UseBulkCartImportResult {
  const [bulkRows, setBulkRows] = useState<ParsedRow[]>([]);
  const [processingBulk, setProcessingBulk] = useState(false);
  const camposRef = useRef(campos);
  const { setBulkImporting } = useCartContext();

  useEffect(() => {
    camposRef.current = campos;
  }, [campos]);

  const bulkCertificateCount = useMemo(() => Math.max(0, bulkRows.length), [bulkRows]);
  const hasBulkRows = bulkCertificateCount > 0;

  const handleApplyBulkRow = useCallback(
    (row: Record<string, string>) => {
      setCampos((prev) => ({ ...prev, ...(row as Partial<T>) }));
    },
    [setCampos],
  );

  const handleRowsChange = useCallback((rows: ParsedRow[]) => {
    setBulkRows(rows);
  }, []);

  const handleBulkAddToCart = useCallback(async () => {
    if (!hasBulkRows) {
      toast.error(emptyMessage);
      return;
    }

    setProcessingBulk(true);
    setBulkImporting(true);
    const previousCampos = camposRef.current;
    try {
      for (const row of bulkRows) {
        const typedRow = row as Partial<T>;
        setCampos((prev) => ({ ...prev, ...typedRow }));
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
        let summary: string | undefined;
        if (getSummary) {
          summary = getSummary(typedRow, camposRef.current);
        } else if (summaryField) {
          const rowValue = typedRow[summaryField];
          const currentValue = camposRef.current[summaryField];
          summary =
            (typeof rowValue === "string" && rowValue.trim()) ||
            (typeof currentValue === "string" && currentValue.trim()) ||
            undefined;
        }
        await handleAddToCart({
          quantity: 1,
          summary,
          skipValidation: true,
        });
      }
      toast.success(successMessage(bulkCertificateCount));
    } catch (error) {
      console.error(error);
      toast.error("Nao foi possivel adicionar todos os certificados. Tente novamente.");
    } finally {
      setProcessingBulk(false);
      setBulkImporting(false);
      setCampos(previousCampos);
      camposRef.current = previousCampos;
    }
  }, [
    bulkRows,
    bulkCertificateCount,
    emptyMessage,
    getSummary,
    handleAddToCart,
    hasBulkRows,
    successMessage,
    setCampos,
    setBulkImporting,
    summaryField,
  ]);

  return {
    bulkRows,
    hasBulkRows,
    bulkCertificateCount,
    processingBulk,
    handleApplyBulkRow,
    handleRowsChange,
    handleBulkAddToCart,
    setBulkRows,
  };
}
