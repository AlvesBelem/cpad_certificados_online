"use client";



import Image from "next/image";

import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { PencilLine, Trash2 } from "lucide-react";

import type {

  AdminDashboardData,

  DashboardModel,
  DashboardUser,
  OrderSummary,
  PaymentBreakdown,
  ReportRow,
} from "@/lib/admin-dashboard";
import { UserRole } from "@/lib/roles";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import {

  Select,

  SelectContent,

  SelectItem,

  SelectTrigger,

  SelectValue,

} from "@/components/ui/select";

import {

  Table,

  TableBody,

  TableCell,

  TableHead,

  TableHeader,

  TableRow,

} from "@/components/ui/table";

import {

  Dialog,

  DialogContent,

  DialogDescription,

  DialogHeader,

  DialogTitle,

} from "@/components/ui/dialog";

import { CERTIFICATE_TEMPLATES } from "@/constants/certificates";



const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const NOW_REFERENCE = Date.now();

type AdminDashboardProps = {

  data: AdminDashboardData;

  adminName: string;

};



export function AdminDashboard({ data, adminName }: AdminDashboardProps) {

  const [clients, setClients] = useState<DashboardUser[]>(data.clients);
  const [employees, setEmployees] = useState<DashboardUser[]>(data.employees);
  const [models, setModels] = useState<DashboardModel[]>(data.models);
  const [orders] = useState<OrderSummary[]>(data.orders);
  const [activeSection, setActiveSection] = useState("overview");
  const [isCreateEmployeeOpen, setIsCreateEmployeeOpen] = useState(false);


  const activeModelCount = useMemo(() => models.filter((model) => model.isActive).length, [models]);



  const stats = [
    {
      label: "Faturamento total",
      value: currencyFormatter.format(data.totals.totalRevenue),
      helper: "Somatorio de pedidos pagos",
    },
    {
      label: "Certificados vendidos",
      value: data.totals.totalCertificates.toLocaleString("pt-BR"),
      helper: "Quantidade emitida",
    },
    {
      label: "Pedidos processados",
      value: data.totals.totalOrders.toLocaleString("pt-BR"),
      helper: "Pedidos confirmados",
    },
    {
      label: "Ticket mǭdio",
      value: currencyFormatter.format(data.totals.averageTicket || 0),
      helper: "Receita por pedido",
    },
  ];


  function handleUserRoleChange(updated: DashboardUser) {

    setClients((previous) => {

      const filtered = previous.filter((user) => user.id !== updated.id);

      if (updated.role === UserRole.USUARIO) {

        return sortUsers([...filtered, updated]);

      }

      return filtered;

    });



    setEmployees((previous) => {

      const filtered = previous.filter((user) => user.id !== updated.id);

      if (updated.role === UserRole.FUNCIONARIO) {

        return sortUsers([...filtered, updated]);

      }

      return filtered;

    });

  }



  function handleModelCreated(model: DashboardModel) {

    setModels((previous) => sortModels([model, ...previous]));

  }



  function handleModelUpdated(updatedModel: DashboardModel) {

    setModels((previous) => sortModels(previous.map((model) => (model.id === updatedModel.id ? updatedModel : model))));

  }



  function handleModelDeleted(modelId: string) {

    setModels((previous) => previous.filter((model) => model.id !== modelId));

  }



  const sidebarItems = [
    { id: "overview", label: "Resumo" },
    { id: "sales", label: "Vendas" },
    { id: "payments", label: "Pagamentos" },
    { id: "reports", label: "Relatórios" },
    { id: "clients", label: "Clientes" },
    { id: "employees", label: "Funcionários" },
    { id: "models", label: "Modelos" },
  ];


  function renderSection() {
    switch (activeSection) {
      case "sales":
        return <SalesSection orders={orders} />;
      case "payments":
        return (
          <div className="space-y-6">
            <PaymentBreakdownCard items={data.paymentBreakdown} />
            <PaymentMovements orders={orders} />
          </div>
        );
      case "reports":

        return <ReportsCard reports={data.reports} />;

      case "clients":

        return (

          <AdminUserTable

            title="Clientes"

            description="Clientes com acesso ao portal de certificados."

            users={clients}

            emptyState="Nenhum cliente cadastrado."

            onRoleChange={handleUserRoleChange}

          />

        );

      case "employees":

        return (

          <AdminUserTable

            title="Funcionários"

            description="Equipe autorizada a emitir certificados."

            users={employees}

            emptyState="Nenhum funcionário ativo."

            onRoleChange={handleUserRoleChange}

            actions={

              <Button size="sm" onClick={() => setIsCreateEmployeeOpen(true)}>

                Novo funcionário

              </Button>

            }

          />

        );

      case "models":

        return (

          <div className="grid gap-6 lg:grid-cols-3">

            <Card className="lg:col-span-2">

              <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">

                <div>

                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Galeria</p>

                  <CardTitle className="text-xl font-semibold">Modelos de certificados</CardTitle>

                  <p className="text-sm text-muted-foreground">

                    {models.length > 0

                      ? `${activeModelCount} ativos · ${models.length} cadastrados`

                      : "Nenhum modelo cadastrado ainda."}

                  </p>

                </div>

              </CardHeader>

              <CardContent>

                {models.length === 0 ? (

                  <div className="rounded-2xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">

                    Cadastre o primeiro modelo ao lado para liberar a personalização de fundos.

                  </div>

                ) : (

                  <div className="grid gap-4 md:grid-cols-2">

                    {models.map((model) => (

                      <ModelCard

                        key={model.id}

                        model={model}

                        onUpdated={handleModelUpdated}

                        onDeleted={handleModelDeleted}

                      />

                    ))}

                  </div>

                )}

              </CardContent>

            </Card>

            <CertificateModelForm onCreated={handleModelCreated} />

          </div>

        );

      case "overview":

      default:

        return (

          <div className="space-y-8">

            <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background">

              <CardHeader>

                <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Bem-vindo</p>

                <CardTitle className="text-2xl font-semibold">Olá, {adminName.split(" ")[0]}</CardTitle>

              </CardHeader>

              <CardContent className="text-sm text-muted-foreground">

                Aqui você acompanha as vendas em tempo real, configura os modelos de certificado e administra equipes e

                clientes.

              </CardContent>

            </Card>



            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="border-border/60">
                  <CardHeader className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      {stat.label}

                    </p>

                    <CardTitle className="text-3xl font-semibold">{stat.value}</CardTitle>

                  </CardHeader>

                  <CardContent>
                    <p className="text-xs text-muted-foreground">{stat.helper}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
              <PaymentBreakdownCard items={data.paymentBreakdown.slice(0, 4)} />
              <ReportsCard reports={data.reports} />
            </div>
          </div>
        );
    }
  }


  return (

    <div className="flex flex-col gap-8 lg:flex-row">

      <aside className="lg:w-64">

        <div className="rounded-2xl border border-border/60 bg-card/60 p-4 lg:sticky lg:top-24">

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Navegação</p>

          <nav className="flex flex-wrap gap-2 lg:flex-col">

            {sidebarItems.map((item) => (

              <button

                key={item.id}

                type="button"

                onClick={() => setActiveSection(item.id)}

                className={cn(

                  "rounded-xl border px-3 py-2 text-sm transition",

                  activeSection === item.id

                    ? "border-primary/60 bg-primary/5 text-primary"

                    : "border-border/60 bg-background hover:border-primary/40 hover:text-foreground",

                )}

              >

                {item.label}

              </button>

            ))}

          </nav>

        </div>

      </aside>



      <div className="flex-1 space-y-10">{renderSection()}</div>

      {activeSection === "employees" ? (

        <CreateEmployeeDialog

          open={isCreateEmployeeOpen}

          onOpenChange={setIsCreateEmployeeOpen}

          onCreated={(employee) => {

            handleUserRoleChange(employee);

            setIsCreateEmployeeOpen(false);

            toast.success("Funcionário criado com sucesso.");

          }}

        />

      ) : null}

    </div>

  );
}

