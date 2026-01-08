import { prisma } from "@/lib/prisma";
import { normalizeRole, UserRole } from "@/lib/roles";

export type DashboardUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export type DashboardModel = {
  id: string;
  name: string;
  slug: string;
  certificateSlug: string;
  description?: string | null;
  category?: string | null;
  previewImage?: string | null;
  backgroundImage?: string | null;
  topBorderImage?: string | null;
  bottomBorderImage?: string | null;
  accentColor?: string | null;
  isActive: boolean;
  createdAt: string;
};

export type PaymentBreakdown = {
  method: string;
  paidRevenue: number;
  paidOrders: number;
  totalOrders: number;
  certificates: number;
  statusCounts: {
    PAID: number;
    PENDING: number;
    CANCELED: number;
    FAILED: number;
    OTHER: number;
  };
};

export type ReportRow = {
  label: string;
  totalRevenue: number;
  totalCertificates: number;
};

export type OrderItemSummary = {
  id: string;
  certificateSlug: string;
  title: string;
  quantity: number;
  unitPrice: number;
  summary?: string | null;
};

export type AdminDashboardData = {
  totals: {
    totalRevenue: number;
    totalCertificates: number;
    totalOrders: number;
    averageTicket: number;
    activeModels: number;
    clients: number;
  };
  paymentBreakdown: PaymentBreakdown[];
  reports: ReportRow[];
  orders: OrderSummary[];
  clients: DashboardUser[];
  employees: DashboardUser[];
  models: DashboardModel[];
};

export type OrderSummary = {
  id: string;
  paymentMethod: string;
  status: string;
  totalAmount: number;
  quantity: number;
  createdAt: string;
  customerEmail: string | null;
  items: OrderItemSummary[];
};

type UserWithRole = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  createdAt: Date;
};

const locale = "pt-BR";

function formatUser(user: UserWithRole): DashboardUser {
  const normalizedRole = normalizeRole(user.role);
  return {
    id: user.id,
    name: user.name || user.email || "Sem nome",
    email: user.email || "sem-email@exemplo.com",
    role: normalizedRole,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [orders, models, clients, employees] = await Promise.all([
    prisma.certificateOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { email: true } },
        items: {
          select: {
            id: true,
            certificateSlug: true,
            title: true,
            quantity: true,
            unitPriceInCents: true,
            summary: true,
          },
        },
      },
    }),
    prisma.certificateModel.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: UserRole.USUARIO },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: UserRole.FUNCIONARIO },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const paidOrders = orders.filter((order) => order.status === "PAID");
  const totalRevenue = paidOrders.reduce((total, order) => total + order.totalAmountInCents / 100, 0);
  const totalCertificates = paidOrders.reduce((total, order) => total + order.quantity, 0);
  const averageTicket = paidOrders.length ? totalRevenue / paidOrders.length : 0;

  const paymentMap = new Map<string, PaymentBreakdown>();

  orders.forEach((order) => {
    const method = (order.paymentMethod || "INDIFERENTE").toUpperCase();
    const entry = paymentMap.get(method) ?? {
      method,
      paidRevenue: 0,
      paidOrders: 0,
      totalOrders: 0,
      certificates: 0,
      statusCounts: { PAID: 0, PENDING: 0, CANCELED: 0, FAILED: 0, OTHER: 0 },
    };

    entry.totalOrders += 1;
    entry.certificates += order.quantity;

    const status = order.status as keyof PaymentBreakdown["statusCounts"];
    if (status === "PAID") {
      entry.paidRevenue += order.totalAmountInCents / 100;
      entry.paidOrders += 1;
    }
    if (entry.statusCounts[status] !== undefined) {
      entry.statusCounts[status] += 1;
    } else {
      entry.statusCounts.OTHER += 1;
    }

    paymentMap.set(method, entry);
  });

  const reportMap = new Map<
    string,
    {
      label: string;
      totalRevenue: number;
      totalCertificates: number;
      timestamp: number;
    }
  >();

  paidOrders.forEach((order) => {
    const year = order.createdAt.getFullYear();
    const month = order.createdAt.getMonth();
    const key = `${year}-${month}`;
    const entry = reportMap.get(key) ?? {
      label: order.createdAt.toLocaleDateString(locale, {
        month: "short",
        year: "numeric",
      }),
      totalRevenue: 0,
      totalCertificates: 0,
      timestamp: new Date(year, month, 1).getTime(),
    };
    entry.totalRevenue += order.totalAmountInCents / 100;
    entry.totalCertificates += order.quantity;
    reportMap.set(key, entry);
  });

  const reports = Array.from(reportMap.values())
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6)
    .map(({ label, totalCertificates: certificates, totalRevenue: revenue }) => ({
      label,
      totalRevenue: revenue,
      totalCertificates: certificates,
    }));

  return {
    totals: {
      totalRevenue,
      totalCertificates,
      totalOrders: orders.length,
      averageTicket,
      activeModels: models.filter((model) => model.isActive).length,
      clients: clients.length,
    },
    paymentBreakdown: Array.from(paymentMap.values()).sort((a, b) => b.paidRevenue - a.paidRevenue),
    reports,
    orders: orders.map((order) => ({
      id: order.id,
      paymentMethod: order.paymentMethod,
      status: order.status,
      totalAmount: order.totalAmountInCents / 100,
      quantity: order.quantity,
      createdAt: order.createdAt.toISOString(),
      customerEmail: order.customer?.email ?? null,
      items: order.items.map((item) => ({
        id: item.id,
        certificateSlug: item.certificateSlug,
        title: item.title,
        quantity: item.quantity,
        unitPrice: item.unitPriceInCents / 100,
        summary: item.summary,
      })),
    })),
    clients: clients.map(formatUser),
    employees: employees.map(formatUser),
    models: models.map((model) => ({
      id: model.id,
      name: model.name,
      slug: model.slug,
      description: model.description,
      category: model.category,
      certificateSlug: model.certificateSlug,
      previewImage: model.previewImage,
      backgroundImage: model.backgroundImage,
      topBorderImage: model.topBorderImage,
      bottomBorderImage: model.bottomBorderImage,
      accentColor: model.accentColor,
      isActive: model.isActive,
      createdAt: model.createdAt.toISOString(),
    })),
  };
}
