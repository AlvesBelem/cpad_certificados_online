
import Link from "next/link";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RedirectTimer } from "./redirect-timer";
import { assertStripe } from "@/lib/stripe";
import { ClearCartOnMount } from "./clear-cart";

async function getStripeSummary(sessionId?: string) {
  if (!sessionId) return null;
  try {
    const stripe = assertStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
      totalCents: session.amount_total ?? undefined,
      totalQuantity: session.metadata?.totalQuantity ? Number(session.metadata.totalQuantity) : undefined,
      unitPriceCents: session.metadata?.unitPriceCents ? Number(session.metadata.unitPriceCents) : undefined,
      method: session.payment_method_types?.[0],
    };
  } catch (error) {
    console.error("Falha ao recuperar sess?o do Stripe:", error);
    return null;
  }
}

type ThankYouPageProps = {
  searchParams?: {
    session_id?: string;
  };
};

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const summary = await getStripeSummary(searchParams?.session_id);
  const formatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  const total = summary?.totalCents ? formatter.format(summary.totalCents / 100) : "Valor calculado";
  const quantity = summary?.totalQuantity ? String(summary.totalQuantity) : "?";
  const unit = summary?.unitPriceCents ? formatter.format(summary.unitPriceCents / 100) : "Conforme faixa";
  const methodLabel = summary?.method ? summary.method.toUpperCase() : "Stripe Checkout";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-16 md:px-10 lg:px-16">
      <RedirectTimer />
      <ClearCartOnMount />
      <header className="space-y-3 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/70">Pagamento confirmado</p>
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">Obrigado pela sua compra!</h1>
        <p className="text-sm text-muted-foreground">
          Recebemos a confirma??o do Stripe. Enquanto processamos o pedido, voc? pode continuar editando seus certificados normalmente.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-[1.1fr,0.9fr]">
        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle>Resumo da emiss?o</CardTitle>
            <CardDescription>Utilize estes dados para acompanhar o processamento do pedido.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-foreground">
            <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Certificados</p>
                <p className="text-lg font-semibold">{quantity}</p>
              </div>
              <span className="text-xs text-muted-foreground">Valor unit?rio {unit}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Total</p>
                <p className="text-lg font-semibold">{total}</p>
              </div>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Forma de pagamento</p>
                <p className="text-lg font-semibold">{methodLabel}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Caso precise ajustar quantidades ou modelos, basta retornar aos certificados e adicionar novos itens ao carrinho.
            </p>
          </CardContent>
        </Card>

        <Card className="border-dashed border-border/60 bg-primary/5">
          <CardHeader>
            <CardTitle>Pr?ximos passos</CardTitle>
            <CardDescription>Conclua os certificados e fa?a o download quando estiverem prontos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. Volte aos modelos e finalize os dados de cada pessoa.</p>
            <p>2. Gere os PDFs quando precisar, diretamente nos modelos.</p>
            <p>3. Precisa de novos certificados? Adicione novamente ao carrinho.</p>
            <Button asChild className="mt-4 w-full">
              <Link href="/certificados">
                Abrir certificados
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
