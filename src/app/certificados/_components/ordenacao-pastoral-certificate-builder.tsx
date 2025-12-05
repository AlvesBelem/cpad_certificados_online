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
const DEFAULT_VERSE =
  "\"Escolhei, pois, irmãos, dentre vós, sete homens de boa reputação, cheios do Espírito Santo e de sabedoria.\" Atos 6:3";
const SIGNATURE_LINE = "_____________________________";

type BuilderProps = {
  igrejaNome: string;
  logoPath?: string | null;
  logoUrl?: string | null;
};

type Campos = {
  nomeOrdenando: string;
  dataNascimento: string;
  localNascimento: string;
  igrejaOrdenadora: string;
  bairro: string;
  cidade: string;
  uf: string;
  dataOrdenacao: string;
  versiculo: string;
  pastorOrdenante: string;
  secretario: string;
};

type CertificateInnerProps = {
  logoSrc: string;
  igrejaNome: string;
  campos: Campos;
  dataNascimentoFormatada: string;
  dataOrdenacaoFormatada: string;
};

function CertificateInner({
  logoSrc,
  igrejaNome,
  campos,
  dataNascimentoFormatada,
  dataOrdenacaoFormatada,
}: CertificateInnerProps) {
  const nomeTexto = campos.nomeOrdenando || "Nome do(a) ordenando(a)";
  const localNascimentoTexto = campos.localNascimento || "Cidade/UF";
  const igrejaOrdenadoraTexto = campos.igrejaOrdenadora || igrejaNome || "Igreja";
  const bairroTexto = campos.bairro || "_____________";
  const cidadeTexto = campos.cidade || "_____________";
  const ufTexto = campos.uf || "__";
  const pastorOrdenanteTexto = campos.pastorOrdenante || "Pastor Ordenante";
  const secretarioTexto = campos.secretario || "Secretário(a)";

  return (
    <div className="flex h-full flex-col rounded-[32px] bg-white p-6 text-[#6b4b1f] md:p-5">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
        <div className="flex items-center gap-4 md:flex-1">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-primary/30 bg-white shadow-md md:h-24 md:w-24">
            <Image src={logoSrc} alt="Logo da igreja" fill sizes="96px" className="object-cover" unoptimized />
          </div>
          <div className="space-y-1 text-center md:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.6em] text-primary/70">Certificado</p>
            <h2 className="text-3xl font-serif text-primary md:text-4xl">Ordenação Pastoral</h2>
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

      <div className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p>
          Certificamos que <span className="font-semibold text-foreground">{nomeTexto}</span>, nascido(a) em{" "}
          <span className="font-semibold text-foreground">{dataNascimentoFormatada}</span>, em{" "}
          <span className="font-semibold text-foreground">{localNascimentoTexto}</span>, foi ordenado(a) a Pastor(a) pela Igreja{" "}
          <span className="font-semibold text-foreground">{igrejaOrdenadoraTexto}</span>.
        </p>
        <p>
          Registramos este ato no bairro <span className="font-semibold text-foreground">{bairroTexto}</span>, cidade de{" "}
          <span className="font-semibold text-foreground">{cidadeTexto}</span> -{" "}
          <span className="font-semibold text-foreground">{ufTexto}</span>, na data de{" "}
          <span className="font-semibold text-foreground">{dataOrdenacaoFormatada}</span>.
        </p>
      </div>

      <div className="mt-6 grid gap-4 border-t border-dashed border-primary/20 pt-6 text-xs uppercase tracking-[0.4em] text-muted-foreground md:grid-cols-2">
        <div className="space-y-1 text-left">
          <p className="text-base font-semibold text-foreground">{cidadeTexto}</p>
          <p>Cidade</p>
        </div>
        <div className="space-y-1 text-left md:text-right">
          <p className="text-base font-semibold text-foreground">{dataOrdenacaoFormatada}</p>
          <p>Data</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 text-center text-xs uppercase tracking-[0.4em] text-muted-foreground md:grid-cols-2">
        <div className="space-y-2">
          <p className="font-mono text-base tracking-[0.3em] text-foreground/80">{SIGNATURE_LINE}</p>
          <p className="text-sm font-semibold tracking-normal text-foreground">{pastorOrdenanteTexto}</p>
          <p>Pastor Ordenante</p>
        </div>
        <div className="space-y-2">
          <p className="font-mono text-base tracking-[0.3em] text-foreground/80">{SIGNATURE_LINE}</p>
          <p className="text-sm font-semibold tracking-normal text-foreground">{secretarioTexto}</p>
          <p>Secretário(a)</p>
        </div>
      </div>
    </div>
  );
}

