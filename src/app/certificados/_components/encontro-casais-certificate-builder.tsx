"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCertificatePDF } from "@/hooks/use-certificate-pdf";
import { CertificatePreview } from "@/components/certificates/CertificatePreview";
import { CertificateForm } from "./CertificateForm";
import Image from "next/image";

const DEFAULT_LOGO = "/igreja.png";

const DEFAULT_VERSE =
  "\"E sobre tudo isto, revesti-vos de amor, que é o vínculo da perfeição.\" Colossenses 3:14";
const SIGNATURE_LINE = "__________________";

type BuilderProps = {
  igrejaNome: string;
};

type Campos = {
  nomeEsposo: string;
  nomeEsposa: string;
  dataConclusao: string;
  observacao: string;
  pastor: string;
  secretario: string;
  professor: string;
  versiculo: string;
};

type CertificateInnerProps = {
  igrejaNome: string;
  campos: Campos;
  dataConclusaoFormatada: string;
};

function CertificateInner({ igrejaNome, campos, dataConclusaoFormatada }: CertificateInnerProps) {
  const esposoTexto = campos.nomeEsposo || "Nome do esposo";
  const esposaTexto = campos.nomeEsposa || "Nome da esposa";
  const observacaoTexto =
    campos.observacao ||
    "Concluiu satisfatoriamente o curso de encontro de casais, buscando crescimento conjugal sob a bênção do Senhor Jesus.";
  const pastorTexto = campos.pastor || "Pastor";
  const secretarioTexto = campos.secretario || "Secretário";
  const professorTexto = campos.professor || "Professor";
  const versiculoTexto = campos.versiculo || DEFAULT_VERSE;

  return (
    <div className="relative flex h-full flex-col rounded-[32px] bg-white p-6 text-[#6b4b1f] md:p-5">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Image
          src="/alianca.png"
          alt="Marca d'água de alianças"
          width={650}
          height={1024}
          className="max-h-[90%] max-w-[90%] opacity-30 -translate-y-6"
          priority
        />
      </div>
      <div className="space-y-3 text-center md:text-left">
        <div className="flex justify-center md:justify-start">
          <div className="relative h-16 w-16 overflow-hidden rounded-2xl border-2 border-primary/20 bg-background shadow-md">
            <Image src={DEFAULT_LOGO} alt="Logo da igreja" fill sizes="64px" className="object-cover" priority />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.6em] text-primary/70">Certificado</p>
          <h2 className="text-3xl font-serif text-primary md:text-4xl">Encontro de Casais</h2>
          <p className="text-xs uppercase tracking-[0.4em] text-primary/60">{igrejaNome}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p className="text-center font-medium text-foreground">Certificamos que o casal:</p>
        <p className="text-center text-lg font-semibold text-foreground">
          {esposoTexto} &amp; {esposaTexto}
        </p>
        <p className="text-center text-sm text-muted-foreground">Concluiu o encontro de casais.</p>
        <p className="text-center text-sm text-muted-foreground">Data: {dataConclusaoFormatada}</p>
        <p className="text-center leading-relaxed">{observacaoTexto}</p>
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
          <p className="text-sm font-semibold tracking-normal text-foreground">{professorTexto}</p>
          <p>Professor</p>
        </div>
      </div>
    </div>
  );
}

export function EncontroCasaisCertificateBuilder({ igrejaNome }: BuilderProps) {
  const createInitialCampos = () => ({
    nomeEsposo: "",
    nomeEsposa: "",
    dataConclusao: "",
    observacao: "",
    pastor: "",
    secretario: "",
    professor: "",
    versiculo: DEFAULT_VERSE,
  });

  const [campos, setCampos] = useState<Campos>(() => createInitialCampos());

  const { certificateRef, isGenerating, isShareSupported, handleShare, handleGeneratePDF } = useCertificatePDF({
    fileName: `certificado-encontro-casais-${campos.nomeEsposo || "casal"}.pdf`,
    title: "Certificado Encontro de Casais",
    text: `Certificado de encontro de casais para ${campos.nomeEsposo || "casal"}`,
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
    setCampos(createInitialCampos());
  };

  return (
    <section className="certificate-print-root flex flex-col gap-6 print:block">
      <div className="space-y-6 rounded-3xl border border-border bg-background/70 p-6 shadow-sm print:hidden">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">Dados do certificado</h3>
          <p className="text-sm text-muted-foreground">Preencha os dados do casal e do encontro.</p>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nomeEsposo">Nome do esposo</Label>
              <Input id="nomeEsposo" value={campos.nomeEsposo} onChange={handleChange("nomeEsposo")} placeholder="Nome do esposo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nomeEsposa">Nome da esposa</Label>
              <Input id="nomeEsposa" value={campos.nomeEsposa} onChange={handleChange("nomeEsposa")} placeholder="Nome da esposa" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="dataConclusao">Data de conclusão</Label>
              <Input id="dataConclusao" type="date" value={campos.dataConclusao} onChange={handleChange("dataConclusao")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pastor">Pastor</Label>
              <Input id="pastor" value={campos.pastor} onChange={handleChange("pastor")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secretario">Secretário</Label>
              <Input id="secretario" value={campos.secretario} onChange={handleChange("secretario")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="professor">Professor</Label>
              <Input id="professor" value={campos.professor} onChange={handleChange("professor")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="versiculo">Versículo</Label>
              <Textarea id="versiculo" value={campos.versiculo} onChange={handleChange("versiculo")} rows={2} />
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

      <CertificatePreview certificateRef={certificateRef} frameColor="#f7e9c5">
        <CertificateInner igrejaNome={igrejaNome} campos={campos} dataConclusaoFormatada={dataConclusaoFormatada} />
      </CertificatePreview>
    </section>
  );
}
