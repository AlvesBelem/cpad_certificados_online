import { redirect } from "next/navigation";
import { AdminDashboard } from "./_components/admin-dashboard";
import { getAdminDashboardData } from "@/lib/admin-dashboard";
import { requireSession } from "@/lib/session";
import { normalizeRole, UserRole } from "@/lib/roles";

export const metadata = {
  title: "Painel administrativo",
};

export default async function AdminPage() {
  const session = await requireSession();
  if (normalizeRole(session.user.role) !== UserRole.ADMIN) {
    redirect("/certificados");
  }

  const data = await getAdminDashboardData();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-0">
      <div className="mb-8 flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">Painel</p>
        <h1 className="text-3xl font-semibold text-foreground">Central administrativa</h1>
        <p className="text-sm text-muted-foreground">
          Monitoramento em tempo real das vendas de certificados, gestao de clientes, funcionarios e biblioteca de
          modelos.
        </p>
      </div>
      <AdminDashboard data={data} adminName={session.user.name ?? session.user.email ?? "Administrador"} />
    </main>
  );
}
