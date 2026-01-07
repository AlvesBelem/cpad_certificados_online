"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function MustChangePasswordGuard() {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!session?.user) return;
    if (!session.user.mustChangePassword) return;
    if (pathname?.startsWith("/alterar-senha")) return;
    const target = pathname && pathname !== "/alterar-senha" ? pathname : "/certificados";
    router.replace(`/alterar-senha?redirect=${encodeURIComponent(target)}`);
  }, [pathname, router, session?.user?.mustChangePassword]);

  return null;
}
