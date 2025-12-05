"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCertificatePDF } from "@/hooks/use-certificate-pdf";
import { CertificatePreview } from "@/components/certificates/CertificatePreview";
import { CertificateForm } from "./CertificateForm";

const DEFAULT_LOGO = "/igreja.png";
const DEFAULT_VERSE = "\"Ensina-me, SENHOR, o caminho dos teus estatutos.\" Salmo 119:33";
const SIGNATURE_LINE = "________________";

type BuilderProps = {
  igrejaNome: string;
  logoPath?: string | null;
  logoUrl?: string | null;
};

type Campos = {
  nomeParticipante: string;
  dataInicio: string;
  dataFim: string;
  igreja: string;
  bairro: string;
  cidade: string;
  cep: string;
  pastor: string;
  secretario: string;
  professor: string;
  observacoes: string;
};

type CertificateInnerProps = {
  logoSrc: string;
  igrejaNome: string;
  campos: Campos;
  dataInicioFormatada: string;
  dataFimFormatada: string;
};

function CertificateInner({ logoSrc, igrejaNome, campos, dataInicioFormatada, dataFimFormatada }: CertificateInnerProps) {
  const participante = campos.nomeParticipante || "Nome do participante";
  const igrejaTexto = campos.igreja || igrejaNome;
  const bairroTexto = campos.bairro || "Bairro";
  const cidadeTexto = campos.cidade || "Cidade";
  const cepTexto = campos.cep || "00000-000";
  const periodoInicio = dataInicioFormatada || "____/____/______";
  const periodoFim = dataFimFormatada || "____/____/______";
  const observacoesTexto = campos.observacoes || "Observações adicionais.";

  return (
    <div className="flex h-full flex-col rounded-[32px] bg-white p-6 text-[#412a14] md:p-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
        <div className="flex items-center gap-4 md:flex-1">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-primary/30 bg-white shadow-md">
            <Image src={logoSrc} alt="Logo da igreja" fill sizes="96px" className="object-cover" unoptimized />
          </div>
          <div className="space-y-1 text-center md:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.6em] text-primary/70">Certificado</p>
            <h2 className="text-3xl font-serif text-primary md:text-4xl">Discipulado</h2>
            <p className="text-xs uppercase tracking-[0.4em] text-primary/60">{igrejaTexto}</p>
          </div>
        </div>
        <aside className="rounded-2xl border border-primary/10 bg-primary/5 p-4 text-center text-sm text-primary md:w-72">
          <p className="text-[10px] uppercase tracking-[0.4em] text-primary/70">Versículo tema</p>
          <div className="mx-auto mt-2 h-px w-12 bg-primary/30" />
          <blockquote className="mt-3 text-sm leading-relaxed text-primary/80">{DEFAULT_VERSE}</blockquote>
        </aside>
      </div>

      <div className="mt-6 grid gap-4 rounded-2xl border border-primary/10 bg-primary/5/30 p-4 text-center text-xs uppercase tracking-[0.3em] text-primary/70 md:grid-cols-2">
        <div className="space-y-1">
          <p>Participante</p>
          <p className="text-lg font-semibold tracking-tight text-primary/90">{participante}</p>
        </div>
        <div className="space-y-1">
          <p>Período</p>
          <p className="text-lg font-semibold tracking-tight text-primary/90">
            {periodoInicio} até {periodoFim}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p>
          Atestamos que <span className="font-semibold text-foreground">{participante}</span> concluiu o curso de discipulado ministrado pela Igreja{" "}
          <span className="font-semibold text-foreground">{igrejaTexto}</span>, demonstrando dedicação e constância em cada encontro.
        </p>
        <p>
          Local: bairro <span className="font-semibold text-foreground">{bairroTexto}</span>, cidade{" "}
          <span className="font-semibold text-foreground">{cidadeTexto}</span> - CEP{" "}
          <span className="font-semibold text-foreground">{cepTexto}</span>.
        </p>
        <p>Observações: {observacoesTexto}</p>
      </div>

      <div className="mt-6 grid gap-6 border-t border-dashed border-primary/20 pt-6 text-xs uppercase tracking-[0.4em] text-muted-foreground md:grid-cols-3">
        <div className="space-y-2 text-center">
          <p className="font-mono text-base tracking-[0.3em] text-foreground/80">{SIGNATURE_LINE}</p>
          <p className="text-sm font-semibold tracking-normal text-foreground">{campos.pastor || "Pastor Responsável"}</p>
          <p>Pastor</p>
        </div>
        <div className="space-y-2 text-center">
          <p className="font-mono text-base tracking-[0.3em] text-foreground/80">{SIGNATURE_LINE}</p>
          <p className="text-sm font-semibold tracking-normal text-foreground">{campos.secretario || "Secretário(a)"}</p>
          <p>Secretário(a)</p>
        </div>
        <div className="space-y-2 text-center">
          <p className="font-mono text-base tracking-[0.3em] text-foreground/80">{SIGNATURE_LINE}</p>
          <p className="text-sm font-semibold tracking-normal text-foreground">{campos.professor || "Professor(a)"}</p>
          <p>Professor(a)</p>
        </div>
      </div>
    </div>
  );
}

