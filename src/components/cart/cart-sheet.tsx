"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogIn, ShoppingCart, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { canFinalizeOffline } from "@/lib/roles";
import { useCartContext } from "./cart-provider";
import { useCartSheet } from "./cart-sheet-context";
import { cn } from "@/lib/utils";

type CartEntry = {
  id: string;
  quantity: number;
  summary?: string | null;
  previewImage?: string | null;
};

type MinimalCartItem = {
  id: string;
  certificateSlug: string;
  title: string;
  quantity: number;
  summary?: string | null;
  previewImage?: string | null;
  entries?: CartEntry[];
};

type DownloadUnit = {
  slug: string;
  title: string;
  summary?: string | null;
  previewImage?: string | null;
  sequence: number;
};

const offlinePaymentMethods = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao", label: "Cartão" },
  { value: "pix", label: "Pix" },
  { value: "transferencia", label: "Transferência" },
  { value: "outro", label: "Outro" },
];

const COMBINED_MAX_PAGES = 25;

async function downloadCertificates(items: MinimalCartItem[], mode: "individual" | "combined") {
  if (!items.length) return;

  const units: DownloadUnit[] = [];
  items.forEach((item) => {
    const entryList =
      item.entries && item.entries.length
        ? item.entries
        : [
            {
              id: `${item.id}-default`,
              quantity: item.quantity,
              summary: item.summary,
              previewImage: item.previewImage,
            },
          ];

    entryList.forEach((entry) => {
      const copies = Math.max(1, entry.quantity || 1);
      for (let copyIndex = 0; copyIndex < copies; copyIndex++) {
        units.push({
          slug: item.certificateSlug,
          title: item.title,
          summary: entry.summary ?? item.summary,
          previewImage: entry.previewImage ?? item.previewImage,
          sequence: units.length + 1,
        });
      }
    });
  });

  if (!units.length) {
    toast.error("Nao foi possivel gerar os PDF(s). Refaça o pedido.");
    return;
  }

  if (mode === "combined") {
    const chunkCount = Math.ceil(units.length / COMBINED_MAX_PAGES);
    for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex += 1) {
      const chunk = units.slice(chunkIndex * COMBINED_MAX_PAGES, (chunkIndex + 1) * COMBINED_MAX_PAGES);
      const pdf = new jsPDF("landscape", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      chunk.forEach((unit, index) => {
        if (!unit.previewImage) return;
        if (index > 0) {
          pdf.addPage();
        }
        pdf.addImage(unit.previewImage, "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
      });
      const fileName =
        chunkCount === 1 ? "certificados.pdf" : `certificados-parte-${chunkIndex + 1}.pdf`;
      pdf.save(fileName);
    }
    return;
  }

  const files: { filename: string; data: ArrayBuffer }[] = [];
  for (const unit of units) {
    if (!unit.previewImage) {
      continue;
    }
    const pdf = new jsPDF("landscape", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(unit.previewImage, "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
    const data = pdf.output("arraybuffer");
    const filename = `certificado-${unit.slug || unit.sequence}-${unit.sequence}.pdf`;
    files.push({ filename, data });
  }

  if (!files.length) {
    toast.error("Nao foi possivel gerar os PDF(s). Refaça o pedido.");
    return;
  }

  if (files.length === 1) {
    const [file] = files;
    const blob = new Blob([file.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return;
  }

  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.filename, file.data);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "certificados.zip";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function CartSheet() {
  const { isOpen, closeCart } = useCartSheet();
  const { formatted, loading, mutating, error, updateQuantity, clear, bulkImporting } = useCartContext();
  const router = useRouter();
  const [checkingOut, setCheckingOut] = useState(false);
  const { data: session } = authClient.useSession();
  const sessionUser = session?.user as { role?: string } | undefined;
  const canFinishOffline = canFinalizeOffline(sessionUser?.role);
  const [paymentMethod, setPaymentMethod] = useState<string>(offlinePaymentMethods[0]?.value ?? "dinheiro");
  const [downloadMode, setDownloadMode] = useState<"individual" | "combined">("individual");

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const items = formatted?.items ?? [];
  const totalLabel = formatted?.pricing.total ?? "R$ 0,00";
  const unitLabel = formatted?.pricing.unitPrice ?? "R$ 0,00";
  const totalQuantity = formatted?.pricing.totalQuantity ?? 0;
  const showLoginCta = Boolean(error && error.toLowerCase().includes("sessao"));

  const currency = useMemo(
    () => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }),
    [],
  );

  const handleRemoveItem = async (itemId: string) => {
    try {
      await updateQuantity(itemId, 0);
    } catch {
      // o hook ja exibe mensagens de erro
    }
  };

  const handleClear = async () => {
    try {
      await clear();
    } catch {
      // erros tratados externamente
    }
  };

  const handleCheckout = async () => {
    if (!formatted || items.length === 0 || checkingOut) return;
    if (!canFinishOffline) {
      toast.info(
        "O checkout online estará disponível em breve. Somente administradores e funcionários podem finalizar pagamentos presenciais durante os testes.",
      );
      return;
    }
    setCheckingOut(true);
    const params = new URLSearchParams();
    if (formatted.pricing.total) {
      params.set("total", formatted.pricing.total);
    }
    if (formatted.pricing.totalQuantity) {
      params.set("quantity", String(formatted.pricing.totalQuantity));
    }
    if (formatted.pricing.unitPrice) {
      params.set("unit", formatted.pricing.unitPrice);
    }
    if (paymentMethod) {
      params.set("method", paymentMethod);
    }
    try {
      const downloadPayload: MinimalCartItem[] = items.map((item) => ({
        id: item.id,
        certificateSlug: item.certificateSlug,
        title: item.title,
        quantity: item.quantity,
        summary: item.summary,
        previewImage: item.previewImage,
        entries: item.entries?.map((entry) => ({
          id: entry.id,
          quantity: entry.quantity,
          summary: entry.summary,
          previewImage: entry.previewImage ?? item.previewImage,
        })),
      }));
      await downloadCertificates(downloadPayload, downloadMode);
      await clear();
      closeCart();
      const query = params.toString();
      router.push(query ? `/obrigado?${query}` : "/obrigado");
    } catch {
      toast.error("Nao foi possivel finalizar o pedido. Tente novamente.");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeCart}
      />
      <aside
        role="dialog"
        aria-label="Carrinho de certificados"
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-2xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-border/70 px-6 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/70">Carrinho</p>
            <p className="text-sm text-muted-foreground">Todos os certificados com o mesmo valor unitario.</p>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={mutating}
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={handleClear}
              >
                {mutating ? "Limpando..." : "Limpar"}
              </Button>
            ) : null}
            <Button type="button" size="icon" variant="outline" onClick={closeCart} aria-label="Fechar carrinho">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p>Carregando certificados...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
              <div className="rounded-full bg-primary/10 p-3">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <p className="text-base font-medium text-foreground">Carrinho vazio</p>
              <p className="text-sm text-muted-foreground">{showLoginCta ? "Faca login para salvar certificados no carrinho." : "Crie um certificado e clique em adicionar ao carrinho."}</p>
              {showLoginCta ? (
                <Button asChild size="sm" className="mt-2">
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Fazer login
                  </Link>
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <article key={item.id} className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      {(() => {
                        const entryCount = item.entries?.length ?? 0;
                        if (entryCount === 1) {
                          const summary = item.entries?.[0]?.summary;
                          return summary ? (
                            <p className="text-xs text-muted-foreground">Para: {summary}</p>
                          ) : null;
                        }
                        if (entryCount > 1) {
                          return (
                            <p className="text-xs text-muted-foreground">
                              {entryCount} certificados diferentes
                            </p>
                          );
                        }
                        if (item.summary) {
                          return <p className="text-xs text-muted-foreground">Para: {item.summary}</p>;
                        }
                        return null;
                      })()}
                      <p className="mt-1 text-xs text-muted-foreground">Quantidade: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {currency.format(item.totalCents / 100)}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Valor unitario {unitLabel}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-destructive transition hover:bg-destructive/10"
                      disabled={mutating}
                    >
                      <Trash2 className="h-3 w-3" />
                      Remover
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <footer className="border-t border-border/70 px-6 py-5">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Certificados</span>
              <span className="font-semibold text-foreground">{totalQuantity}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Valor unitario</span>
              <span className="font-semibold text-foreground">{unitLabel}</span>
            </div>
            <Separator className="bg-border/80" />
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>{totalLabel}</span>
            </div>
          </div>
          {canFinishOffline ? (
            <div className="mt-4 space-y-2">
              <Label htmlFor="paymentMethod" className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Forma de pagamento presencial
              </Label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className="w-full rounded-2xl border border-border/60 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                {offlinePaymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">
              Checkout online em desenvolvimento. Apenas administradores e funcionários conseguem finalizar pagamentos neste ambiente de teste.
            </p>
          )}
          <div className="mt-4 space-y-2">
            <Label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Entrega dos PDFs</Label>
            <div className="space-y-2 text-sm text-muted-foreground">
              <label className="flex cursor-pointer items-start gap-2 rounded-2xl border border-border/60 p-3 text-left">
                <input
                  type="radio"
                  className="mt-1"
                  value="individual"
                  checked={downloadMode === "individual"}
                  onChange={() => setDownloadMode("individual")}
                />
                <div>
                  <p className="font-semibold text-foreground">PDFs individuais (ZIP)</p>
                  <p className="text-xs text-muted-foreground">
                    Cada certificado vira um PDF separado. Se houver vários, entregamos em um arquivo compactado.
                  </p>
                </div>
              </label>
              <label className="flex cursor-pointer items-start gap-2 rounded-2xl border border-border/60 p-3 text-left">
                <input
                  type="radio"
                  className="mt-1"
                  value="combined"
                  checked={downloadMode === "combined"}
                  onChange={() => setDownloadMode("combined")}
                />
                <div>
                  <p className="font-semibold text-foreground">PDF único (até 25 páginas)</p>
                  <p className="text-xs text-muted-foreground">
                    Agrupa os certificados em um único arquivo. A cada 25 páginas geramos um novo PDF automaticamente.
                  </p>
                </div>
              </label>
            </div>
          </div>
          <Button
            type="button"
            className="mt-3 w-full"
            disabled={items.length === 0 || mutating || checkingOut || bulkImporting}
            onClick={handleCheckout}
          >
            {checkingOut
              ? "Gerando seus PDFs..."
              : bulkImporting || mutating
                ? "Importando certificados..."
                : canFinishOffline
                  ? "Finalizar pedido"
                  : "Ir para checkout"}
          </Button>
        </footer>
      </aside>
    </>
  );
}
