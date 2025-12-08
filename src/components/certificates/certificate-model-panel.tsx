"use client";

import Image from "next/image";
import { useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CERTIFICATE_TEMPLATES } from "@/constants/certificates";
import { CertificateModelProvider } from "@/contexts/certificate-model-context";
import { useCertificateModels } from "@/hooks/use-certificate-models";
import { cn } from "@/lib/utils";

type CertificateModelControllerProps = {
  children: ReactNode;
};

const PLACEHOLDER_PREVIEW = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg width="320" height="240" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#E5E7EB" rx="16"/>
    <text x="50%" y="50%" text-anchor="middle" font-size="18" font-family="sans-serif" fill="#94A3B8">
      Prévia indisponível
    </text>
  </svg>`,
)}`;

export function CertificateModelController({ children }: CertificateModelControllerProps) {
  const pathname = usePathname();
  const slug = useMemo(() => {
    if (!pathname?.startsWith("/certificados/")) {
      return null;
    }
    const segments = pathname.split("/").filter(Boolean);
    const routeSlug = segments[1];
    if (!routeSlug || routeSlug.startsWith("(")) {
      return null;
    }
    return routeSlug;
  }, [pathname]);

  const template = CERTIFICATE_TEMPLATES.find((item) => item.slug === slug);

  const defaultOption = useMemo(
    () => ({
      id: "default",
      name: "Modelo original",
      previewImage: template?.preview ?? PLACEHOLDER_PREVIEW,
      backgroundImage: template?.preview ?? PLACEHOLDER_PREVIEW,
      isDefault: true,
    }),
    [template],
  );

  const { options, selectedId, selectModel, selectedModel, isLoading, error } = useCertificateModels(
    slug,
    defaultOption,
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const providerValue = selectedModel && !selectedModel.isDefault ? selectedModel : null;

  return (
    <CertificateModelProvider value={providerValue}>
      {children}
      {slug ? (
        <>
          <aside
            className={cn(
              "fixed top-24 left-4 z-40 h-[70vh] w-72 max-w-[85vw] transition-all duration-300 print:hidden",
              isSidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-[calc(100%-48px)] opacity-70",
            )}
          >
            <div className="pointer-events-auto flex h-full flex-col rounded-2xl border border-border bg-card/95 shadow-2xl">
              <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">Modelos</p>
                  <p className="text-xs text-muted-foreground">
                    {options.length > 0 ? options.length - 1 : 0} personalizados
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground"
                  onClick={() => setIsSidebarOpen((open) => !open)}
                  aria-label={isSidebarOpen ? "Recolher galeria" : "Expandir galeria"}
                >
                  {isSidebarOpen ? <ChevronsLeft className="h-4 w-4" /> : <ChevronsRight className="h-4 w-4" />}
                </Button>
              </div>
            {error ? <p className="px-4 pt-3 text-sm text-destructive">{error}</p> : null}
              <div className="flex-1 overflow-y-auto px-3 py-3">
                <div className="space-y-3">
                  {options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={cn(
                        "flex w-full flex-col gap-2 rounded-xl border p-2 text-left text-sm transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                        selectedId === option.id
                          ? "border-primary bg-primary/10 text-foreground shadow-sm"
                          : "border-border/60 bg-background text-muted-foreground",
                      )}
                      onClick={() => selectModel(option.id)}
                      disabled={isLoading}
                    >
                      <div className="relative h-28 w-full overflow-hidden rounded-lg border border-border/60 bg-muted">
                        <Image
                          src={option.previewImage || option.backgroundImage || PLACEHOLDER_PREVIEW}
                          alt={`Prévia ${option.name}`}
                          fill
                          sizes="200px"
                          className="object-cover"
                          priority={false}
                          onError={(event) => {
                            const target = event.currentTarget as HTMLImageElement;
                            if (target.src !== PLACEHOLDER_PREVIEW) {
                              target.src = PLACEHOLDER_PREVIEW;
                            }
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{option.name}</p>
                        <p className="text-xs">
                          {option.isDefault ? "Layout original" : "Modelo personalizado"}
                        </p>
                      </div>
                    </button>
                  ))}
                  {options.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nenhum modelo disponível.</p>
                  ) : null}
                </div>
              </div>
            </div>
          </aside>
          {!isSidebarOpen ? (
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="fixed bottom-6 right-4 z-30 h-10 w-10 rounded-full shadow-lg print:hidden md:top-24 md:right-4"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Abrir galeria de modelos"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          ) : null}
        </>
      ) : null}
    </CertificateModelProvider>
  );
}
