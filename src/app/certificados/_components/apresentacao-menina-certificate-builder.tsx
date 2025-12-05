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
  "\"Terminados os dias da purificação, segundo a lei de Moisés, levaram-no a Jerusalém, para apresentá-lo ao Senhor.\" Lucas 2:22";
const SIGNATURE_LINE = "________________________";

type BuilderProps = {
  igrejaNome: string;
  logoPath?: string | null;
  logoUrl?: string | null;
};

type Campos = {
  nomeCrianca: string;
  sexo: string;
  dataNascimento: string;
  cidadeNascimento: string;
  estadoNascimento: string;
  nomePai: string;
  nomeMae: string;
  bairro: string;
  cidadeResidencia: string;
  estadoResidencia: string;
  cep: string;
  dataApresentacao: string;
  nomePastor: string;
  nomeSecretario: string;
  versiculo: string;
};

type CertificateInnerProps = {
  logoSrc: string;
  igrejaNome: string;
  campos: Campos;
  dataNascimentoFormatada: string;
  dataApresentacaoFormatada: string;
};

function CertificateInner({
  logoSrc,
  igrejaNome,
  campos,
  dataNascimentoFormatada,
  dataApresentacaoFormatada,
}: CertificateInnerProps) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden text-center md:p-2">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Image
          src="/menina.png"
          alt="Marca d'água de menina"
          width={650}
          height={1024}
          className="max-h-[90%] max-w-[90%] opacity-30"
          priority
        />
      </div>
      <div className="certificate-header flex flex-col items-start gap-6 text-left md:flex-row md:items-center md:gap-10">
        <div className="flex items-center justify-start">
          <div className="relative h-24 w-24 overflow-hidden rounded-3xl border-2 border-primary/30 bg-background shadow-lg">
            <Image src={logoSrc} alt="Logo da igreja" fill sizes="96px" className="object-cover" unoptimized />
          </div>
        </div>
        <div className="certificate-header__info space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.6em] text-primary/70">Igreja</p>
          <p className="text-sm uppercase tracking-[0.4em] text-primary/80">{igrejaNome}</p>
          <h2 className="text-4xl font-serif text-primary">Certificado de Apresentação de Criança Menina</h2>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.5em] text-primary/60">
            <span className="h-px w-10 bg-primary/30" aria-hidden="true" />
            <span>Apresentação Infantil</span>
            <span className="h-px w-10 bg-primary/30" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-8 text-left lg:flex-row lg:gap-12">
        <aside className="rounded-3xl bg-pink-100 p-6 lg:w-64">
          <p className="text-xs uppercase tracking-[0.4em] text-primary/60">Versículo</p>
          <div className="mt-3 h-px w-12 bg-primary/40" />
          <blockquote className="mt-4 text-base leading-relaxed text-primary/80">
            {campos.versiculo || DEFAULT_VERSE}
          </blockquote>
        </aside>
        <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
          <p>
            Foi apresentado(a) oficialmente ao Senhor{" "}
            <span className="font-semibold text-foreground">{campos.nomeCrianca || "____________________"}</span>, do sexo{" "}
            <span className="font-semibold text-foreground">{campos.sexo || "____"}</span>, nascido(a) em{" "}
            <span className="font-semibold text-foreground">{dataNascimentoFormatada}</span>, na cidade de{" "}
            <span className="font-semibold text-foreground">{campos.cidadeNascimento || "____________"}</span> -{" "}
            <span className="font-semibold text-foreground">{campos.estadoNascimento || "__"}</span>.
          </p>
          <p>
            Filho(a) de <span className="font-semibold text-foreground">{campos.nomePai || "____________________"}</span> e{" "}
            <span className="font-semibold text-foreground">{campos.nomeMae || "____________________"}</span>, residentes no bairro{" "}
            <span className="font-semibold text-foreground">{campos.bairro || "________________"}</span>, cidade{" "}
            <span className="font-semibold text-foreground">{campos.cidadeResidencia || "________________"}</span> -{" "}
            <span className="font-semibold text-foreground">{campos.estadoResidencia || "__"}</span>, CEP{" "}
            <span className="font-semibold text-foreground">{campos.cep || "__________"}</span>.
          </p>
          <p>
            A apresentação ocorreu em {igrejaNome}, no dia{" "}
            <span className="font-semibold text-foreground">{dataApresentacaoFormatada}</span>, diante da família e da congregação que
            se comprometem a ensinar os caminhos do Senhor.
          </p>
        </div>
      </div>

      <div className="-mt-10 grid gap-0 pt-10 text-right text-[11px] uppercase tracking-[0.4em] text-muted-foreground/80 md:grid-cols-2">
        <div className="space-y-1">
          <p className="text-sm font-semibold tracking-normal text-foreground">{campos.nomeSecretario || "Nome do Secretário(a)"} </p>
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

