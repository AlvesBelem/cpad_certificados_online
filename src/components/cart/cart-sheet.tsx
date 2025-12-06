"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { Loader2, LogIn, ShoppingCart, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartContext } from "./cart-provider";
import { useCartSheet } from "./cart-sheet-context";
import { cn } from "@/lib/utils";

export function CartSheet() {
  const { isOpen, closeCart } = useCartSheet();
  const { formatted, loading, mutating, error, updateQuantity, clear } = useCartContext();

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
  const totalLabel = formatted?.pricing.total ?? "R$ 0,00";
  const unitLabel = formatted?.pricing.unitPrice ?? "R$ 0,00";
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
                      {item.summary ? (
                        <p className="text-xs text-muted-foreground">Para: {item.summary}</p>
                      ) : null}
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
          <Button type="button" className="mt-4 w-full" disabled={items.length === 0 || mutating} onClick={closeCart}>
            Finalizar pedido
          </Button>
        </footer>
      </aside>
    </>
  );
}
