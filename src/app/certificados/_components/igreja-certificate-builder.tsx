"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCertificatePDF } from "@/hooks/use-certificate-pdf";
import { CertificateForm } from "./CertificateForm";
import { CertificatePreview } from "@/components/certificates/CertificatePreview";

const DEFAULT_LOGO = "/igreja.png";
const DEFAULT_VERSE = "\"Portanto ide, fazei discípulos de todas as nações, batizando-os em nome do Pai, e do Filho, e do Espírito Santo.\" Mateus 28:19";
const SIGNATURE_LINE = "________________________";

type BuilderProps = {
  igrejaNome: string;
  logoPath?: string | null;
  logoUrl?: string | null;
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

type CertificateInnerProps = {
  logoSrc: string;
  igrejaNome: string;
  campos: Campos;
  dataFormatada: string;
};

function CertificateInner({ logoSrc, igrejaNome, campos, dataFormatada }: CertificateInnerProps) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden text-center md:p-2">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Image
          src="/batismo.png"
          alt="Marca d'água de batismo"
          width={650}
          height={1024}
          className="max-h-[90%] max-w-[90%] opacity-30 -translate-y-6"
          priority
        />
      </div>
      {/* Church identity */}
      <div className="certificate-header flex flex-col items-start gap-6 text-left md:flex-row md:items-center md:gap-10">
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
      <div className="mt-10 flex flex-col gap-8 text-left lg:flex-row lg:gap-12">
        <aside className="rounded-3xl bg-lime-100 p-6 lg:w-64">
          <p className="text-xs uppercase tracking-[0.4em] text-primary/60">Versículo</p>
          <div className="mt-3 h-px w-12 bg-primary/40" />
          <blockquote className="mt-4 text-base leading-relaxed text-primary/80">
            {campos.versiculo || DEFAULT_VERSE}
          </blockquote>
        </aside>
        <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
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
      <div className="-mt-10 grid gap-0 pt-10 text-right text-[11px] uppercase tracking-[0.4em] text-muted-foreground/80 md:grid-cols-2">
        <div className="space-y-1">
          <p className="text-sm font-semibold tracking-normal text-foreground">{campos.nomeSecretario || "Nome do Secretário(a)"}</p>
          <p className="font-mono text-base tracking-[0.3em] text-foreground/70">{SIGNATURE_LINE}</p>
          <p>Secretário(a)</p>
        </div>
        <div className="space-y-1">
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

  const logoSrc = useMemo(() => logoPath || logoUrl || DEFAULT_LOGO, [logoPath, logoUrl]);

  const { certificateRef, isGenerating, isShareSupported, handleShare, handleGeneratePDF } = useCertificatePDF({
    fileName: `certificado-batismo-${campos.nomeBatizando || "membro"}.pdf`,
    title: "Certificado de Batismo",
    text: `Certificado para ${campos.nomeBatizando || "membro"}`,
  });

  const handleChange = (field: keyof Campos) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCampos((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateAndReset = async () => {
    await handleGeneratePDF();
    setCampos(createInitialCampos());
  };

  const dataFormatada = campos.dataBatismo
    ? new Date(campos.dataBatismo).toLocaleDateString("pt-BR")
    : "____/____/______";

  return (
    <section className="certificate-print-root flex flex-col gap-6 print:block">
      {/* Form container */}
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
        />
      </div>

      {/* Certificate preview */}
      <CertificatePreview
        certificateRef={certificateRef}
        mobileImage="/certificado_batismo.png"
        mobileAlt="Prévia do certificado de batismo"
        frameColor="#ecfccb"
      >
        <CertificateInner logoSrc={logoSrc} igrejaNome={igrejaNome} campos={campos} dataFormatada={dataFormatada} />
      </CertificatePreview>
    </section>
  );
}
