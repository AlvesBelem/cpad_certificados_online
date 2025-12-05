"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCertificatePDF } from "@/hooks/use-certificate-pdf";
import { CertificatePreview } from "@/components/certificates/CertificatePreview";
import { CertificateForm } from "./CertificateForm";

const DEFAULT_VERSE = "\"Oh! quão bom e quão suave é que os irmãos vivam em união.\" Salmos 133:1";
const SIGNATURE_LINE = "_____________________________";

type BuilderProps = {
  igrejaNome: string;
};

type Campos = {
  nomeParticipante: string;
  ano: string;
  versiculo: string;
  observacao: string;
  pastor: string;
  secretario: string;
  liderCelula: string;
};

type CertificateInnerProps = {
  igrejaNome: string;
  campos: Campos;
};

function CertificateInner({ igrejaNome, campos }: CertificateInnerProps) {
  const nomeTexto = campos.nomeParticipante || "Nome do participante";
  const anoTexto = campos.ano || "____";
  const versiculoTexto = campos.versiculo || DEFAULT_VERSE;
  const observacaoTexto =
    campos.observacao ||
    "Tem participado frequentemente de nossa célula, compartilhando experiências e crescendo em graça e conhecimento.";
  const pastorTexto = campos.pastor || "Pastor";
  const secretarioTexto = campos.secretario || "Secretário";
  const liderCelulaTexto = campos.liderCelula || "Líder de Célula";

  return (
    <div className="flex h-full flex-col rounded-[32px] bg-white p-6 text-[#6b4b1f] md:p-5">
      <div className="space-y-1 text-center md:text-left">
        <p className="text-[11px] font-semibold uppercase tracking-[0.6em] text-primary/70">Certificado</p>
        <h2 className="text-3xl font-serif text-primary md:text-4xl">Participação em Célula</h2>
        <p className="text-xs uppercase tracking-[0.4em] text-primary/60">{igrejaNome}</p>
      </div>

      <div className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p className="text-center font-medium text-foreground">Temos o prazer em certificar que:</p>
        <p className="text-center text-lg font-semibold text-foreground">{nomeTexto}</p>
        <p className="text-center leading-relaxed">
          {observacaoTexto} Ano de <span className="font-semibold text-foreground">{anoTexto}</span>.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm text-primary">
        <p className="text-center leading-relaxed">{versiculoTexto}</p>
      </div>

      <div className="mt-6 grid gap-6 text-center text-xs uppercase tracking-[0.4em] text-muted-foreground md:grid-cols-3">
        <div className="space-y-2">
          <p className="font-mono text-base tracking-[0.3em] text-foreground/80">{SIGNATURE_LINE}</p>
          <p className="text-sm font-semibold tracking-normal text-foreground">{pastorTexto}</p>
          <p>Pastor</p>
        </div>
        <div className="space-y-2">
          <p className="font-mono text-base tracking-[0.3em] text-foreground/80">{SIGNATURE_LINE}</p>
          <p className="text-sm font-semibold tracking-normal text-foreground">{secretarioTexto}</p>
          <p>Secretário</p>
        </div>
        <div className="space-y-2">
          <p className="font-mono text-base tracking-[0.3em] text-foreground/80">{SIGNATURE_LINE}</p>
          <p className="text-sm font-semibold tracking-normal text-foreground">{liderCelulaTexto}</p>
          <p>Líder de Célula</p>
        </div>
      </div>
    </div>
  );
}

export function ParticipacaoCelulaCertificateBuilder({ igrejaNome }: BuilderProps) {
  const createInitialCampos = () => ({
    nomeParticipante: "",
    ano: "",
    versiculo: DEFAULT_VERSE,
    observacao: "",
    pastor: "",
    secretario: "",
    liderCelula: "",
  });

  const [campos, setCampos] = useState<Campos>(() => createInitialCampos());

  const { certificateRef, isGenerating, isShareSupported, handleShare, handleGeneratePDF } = useCertificatePDF({
    fileName: `certificado-celula-${campos.nomeParticipante || "participante"}.pdf`,
    title: "Certificado Participação em Célula",
    text: `Certificado de participação em célula para ${campos.nomeParticipante || "participante"}`,
  });

  const handleChange = (field: keyof Campos) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setCampos((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateAndReset = async () => {
    await handleGeneratePDF();
    setCampos(createInitialCampos());
  };

  return (
    <section className="certificate-print-root flex flex-col gap-6 print:block">
      <div className="space-y-6 rounded-3xl border border-border bg-background/70 p-6 shadow-sm print:hidden">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">Dados do certificado</h3>
          <p className="text-sm text-muted-foreground">Preencha os dados do participante da célula.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomeParticipante">Nome do(a) participante</Label>
            <Input
              id="nomeParticipante"
              value={campos.nomeParticipante}
              onChange={handleChange("nomeParticipante")}
              placeholder="Ex.: João Silva"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ano">Ano</Label>
              <Input id="ano" value={campos.ano} onChange={handleChange("ano")} placeholder="2025" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data">Versículo (opcional)</Label>
              <Textarea id="versiculo" value={campos.versiculo} onChange={handleChange("versiculo")} rows={2} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="pastor">Pastor</Label>
              <Input id="pastor" value={campos.pastor} onChange={handleChange("pastor")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secretario">Secretário</Label>
              <Input id="secretario" value={campos.secretario} onChange={handleChange("secretario")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="liderCelula">Líder de Célula</Label>
              <Input id="liderCelula" value={campos.liderCelula} onChange={handleChange("liderCelula")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao">Observação (opcional)</Label>
            <Textarea id="observacao" value={campos.observacao} onChange={handleChange("observacao")} rows={2} />
          </div>
        </div>

        <CertificateForm
          isShareSupported={isShareSupported}
          isGenerating={isGenerating}
          handleShare={handleShare}
          handleGeneratePDF={handleGenerateAndReset}
        />
      </div>

      <CertificatePreview certificateRef={certificateRef} frameColor="#f6e3b4">
        <CertificateInner igrejaNome={igrejaNome} campos={campos} />
      </CertificatePreview>
    </section>
  );
}