export function ApresentacaoMeninaCertificateBuilder({ igrejaNome, logoPath, logoUrl }: BuilderProps) {
  const createInitialCampos = () => ({
    nomeCrianca: "",
    sexo: "",
    dataNascimento: "",
    cidadeNascimento: "",
    estadoNascimento: "",
    nomePai: "",
    nomeMae: "",
    bairro: "",
    cidadeResidencia: "",
    estadoResidencia: "",
    cep: "",
    dataApresentacao: "",
    nomePastor: "",
    nomeSecretario: "",
    versiculo: DEFAULT_VERSE,
  });

  const [campos, setCampos] = useState<Campos>(() => createInitialCampos());

  const logoSrc = useMemo(() => logoPath || logoUrl || DEFAULT_LOGO, [logoPath, logoUrl]);

  const { certificateRef, isGenerating, isShareSupported, handleShare, handleGeneratePDF } = useCertificatePDF({
    fileName: `apresentacao-${campos.nomeCrianca || "crianca"}.pdf`,
    title: "Apresentação de Crianças",
    text: `Certificado para ${campos.nomeCrianca || "criança"}`,
  });

  const handleChange = (field: keyof Campos) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setCampos((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateAndReset = async () => {
    await handleGeneratePDF();
    setCampos(createInitialCampos());
  };

  const dataNascimentoFormatada = campos.dataNascimento
    ? new Date(campos.dataNascimento).toLocaleDateString("pt-BR")
    : "____/____/______";

  const dataApresentacaoFormatada = campos.dataApresentacao
    ? new Date(campos.dataApresentacao).toLocaleDateString("pt-BR")
    : "____/____/______";

  return (
    <section className="certificate-print-root flex flex-col gap-6 print:block">
      <div className="space-y-6 rounded-3xl border border-border bg-background/70 p-6 shadow-sm print:hidden">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomeCrianca">Nome da criança</Label>
            <Input id="nomeCrianca" value={campos.nomeCrianca} onChange={handleChange("nomeCrianca")} placeholder="Ex.: Ana Oliveira" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo</Label>
              <Input id="sexo" value={campos.sexo} onChange={handleChange("sexo")} placeholder="Feminino" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataNascimento">Data de nascimento</Label>
              <Input id="dataNascimento" type="date" value={campos.dataNascimento} onChange={handleChange("dataNascimento")} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cidadeNascimento">Cidade de nascimento</Label>
              <Input id="cidadeNascimento" value={campos.cidadeNascimento} onChange={handleChange("cidadeNascimento")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estadoNascimento">Estado de nascimento</Label>
              <Input id="estadoNascimento" value={campos.estadoNascimento} onChange={handleChange("estadoNascimento")} maxLength={2} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nomePai">Nome do pai</Label>
              <Input id="nomePai" value={campos.nomePai} onChange={handleChange("nomePai")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nomeMae">Nome da mãe</Label>
              <Input id="nomeMae" value={campos.nomeMae} onChange={handleChange("nomeMae")} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input id="bairro" value={campos.bairro} onChange={handleChange("bairro")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidadeResidencia">Cidade</Label>
              <Input id="cidadeResidencia" value={campos.cidadeResidencia} onChange={handleChange("cidadeResidencia")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estadoResidencia">UF</Label>
              <Input id="estadoResidencia" value={campos.estadoResidencia} onChange={handleChange("estadoResidencia")} maxLength={2} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <Input id="cep" value={campos.cep} onChange={handleChange("cep")} placeholder="00000-000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataApresentacao">Data da apresentação</Label>
            <Input id="dataApresentacao" type="date" value={campos.dataApresentacao} onChange={handleChange("dataApresentacao")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nomeSecretario">Secretário(a)</Label>
              <Input id="nomeSecretario" value={campos.nomeSecretario} onChange={handleChange("nomeSecretario")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nomePastor">Pastor</Label>
              <Input id="nomePastor" value={campos.nomePastor} onChange={handleChange("nomePastor")} />
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
        mobileImage="/certificado_menina.png"
        mobileAlt="Prévia do certificado de apresentação da menina"
        frameColor="#fce7f3"
      >
        <CertificateInner
          logoSrc={logoSrc}
          igrejaNome={igrejaNome}
          campos={campos}
          dataNascimentoFormatada={dataNascimentoFormatada}
          dataApresentacaoFormatada={dataApresentacaoFormatada}
        />
      </CertificatePreview>
    </section>
  );
}
