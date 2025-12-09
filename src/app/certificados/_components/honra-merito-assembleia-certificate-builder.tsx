"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CertificatePreview } from "@/components/certificates/CertificatePreview";
import { CertificateForm } from "@/app/certificados/_components/CertificateForm";
import { useCertificatePDF } from "@/hooks/use-certificate-pdf";
import { useCertificateCartButton } from "@/hooks/use-certificate-cart-button";

const CERTIFICATE_TITLE = "Certificado de Honra ao Mérito (Assembleia)";
const CERTIFICATE_SLUG = "honra-merito-assembleia";

type Campos = {
  igreja: string;
  congregacao: string;
  nomeHomenageado: string;
  pastor: string;
  data: string;
  cidade: string;
  observacao: string;
};

const REQUIRED_FIELDS: (keyof Campos)[] = ["nomeHomenageado", "pastor", "igreja", "congregacao"];

const MEDAL_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
      <defs>
        <linearGradient id='g1' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stop-color='#fbbf24'/>
          <stop offset='100%' stop-color='#b45309'/>
        </linearGradient>
      </defs>
      <circle cx='100' cy='100' r='90' fill='url(#g1)' stroke='#8b5a00' stroke-width='8'/>
      <circle cx='100' cy='100' r='60' fill='#0f172a' stroke='#fcd34d' stroke-width='8'/>
      <text x='50%' y='55%' font-size='28' font-family='serif' font-weight='bold' fill='#fcd34d' text-anchor='middle'>HONRA</text>
      <text x='50%' y='75%' font-size='20' font-family='serif' font-weight='bold' fill='#fcd34d' text-anchor='middle'>MÉRITO</text>
    </svg>`,
  );

export function HonraMeritoAssembleiaCertificateBuilder() {
  const [campos, setCampos] = useState<Campos>({
    igreja: "Assembleia de Deus em Belém",
    congregacao: "Congregação Rio Jordão II",
    nomeHomenageado: "Nome do homenageado",
    pastor: "Nome do Pastor",
    data: new Date().toISOString().slice(0, 10),
    cidade: "Cidade/UF",
    observacao: "pelos serviços realizados em prol da obra de Deus.",
  });
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPath, setLogoPath] = useState<string | null>(null);

  const handleChange = (field: keyof Campos) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setCampos((prev) => ({ ...prev, [field]: value }));
  };

  const dataFormatada = useMemo(() => {
    if (!campos.data) return "____/____/______";
    const date = new Date(campos.data);
    if (Number.isNaN(date.getTime())) return campos.data;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  }, [campos.data]);

  const {
    certificateRef,
    isGenerating,
    isShareSupported,
    handleShare,
    handleGeneratePDF,
    capturePreviewImage,
  } = useCertificatePDF({
    fileName: `honra-merito-${campos.nomeHomenageado || "homenageado"}.pdf`,
    title: CERTIFICATE_TITLE,
    text: `Certificado de honra ao mérito para ${campos.nomeHomenageado || "homenageado"}`,
  });

  const { handleAddToCart, isAddingToCart, isReady } = useCertificateCartButton<Campos>({
    slug: CERTIFICATE_SLUG,
    title: CERTIFICATE_TITLE,
    data: campos,
    requiredFields: REQUIRED_FIELDS,
    summary: `${campos.nomeHomenageado} • ${campos.congregacao}`,
    getPreviewImage: capturePreviewImage,
  });

  const logoSrc = logoPath || (logoUrl.trim() || "/igreja.png");

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoPath(URL.createObjectURL(file));
    }
  };

  return (
    <section className="certificate-print-root flex flex-col gap-6 print:block">
      <div className="space-y-6 rounded-3xl border border-border bg-background/70 p-6 shadow-sm print:hidden">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">Dados do certificado</h3>
          <p className="text-sm text-muted-foreground">Preencha os campos dinâmicos conforme a homenagem.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="igreja">Igreja</Label>
            <Input id="igreja" value={campos.igreja} onChange={handleChange("igreja")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="congregacao">Congregação</Label>
            <Input id="congregacao" value={campos.congregacao} onChange={handleChange("congregacao")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nomeHomenageado">Nome da pessoa homenageada</Label>
            <Input id="nomeHomenageado" value={campos.nomeHomenageado} onChange={handleChange("nomeHomenageado")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pastor">Nome do Pastor</Label>
            <Input id="pastor" value={campos.pastor} onChange={handleChange("pastor")} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="data">Data</Label>
            <Input id="data" type="date" value={campos.data} onChange={handleChange("data")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade/UF</Label>
            <Input id="cidade" value={campos.cidade} onChange={handleChange("cidade")} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="observacao">Texto da homenagem</Label>
          <Textarea
            id="observacao"
            rows={3}
            value={campos.observacao}
            onChange={handleChange("observacao")}
            placeholder="pelos serviços realizados em prol da obra de Deus."
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="logoUrl">URL da logo (opcional)</Label>
            <Input
              id="logoUrl"
              value={logoUrl}
              onChange={(event) => setLogoUrl(event.target.value)}
              placeholder="https://exemplo.com/logo.png"
            />
            <p className="text-xs text-muted-foreground">Usamos a logo padrão se este campo estiver vazio.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="logoUpload">Upload da logo (opcional)</Label>
            <Input id="logoUpload" type="file" accept="image/*" onChange={handleLogoUpload} />
            <p className="text-xs text-muted-foreground">PNG/JPG. Se não enviar, usamos a logo padrão.</p>
          </div>
        </div>
        <CertificateForm
          isShareSupported={isShareSupported}
          isGenerating={isGenerating}
          handleShare={handleShare}
          handleGeneratePDF={handleGeneratePDF}
          onAddToCart={handleAddToCart}
          isAddingToCart={isAddingToCart}
          canSubmit={isReady}
          showGenerate={false}
        />
      </div>

      <CertificatePreview
        certificateRef={certificateRef}
        mobileImage="/certificado_discipulado.jpg"
        mobileAlt="Prévia do certificado de honra ao mérito"
        frameColor="#0f172a"
        allowOverflow
      >
        <CertificateInner campos={campos} dataFormatada={dataFormatada} logoSrc={logoSrc} />
      </CertificatePreview>
    </section>
  );
}

type InnerProps = {
  campos: Campos;
  dataFormatada: string;
  logoSrc: string;
};

function CertificateInner({ campos, dataFormatada, logoSrc }: InnerProps) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[32px] bg-white/95 p-8 text-[#0f172a] md:p-10">
      <Decor />
      <header className="relative z-20 flex flex-col items-center gap-4 text-center">
        <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-primary/50 bg-white/90 shadow-md">
          <Image
            src={logoSrc}
            alt="Logo"
            fill
            sizes="64px"
            className="object-contain rounded-full"
            priority
            onError={(event) => {
              const target = event.currentTarget as HTMLImageElement;
              if (target.src !== "http://localhost/igreja.png" && !target.src.endsWith("/igreja.png")) {
                target.src = "/igreja.png";
              }
            }}
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-primary/80">Certificado</p>
          <h2 className="text-base font-semibold text-[#0f172a]">
            {campos.igreja || "Igreja"} - {campos.congregacao || "Congregação"}
          </h2>
          <p className="text-sm text-[#0f172a]/80">
            na pessoa de seu Pastor, sente-se honrada em conferir a
          </p>
        </div>
        <h1 className="text-center text-3xl font-bold uppercase text-[#0f172a] md:text-4xl">
          {campos.nomeHomenageado || "Nome do homenageado"}
        </h1>
      </header>

      <main className="relative z-20 mt-8 flex flex-col items-center gap-4 text-center text-lg leading-relaxed text-[#0f172a] md:text-xl">
        <p className="max-w-3xl">
          este certificado {campos.observacao || "pelos serviços realizados em prol da obra de Deus."}
        </p>
        <p className="text-base text-[#0f172a]/80">
          {campos.cidade || "Cidade/UF"}, {dataFormatada}
        </p>
      </main>

      <footer className="relative z-20 mt-10 grid gap-8 text-center text-sm uppercase tracking-[0.25em] text-[#0f172a]/80 md:grid-cols-2">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-40 border-b-2 border-[#0f172a]/60" aria-hidden="true" />
          <div className="space-y-1 text-[#0f172a]">
            <p className="text-base font-semibold tracking-normal text-[#0f172a]">{campos.pastor || "Pastor"}</p>
            <p className="text-xs uppercase tracking-[0.3em] text-[#0f172a]/70">Pastor</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-40 border-b-2 border-[#0f172a]/60" aria-hidden="true" />
          <div className="space-y-1 text-[#0f172a]">
            <p className="text-base font-semibold tracking-normal text-[#0f172a]">
              {campos.nomeHomenageado || "Homenageado"}
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-[#0f172a]/70">Homenageado(a)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Decor() {
  return (
    <>
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#223d8f] via-[#2b4fa8] to-[#f3f4ff] opacity-90" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.2),transparent_45%),radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.14),transparent_40%)]" />
      <div className="absolute inset-0 z-10 opacity-70">
        <div className="absolute -left-10 top-0 h-full w-56 rotate-[12deg] bg-gradient-to-b from-[#f59e0b] via-[#fbbf24] to-[#b45309] blur-[1px]" />
        <div className="absolute -left-2 top-0 h-full w-52 rotate-[-8deg] bg-gradient-to-b from-[#fde68a] via-[#f59e0b] to-[#92400e] mix-blend-screen opacity-90 blur-[1px]" />
      </div>
    </>
  );
}
