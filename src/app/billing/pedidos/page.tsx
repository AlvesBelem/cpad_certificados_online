import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatPaymentMethodLabel } from "@/lib/payment-method-label";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function BillingOrdersPage() {
  const session = await requireSession();
  const orders = await prisma.certificateOrder.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        select: {
          id: true,
          title: true,
          summary: true,
          quantity: true,
          unitPriceInCents: true,
        },
      },
    },
  });

  const renderStatusBadge = (status: string) => {
    const normalized = status.toUpperCase();
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PAID: "default",
      PENDING: "secondary",
      CANCELED: "outline",
      FAILED: "destructive",
    };
    const labels: Record<string, string> = {
      PAID: "Pago",
      PENDING: "Pendente",
      CANCELED: "Cancelado",
      FAILED: "Falhou",
    };
    return (
      <Badge variant={variants[normalized] ?? "secondary"} className="uppercase tracking-[0.2em]">
        {labels[normalized] ?? normalized}
      </Badge>
    );
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-12 md:px-10 lg:px-16">
      <div className="space-y-2 pb-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">Pedidos</p>
        <h1 className="text-2xl font-semibold text-foreground">Histórico de pedidos</h1>
        <p className="text-sm text-muted-foreground">
          Consulte seus pedidos já pagos ou em processamento. Ao concluir o pagamento, os certificados são liberados
          para impressão.
        </p>
      </div>

      {orders.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle>Você ainda não possui pedidos</CardTitle>
            <CardDescription>Adicione certificados ao carrinho e finalize o pagamento para registrar seu primeiro pedido.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Collapsible
              key={order.id}
              className="rounded-2xl border border-border/70 bg-card/80 p-3 text-xs text-muted-foreground shadow-sm transition hover:border-primary/70 md:p-4"
              defaultOpen={false}
            >
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Pedido {order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                    {dateFormatter.format(order.createdAt)} · {order.quantity} certificado(s)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {renderStatusBadge(order.status)}
                  <CollapsibleTrigger className="text-xs font-semibold text-primary underline-offset-4 hover:underline">
                    Detalhes
                  </CollapsibleTrigger>
                </div>
              </div>
              <CollapsibleContent className="mt-3 space-y-2">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Forma de pagamento</p>
                    <p className="font-semibold text-foreground">{formatPaymentMethodLabel(order.paymentMethod)}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Total</p>
                    <p className="text-base font-semibold text-foreground">
                      {currencyFormatter.format(order.totalAmountInCents / 100)}
                    </p>
                  </div>
                </div>
                {order.notes ? (
                  <p className="text-[11px] text-muted-foreground/90">
                    Observações: <span className="font-medium text-foreground">{order.notes}</span>
                  </p>
                ) : null}
                {order.items.length ? (
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-2 text-[11px]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      Certificados
                    </p>
                    <ul className="mt-1 space-y-1">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-2 text-foreground">
                          <div className="space-y-0.5">
                            <p className="font-semibold">{item.title}</p>
                            {item.summary ? <p className="text-muted-foreground">Para: {item.summary}</p> : null}
                          </div>
                          <p className="text-right font-semibold">
                            {item.quantity}x {currencyFormatter.format(item.unitPriceInCents / 100)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}
    </main>
  );
}
