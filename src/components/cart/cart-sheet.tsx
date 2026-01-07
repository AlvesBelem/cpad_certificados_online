"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogIn, ShoppingCart, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { useCartContext } from "./cart-provider";
import { useCartSheet } from "./cart-sheet-context";
import { cn } from "@/lib/utils";

export function CartSheet() {
  const { isOpen, closeCart } = useCartSheet();
  const { formatted, loading, mutating, error, updateQuantity, clear, bulkImporting } = useCartContext();
  const router = useRouter();
  const [checkingOut, setCheckingOut] = useState(false);
  const { data: session } = authClient.useSession();

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
  const showLoginCta = Boolean(!session && error && error.toLowerCase().includes("sessao"));

  const currency = useMemo(
    () => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }),
    [],
  );

  const handleRemoveItem = async (itemId: string) => {
    try {
      await updateQuantity(itemId, 0);
    } catch {
      // erros tratados pelo provider
    }
  };

  const handleClear = async () => {
    try {
      await clear();
    } catch {
      // ignorar
    }
  };

  const handleCheckout = async () => {
    if (!formatted || items.length === 0 || checkingOut) return;
    if (bulkImporting) {
      toast.info("Aguarde a importação dos certificados antes de finalizar o pedido.");
      return;
    }
    setCheckingOut(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.url) {
        toast.error(data?.message ?? "Não foi possível iniciar o checkout.");
        setCheckingOut(false);
        return;
      }
      window.location.href = data.url as string;
    } catch (error) {
      console.error("Erro ao iniciar checkout:", error);
      toast.error("Não foi possível iniciar o checkout. Tente novamente.");
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
            <p className="text-sm text-muted-foreground">Todos os certificados com o mesmo valor unitário.</p>
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
              <p className="text-sm text-muted-foreground">
                {showLoginCta ? "Faça login para salvar certificados no carrinho." : "Crie um certificado e clique em adicionar ao carrinho."}
              </p>
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
                    <span className="font-medium text-foreground">Valor unitário {unitLabel}</span>
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
              <span className="text-muted-foreground">Valor unitário</span>
              <span className="font-semibold text-foreground">{unitLabel}</span>
            </div>
            <Separator className="bg-border/80" />
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>{totalLabel}</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Você será redirecionado ao Stripe para concluir o pagamento. Após a confirmação, voltaremos automaticamente para liberar os certificados.
          </p>
          <Button
            type="button"
            className="mt-3 w-full"
            disabled={items.length === 0 || mutating || checkingOut || bulkImporting}
            onClick={handleCheckout}
          >
            {checkingOut
              ? "Redirecionando..."
              : bulkImporting || mutating
                ? "Importando certificados..."
                : "Ir para pagamento"}
          </Button>
        </footer>
      </aside>
    </>
  );
}
