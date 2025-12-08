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
  totalRevenue: number;
  orders: number;
  certificates: number;
};

export type ReportRow = {
  label: string;
  totalRevenue: number;
  totalCertificates: number;
};

export type AdminDashboardData = {
  totals: {
    totalRevenue: number;
    totalCertificates: number;
    totalOrders: number;
    activeModels: number;
    clients: number;
  };
  paymentBreakdown: PaymentBreakdown[];
  reports: ReportRow[];
  clients: DashboardUser[];
  employees: DashboardUser[];
  models: DashboardModel[];
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
    }),
    prisma.certificateModel.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: UserRole.USER },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: UserRole.EMPLOYEE },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalRevenue = orders.reduce((total, order) => total + order.totalAmountInCents / 100, 0);
  const totalCertificates = orders.reduce((total, order) => total + order.quantity, 0);

  const paymentMap = new Map<string, PaymentBreakdown>();
  orders.forEach((order) => {
    const method = order.paymentMethod || "INDIFERENTE";
    const entry = paymentMap.get(method) ?? {
      method,
      totalRevenue: 0,
      orders: 0,
      certificates: 0,
    };
    entry.totalRevenue += order.totalAmountInCents / 100;
    entry.orders += 1;
    entry.certificates += order.quantity;
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

  orders.forEach((order) => {
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
      activeModels: models.filter((model) => model.isActive).length,
      clients: clients.length,
    },
    paymentBreakdown: Array.from(paymentMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue),
    reports,
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
