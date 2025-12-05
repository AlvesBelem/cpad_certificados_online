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
const DEFAULT_VERSE = "\"Habite ricamente em vós a palavra de Cristo.\" Colossenses 3:16";
const SIGNATURE_LINE = "__________________";

type BuilderProps = {
  igrejaNome: string;
  logoPath?: string | null;
  logoUrl?: string | null;
};

type Campos = {
  nomeAluno: string;
  ano: string;
  classeAtual: string;
  proximaClasse: string;
  cidade: string;
  dataConclusao: string;
  superintendente: string;
  professor: string;
  versiculo: string;
};

type CertificateInnerProps = {
  logoSrc: string;
  igrejaNome: string;
  campos: Campos;
  dataConclusaoFormatada: string;
};

function CertificateInner({ logoSrc, igrejaNome, campos, dataConclusaoFormatada }: CertificateInnerProps) {
  const anoTexto = campos.ano || "____";
  const classeAtualTexto = campos.classeAtual || "_____________";
  const proximaClasseTexto = campos.proximaClasse || "_____________";
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

      <div className="mt-2 grid gap-2 rounded-2xl border border-primary/10 bg-primary/5 p-1 text-center text-[11px] uppercase tracking-[0.3em] text-primary/70 md:grid-cols-3">
        <div className="space-y-1">
          <p>Ano letivo</p>
          <p className="text-lg font-semibold tracking-tight text-primary/90">{anoTexto}</p>
        </div>
        <div className="space-y-1">
          <p>Classe atual</p>
          <p className="text-lg font-semibold tracking-tight text-primary/90">{classeAtualTexto}</p>
        </div>
        <div className="space-y-1">
          <p>Próxima classe</p>
          <p className="text-lg font-semibold tracking-tight text-primary/90">{proximaClasseTexto}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p>
          Certificamos{" "}
          <span className="font-semibold text-foreground">{alunoTexto}</span> pela participação e conclusão da classe{" "}
          <span className="font-semibold text-foreground">{classeAtualTexto}</span> no ano{" "}
          <span className="font-semibold text-foreground">{anoTexto}</span> na Escola Bíblica Dominical desta congregação.
        </p>
        <p>
          Registramos a promoção para a classe{" "}
          <span className="font-semibold text-foreground">{proximaClasseTexto}</span>, na cidade de {cidadeTexto}, na data de{" "}
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

      <div className="mt-6 grid gap-6 text-center text-xs uppercase tracking-[0.4em] text-muted-foreground md:grid-cols-3">
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

export function EbdAnualCertificateBuilder({ igrejaNome, logoPath, logoUrl }: BuilderProps) {
  const createInitialCampos = () => ({
    nomeAluno: "",
    ano: "",
    classeAtual: "",
    proximaClasse: "",
    cidade: "",
    dataConclusao: "",
    superintendente: "",
    professor: "",
    versiculo: DEFAULT_VERSE,
  });

  const [campos, setCampos] = useState<Campos>(() => createInitialCampos());

  const logoSrc = useMemo(() => logoPath || logoUrl || DEFAULT_LOGO, [logoPath, logoUrl]);

  const { certificateRef, isGenerating, isShareSupported, handleShare, handleGeneratePDF } = useCertificatePDF({
    fileName: `certificado-ebd-anual-${campos.nomeAluno || "aluno"}.pdf`,
    title: "Certificado EBD Anual",
    text: `Certificado anual EBD para ${campos.nomeAluno || "aluno"}`,
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
          <p className="text-sm text-muted-foreground">Preencha o formulário anual da Escola Bíblica Dominical.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomeAluno">Nome do aluno(a)</Label>
            <Input id="nomeAluno" value={campos.nomeAluno} onChange={handleChange("nomeAluno")} placeholder="Ex.: Maria de Souza" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="ano">Ano letivo</Label>
              <Input id="ano" value={campos.ano} onChange={handleChange("ano")} placeholder="2025" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classeAtual">Classe atual</Label>
              <Input id="classeAtual" value={campos.classeAtual} onChange={handleChange("classeAtual")} placeholder="Jovens" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proximaClasse">Próxima classe</Label>
              <Input id="proximaClasse" value={campos.proximaClasse} onChange={handleChange("proximaClasse")} placeholder="Adultos" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input id="cidade" value={campos.cidade} onChange={handleChange("cidade")} placeholder="São Paulo - SP" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dataConclusao">Data da conclusão</Label>
              <Input id="dataConclusao" type="date" value={campos.dataConclusao} onChange={handleChange("dataConclusao")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="superintendente">Superintendente</Label>
              <Input id="superintendente" value={campos.superintendente} onChange={handleChange("superintendente")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="professor">Professor(a)</Label>
              <Input id="professor" value={campos.professor} onChange={handleChange("professor")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="versiculo">Versículo</Label>
              <Textarea id="versiculo" value={campos.versiculo} onChange={handleChange("versiculo")} rows={3} />
            </div>
          </div>
        </div>

        <CertificateForm
          isShareSupported={isShareSupported}
          isGenerating={isGenerating}
          handleShare={handleShare}
          handleGeneratePDF={handleGenerateAndReset}
        />
      </div>

      <CertificatePreview certificateRef={certificateRef} frameColor="#e5ecf5">
        <CertificateInner logoSrc={logoSrc} igrejaNome={igrejaNome} campos={campos} dataConclusaoFormatada={dataConclusaoFormatada} />
      </CertificatePreview>
    </section>
  );
}
