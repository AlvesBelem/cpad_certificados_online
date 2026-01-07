"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCertificatePDF } from "@/hooks/use-certificate-pdf";
import { CertificatePreview } from "@/components/certificates/CertificatePreview";
import { CertificateForm } from "./CertificateForm";
import { BulkImportPanel } from "@/components/certificates/bulk-import-panel";
import { resolveBulkFields } from "@/components/certificates/bulk-import-fields";
import { useCertificateCartButton } from "@/hooks/use-certificate-cart-button";

const DEFAULT_LOGO = "/assets/logos/igreja.png";
const DEFAULT_VERSE = "\"Habite ricamente em vós a palavra de Cristo.\" Colossenses 3:16";
const SIGNATURE_LINE = "__________________";

type BuilderProps = {
  igrejaNome: string;
  logoPath?: string | null;
  logoUrl?: string | null;
};

type Campos = {
  nomeAluno: string;
  trimestre: string;
  ano: string;
  classe: string;
  cidade: string;
  dataConclusao: string;
  superintendente: string;
  professor: string;
  versiculo: string;
};

const BULK_FIELD_KEYS: (keyof Campos)[] = [
  "nomeAluno",
  "trimestre",
  "ano",
  "classe",
  "cidade",
  "dataConclusao",
  "superintendente",
  "professor",
  "versiculo",
];

const BULK_FIELDS = resolveBulkFields(BULK_FIELD_KEYS);
const CERTIFICATE_TITLE = "Certificado EBD";
const CERTIFICATE_SLUG = "ebd";
const REQUIRED_FIELDS: (keyof Campos)[] = [
  "nomeAluno",
  "trimestre",
  "ano",
  "dataConclusao"
];

type CertificateInnerProps = {
  logoSrc: string;
  igrejaNome: string;
  campos: Campos;
  dataConclusaoFormatada: string;
};

function CertificateInner({ logoSrc, igrejaNome, campos, dataConclusaoFormatada }: CertificateInnerProps) {
  const formatarTrimestre = (valor: string, capitalize = true) => {
    const base = valor || "4º";
    const possuiTrimestre = /trimestre/i.test(base);
    const possuiOrdinal = base.includes("º");
    const prefixo = possuiTrimestre ? base : `${base}${possuiOrdinal ? "" : "º"}`;
    return `${prefixo} ${capitalize ? "Trimestre" : "trimestre"}`;
  };

  const trimestreDisplay = formatarTrimestre(campos.trimestre, true);
  const trimestreTexto = formatarTrimestre(campos.trimestre, false);
  const anoTexto = campos.ano || "____";
  const classeTexto = campos.classe || "_______________";
  const alunoTexto = campos.nomeAluno || "Nome do aluno(a)";
  const cidadeTexto = campos.cidade || "_______________";
  const superintendenteTexto = campos.superintendente || "Superintendente";
  const professorTexto = campos.professor || "Professor(a)";

  return (
    <div className="flex h-full flex-col rounded-[32px] bg-white p-6 text-[#142443] md:p-5">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
        <div className="flex items-center gap-4 md:flex-1">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-primary/30 bg-white shadow-md md:h-24 md:w-24">
            <Image src={logoSrc} alt="Logo da igreja" fill sizes="96px" className="object-cover" unoptimized />
          </div>
          <div className="space-y-1 text-center md:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.6em] text-primary/70">Certificado</p>
            <h2 className="text-3xl font-serif text-primary md:text-4xl">Escola Bíblica Dominical</h2>
            <p className="text-xs uppercase tracking-[0.4em] text-primary/60">{igrejaNome}</p>
          </div>
        </div>
        <aside className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-center text-sm text-primary md:w-64">
          <p className="text-[10px] uppercase tracking-[0.4em] text-primary/70">Versículo tema</p>
          <div className="mx-auto mt-2 h-px w-12 bg-primary/30" />
          <blockquote className="mt-3 text-sm leading-relaxed text-primary/80">
            {campos.versiculo || DEFAULT_VERSE}
          </blockquote>
        </aside>
      </div>

      <div className="mt-8 grid gap-2 rounded-2xl border border-primary/10 bg-primary/5 p-1 text-center text-[11px] uppercase tracking-[0.3em] text-primary/70 md:grid-cols-3">
        <div className="space-y-1">
          <p>Trimestre</p>
          <p className="text-lg font-semibold tracking-tight text-primary/90">{trimestreDisplay}</p>
        </div>
        <div className="space-y-1">
          <p>Ano</p>
          <p className="text-lg font-semibold tracking-tight text-primary/90">{anoTexto}</p>
        </div>
        <div className="space-y-1">
          <p>Classe</p>
          <p className="text-lg font-semibold tracking-tight text-primary/90">{classeTexto}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p>
          Certificamos{" "}
          <span className="font-semibold text-foreground">{alunoTexto}</span> pela participação e assiduidade na classe{" "}
          <span className="font-semibold text-foreground">{classeTexto}</span> durante o{" "}
          <span className="font-semibold text-foreground">{trimestreTexto}</span> do ano{" "}
          <span className="font-semibold text-foreground">{anoTexto}</span> na Escola Bíblica Dominical desta congregação.
        </p>
        <p>
          Registramos este momento na cidade de {cidadeTexto}, na data de{" "}
          <span className="font-semibold text-foreground">{dataConclusaoFormatada}</span>, como testemunho do compromisso com o estudo da Palavra
          de Deus.
        </p>
      </div>

      <div className="mt-6 grid gap-4 border-t border-dashed border-primary/20 pt-6 text-xs uppercase tracking-[0.4em] text-muted-foreground md:grid-cols-2">
        <div className="space-y-1 text-left">
          <p className="text-base font-semibold text-foreground">{cidadeTexto}</p>
          <p>Cidade</p>
        </div>
        <div className="space-y-1 text-left md:text-right">
          <p className="text-base font-semibold text-foreground">{dataConclusaoFormatada}</p>
          <p>Data</p>
        </div>
      </div>

      <div className="mt-20 grid gap-6 text-center text-xs uppercase tracking-[0.4em] text-muted-foreground md:grid-cols-3">
        <div className="space-y-2">
          <p className="font-mono text-base tracking-[0.3em] text-foreground/80">{SIGNATURE_LINE}</p>
          <p className="text-sm font-semibold tracking-normal text-foreground">{superintendenteTexto}</p>
          <p>Superintendente</p>
        </div>
        <div className="space-y-2">
          <p className="font-mono text-base tracking-[0.3em] text-foreground/80">{SIGNATURE_LINE}</p>
          <p className="text-sm font-semibold tracking-normal text-foreground">{alunoTexto}</p>
          <p>Aluno(a)</p>
        </div>
        <div className="space-y-2">
          <p className="font-mono text-base tracking-[0.3em] text-foreground/80">{SIGNATURE_LINE}</p>
          <p className="text-sm font-semibold tracking-normal text-foreground">{professorTexto}</p>
          <p>Professor(a)</p>
        </div>
      </div>
    </div>
  );
}

