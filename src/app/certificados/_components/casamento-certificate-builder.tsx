"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCertificatePDF } from "@/hooks/use-certificate-pdf";
import { CertificatePreview } from "@/components/certificates/CertificatePreview";

const DEFAULT_LOGO = "/igreja.png";
const DEFAULT_VERSE =
  "\"Por isso, deixará o homem a seu pai e a sua mãe, e unir-se-á a sua mulher; e serão ambos uma só carne.\" Gênesis 2:24";
const SIGNATURE_LINE = "________________________";

type BuilderProps = {
  igrejaNome: string;
  logoPath?: string | null;
  logoUrl?: string | null;
};

type Campos = {
  nomeNoivo: string;
  nomeNoiva: string;
  dataCasamento: string;
  igrejaCerimonia: string;
  bairro: string;
  cidade: string;
  estado: string;
  ministro: string;
  secretario: string;
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
    <div className="flex h-full flex-col text-center md:p-2">
      <div className="relative flex h-full flex-col overflow-hidden rounded-[32px] bg-white/95 p-2 md:p-4">
        <div className="pointer-events-none absolute inset-0 opacity-15">
          <Image src="/fundo_casamento.svg" alt="" fill className="object-cover" priority />
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Image
            src="/alianca.png"
            alt="Marca d'água de alianças"
            width={650}
            height={1024}
            className="max-h-[90%] max-w-[90%] opacity-30"
            priority
          />
        </div>
        <div className="relative flex h-full flex-col">
          <div className="certificate-header flex flex-col items-start gap-6 text-left md:flex-row md:items-center md:gap-10">
            <div className="flex items-center justify-start">
              <div className="relative h-24 w-24 overflow-hidden rounded-3xl border-2 border-primary/30 bg-background shadow-lg">
                <Image src={logoSrc} alt="Logo da igreja" fill sizes="96px" className="object-cover" unoptimized />
              </div>
            </div>
            <div className="certificate-header__info space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.6em] text-primary/70">Igreja</p>
              <p className="text-sm uppercase tracking-[0.4em] text-primary/80">{igrejaNome}</p>
              <h2 className="text-4xl font-serif text-primary">Certificado de Casamento</h2>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.5em] text-primary/60">
                <span className="h-px w-10 bg-primary/30" aria-hidden="true" />
                <span>União perante Deus</span>
                <span className="h-px w-10 bg-primary/30" aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-8 text-left lg:flex-row lg:gap-12 ">
            <aside className="rounded-3xl bg-red-100/90 p-6 lg:w-64">
              <p className="text-xs uppercase tracking-[0.4em] text-primary/60 ">Versículo</p>
              <div className="mt-3 h-px w-12 bg-primary/40" />
              <blockquote className="mt-4 text-base leading-relaxed text-primary/80">
                {campos.versiculo || DEFAULT_VERSE}
              </blockquote>
            </aside>
            <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
              <p>
                Certificamos que{" "}
                <span className="font-semibold text-foreground">{campos.nomeNoivo || "__________________"}</span> e{" "}
                <span className="font-semibold text-foreground">{campos.nomeNoiva || "__________________"}</span> uniram-se em
                santo matrimônio diante de Deus e da Igreja, comprometidos a viver em amor e fidelidade conforme as Sagradas Escrituras.
              </p>
              <p>
                A cerimônia ocorreu na Igreja{" "}
                <span className="font-semibold text-foreground">{campos.igrejaCerimonia || "____________"}</span>, bairro{" "}
                <span className="font-semibold text-foreground">{campos.bairro || "____________"}</span>, cidade de{" "}
                <span className="font-semibold text-foreground">{campos.cidade || "____________"}</span> -{" "}
                <span className="font-semibold text-foreground">{campos.estado || "__"}</span>, na data de{" "}
                <span className="font-semibold text-foreground">{dataFormatada}</span>.
              </p>
              <p>
                Registrado na Igreja <span className="font-semibold text-foreground">{igrejaNome}</span> como testemunho de fé e amor.
              </p>
            </div>
          </div>

          <div className="-mt-10 grid gap-0 pt-10 text-right text-[11px] uppercase tracking-[0.4em] text-muted-foreground/80 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-semibold tracking-normal text-foreground">{campos.secretario || "Nome do Secretário(a)"}</p>
              <p className="font-mono text-base tracking-[0.3em] text-foreground/70">{SIGNATURE_LINE}</p>
              <p>Secretário(a)</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold tracking-normal text-foreground">{campos.ministro || "Ministro(s) Oficiante(s)"}</p>
              <p className="font-mono text-base tracking-[0.3em] text-foreground/70">{SIGNATURE_LINE}</p>
              <p>Ministro(s)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CasamentoCertificateBuilder({ igrejaNome, logoPath, logoUrl }: BuilderProps) {
  const createInitialCampos = () => ({
    nomeNoivo: "",
    nomeNoiva: "",
    dataCasamento: "",
    igrejaCerimonia: "",
    bairro: "",
    cidade: "",
    estado: "",
    ministro: "",
    secretario: "",
    versiculo: DEFAULT_VERSE,
  });

  const [campos, setCampos] = useState<Campos>(() => createInitialCampos());

  const logoSrc = useMemo(() => logoPath || logoUrl || DEFAULT_LOGO, [logoPath, logoUrl]);

  const { certificateRef, isGenerating, isShareSupported, handleShare, handleGeneratePDF } = useCertificatePDF({
    fileName: `certificado-casamento-${campos.nomeNoivo || "noivo"}-${campos.nomeNoiva || "noiva"}.pdf`,
    title: "Certificado de Casamento",
    text: `Casamento de ${campos.nomeNoivo || "noivo"} e ${campos.nomeNoiva || "noiva"}`,
  });

  const handleChange = (field: keyof Campos) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setCampos((prev) => ({ ...prev, [field]: value }));
  };

  const dataFormatada = campos.dataCasamento
    ? new Date(campos.dataCasamento).toLocaleDateString("pt-BR")
    : "____/____/______";

  const handleGenerateAndReset = async () => {
    await handleGeneratePDF();
    setCampos(createInitialCampos());
  };

  return (
    <section className="certificate-print-root flex flex-col gap-6 print:block">
      <div className="space-y-6 rounded-3xl border border-border bg-background/70 p-6 shadow-sm print:hidden">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nomeNoivo">Nome do noivo</Label>
              <Input id="nomeNoivo" value={campos.nomeNoivo} onChange={handleChange("nomeNoivo")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nomeNoiva">Nome da noiva</Label>
              <Input id="nomeNoiva" value={campos.nomeNoiva} onChange={handleChange("nomeNoiva")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataCasamento">Data</Label>
            <Input id="dataCasamento" type="date" value={campos.dataCasamento} onChange={handleChange("dataCasamento")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="igrejaCerimonia">Igreja / local</Label>
            <Input id="igrejaCerimonia" value={campos.igrejaCerimonia} onChange={handleChange("igrejaCerimonia")} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input id="bairro" value={campos.bairro} onChange={handleChange("bairro")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" value={campos.cidade} onChange={handleChange("cidade")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">UF</Label>
              <Input id="estado" value={campos.estado} onChange={handleChange("estado")} maxLength={2} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="secretario">Secretário(a)</Label>
              <Input id="secretario" value={campos.secretario} onChange={handleChange("secretario")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ministro">Ministro(s) Oficiante(s)</Label>
              <Input id="ministro" value={campos.ministro} onChange={handleChange("ministro")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="versiculo">Texto lateral</Label>
            <Textarea id="versiculo" value={campos.versiculo} onChange={handleChange("versiculo")} rows={3} />
          </div>
        </div>
        <div className="hidden gap-2 pt-2 md:flex">
          <Button
            type="button"
            size="sm"
            className="flex-1 bg-emerald-700 text-white hover:bg-emerald-800"
            onClick={handleGenerateAndReset}
            disabled={isGenerating}
          >
            {isGenerating ? "Gerando PDF..." : "Gerar PDF"}
          </Button>
        </div>
        <div className="flex gap-2 pt-2 md:hidden">
          {isShareSupported ? (
            <Button
              type="button"
              variant={isGenerating ? "outline" : "default"}
              className="flex-1"
              onClick={handleShare}
              disabled={isGenerating}
            >
              {isGenerating ? "Gerando PDF..." : "Compartilhar PDF"}
            </Button>
          ) : null}
        </div>
      </div>

      <CertificatePreview
        certificateRef={certificateRef}
        mobileImage="/certificado_casamento.png"
        mobileAlt="Prévia do certificado de casamento"
        allowOverflow
        autoHeight
        frameColor="#fee2e2"
        contentClassName="pb-12 md:pb-16"
      >
        <CertificateInner logoSrc={logoSrc} igrejaNome={igrejaNome} campos={campos} dataFormatada={dataFormatada} />
      </CertificatePreview>
    </section>
  );
}