export function OrdenacaoPastoralCertificateBuilder({ igrejaNome, logoPath, logoUrl }: BuilderProps) {
  const createInitialCampos = () => ({
    nomeOrdenando: "",
    dataNascimento: "",
    localNascimento: "",
    igrejaOrdenadora: "",
    bairro: "",
    cidade: "",
    uf: "",
    dataOrdenacao: "",
    versiculo: DEFAULT_VERSE,
    pastorOrdenante: "",
    secretario: "",
  });

  const [campos, setCampos] = useState<Campos>(() => createInitialCampos());

  const logoSrc = useMemo(() => logoPath || logoUrl || DEFAULT_LOGO, [logoPath, logoUrl]);

  const { certificateRef, isGenerating, isShareSupported, handleShare, handleGeneratePDF } = useCertificatePDF({
    fileName: `certificado-ordenacao-${campos.nomeOrdenando || "ordenacao"}.pdf`,
    title: "Certificado de Ordenação Pastoral",
    text: `Certificado de ordenação para ${campos.nomeOrdenando || "pastor(a)"}`,
  });

  const handleChange = (field: keyof Campos) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setCampos((prev) => ({ ...prev, [field]: value }));
  };

  const dataNascimentoFormatada = campos.dataNascimento
    ? new Date(campos.dataNascimento).toLocaleDateString("pt-BR")
    : "____/____/______";

  const dataOrdenacaoFormatada = campos.dataOrdenacao
    ? new Date(campos.dataOrdenacao).toLocaleDateString("pt-BR")
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
          <p className="text-sm text-muted-foreground">Preencha as informações de ordenação pastoral.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomeOrdenando">Nome do(a) ordenando(a)</Label>
            <Input id="nomeOrdenando" value={campos.nomeOrdenando} onChange={handleChange("nomeOrdenando")} placeholder="Ex.: João Silva" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="dataNascimento">Data de nascimento</Label>
              <Input id="dataNascimento" type="date" value={campos.dataNascimento} onChange={handleChange("dataNascimento")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="localNascimento">Local de nascimento</Label>
              <Input id="localNascimento" value={campos.localNascimento} onChange={handleChange("localNascimento")} placeholder="Cidade - UF" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="igrejaOrdenadora">Igreja ordenadora</Label>
            <Input id="igrejaOrdenadora" value={campos.igrejaOrdenadora} onChange={handleChange("igrejaOrdenadora")} placeholder="Igreja local" />
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
              <Label htmlFor="uf">UF</Label>
              <Input id="uf" value={campos.uf} onChange={handleChange("uf")} maxLength={2} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dataOrdenacao">Data da ordenação</Label>
              <Input id="dataOrdenacao" type="date" value={campos.dataOrdenacao} onChange={handleChange("dataOrdenacao")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pastorOrdenante">Pastor ordenante</Label>
              <Input id="pastorOrdenante" value={campos.pastorOrdenante} onChange={handleChange("pastorOrdenante")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="secretario">Secretário(a)</Label>
              <Input id="secretario" value={campos.secretario} onChange={handleChange("secretario")} />
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

      <CertificatePreview certificateRef={certificateRef} frameColor="#f7e9c5">
        <CertificateInner
          logoSrc={logoSrc}
          igrejaNome={igrejaNome}
          campos={campos}
          dataNascimentoFormatada={dataNascimentoFormatada}
          dataOrdenacaoFormatada={dataOrdenacaoFormatada}
        />
      </CertificatePreview>
    </section>
  );
}
