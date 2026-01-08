import { requireSession } from "@/lib/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "./password-form";

type PageProps = {
  searchParams?: {
    redirect?: string;
  };
};

export default async function ChangePasswordPage({ searchParams }: PageProps) {
  const session = await requireSession();
  const redirectTo =
    typeof searchParams?.redirect === "string" && searchParams.redirect.trim()
      ? searchParams.redirect
      : "/certificados";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12 md:px-10 lg:px-16">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">Segurança</p>
        <h1 className="text-2xl font-semibold text-foreground">Alterar senha</h1>
        <p className="text-sm text-muted-foreground">
          {session.user.mustChangePassword
            ? "Defina uma nova senha para continuar usando o painel."
            : "Atualize sua senha sempre que precisar manter a conta segura."}
        </p>
      </div>

      <Card className="border-border/60 bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle>Senha de acesso</CardTitle>
          <CardDescription>Informe a senha atual e escolha uma nova senha forte.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm redirectTo={redirectTo} forcing={session.user.mustChangePassword ?? false} />
        </CardContent>
      </Card>
    </main>
  );
}
