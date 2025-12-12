"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type Mode = "login" | "signup";

export function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/certificados";

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actionLabel = mode === "login" ? "Entrar" : "Criar conta";

  const disabled = submitting || !email || !password || (mode === "signup" && !name);

  const authDescription = useMemo(
    () =>
      mode === "login"
        ? "Acesse com email e senha ou continue com o Google para salvar certificados no carrinho."
        : "Crie sua conta para salvar certificados, manter o carrinho e pagar pelo total em centavos.",
    [mode],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { data, error: signInError } = await authClient.signIn.email({
        email,
        password,
        name: mode === "signup" ? name : undefined,
        callbackURL: redirectTo,
      });

      if (signInError) {
        throw new Error(signInError.message || "Nao foi possivel autenticar. Tente novamente.");
      }

      const url = data?.url || redirectTo;
      router.push(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao autenticar.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setSubmitting(true);
    setError(null);
    try {
      const { data, error: signInError } = await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectTo,
      });
      if (signInError) {
        throw new Error(signInError.message || "Nao foi possivel autenticar com Google.");
      }
      if (data?.url) {
        window.location.href = data.url;
      } else {
        router.push(redirectTo);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao autenticar com Google.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-5xl flex-col gap-10 px-6 py-12 md:px-10 lg:px-16">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/70">Acesso</p>
        <h1 className="text-3xl font-bold text-foreground">Entrar ou criar conta</h1>
        <p className="text-sm text-muted-foreground">{authDescription}</p>
      </header>

      <div className="grid gap-6 md:grid-cols-[1.1fr,0.9fr] md:items-start">
        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle>{actionLabel}</CardTitle>
            <CardDescription>
              Autenticacao com Better Auth. Email/senha e Google. Banco em memoria e Prisma como ORM.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2 text-sm">
              <Button
                type="button"
                variant={mode === "login" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setMode("login")}
              >
                Ja tenho conta
              </Button>
              <Button
                type="button"
                variant={mode === "signup" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setMode("signup")}
              >
                Criar conta
              </Button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Nome completo"
                    autoComplete="name"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="border-0 px-0 focus-visible:ring-0"
                    placeholder="seu@email.com"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="border-0 px-0 focus-visible:ring-0"
                    placeholder="Minimo 8 caracteres"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                </div>
              </div>

              {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={disabled}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...
                  </>
                ) : (
                  <>
                    {actionLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="flex items-center gap-2">
              <span className="h-px flex-1 bg-border" aria-hidden />
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Ou</span>
              <span className="h-px flex-1 bg-border" aria-hidden />
            </div>

            <Button type="button" variant="outline" className="w-full" onClick={handleGoogle}>
              <Sparkles className="mr-2 h-4 w-4" />
              Continuar com Google
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed border-border/60 bg-muted/40">
          <CardHeader>
            <CardTitle>Resumo do carrinho pago</CardTitle>
            <CardDescription>
              Valores em centavos. Ao finalizar, cobramos o total conforme a faixa de quantidade.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              1 a 10 certificados: R$ 2,50 cada (250 centavos)
            </p>
            <p className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              11 a 50 certificados: R$ 2,00 cada (200 centavos)
            </p>
            <p className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              51+ certificados: R$ 1,80 cada (180 centavos)
            </p>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="flex items-center gap-2 font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Sugestao inteligente
              </p>
              <p className="mt-1 text-xs">
                Se faltar 1 certificado para mudar de faixa, avisamos para voce aproveitar o desconto.
              </p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background px-3 py-2">
              <p className="text-xs uppercase tracking-[0.3em] text-primary/70">Fluxo</p>
              <ul className="mt-2 space-y-1">
                <li>1. Logar para associar certificados ao carrinho.</li>
                <li>2. Criar certificados; cada PDF concluido entra no carrinho.</li>
                <li>3. Ao finalizar, cobramos o total calculado em centavos.</li>
              </ul>
            </div>
            <p className="text-xs text-muted-foreground">
              Usa banco em memoria por enquanto (MVP). Prisma fica pronto para persistir depois.
            </p>
            <Link href="/certificados" className="inline-flex items-center text-sm font-semibold text-primary hover:underline">
              Voltar para certificados
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