export function EbdCertificateBuilder({ igrejaNome, logoPath, logoUrl }: BuilderProps) {
  const createInitialCampos = () => ({
    nomeAluno: "",
    trimestre: "",
    ano: "",
    classe: "",
    cidade: "",
    dataConclusao: "",
    superintendente: "",
    professor: "",
    versiculo: DEFAULT_VERSE,
  });

  const [campos, setCampos] = useState<Campos>(() => createInitialCampos());

  const logoSrc = useMemo(() => logoPath || logoUrl || DEFAULT_LOGO, [logoPath, logoUrl]);

  const {
    certificateRef,
    isGenerating,
    isShareSupported,
    handleShare,
    handleGeneratePDF,
    capturePreviewImage,
  } = useCertificatePDF({
    fileName: `certificado-ebd-${campos.nomeAluno || "aluno"}.pdf`,
    title: "Certificado EBD",
    text: `Certificado EBD para ${campos.nomeAluno || "aluno"}`,
  });

  const { handleAddToCart, isAddingToCart, isReady } = useCertificateCartButton<Campos>({
    slug: CERTIFICATE_SLUG,
    title: CERTIFICATE_TITLE,
    data: campos,
    requiredFields: REQUIRED_FIELDS,
    summary: campos.nomeAluno,
    getPreviewImage: capturePreviewImage,
  });

  const handleChange = (field: keyof Campos) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setCampos((prev) => ({ ...prev, [field]: value }));
  };

  const dataConclusaoFormatada = campos.dataConclusao
    ? new Date(campos.dataConclusao).toLocaleDateString("pt-BR")
    : "____/____/______";

  const handleGenerateAndReset = async () => {
    await handleGeneratePDF();
  };

  const handleApplyBulkRow = useCallback((row: Record<string, string>) => {
    setCampos((prev) => ({ ...prev, ...row }));
  }, []);

  return (
    <section className="certificate-print-root flex flex-col gap-6 print:block">
      <BulkImportPanel
        certificateTitle={CERTIFICATE_TITLE}
        certificateSlug={CERTIFICATE_SLUG}
        fields={BULK_FIELDS}
        onApplyRow={handleApplyBulkRow}
      />
      <div className="space-y-6 rounded-3xl border border-border bg-background/70 p-6 shadow-sm print:hidden">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">Dados do certificado</h3>
          <p className="text-sm text-muted-foreground">Preencha o formulário da Escola Bíblica Dominical.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomeAluno">Nome do aluno(a)</Label>
            <Input id="nomeAluno" value={campos.nomeAluno} onChange={handleChange("nomeAluno")} placeholder="Ex.: Maria de Souza" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="trimestre">Trimestre</Label>
              <Input id="trimestre" value={campos.trimestre} onChange={handleChange("trimestre")} placeholder="4º Trimestre" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ano">Ano</Label>
              <Input id="ano" value={campos.ano} onChange={handleChange("ano")} placeholder="2024" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataConclusao">Data da conclusão</Label>
              <Input id="dataConclusao" type="date" value={campos.dataConclusao} onChange={handleChange("dataConclusao")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="classe">Classe / faixa</Label>
            <Input id="classe" value={campos.classe} onChange={handleChange("classe")} placeholder="Jovens Adultos" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input id="cidade" value={campos.cidade} onChange={handleChange("cidade")} placeholder="São Paulo - SP" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="superintendente">Superintendente</Label>
              <Input id="superintendente" value={campos.superintendente} onChange={handleChange("superintendente")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="professor">Professor(a)</Label>
              <Input id="professor" value={campos.professor} onChange={handleChange("professor")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="versiculo">Versículo</Label>
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
      </div>

      <CertificatePreview certificateRef={certificateRef} frameColor="#e5ecf5">
        <CertificateInner logoSrc={logoSrc} igrejaNome={igrejaNome} campos={campos} dataConclusaoFormatada={dataConclusaoFormatada} />
      </CertificatePreview>
    </section>
  );
}
