"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CertificatePreview } from "@/components/certificates/CertificatePreview";
import { useCertificatePDF } from "@/hooks/use-certificate-pdf";
import { useCartContext } from "@/components/cart/cart-provider";
import { BulkImportPanel } from "@/components/certificates/bulk-import-panel";
import { resolveBulkFields } from "@/components/certificates/bulk-import-fields";
import { useCertificateCartButton } from "@/hooks/use-certificate-cart-button";
import { useBulkCartImport } from "@/hooks/use-bulk-cart-import";
import { CertificateForm } from "./CertificateForm";
import { cn } from "@/lib/utils";
import { useCertificateModelContext } from "@/contexts/certificate-model-context";
import { Button } from "@/components/ui/button";

const DEFAULT_LOGO = "/assets/logos/igreja.png";
const DEFAULT_VERSE = "\"Portanto ide, fazei discípulos de todas as nações, batizando-os em nome do Pai, e do Filho, e do Espírito Santo.\" Mateus 28:19";
const SIGNATURE_LINE = "________________________";

type BuilderProps = {
  igrejaNome: string;
  logoPath?: string | null;
  logoUrl?: string | null;
  certificateSlug?: string;
  certificateTitle?: string;
};

type Campos = {
  nomeBatizando: string;
  dataBatismo: string;
  localBatismo: string;
  cidade: string;
  estado: string;
  nomePastor: string;
  nomeSecretario: string;
  versiculo: string;
};

const BULK_FIELD_KEYS: (keyof Campos)[] = [
  "nomeBatizando",
  "dataBatismo",
  "localBatismo",
  "cidade",
  "estado",
  "nomePastor",
  "nomeSecretario",
  "versiculo",
];

const BULK_FIELDS = resolveBulkFields(BULK_FIELD_KEYS);
const REQUIRED_FIELDS: (keyof Campos)[] = [
  "nomeBatizando",
  "dataBatismo",
  "nomePastor"
];

type CertificateInnerProps = {
  logoSrc: string;
  igrejaNome: string;
  campos: Campos;
  dataFormatada: string;
};

function CertificateInner({ logoSrc, igrejaNome, campos, dataFormatada }: CertificateInnerProps) {
  const certificateModel = useCertificateModelContext();
  const showDefaultWatermark = !certificateModel?.backgroundImage;
  const contentPaddingClass = certificateModel?.backgroundImage
    ? "px-6 py-8 sm:px-8 sm:py-10 lg:px-16 lg:py-14"
    : "px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10";

  return (
    <div className={cn("relative flex h-full flex-col overflow-hidden text-center", contentPaddingClass)}>
      {showDefaultWatermark ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Image
            src="/certificates/batismo/batismo.png"
            alt="Marca d'água de batismo"
            width={650}
            height={1024}
            className="max-h-[90%] max-w-[90%] opacity-30 -translate-y-6"
            priority
          />
        </div>
      ) : null}
      {/* Church identity */}
      <div className="certificate-header flex w-full flex-col items-start gap-6 text-left md:flex-row md:items-center md:gap-10">
        <div className="flex items-center justify-start">
          <div className="relative h-24 w-24 overflow-hidden rounded-3xl border-2 border-primary/30 bg-background shadow-lg">
            <Image src={logoSrc} alt="Logo da igreja" fill sizes="96px" className="object-cover" unoptimized />
            </div>
          </div>
          <div className="certificate-header__info space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.6em] text-primary/70">Igreja</p>
            <p className="text-sm uppercase tracking-[0.4em] text-primary/80">{igrejaNome}</p>
            <h2 className="text-4xl font-serif text-primary">Certificado de Batismo</h2>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.5em] text-primary/60">
              <span className="h-px w-10 bg-primary/30" aria-hidden="true" />
              <span>Batismo cristão</span>
              <span className="h-px w-10 bg-primary/30" aria-hidden="true" />
            </div>
          </div>
        </div>

      {/* Certificate text */}
      <div className="mt-8 flex flex-1 flex-col gap-8 text-left lg:flex-row lg:items-start lg:gap-12">
        <aside className="rounded-3xl bg-primary/10 p-6 lg:w-64 lg:flex-shrink-0">
          <p className="text-xs uppercase tracking-[0.4em] text-primary/60">Versículo</p>
          <div className="mt-3 h-px w-12 bg-primary/40" />
          <blockquote className="mt-4 text-base leading-relaxed text-primary/80">
            {campos.versiculo || DEFAULT_VERSE}
          </blockquote>
        </aside>
        <div className="flex-1 space-y-6 text-lg leading-relaxed text-muted-foreground">
          <p>
            Certificamos que{" "}
            <span className="font-semibold text-foreground">{campos.nomeBatizando || "__________________"}</span>{" "}
            foi batizado(a) em nome do Pai, do Filho e do Espírito Santo, conforme o exemplo do nosso Senhor e Salvador Jesus Cristo.
          </p>
          <p>
            Realizado em{" "}
            <span className="font-semibold text-foreground">{campos.localBatismo || "________"}</span>, cidade de{" "}
            <span className="font-semibold text-foreground">{campos.cidade || "________"}</span>{" "}
            - <span className="font-semibold text-foreground">{campos.estado || "__"}</span>, na data de{" "}
            <span className="font-semibold text-foreground">{dataFormatada}</span>.
          </p>
          <p>
            Registrado na Igreja <span className="font-semibold text-foreground">{igrejaNome}</span> com alegria e gratidão.
          </p>
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-auto grid gap-10 pt-12 text-center text-[11px] uppercase tracking-[0.4em] text-muted-foreground/80 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-semibold tracking-normal text-foreground">{campos.nomeSecretario || "Nome do Secretário(a)"}</p>
          <p className="font-mono text-base tracking-[0.3em] text-foreground/70">{SIGNATURE_LINE}</p>
          <p>Secretário(a)</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold tracking-normal text-foreground">{campos.nomePastor || "Nome do Pastor"}</p>
          <p className="font-mono text-base tracking-[0.3em] text-foreground/70">{SIGNATURE_LINE}</p>
          <p>Pastor</p>
        </div>
      </div>
    </div>
  );
}

