"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

function hasMustChangePassword(user: unknown): user is { mustChangePassword?: boolean } {
  return Boolean(user && typeof user === "object" && "mustChangePassword" in user);
}

export function MustChangePasswordGuard() {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();
  const sessionUser = session?.user;
  const mustChangePassword = hasMustChangePassword(sessionUser) && Boolean(sessionUser?.mustChangePassword);

  useEffect(() => {
    if (!sessionUser || !mustChangePassword) return;
    if (pathname?.startsWith("/alterar-senha")) return;
    const target = pathname && pathname !== "/alterar-senha" ? pathname : "/certificados";
    router.replace(`/alterar-senha?redirect=${encodeURIComponent(target)}`);
  }, [mustChangePassword, pathname, router, sessionUser]);

  return null;
}
