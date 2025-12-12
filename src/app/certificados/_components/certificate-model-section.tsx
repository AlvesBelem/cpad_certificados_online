"use client";

import Image from "next/image";
import { ReactNode } from "react";
import { useCertificateModels } from "@/hooks/use-certificate-models";
import { CertificateModelProvider } from "@/contexts/certificate-model-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CertificateModelSectionProps = {
  certificateSlug: string;
  defaultPreview?: string;
  children: ReactNode;
};

const FALLBACK_PREVIEW = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg width="320" height="240" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#E5E7EB" rx="16"/>
    <text x="50%" y="50%" text-anchor="middle" font-size="18" font-family="sans-serif" fill="#94A3B8">
      Prévia indisponível
    </text>
  </svg>`,
)}`;

export function CertificateModelSection({ certificateSlug, defaultPreview, children }: CertificateModelSectionProps) {
  const defaultOption = {
    id: "default",
    name: "Modelo original",
    previewImage: defaultPreview ?? FALLBACK_PREVIEW,
    isDefault: true,
  };

  const { options, selectedId, selectModel, selectedModel, isLoading, error } = useCertificateModels(
    certificateSlug,
    defaultOption,
  );

  return (
    <div className="space-y-4">
      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Modelos de fundo</p>
          <CardTitle className="text-lg">Escolha o fundo para este certificado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="grid gap-4 md:grid-cols-3">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                className={cn(
                  "flex flex-col gap-2 rounded-2xl border p-2 transition",
                  selectedId === option.id ? "border-primary bg-primary/5" : "border-border/60 bg-background/60",
                )}
                onClick={() => selectModel(option.id)}
                disabled={isLoading}
              >
                <div className="relative h-32 w-full overflow-hidden rounded-xl border border-border/60 bg-muted">
                  <Image
                    src={option.previewImage || FALLBACK_PREVIEW}
                    alt={`Pr?via ${option.name}`}
                    fill
                    sizes="320px"
                    className="object-cover"
                    unoptimized
                    onError={(event) => {
                      const target = event.currentTarget as HTMLImageElement;
                      if (target.src !== FALLBACK_PREVIEW) {
                        target.src = FALLBACK_PREVIEW;
                      }
                    }}
                  />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">{option.name}</p>
                  {option.isDefault ? (
                    <p className="text-xs text-muted-foreground">Mantém o layout original</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Modelo personalizado</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      <CertificateModelProvider value={selectedModel.isDefault ? null : selectedModel}>{children}</CertificateModelProvider>
    </div>
  );
}
