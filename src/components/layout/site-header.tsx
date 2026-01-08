"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartContext } from "@/components/cart/cart-provider";
import { useCartSheet } from "@/components/cart/cart-sheet-context";
import { cn } from "@/lib/utils";
import { normalizeRole, UserRole } from "@/lib/roles";
import { authClient } from "@/lib/auth-client";

const baseNavLinks = [{ href: "/certificados", label: "Modelos" }];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { formatted } = useCartContext();
  const { openCart } = useCartSheet();
  const { data: session } = authClient.useSession();
  const [signingOut, setSigningOut] = useState(false);

  const itemCount = formatted?.pricing.totalQuantity ?? 0;
  const user = session?.user;
  const displayName = user?.name || user?.email || "Usuario";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const handleLogout = async () => {
    try {
      setSigningOut(true);
      await authClient.signOut();
      toast.success("Voce saiu da conta.");
      router.replace("/login");
    } catch (error) {
      console.error("Erro ao sair:", error);
      toast.error("Nao foi possivel sair. Tente novamente.");
    } finally {
      setSigningOut(false);
    }
  };

  const userRole = (user as { role?: string } | undefined)?.role;

  const normalizedRole = normalizeRole(userRole);

  const links = useMemo(() => {
    const items = [...baseNavLinks];
    if (normalizedRole === UserRole.USUARIO) {
      items.push({ href: "/billing/pedidos", label: "Pedidos" });
    }
    if (normalizedRole === UserRole.ADMIN) {
      items.push({ href: "/admin", label: "Admin" });
    }
    return items;
  }, [normalizedRole]);

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 md:px-10 lg:px-16">
        <Link href="/" className="text-base font-semibold tracking-tight text-foreground">
          AdiGreja Certificados
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition hover:text-foreground",
                pathname?.startsWith(item.href) ? "text-foreground" : undefined,
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => openCart()}
            aria-label="Abrir carrinho"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-background">
                {itemCount}
              </span>
            ) : null}
          </Button>
          {user ? (
            <div className="flex items-center gap-3 rounded-full border border-border/70 bg-card/70 px-3 py-1">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                aria-hidden
              >
                {initials || "US"}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold text-foreground">{displayName}</span>
                {user.email ? <span className="text-xs text-muted-foreground">{user.email}</span> : null}
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                disabled={signingOut}
              >
                <LogOut className="h-4 w-4" />
                {signingOut ? "Saindo..." : "Sair"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