type SalesSectionProps = {
  orders: OrderSummary[];
};

const STATUS_LABEL: Record<string, string> = {
  PAID: "Pago",
  PENDING: "Pendente",
  CANCELED: "Cancelado",
  FAILED: "Falhou",
};

function formatStatus(status: string) {
  return (STATUS_LABEL[status] ?? status) || "Indefinido";
}

function SalesSection({ orders }: SalesSectionProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("90");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const now = NOW_REFERENCE;

  const paymentOptions = useMemo(() => {
    const methods = Array.from(new Set(orders.map((order) => order.paymentMethod || "indiferente")));
    return ["all", ...methods];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const maxAgeDays = periodFilter === "all" ? null : Number(periodFilter);

    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (methodFilter !== "all" && (order.paymentMethod || "indiferente") !== methodFilter) return false;
      if (maxAgeDays) {
        const orderTime = new Date(order.createdAt).getTime();
        const diffDays = (now - orderTime) / (1000 * 60 * 60 * 24);
        if (diffDays > maxAgeDays) return false;
      }
      return true;
    });
  }, [methodFilter, orders, periodFilter, statusFilter, now]);

  const paidFiltered = filteredOrders.filter((order) => order.status === "PAID");
  const revenue = paidFiltered.reduce((sum, order) => sum + order.totalAmount, 0);
  const certificates = paidFiltered.reduce((sum, order) => sum + order.quantity, 0);
  const ordersCount = filteredOrders.length;
  const avgTicket = paidFiltered.length ? revenue / paidFiltered.length : 0;

  const breakdownMap = new Map<string, PaymentBreakdown>();
  filteredOrders.forEach((order) => {
    const method = (order.paymentMethod || "indiferente").toUpperCase();
    const entry = breakdownMap.get(method) ?? {
      method,
      paidRevenue: 0,
      paidOrders: 0,
      totalOrders: 0,
      certificates: 0,
      statusCounts: { PAID: 0, PENDING: 0, CANCELED: 0, FAILED: 0, OTHER: 0 },
    };

    entry.totalOrders += 1;
    entry.certificates += order.quantity;
    const statusKey = order.status as keyof PaymentBreakdown["statusCounts"];
    if (statusKey === "PAID") {
      entry.paidRevenue += order.totalAmount;
      entry.paidOrders += 1;
    }
    if (entry.statusCounts[statusKey] !== undefined) {
      entry.statusCounts[statusKey] += 1;
    } else {
      entry.statusCounts.OTHER += 1;
    }

    breakdownMap.set(method, entry);
  });
  const breakdown = Array.from(breakdownMap.values()).sort((a, b) => b.paidRevenue - a.paidRevenue);

  const cards = [
    { label: "Receita filtrada", value: currencyFormatter.format(revenue), helper: "Apenas pedidos pagos" },
    { label: "Certificados", value: certificates.toLocaleString("pt-BR"), helper: "Somente pagos" },
    { label: "Pedidos", value: ordersCount.toLocaleString("pt-BR"), helper: "Inclui todos os status" },
    { label: "Ticket médio", value: currencyFormatter.format(avgTicket), helper: "Pagos / pedido" },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Vendas</p>
          <CardTitle className="text-xl font-semibold">Filtro de vendas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="PAID">Pago</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="CANCELED">Cancelado</SelectItem>
                  <SelectItem value="FAILED">Falhou</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Período</Label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="365">Últimos 12 meses</SelectItem>
                  <SelectItem value="all">Todo o histórico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Forma de pagamento</Label>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Forma" />
                </SelectTrigger>
                <SelectContent>
                  {paymentOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === "all" ? "Todas" : option.replace(/[_-]/g, " ").toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <Card key={card.label} className="border-border/60">
                <CardHeader className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    {card.label}
                  </p>
                  <CardTitle className="text-2xl font-semibold">{card.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{card.helper}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Pedidos filtrados</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {ordersCount} pedidos • {paidFiltered.length} pagos • {certificates} certificados pagos
                </p>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {filteredOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum pedido para os filtros atuais.</p>
                ) : (
                  <div className="min-w-full rounded-2xl border border-border/60">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Pagamento</TableHead>
                          <TableHead>Certificados</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Cliente</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.slice(0, 25).map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>{dateFormatter.format(new Date(order.createdAt))}</TableCell>
                            <TableCell className="font-semibold">{formatStatus(order.status)}</TableCell>
                            <TableCell className="capitalize">
                              {(order.paymentMethod || "indiferente").replace(/[_-]/g, " ").toLowerCase()}
                            </TableCell>
                            <TableCell>{order.quantity}</TableCell>
                            <TableCell className="font-semibold">
                              {currencyFormatter.format(order.totalAmount)}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {order.customerEmail ?? "N/A"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Pagamentos (filtro aplicado)</CardTitle>
                <p className="text-xs text-muted-foreground">Apenas pedidos pagos dentro dos filtros.</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {breakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem pagamentos para este filtro.</p>
                ) : (
                  breakdown.map((item) => (
                    <div
                      key={item.method}
                      className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          {item.method.replace(/[_-]/g, " ").toLowerCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.paidOrders} pagos de {item.totalOrders} pedidos - {item.certificates} certificados
                        </p>
                      </div>
                      <span className="text-base font-semibold">
                        {currencyFormatter.format(item.paidRevenue)}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


type AdminUserTableProps = {

  title: string;

  description: string;

  users: DashboardUser[];

  emptyState: string;

  onRoleChange: (user: DashboardUser) => void;

  actions?: React.ReactNode;

};



function AdminUserTable({ title, description, users, emptyState, onRoleChange, actions }: AdminUserTableProps) {

  const [pendingId, setPendingId] = useState<string | null>(null);



  async function handleRoleUpdate(userId: string, role: UserRole) {

    setPendingId(userId);

    try {

      const response = await fetch(`/api/admin/users/${userId}`, {

        method: "PATCH",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ role }),

      });



      if (!response.ok) {

        const payload = await response.json().catch(() => ({}));

        throw new Error(payload.message || "Nao foi possivel atualizar o usuário.");

      }



      const payload = await response.json();

      onRoleChange(payload.user);

      toast.success("Role atualizada com sucesso.");

    } catch (error) {

      console.error(error);

      toast.error(error instanceof Error ? error.message : "Nao foi possivel atualizar o usuário.");

    } finally {

      setPendingId(null);

    }

  }



  return (

    <Card className="border-border/70">

      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{title}</p>

          <CardTitle className="text-xl">{description}</CardTitle>

        </div>

        {actions}

      </CardHeader>

      <CardContent>

        {users.length === 0 ? (

          <p className="text-sm text-muted-foreground">{emptyState}</p>

        ) : (

          <div className="max-h-[360px] overflow-auto rounded-xl border border-border/60">

            <Table>

              <TableHeader>

                <TableRow>

                  <TableHead>Nome</TableHead>

                  <TableHead>Email</TableHead>

                  <TableHead className="hidden lg:table-cell">Criado em</TableHead>

                  <TableHead>Role</TableHead>

                </TableRow>

              </TableHeader>

              <TableBody>

                {users.map((user) => (

                  <TableRow key={user.id}>

                    <TableCell className="font-medium">{user.name}</TableCell>

                    <TableCell className="text-muted-foreground">{user.email}</TableCell>

                    <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">

                      {dateFormatter.format(new Date(user.createdAt))}

                    </TableCell>

                    <TableCell>

                      <Select

                        value={user.role}

                        onValueChange={(value) => handleRoleUpdate(user.id, value as UserRole)}

                        disabled={pendingId === user.id}

                      >

                        <SelectTrigger className="h-8 w-[160px] text-xs">

                          <SelectValue />

                        </SelectTrigger>

                        <SelectContent>

                          <SelectItem value={UserRole.USUARIO}>Cliente</SelectItem>

                          <SelectItem value={UserRole.FUNCIONARIO}>Funcionario</SelectItem>

                          <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>

                        </SelectContent>

                      </Select>

                    </TableCell>

                  </TableRow>

                ))}

              </TableBody>

            </Table>

          </div>

        )}

      </CardContent>

    </Card>

  );

}



type PaymentBreakdownCardProps = {

  items: PaymentBreakdown[];

};



function PaymentBreakdownCard({ items }: PaymentBreakdownCardProps) {

  return (

    <Card className="border-border/70">

      <CardHeader>

        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Pagamentos</p>

        <CardTitle className="text-xl">Totais por forma de pagamento</CardTitle>

      </CardHeader>

      <CardContent className="space-y-4">

        {items.length === 0 ? (

          <p className="text-sm text-muted-foreground">Ainda nao ha registros de pagamento.</p>

        ) : (

          items.map((item) => (

            <div

              key={item.method}

              className="flex items-center justify-between rounded-2xl border border-border/60 px-4 py-3"

            >

              <div>

                <p className="text-sm font-semibold capitalize text-foreground">

                  {item.method.replace(/[_-]/g, " ").toLowerCase()}

                </p>

                <p className="text-xs text-muted-foreground">

                  {item.paidOrders} pagos de {item.totalOrders} pedidos - {item.certificates} certificados

                </p>

              </div>

              <span className="text-base font-semibold">{currencyFormatter.format(item.paidRevenue)}</span>

            </div>

          ))

        )}

      </CardContent>

    </Card>

  );

}

type PaymentMovementsProps = {
  orders: OrderSummary[];
};

function PaymentMovements({ orders }: PaymentMovementsProps) {
  if (orders.length === 0) {
    return (
      <Card className="border-border/70">
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Movimentacoes</p>
          <CardTitle className="text-lg">Nenhum pedido registrado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Assim que os pedidos forem registrados, eles aparecem aqui agrupados por forma de pagamento.
          </p>
        </CardContent>
      </Card>
    );
  }

  type PaymentGroup = {
    method: string;
    orders: OrderSummary[];
    totalAmount: number;
    quantity: number;
  };

  const grouped = Array.from(
    orders.reduce<Map<string, PaymentGroup>>((map, order) => {
      const method = (order.paymentMethod || "INDIFERENTE").toUpperCase();
      const entry = map.get(method) ?? {
        method,
        orders: [],
        totalAmount: 0,
        quantity: 0,
      };
      entry.orders.push(order);
      entry.totalAmount += order.totalAmount;
      entry.quantity += order.quantity;
      map.set(method, entry);
      return map;
    }, new Map()),
  ).sort((a, b) => b.totalAmount - a.totalAmount);

  return (
    <div className="space-y-4">
      {grouped.map((group) => {
        const readableMethod = (group.method || "INDIFERENTE").replace(/[_-]/g, " ").toLowerCase();
        const orderCount = Array.isArray(group.orders) ? group.orders.length : 0;
        const certificateCount = typeof group.quantity === "number" ? group.quantity : 0;
        const orderList = Array.isArray(group.orders) ? group.orders : [];
        return (
          <Card key={group.method} className="border-border/60">
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Movimentacoes</p>
              <CardTitle className="text-lg capitalize">{readableMethod}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {orderCount} pedido(s) · {certificateCount} certificado(s)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderList.map((order) => (
                <div key={order.id} className="rounded-xl border border-border/60 p-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Pedido {order.id.slice(-6).toUpperCase()}
                      </p>
                      {order.customerEmail ? (
                        <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                      ) : null}
                      <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                        {dateFormatter.format(new Date(order.createdAt))}
                      </p>
                      <p className="text-xs text-muted-foreground">Status: {order.status.toLowerCase()}</p>
                    </div>
                    <div className="text-right text-sm font-semibold text-foreground">
                      {currencyFormatter.format(order.totalAmount)}
                      <p className="text-xs text-muted-foreground">{order.quantity} certificado(s)</p>
                    </div>
                  </div>
                  {order.items.length ? (
                    <div className="mt-3 rounded-lg border border-border/40 bg-muted/40 p-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                        Produtos
                      </p>
                      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {order.items.map((item) => (
                          <li key={item.id} className="flex items-center justify-between gap-3">
                            <span className="truncate">
                              {item.title}
                              {item.summary ? ` · ${item.summary}` : ""}
                            </span>
                            <span className="text-foreground">
                              {item.quantity}x {currencyFormatter.format(item.unitPrice)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}



type ReportsCardProps = {

  reports: ReportRow[];

};



function ReportsCard({ reports }: ReportsCardProps) {

  return (

    <Card className="border-border/70">

      <CardHeader>

        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Relatórios</p>

        <CardTitle className="text-xl">Resumo mensal</CardTitle>

      </CardHeader>

      <CardContent>

        {reports.length === 0 ? (

          <p className="text-sm text-muted-foreground">Registre vendas para gerar o relatório automático.</p>

        ) : (

          <div className="rounded-2xl border border-border/60">

            <Table>

              <TableHeader>

                <TableRow>

                  <TableHead>Periodo</TableHead>

                  <TableHead>Certificados</TableHead>

                  <TableHead>Faturamento</TableHead>

                </TableRow>

              </TableHeader>

              <TableBody>

                {reports.map((report) => (

                  <TableRow key={report.label}>

                    <TableCell>{report.label}</TableCell>

                    <TableCell>{report.totalCertificates}</TableCell>

                    <TableCell className="font-semibold">

                      {currencyFormatter.format(report.totalRevenue)}

                    </TableCell>

                  </TableRow>

                ))}

              </TableBody>

            </Table>

          </div>

        )}

      </CardContent>

    </Card>

  );

}



type CertificateModelFormProps = {

  onCreated: (model: DashboardModel) => void;

};



function CertificateModelForm({ onCreated }: CertificateModelFormProps) {

  const [isPending, startTransition] = useTransition();

  const [certificateSlug, setCertificateSlug] = useState(

    CERTIFICATE_TEMPLATES[0]?.slug ?? "batismo",

  );



  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {

    event.preventDefault();

    const form = event.currentTarget;

    const formData = new FormData(form);



    const template = CERTIFICATE_TEMPLATES.find((item) => item.slug === certificateSlug);

    if (!template) {

      toast.error("Selecione um modelo base.");

      return;

    }



    const backgroundImage = formData.get("backgroundImage");

    if (!(backgroundImage instanceof File) || backgroundImage.size === 0) {

      toast.error("Envie uma imagem de fundo.");

      return;

    }



    const displayDate = new Intl.DateTimeFormat("pt-BR", {

      day: "2-digit",

      month: "short",

      year: "numeric",

    }).format(new Date());



    formData.set("certificateSlug", certificateSlug);

    formData.set("name", `${template.title} - Fundo ${displayDate}`);

    formData.set("slug", `${template.slug}-${Date.now().toString(36)}`);

    formData.set("category", template.title);

    formData.set("description", `Fundo atualizado automaticamente em ${displayDate}.`);

    formData.set("previewImage", backgroundImage, backgroundImage.name);



    startTransition(async () => {

      try {

        const response = await fetch("/api/admin/certificate-models", {

          method: "POST",

          body: formData,

        });



        if (!response.ok) {

          const payload = await response.json().catch(() => ({}));

          throw new Error(payload.message || "Nao foi possivel criar o modelo.");

        }



        const payload = await response.json();

        onCreated(payload.model);

        form.reset();

        toast.success("Fundo salvo com sucesso!");

      } catch (error) {

        console.error(error);

        toast.error(error instanceof Error ? error.message : "Falha ao salvar o fundo.");

      }

    });

  }



  return (

    <Card className="border-border/70">

      <CardHeader>

        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Personalização</p>

        <CardTitle className="text-xl">Atualizar fundo do certificado</CardTitle>

        <p className="text-sm text-muted-foreground">

          Escolha o modelo pronto e envie apenas a imagem de fundo. Os textos e logos permanecem iguais.

        </p>

      </CardHeader>

      <CardContent>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input type="hidden" name="certificateSlug" value={certificateSlug} />

          <div className="space-y-2">

            <Label>Modelo base</Label>

            <Select value={certificateSlug} onValueChange={setCertificateSlug} disabled={isPending}>

              <SelectTrigger className="w-full">

                <SelectValue placeholder="Selecione o certificado" />

              </SelectTrigger>

              <SelectContent>

                {CERTIFICATE_TEMPLATES.map((template) => (

                  <SelectItem key={template.slug} value={template.slug}>

                    {template.title}

                  </SelectItem>

                ))}

              </SelectContent>

            </Select>

          </div>

          <div className="space-y-2">

            <Label htmlFor="background-image">Foto de fundo</Label>

            <Input

              id="background-image"

              type="file"

              name="backgroundImage"

              accept="image/*"

              required

              disabled={isPending}

            />

            <p className="text-xs text-muted-foreground">

              Recomendamos imagens A4 horizontal (3508 x 2480 px) em 300 DPI para melhor qualidade no PDF.

            </p>

          </div>

          <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-xs text-primary/80">

            Os textos e logos dos certificados permanecem originais. Apenas o fundo enviado será aplicado ao modelo

            selecionado.

          </div>

          <Button type="submit" className="w-full" disabled={isPending}>

            {isPending ? "Salvando..." : "Salvar fundo"}

          </Button>

        </form>

      </CardContent>

    </Card>

  );

}



type ModelCardProps = {

  model: DashboardModel;

  onUpdated: (model: DashboardModel) => void;

  onDeleted: (id: string) => void;

};



function ModelCard({ model, onUpdated, onDeleted }: ModelCardProps) {

  const createdAt = dateFormatter.format(new Date(model.createdAt));

  const accentStyle = model.accentColor

    ? {

        backgroundColor: model.accentColor,

      }

    : undefined;

  const [isEditOpen, setIsEditOpen] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const [imageError, setImageError] = useState(false);



  useEffect(() => {

    setImageError(false);

  }, [model.previewImage, model.backgroundImage]);



  const previewSrc = imageError ? null : model.previewImage || model.backgroundImage || null;



  async function handleDelete() {

    if (!window.confirm(`Deseja remover o modelo "${model.name}"?`)) {

      return;

    }

    setIsDeleting(true);

    try {

      const response = await fetch(`/api/admin/certificate-models?id=${model.id}`, {

        method: "DELETE",

      });

      if (!response.ok) {

        const payload = await response.json().catch(() => ({}));

        throw new Error(payload.message || "Nao foi possivel remover o modelo.");

      }

      onDeleted(model.id);

      toast.success("Modelo removido.");

    } catch (error) {

      console.error(error);

      toast.error(error instanceof Error ? error.message : "Falha ao remover o modelo.");

    } finally {

      setIsDeleting(false);

    }

  }



  return (

    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 p-4">

      <div className="relative h-40 w-full overflow-hidden rounded-xl border border-border/50 bg-muted">

        {previewSrc ? (

          <Image

            src={previewSrc}

            alt={`Preview do modelo ${model.name}`}

            fill

            sizes="320px"

            className="object-cover"

            onError={() => setImageError(true)}

          />

        ) : (

          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">

            Sem imagem de preview

          </div>

        )}

        <div className="absolute right-2 top-2 flex gap-1 rounded-full bg-background/80 p-1 shadow-sm backdrop-blur">

          <Button

            type="button"

            size="icon"

            variant="ghost"

            className="h-8 w-8"

            onClick={() => setIsEditOpen(true)}

            title="Editar fundo"

          >

            <PencilLine className="h-4 w-4" />

          </Button>

          <Button

            type="button"

            size="icon"

            variant="ghost"

            className="h-8 w-8 text-destructive hover:text-destructive"

            onClick={handleDelete}

            disabled={isDeleting}

            title="Excluir modelo"

          >

            <Trash2 className="h-4 w-4" />

          </Button>

        </div>

      </div>

      <div>

        <p className="text-sm font-semibold text-foreground">{model.name}</p>

        <p className="text-xs text-muted-foreground">

          {model.category || "Sem categoria"} · {model.certificateSlug}

        </p>

      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">

        {model.backgroundImage ? (

          <span className="rounded-full bg-muted px-2 py-1">Fundo</span>

        ) : null}

        {model.topBorderImage ? <span className="rounded-full bg-muted px-2 py-1">Topo</span> : null}

        {model.bottomBorderImage ? <span className="rounded-full bg-muted px-2 py-1">Base</span> : null}

        {model.accentColor ? (

          <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-1">

            <span className="h-3 w-3 rounded-full" style={accentStyle} />

            {model.accentColor}

          </span>

        ) : null}

      </div>

      <p className="line-clamp-2 text-xs text-muted-foreground">{model.description || "Sem descrição."}</p>

      <div className="flex items-center justify-between text-xs text-muted-foreground">

        <span>{model.isActive ? "Ativo" : "Inativo"}</span>

        <span>{createdAt}</span>

      </div>

      <EditModelDialog model={model} open={isEditOpen} onOpenChange={setIsEditOpen} onUpdated={onUpdated} />

    </div>

  );

}



type EditModelDialogProps = {

  model: DashboardModel;

  open: boolean;

  onOpenChange: (open: boolean) => void;

  onUpdated: (model: DashboardModel) => void;

};



function EditModelDialog({ model, open, onOpenChange, onUpdated }: EditModelDialogProps) {

  const [isSubmitting, setIsSubmitting] = useState(false);



  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {

    event.preventDefault();

    const form = event.currentTarget;

    const formData = new FormData(form);

    const backgroundImage = formData.get("backgroundImage");



    if (!(backgroundImage instanceof File) || backgroundImage.size === 0) {

      toast.error("Envie a nova imagem do fundo.");

      return;

    }



    setIsSubmitting(true);

    try {

      const response = await fetch("/api/admin/certificate-models", {

        method: "PATCH",

        body: formData,

      });



      if (!response.ok) {

        const payload = await response.json().catch(() => ({}));

        throw new Error(payload.message || "Nao foi possivel atualizar o modelo.");

      }



      const payload = await response.json();

      onUpdated(payload.model);

      form.reset();

      onOpenChange(false);

      toast.success("Fundo atualizado!");

    } catch (error) {

      console.error(error);

      toast.error(error instanceof Error ? error.message : "Falha ao atualizar o modelo.");

    } finally {

      setIsSubmitting(false);

    }

  }



  return (

    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent>

        <DialogHeader>

          <DialogTitle>Editar fundo</DialogTitle>

          <DialogDescription>

            Substitua o fundo do modelo <span className="font-semibold text-foreground">{model.name}</span>. Os textos

            permanecem iguais.

          </DialogDescription>

        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>

          <input type="hidden" name="modelId" defaultValue={model.id} />

          <div className="space-y-2">

            <Label htmlFor={`edit-background-${model.id}`}>Nova foto de fundo</Label>

            <Input

              id={`edit-background-${model.id}`}

              type="file"

              name="backgroundImage"

              accept="image/*"

              required

              disabled={isSubmitting}

            />

            <p className="text-xs text-muted-foreground">

              Use imagens A4 horizontal (3508 x 2480 px) em 300 DPI para manter a qualidade.

            </p>

          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>

            {isSubmitting ? "Atualizando..." : "Salvar alterações"}

          </Button>

        </form>

      </DialogContent>

    </Dialog>

  );

}



function sortUsers(users: DashboardUser[]) {

  return [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

}



function sortModels(models: DashboardModel[]) {

  return [...models].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

}



type CreateEmployeeDialogProps = {

  open: boolean;

  onOpenChange: (open: boolean) => void;

  onCreated: (user: DashboardUser) => void;

};



function CreateEmployeeDialog({ open, onOpenChange, onCreated }: CreateEmployeeDialogProps) {

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);



  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {

    event.preventDefault();

    setError(null);

    const form = event.currentTarget;

    const formData = new FormData(form);

    const payload = {

      name: (formData.get("employeeName") ?? "").toString().trim(),

      email: (formData.get("employeeEmail") ?? "").toString().trim().toLowerCase(),

      password: (formData.get("employeePassword") ?? "").toString(),

      confirmPassword: (formData.get("employeePasswordConfirm") ?? "").toString(),

    };

    if (payload.password.length < 8) {
      setError("A senha temporaria deve ter pelo menos 8 caracteres.");
      return;
    }

    if (payload.password !== payload.confirmPassword) {
      setError("As senhas informadas nao conferem.");
      return;
    }



    setIsSubmitting(true);

    try {

      const response = await fetch("/api/admin/users", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          password: payload.password,
        }),

      });



      if (!response.ok) {

        const data = await response.json().catch(() => ({}));

        throw new Error(data.message || "Nao foi possivel criar o funcionario.");

      }



      const { user } = await response.json();

      onCreated(user);

      form.reset();

    } catch (err) {

      console.error(err);

      setError(err instanceof Error ? err.message : "Nao foi possivel criar o funcionario.");

    } finally {

      setIsSubmitting(false);

    }

  }



  return (

    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent>

        <DialogHeader>

          <DialogTitle>Novo funcionário</DialogTitle>

          <DialogDescription>Informe os dados para liberar um funcionário no painel.</DialogDescription>

        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>

          <div className="space-y-2">

            <Label htmlFor="employeeName">Nome</Label>

            <Input id="employeeName" name="employeeName" placeholder="Nome completo" required disabled={isSubmitting} />

          </div>

          <div className="space-y-2">

            <Label htmlFor="employeePassword">Senha temporaria</Label>

            <Input

              id="employeePassword"

              name="employeePassword"

              type="password"

              minLength={8}

              placeholder="Minimo 8 caracteres"

              required

              disabled={isSubmitting}

            />

          </div>

          <div className="space-y-2">

            <Label htmlFor="employeePasswordConfirm">Confirmar senha</Label>

            <Input

              id="employeePasswordConfirm"

              name="employeePasswordConfirm"

              type="password"

              minLength={8}

              placeholder="Repita a senha"

              required

              disabled={isSubmitting}

            />

          </div>

          <p className="text-xs text-muted-foreground">

            Compartilhe a senha temporaria com o funcionario. No primeiro acesso ele precisara definir uma nova senha.

          </p>

          <div className="space-y-2">

            <Label htmlFor="employeeEmail">Email</Label>

            <Input

              id="employeeEmail"

              name="employeeEmail"

              type="email"

              placeholder="nome@igreja.com"

              required

              disabled={isSubmitting}

            />

          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>

            {isSubmitting ? "Criando..." : "Cadastrar funcionário"}

          </Button>

        </form>

      </DialogContent>

    </Dialog>

  );

}



