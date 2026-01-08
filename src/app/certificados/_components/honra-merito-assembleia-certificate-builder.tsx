"use client";

import { useCallback, useMemo, useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CertificatePreview } from "@/components/certificates/CertificatePreview";
import { BulkImportPanel, ParsedRow } from "@/components/certificates/bulk-import-panel";
import { resolveBulkFields } from "@/components/certificates/bulk-import-fields";
import { CertificateForm } from "@/app/certificados/_components/CertificateForm";
import { useCertificatePDF } from "@/hooks/use-certificate-pdf";
import { useCertificateCartButton } from "@/hooks/use-certificate-cart-button";

const CERTIFICATE_TITLE = "Certificado de Honra ao Mérito (Assembleia)";
const CERTIFICATE_SLUG = "honra-merito-assembleia";
const LINE = "_________________________";
const LINE_LONG = "________________________________________";
const MAX_CERTIFICATES_PER_PDF = 25;

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
const BULK_FIELD_KEYS: (keyof Campos)[] = [
  "nomeHomenageado",
  "igreja",
  "congregacao",
  "pastor",
  "data",
  "cidade",
  "observacao",
];
const BULK_FIELDS = resolveBulkFields(BULK_FIELD_KEYS);

export function HonraMeritoAssembleiaCertificateBuilder() {
  const [campos, setCampos] = useState<Campos>({
    igreja: "",
    congregacao: "",
    nomeHomenageado: "",
    pastor: "",
    data: "",
    cidade: "",
    observacao: "",
  });
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [bulkRows, setBulkRows] = useState<ParsedRow[]>([]);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ processed: number; total: number } | null>(null);
  const dataFormRef = useRef<HTMLDivElement | null>(null);

  const handleChange = (field: keyof Campos) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setCampos((prev) => ({ ...prev, [field]: value }));
  };

  const dataFormatada = useMemo(() => {
    if (!campos.data) return "____/____/______";
    const date = parseDateFromInput(campos.data);
    if (!date) return "____/____/______";
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
    summary: `${campos.nomeHomenageado || "Homenageado"} - ${campos.congregacao || "Congregação"}`,
    getPreviewImage: capturePreviewImage,
  });

  const defaultLogo = "/assets/logos/logo-assembleia.png";
  const logoSrc = logoPath || (logoUrl.trim() || defaultLogo);

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoPath(URL.createObjectURL(file));
    }
  };

  const handleApplyBulkRow = useCallback((row: Record<string, string>) => {
    setCampos((prev) => ({ ...prev, ...mapRowToCampos(row) }));
  }, []);

  const handleBulkRowsChange = useCallback((rows: ParsedRow[]) => {
    setBulkRows(rows);
    setBatchProgress(null);
  }, []);

  const handleGenerateBulkPdfs = useCallback(async () => {
    if (!bulkRows.length) {
      toast.info("Importe a planilha antes de gerar os PDFs em lote.");
      return;
    }

    setIsBatchGenerating(true);
    setBatchProgress({ processed: 0, total: bulkRows.length });
    const originalCampos = { ...campos };

    try {
      const rowChunks = chunkArray(bulkRows, MAX_CERTIFICATES_PER_PDF);
      let processed = 0;

      for (let chunkIndex = 0; chunkIndex < rowChunks.length; chunkIndex += 1) {
        const chunk = rowChunks[chunkIndex];
        const pdf = new jsPDF("landscape", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        for (let pageIndex = 0; pageIndex < chunk.length; pageIndex += 1) {
          const row = chunk[pageIndex];
          setCampos(mapRowToCampos(row));
          await waitForRender();
          const pageImage = await capturePreviewImage();
          if (!pageImage) {
            throw new Error("Não foi possível capturar a prévia do certificado.");
          }
          if (pageIndex > 0) {
            pdf.addPage();
          }
          pdf.addImage(pageImage, "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
          processed += 1;
          setBatchProgress({ processed, total: bulkRows.length });
        }

        const fileIndex = chunkIndex + 1;
        pdf.save(`honra-merito-${fileIndex}.pdf`);
        await waitForRender();
      }

      toast.success(
        `Geramos ${rowChunks.length} PDF(s) com ${bulkRows.length} certificado(s). Cada arquivo contém no máximo ${MAX_CERTIFICATES_PER_PDF} páginas.`,
      );
    } catch (err) {
      console.error("Erro ao gerar PDFs em lote:", err);
      toast.error("Erro ao gerar os PDFs em lote. Tente novamente.");
    } finally {
      setCampos(originalCampos);
      setIsBatchGenerating(false);
      setBatchProgress(null);
    }
  }, [bulkRows, capturePreviewImage, campos]);

  const bulkPdfCount = bulkRows.length ? Math.ceil(bulkRows.length / MAX_CERTIFICATES_PER_PDF) : 0;
  const scrollToDataForm = useCallback(() => {
    dataFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <section className="certificate-print-root flex flex-col gap-6 print:block">
      <BulkImportPanel
        certificateTitle={CERTIFICATE_TITLE}
        certificateSlug={CERTIFICATE_SLUG}
        fields={BULK_FIELDS}
        onApplyRow={handleApplyBulkRow}
        onRowsChange={handleBulkRowsChange}
        onAfterApplyRow={scrollToDataForm}
        showManualOrder={false}
      />

      {bulkRows.length > 0 ? (
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-4 shadow-sm print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-primary/70">PDF em lote</p>
              <p className="text-sm text-muted-foreground">
                Vamos gerar {bulkPdfCount} PDF{bulkPdfCount > 1 ? "s" : ""} com até {MAX_CERTIFICATES_PER_PDF} certificados
                cada a partir da planilha.
              </p>
              {batchProgress ? (
                <p className="text-xs font-semibold text-primary">
                  Gerando {batchProgress.processed}/{batchProgress.total}...
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleGenerateBulkPdfs}
              disabled={isGenerating || isBatchGenerating}
            >
              {isBatchGenerating ? "Gerando PDFs..." : "Gerar PDFs da planilha"}
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Limitamos {MAX_CERTIFICATES_PER_PDF} páginas por arquivo. Se houver mais nomes, novos PDFs serão baixados em
            sequência.
          </p>
        </div>
      ) : null}

      <div
        ref={dataFormRef}
        className="space-y-6 rounded-3xl border border-border bg-background/70 p-6 shadow-sm print:hidden"
      >
        <form
          className="space-y-4 rounded-2xl border border-primary/25 bg-primary/5 p-4"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">Logomarca</h3>
            <p className="text-sm text-muted-foreground">Informe uma URL ou envie a imagem da logo que aparecerá no topo.</p>
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
        </form>
        <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
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
        </form>
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
        mobileImage="/certificates/honra-merito-assembleia/certificado_honra_ao_merito.jpg"
        mobileAlt="Prévia do certificado de honra ao mérito"
        frameColor="#000000"
        allowOverflow
        widthMm={282}
        heightMm={200}
        printWidthMm={297}
        printHeightMm={210}
      >
        <CertificateInner campos={campos} dataFormatada={dataFormatada} logoSrc={logoSrc} defaultLogo={defaultLogo} />
      </CertificatePreview>
    </section>
  );
}

type InnerProps = {
  campos: Campos;
  dataFormatada: string;
  logoSrc: string;
  defaultLogo: string;
};

function CertificateInner({ campos, dataFormatada, logoSrc, defaultLogo }: InnerProps) {
  const fill = (value: string, placeholder: string) => (value && value.trim().length ? value : placeholder);
  const dataDisplay = campos.data?.trim().length ? dataFormatada : "____/____/______";
  const igrejaDisplay = fill(campos.igreja, LINE);
  const congregacaoDisplay = fill(campos.congregacao, LINE);
  const nomeDisplay = fill(campos.nomeHomenageado, LINE_LONG);
  const pastorDisplay = fill(campos.pastor, LINE);
  const homenageadoDisplay = fill(campos.nomeHomenageado, LINE);
  const cidadeDisplay = fill(campos.cidade, LINE);
  const observacaoDisplay = fill(campos.observacao, LINE_LONG);

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[32px] bg-white/95 p-8 text-black md:p-10">
      <Decor />
      <div className="relative z-30 flex justify-center pt-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- need plain img to support blob/object URLs from uploads */}
        <img
          src={logoSrc}
          alt="Logo"
          className="h-auto max-h-28 w-auto max-w-[360px] object-contain"
          onError={(event) => {
            const target = event.currentTarget as HTMLImageElement;
            if (target.src.endsWith(defaultLogo)) return;
            target.src = defaultLogo;
          }}
        />
      </div>
      <header className="relative z-20 mt-2 flex flex-col items-center gap-4 text-center">
        <div className="space-y-1">
          <p className="text-2xl font-bold uppercase tracking-[0.3em] text-black md:text-3xl">
            Certificado de Honra ao Mérito
          </p>
          <h2 className="pt-7 text-base font-semibold text-black md:pt-7 md:text-lg">
            <span className="font-bold">{igrejaDisplay}</span> - <span className="font-bold">{congregacaoDisplay}</span>
          </h2>
          <p className="text-base text-black/80 md:text-lg">na pessoa de seu Pastor, sente-se honrada em conferir a</p>
        </div>
        <h1 className="text-center text-2xl font-bold uppercase text-black md:text-3xl">{nomeDisplay}</h1>
      </header>

      <main className="relative z-20 mt-8 flex flex-col items-center gap-4 text-center text-lg leading-relaxed text-black md:text-xl">
        <div className="mx-auto w-full max-w-3xl space-y-2 text-left">
          <p className="text-center text-base md:text-lg">com este certificado {observacaoDisplay}</p>
          <p className="pt-8 text-right text-base text-black/80 mr-[105px] ml-[10px]">
            {cidadeDisplay}, {dataDisplay}
          </p>
        </div>
      </main>

      <footer className="relative z-20 mt-10 grid gap-8 text-center text-sm uppercase tracking-[0.25em] text-black/80 md:grid-cols-2">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-72 border-b-2 border-black/60" aria-hidden="true" />
          <div className="space-y-1 text-black">
            <p className="text-base font-semibold tracking-normal text-black">{pastorDisplay}</p>
            <p className="text-xs uppercase tracking-[0.3em] text-black/70">Pastor</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-72 border-b-2 border-black/60" aria-hidden="true" />
          <div className="space-y-1 text-black">
            <p className="text-base font-semibold tracking-normal text-black">{homenageadoDisplay}</p>
            <p className="text-xs uppercase tracking-[0.3em] text-black/70">Homenageado(a)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Decor() {
  return (
    <>
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#fff7e0] via-[#fff1c2] to-[#fffaf0] opacity-95" />
      <div className="absolute inset-0 z-10 opacity-80">
        <div className="absolute -left-10 top-0 h-full w-56 rotate-[12deg] bg-gradient-to-b from-[#f59e0b] via-[#fbbf24] to-[#b45309] blur-[1px]" />
        <div className="absolute -left-2 top-0 h-full w-52 rotate-[-8deg] bg-gradient-to-b from-[#fde68a] via-[#f59e0b] to-[#92400e] mix-blend-screen opacity-90 blur-[1px]" />
      </div>
    </>
  );
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function mapRowToCampos(row: Record<string, string>): Campos {
  const dataNormalizada = formatDateToInput(row.data ?? "");
  return {
    igreja: row.igreja ?? "",
    congregacao: row.congregacao ?? "",
    nomeHomenageado: row.nomeHomenageado ?? "",
    pastor: row.pastor ?? "",
    data: dataNormalizada,
    cidade: row.cidade ?? "",
    observacao: row.observacao ?? "",
  };
}

function waitForRender() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function formatDateToInput(value: string) {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";

  const isoLikeMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoLikeMatch) return `${isoLikeMatch[1]}-${isoLikeMatch[2]}-${isoLikeMatch[3]}`;

  const slashMatch = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})(?:\s+\d{2}:\d{2}(?::\d{2})?)?$/);
  if (slashMatch) {
    const first = Number(slashMatch[1]);
    const second = Number(slashMatch[2]);
    const year = slashMatch[3];
    const pad = (num: number) => String(num).padStart(2, "0");

    // Se o primeiro numero for dia > 12, interpretamos como dd/mm.
    if (first > 12 && second <= 12) {
      return `${year}-${pad(second)}-${pad(first)}`;
    }
    // Se o segundo numero for dia > 12, interpretamos como mm/dd (formato americano).
    if (second > 12 && first <= 12) {
      return `${year}-${pad(first)}-${pad(second)}`;
    }
    // Ambiguo (ambos <= 12): mantemos como dd/mm por padrao.
    return `${year}-${pad(second)}-${pad(first)}`;
  }

  const excelSerialMatch = trimmed.match(/^\d{5,}$/);
  if (excelSerialMatch) {
    const serial = Number.parseInt(excelSerialMatch[0], 10);
    const excelEpoch = Date.UTC(1899, 11, 31);
    const excelSerial = serial > 59 ? serial - 1 : serial;
    const serialDate = new Date(excelEpoch + excelSerial * 24 * 60 * 60 * 1000);
    if (!Number.isNaN(serialDate.getTime())) {
      return serialDate.toISOString().slice(0, 10);
    }
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return "";
}

function parseDateFromInput(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [year, month, day] = match.slice(1).map((part) => Number(part));
  if ([year, month, day].some((num) => Number.isNaN(num))) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}
