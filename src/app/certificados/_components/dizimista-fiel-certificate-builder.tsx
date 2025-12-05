"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCertificatePDF } from "@/hooks/use-certificate-pdf";
import { CertificatePreview } from "@/components/certificates/CertificatePreview";
import { CertificateForm } from "./CertificateForm";

const DEFAULT_LOGO = "/igreja.png";

const DEFAULT_VERSE =
  "\"Trazei todos os Dízimos à casa do Tesouro, e provai-me nisto, diz o Senhor dos Exércitos, se eu não abrir as janelas do céu, e não derramar sobre vós bênção sem medida.\" Malaquias 3:10,11";
const SIGNATURE_LINE = "_____________________________";

type BuilderProps = {
  igrejaNome: string;
};

type Campos = {
  nomeMembro: string;
  cidade: string;
  dataRegistro: string;
  versiculo: string;
  observacao: string;
  oficiante: string;
};

type CertificateInnerProps = {
  igrejaNome: string;
  campos: Campos;
  dataFormatada: string;
};

function CertificateInner({ igrejaNome, campos, dataFormatada }: CertificateInnerProps) {
  const nomeTexto = campos.nomeMembro || "Nome do dizimista";
  const cidadeTexto = campos.cidade || "_____________";
  const versiculoTexto = campos.versiculo || DEFAULT_VERSE;
  const observacaoTexto = campos.observacao || "";
  const oficianteTexto = campos.oficiante || "Oficiante";

  return (
    <div className="flex h-full flex-col rounded-[32px] bg-white p-6 text-[#6b4b1f] md:p-5">
      <div className="space-y-3 text-center md:text-left">
        <div className="flex justify-center md:justify-start">
          <div className="relative h-16 w-16 overflow-hidden rounded-2xl border-2 border-primary/20 bg-background shadow-md">
            <Image src={DEFAULT_LOGO} alt="Logo da igreja" fill sizes="64px" className="object-cover" priority />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.6em] text-primary/70">Certificado</p>
          <h2 className="text-3xl font-serif text-primary md:text-4xl">Dizimista Fiel</h2>
          <p className="text-xs uppercase tracking-[0.4em] text-primary/60">{igrejaNome}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p>
          Certificamos que o(a) <span className="font-semibold text-foreground">{nomeTexto}</span> tem sido Dizimista Fiel em conformidade com a
          palavra de Deus, ajudando a estabelecer o reino de Deus na <span className="font-semibold text-foreground">{igrejaNome}</span>.
        </p>
        <p>
          Registramos na cidade de <span className="font-semibold text-foreground">{cidadeTexto}</span>, na data de{" "}
          <span className="font-semibold text-foreground">{dataFormatada}</span>.
        </p>
        {observacaoTexto ? (
          <p className="italic text-xs text-foreground/80">Obs.: {observacaoTexto}</p>
        ) : null}
      </div>

      <div className="mt-6 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm text-primary">
        <p className="text-center leading-relaxed">{versiculoTexto}</p>
      </div>

      <div className="mt-6 grid gap-6 text-center text-xs uppercase tracking-[0.4em] text-muted-foreground md:grid-cols-1">
        <div className="space-y-2">
          <p className="font-mono text-base tracking-[0.3em] text-foreground/80">{SIGNATURE_LINE}</p>
          <p className="text-sm font-semibold tracking-normal text-foreground">{oficianteTexto}</p>
          <p>Oficiante</p>
        </div>
      </div>
    </div>
  );
}

export function DizimistaFielCertificateBuilder({ igrejaNome }: BuilderProps) {
  const createInitialCampos = () => ({
    nomeMembro: "",
    cidade: "",
    dataRegistro: "",
    versiculo: DEFAULT_VERSE,
    observacao: "",
    oficiante: "",
  });

  const [campos, setCampos] = useState<Campos>(() => createInitialCampos());

  const { certificateRef, isGenerating, isShareSupported, handleShare, handleGeneratePDF } = useCertificatePDF({
    fileName: `certificado-dizimista-${campos.nomeMembro || "dizimista"}.pdf`,
    title: "Certificado de Dizimista Fiel",
    text: `Certificado de Dizimista Fiel para ${campos.nomeMembro || "membro"}`,
  });

  const handleChange = (field: keyof Campos) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setCampos((prev) => ({ ...prev, [field]: value }));
  };

  const dataFormatada = campos.dataRegistro ? new Date(campos.dataRegistro).toLocaleDateString("pt-BR") : "____/____/______";

  const handleGenerateAndReset = async () => {
    await handleGeneratePDF();
    setCampos(createInitialCampos());
  };

  return (
    <section className="certificate-print-root flex flex-col gap-6 print:block">
      <div className="space-y-6 rounded-3xl border border-border bg-background/70 p-6 shadow-sm print:hidden">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">Dados do certificado</h3>
          <p className="text-sm text-muted-foreground">Preencha os dados do(a) dizimista.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomeMembro">Nome do(a) dizimista</Label>
            <Input id="nomeMembro" value={campos.nomeMembro} onChange={handleChange("nomeMembro")} placeholder="Ex.: João Silva" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" value={campos.cidade} onChange={handleChange("cidade")} placeholder="São Paulo - SP" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataRegistro">Data</Label>
              <Input id="dataRegistro" type="date" value={campos.dataRegistro} onChange={handleChange("dataRegistro")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oficiante">Oficiante</Label>
              <Input id="oficiante" value={campos.oficiante} onChange={handleChange("oficiante")} placeholder="Nome do oficiante" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="versiculo">Versículo</Label>
            <Textarea id="versiculo" value={campos.versiculo} onChange={handleChange("versiculo")} rows={3} />
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
        <CertificateInner igrejaNome={igrejaNome} campos={campos} dataFormatada={dataFormatada} />
      </CertificatePreview>
    </section>
  );
}