export function DiscipuladoCertificateBuilder({ igrejaNome, logoPath, logoUrl }: BuilderProps) {
  const createInitialCampos = () => ({
    nomeParticipante: "",
    dataInicio: "",
    dataFim: "",
    igreja: igrejaNome,
    bairro: "",
    cidade: "",
    cep: "",
    pastor: "",
    secretario: "",
    professor: "",
    observacoes: "",
  });

  const [campos, setCampos] = useState<Campos>(() => createInitialCampos());

  const logoSrc = useMemo(() => logoPath || logoUrl || DEFAULT_LOGO, [logoPath, logoUrl]);

  const { certificateRef, isGenerating, isShareSupported, handleShare, handleGeneratePDF } = useCertificatePDF({
    fileName: `certificado-discipulado-${campos.nomeParticipante || "aluno"}.pdf`,
    title: "Certificado de Discipulado",
    text: `Certificado de Discipulado para ${campos.nomeParticipante || "aluno"}`,
  });

  const handleChange = (field: keyof Campos) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setCampos((prev) => ({ ...prev, [field]: value }));
  };

  const dataInicioFormatada = campos.dataInicio ? new Date(campos.dataInicio).toLocaleDateString("pt-BR") : "";
  const dataFimFormatada = campos.dataFim ? new Date(campos.dataFim).toLocaleDateString("pt-BR") : "";

  const handleGenerateAndReset = async () => {
    await handleGeneratePDF();
    setCampos(createInitialCampos());
  };

  return (
    <section className="certificate-print-root flex flex-col gap-6 print:block">
      <div className="space-y-6 rounded-3xl border border-border bg-background/70 p-6 shadow-sm print:hidden">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">Dados do certificado</h3>
          <p className="text-sm text-muted-foreground">Preencha os campos referentes ao curso de discipulado.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomeParticipante">Nome do participante</Label>
            <Input id="nomeParticipante" value={campos.nomeParticipante} onChange={handleChange("nomeParticipante")} placeholder="Ex.: Ana Souza" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data de início</Label>
              <Input id="dataInicio" type="date" value={campos.dataInicio} onChange={handleChange("dataInicio")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataFim">Data de conclusão</Label>
              <Input id="dataFim" type="date" value={campos.dataFim} onChange={handleChange("dataFim")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="igreja">Nome da igreja</Label>
            <Input id="igreja" value={campos.igreja} onChange={handleChange("igreja")} placeholder="Nome da igreja" />
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
              <Label htmlFor="cep">CEP</Label>
              <Input id="cep" value={campos.cep} onChange={handleChange("cep")} placeholder="00000-000" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="pastor">Pastor responsável</Label>
              <Input id="pastor" value={campos.pastor} onChange={handleChange("pastor")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secretario">Secretário(a)</Label>
              <Input id="secretario" value={campos.secretario} onChange={handleChange("secretario")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="professor">Professor(a)</Label>
              <Input id="professor" value={campos.professor} onChange={handleChange("professor")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea id="observacoes" value={campos.observacoes} onChange={handleChange("observacoes")} rows={3} />
          </div>
        </div>

        <CertificateForm
          isShareSupported={isShareSupported}
          isGenerating={isGenerating}
          handleShare={handleShare}
          handleGeneratePDF={handleGenerateAndReset}
        />
      </div>

      <CertificatePreview
        certificateRef={certificateRef}
        mobileImage="/certificado_discipulado.png"
        mobileAlt="Prévia do certificado de discipulado"
        frameColor="#f3e7d8"
      >
        <CertificateInner
          logoSrc={logoSrc}
          igrejaNome={igrejaNome}
          campos={campos}
          dataInicioFormatada={dataInicioFormatada}
          dataFimFormatada={dataFimFormatada}
        />
      </CertificatePreview>
    </section>
  );
}
