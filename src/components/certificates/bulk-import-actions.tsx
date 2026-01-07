"use client";

import { Button } from "@/components/ui/button";

type BulkImportActionsProps = {
  count: number;
  processing?: boolean;
  isAdding?: boolean;
  onConfirm: () => void;
  description?: string;
};

export function BulkImportActions({
  count,
  processing = false,
  isAdding = false,
  onConfirm,
  description = "Ao adicionar ao carrinho, cada linha preenchida gera um certificado individual.",
}: BulkImportActionsProps) {
  if (count <= 0) return null;

  return (
    <div className="rounded-3xl border border-primary/30 bg-primary/5 p-4 shadow-sm">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-foreground">
          {count} linha{count > 1 ? "s" : ""} importada{count > 1 ? "s" : ""}.
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
        <Button type="button" onClick={onConfirm} disabled={processing || isAdding}>
          {processing ? "Importando certificados..." : `Adicionar ${count} certificado(s) ao carrinho`}
        </Button>
      </div>
    </div>
  );
}