export function IgrejaCertificateBuilder({
  igrejaNome,
  logoPath,
  logoUrl,
  certificateSlug,
  certificateTitle,
}: BuilderProps) {
  const createInitialCampos = () => ({
    nomeBatizando: "",
    dataBatismo: "",
    localBatismo: "",
    cidade: "",
    estado: "",
    nomePastor: "",
    nomeSecretario: "",
    versiculo: DEFAULT_VERSE,
  });

  const [campos, setCampos] = useState<Campos>(() => createInitialCampos());

  const pathname = usePathname();
  const resolvedSlug = useMemo(() => {
    if (certificateSlug) return certificateSlug;
    const parts = pathname?.split("/").filter(Boolean);
    return parts?.[parts.length - 1] ?? "certificado";
  }, [certificateSlug, pathname]);

  const resolvedTitle = useMemo(() => {
    if (certificateTitle) return certificateTitle;
    const spaced = resolvedSlug.replace(/-/g, " ");
    const label = spaced.charAt(0).toUpperCase() + spaced.slice(1);
    return label ? `Certificado ${label}` : "Certificado";
  }, [certificateTitle, resolvedSlug]);

  const {
    certificateRef,
    isGenerating,
    isShareSupported,
    handleShare,
    handleGeneratePDF,
    capturePreviewImage,
  } = useCertificatePDF({
    fileName: `certificado-batismo-${campos.nomeBatizando || "membro"}.pdf`,
    title: "Certificado de Batismo",
    text: `Certificado para ${campos.nomeBatizando || "membro"}`,
  });

  const { formatted, error: cartError } = useCartContext();
  const { handleAddToCart, isAddingToCart, isReady } = useCertificateCartButton<Campos>({
    slug: resolvedSlug,
    title: resolvedTitle,
    data: campos,
    requiredFields: REQUIRED_FIELDS,
    summary: campos.nomeBatizando,
    getPreviewImage: capturePreviewImage,
  });
  const {
    bulkCertificateCount,
    hasBulkRows,
    processingBulk,
    handleApplyBulkRow,
    handleRowsChange,
    handleBulkAddToCart,
  } = useBulkCartImport<Campos>({
    campos,
    setCampos,
    handleAddToCart,
    summaryField: "nomeBatizando",
  });

  useEffect(() => {
    if (cartError) {
      toast.error(cartError);
    }
  }, [cartError]);

  const logoSrc = useMemo(() => logoPath || logoUrl || DEFAULT_LOGO, [logoPath, logoUrl]);

  const handleChange = (field: keyof Campos) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCampos((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateAndReset = async () => {
    if (!isReady) {
      toast.error("Preencha todos os campos obrigatorios antes de gerar o PDF.");
      return;
    }
    await handleGeneratePDF();
  };

  const dataFormatada = campos.dataBatismo
    ? new Date(campos.dataBatismo).toLocaleDateString("pt-BR")
    : "____/____/______";

  return (
    <section className="certificate-print-root flex flex-col gap-6 print:block">
      <BulkImportPanel
        certificateSlug={resolvedSlug}
        certificateTitle={resolvedTitle}
        fields={BULK_FIELDS}
        onApplyRow={handleApplyBulkRow}
        onRowsChange={handleRowsChange}
      />
      {hasBulkRows ? (
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-4 shadow-sm">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-foreground">
              {bulkCertificateCount} linha{bulkCertificateCount > 1 ? "s" : ""} importada{bulkCertificateCount > 1 ? "s" : ""}.
            </p>
            <p className="text-xs text-muted-foreground">
              Ao adicionar ao carrinho, consideramos cada linha preenchida como um certificado individual.
            </p>
            <Button type="button" onClick={handleBulkAddToCart} disabled={isAddingToCart || processingBulk}>
              {processingBulk ? "Importando certificados..." : `Adicionar ${bulkCertificateCount} certificado(s) ao carrinho`}
            </Button>
          </div>
        </div>
      ) : null}
      {/* Form container */}
      {!hasBulkRows ? (
      <div className="space-y-6 rounded-3xl border border-border bg-background/70 p-6 shadow-sm print:hidden">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">Dados do certificado</h3>
          <p className="text-sm text-muted-foreground">Preencha o formulário e visualize o certificado abaixo.</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomeBatizando">Nome do batizando</Label>
            <Input id="nomeBatizando" value={campos.nomeBatizando} onChange={handleChange("nomeBatizando")} placeholder="Ex.: João da Silva" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dataBatismo">Data do batismo</Label>
              <Input id="dataBatismo" type="date" value={campos.dataBatismo} onChange={handleChange("dataBatismo")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="localBatismo">Local</Label>
              <Input id="localBatismo" value={campos.localBatismo} onChange={handleChange("localBatismo")} placeholder="Ex.: Rio Jordão" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" value={campos.cidade} onChange={handleChange("cidade")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input id="estado" value={campos.estado} onChange={handleChange("estado")} maxLength={2} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nomePastor">Pastor responsável</Label>
              <Input id="nomePastor" value={campos.nomePastor} onChange={handleChange("nomePastor")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nomeSecretario">Secretário(a)</Label>
              <Input id="nomeSecretario" value={campos.nomeSecretario} onChange={handleChange("nomeSecretario")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="versiculo">Texto lateral</Label>
            <Textarea id="versiculo" value={campos.versiculo} onChange={handleChange("versiculo")} rows={3} />
          </div>
        </div>
        <CertificateForm
          isShareSupported={isShareSupported}
          isGenerating={isGenerating}
          handleShare={handleShare}
          handleGeneratePDF={handleGenerateAndReset}
          onAddToCart={handleAddToCart}
          isAddingToCart={isAddingToCart}
          canSubmit={isReady}
          showGenerate={false}
        />
        {formatted?.pricing && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">
            <div className="flex flex-wrap gap-3">
              <span className="font-semibold text-foreground">
                {formatted.pricing.totalQuantity} certificado(s)
              </span>
              <span className="text-muted-foreground">
                Valor unitario: {formatted.pricing.unitPrice}
              </span>
              <span className="font-semibold text-foreground">
                Total: {formatted.pricing.total}
              </span>
            </div>
            {formatted.pricing.upsell && (
              <p className="mt-2 text-xs text-primary">
                Falta 1 certificado para pagar {formatted.pricing.nextUnitPrice} cada (total {formatted.pricing.upsellTotal}).
              </p>
            )}
          </div>
        )}
      </div>
      ) : null}

      {/* Certificate preview */}
      <CertificatePreview
        certificateRef={certificateRef}
        mobileImage="/certificates/batismo/certificado_batismo.jpg"
        mobileAlt="Prévia do certificado de batismo"
        frameColor="#ecfccb"
      >
        <CertificateInner logoSrc={logoSrc} igrejaNome={igrejaNome} campos={campos} dataFormatada={dataFormatada} />
      </CertificatePreview>
    </section>
  );
}
