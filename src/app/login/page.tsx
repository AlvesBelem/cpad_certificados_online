import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginContent } from "./login-content";

function LoginPageFallback() {
  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-5xl items-center justify-center px-6 py-12 md:px-10 lg:px-16">
      <div className="rounded-2xl border border-dashed border-border/60 bg-card/70 px-6 py-10 text-center text-sm text-muted-foreground">
        Carregando formulario de login...
      </div>
    </main>
  );
}

export default async function LoginPage() {
  const session = await getSession();
  if (session?.user) {
    redirect("/certificados");
  }
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginContent />
    </Suspense>
  );
}
