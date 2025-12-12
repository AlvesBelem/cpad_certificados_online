"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Clock, Download, Printer, ShieldCheck, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const certificatePreviews = [
  { title: "Batismo", href: "/certificados/batismo", image: "/certificates/batismo/certificado_batismo.jpg" },
  { title: "EBD", href: "/certificados/ebd", image: "/certificates/ebd/certificado_ebd_trimestre.jpg" },
  { title: "Discipulado", href: "/certificados/discipulado", image: "/certificates/discipulado/certificado_discipulado.jpg" },
  { title: "Apresenta???o Menina", href: "/certificados/apresentacao-menina", image: "/certificates/apresentacao-menina/certificado_menina.jpg" },
  { title: "Apresenta???o Menino", href: "/certificados/apresentacao-menino", image: "/certificates/apresentacao-menino/certificado_menino.jpg" },
  { title: "Casamento", href: "/certificados/casamento", image: "/certificates/casamento/certificado_casamento.jpg" },
  { title: "EBD Anual", href: "/certificados/ebd-anual", image: "/certificates/ebd-anual/certificado_ebd_anual.jpg" },
  { title: "Ordena???o Pastoral", href: "/certificados/ordenacao-pastoral", image: "/certificates/ordenacao-pastoral/certificado_ordenacao.jpg" },
  { title: "Dizimista Fiel", href: "/certificados/dizimista-fiel", image: "/certificates/dizimista-fiel/certificado_dizimista.jpg" },
  { title: "Encontro de Casais", href: "/certificados/encontro-casais", image: "/certificates/encontro-casais/certificado_casais.jpg" },
];

const steps = [
  {
    title: "Escolha o certificado",
    description: "Selecione o modelo que precisa. Todos já vêm prontos para preencher.",
    icon: <Wand2 className="h-5 w-5 text-primary" />,
  },
  {
    title: "Insira as informações",
    description: "Digite os dados da igreja e do evento e veja a prévia em tempo real.",
    icon: <Printer className="h-5 w-5 text-primary" />,
  },
  {
    title: "Gere o PDF",
    description: "Baixe o PDF finalizado e realize a impressão a partir dele quando quiser.",
    icon: <Download className="h-5 w-5 text-primary" />,
  },
];

const highlights = [
  { title: "Templates aprovados", description: "Arte revisada e pronta para uso. Mantemos o padrao visual original.", icon: <ShieldCheck className="h-5 w-5 text-primary" /> },
  { title: "Cobranca simples", description: "Pague so o que emitir com descontos progressivos por volume.", icon: <CheckCircle2 className="h-5 w-5 text-primary" /> },
  { title: "Entrega rapida", description: "PDF pronto para imprimir logo apos o pagamento.", icon: <Clock className="h-5 w-5 text-primary" /> },
];

const pricingTiers = [
  { title: "1 a 10 certificados", price: "R$ 2,50 cada", description: "Para datas pontuais e eventos menores." },
  { title: "11 a 50 certificados", price: "R$ 2,00 cada", description: "Melhor custo para periodos com varias turmas." },
  { title: "51 certificados ou mais", price: "R$ 1,80 cada", description: "Desconto para quem emite em escala." },
];

export default function LandingPage() {
  return (
    <main className="bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16 md:px-10 lg:px-16">
        <Hero />
        <Pricing />
        <TemplateGrid />
        <HowItWorks />
        <Highlights />
        <FinalCta />
      </section>
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <div className="grid gap-10 md:grid-cols-[1.1fr,0.9fr] md:items-center">
      <div className="space-y-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Planos pagos por certificado
        </p>
        <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Certificados prontos para batismo, casamento e ministerio com cobranca por volume.
        </h1>
        <p className="text-balance text-lg text-muted-foreground">
          Versao para igrejas, eventos e pessoas que precisam emitir certificados pagos. Escolha o modelo, pague por unidade e gere o PDF em minutos.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 px-8 text-base">
            <Link href="/certificados">
              Escolher certificado
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
            <Link href="/login">Cadastrar ou fazer login</Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Printer className="h-4 w-4 text-primary" /> Impressao a partir do PDF gerado
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" /> Valores progressivos por volume
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Modelos revisados
          </span>
        </div>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle>O que voce encontra aqui</CardTitle>
          <CardDescription className="text-base">
            Certificados aprovados por igrejas locais, focados em clareza e em impressao.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="flex items-center justify-between rounded-xl border border-primary/15 bg-background/60 px-4 py-3">
            <span>Modelos prontos</span>
            <span className="text-xl font-semibold text-foreground">10+</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-primary/15 bg-background/60 px-4 py-3">
            <span>PDF em poucos cliques</span>
            <span className="text-xl font-semibold text-foreground">Sim</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-primary/15 bg-background/60 px-4 py-3">
            <span>Pagamento por emissao</span>
            <span className="text-xl font-semibold text-foreground">De R$ 1,80 a R$ 2,50</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Pricing() {
  return (
    <section className="space-y-6 rounded-3xl border border-border/80 bg-card px-6 py-10">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Planos pagos</p>
        <h2 className="text-3xl font-bold tracking-tight">Pague apenas pelos certificados que emitir.</h2>
        <p className="text-muted-foreground">
          Valores por faixa para atender tanto eventos unicos quanto emissoes recorrentes.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {pricingTiers.map((tier) => (
          <Card key={tier.title} className="border-border/70 bg-background/70">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">{tier.title}</CardTitle>
              <CardDescription className="text-base font-semibold text-foreground">{tier.price}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{tier.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function TemplateGrid() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const total = certificatePreviews.length;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="modelos" className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Modelos prontos</p>
        <h2 className="text-3xl font-bold tracking-tight">Escolha o certificado e personalize os campos.</h2>
        <p className="text-muted-foreground">
          Os layouts foram mantidos intactos para preservar o padrão. Basta informar os dados e imprimir.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/50 px-3 py-6 shadow-sm">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {certificatePreviews.map((item) => {
            const imageSrc = item.image || "/certificates/batismo/certificado_batismo.jpg";
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group relative flex min-w-full flex-shrink-0 flex-col items-center gap-4 px-2"
              >
                <div className="relative h-[320px] w-full overflow-hidden rounded-2xl border border-border/70 bg-muted shadow-md">
                  <Image
                    src={imageSrc}
                    alt={`Prévia do certificado ${item.title}`}
                    fill
                    className="object-contain"
                    sizes="(min-width: 1024px) 800px, 100vw"
                    priority
                  />
                </div>
                <div className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-background/90 px-4 py-3 shadow-sm">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">Pronto para imprimir</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="grid gap-6 rounded-3xl border border-border/80 bg-card px-6 py-10 md:grid-cols-[1fr,1.1fr]">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Como funciona</p>
        <h2 className="text-3xl font-bold tracking-tight">Um fluxo simples para gerar certificados pagos.</h2>
        <p className="text-muted-foreground">
          A cobranca acontece por certificado dentro das faixas acima. Escolha o modelo, preencha e exporte o PDF.
        </p>
        <Button asChild className="mt-2 w-fit">
          <Link href="/certificados">
            Ir para os certificados
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <Card key={step.title} className="border-border/60 bg-background/70">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {index + 1}
              </div>
              <div className="flex items-center gap-2 text-primary">
                {step.icon}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <CardTitle className="text-lg">{step.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Highlights() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Diferenciais</p>
        <h2 className="text-3xl font-bold tracking-tight">Pensado para quem precisa pagar e emitir em escala.</h2>
        <p className="text-muted-foreground">
          Mantivemos apenas o essencial: os certificados, a cobranca por faixa e o PDF pronto para impressao.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {highlights.map((highlight) => (
          <Card key={highlight.title} className="border-border/60">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                {highlight.icon}
              </div>
              <CardTitle className="text-lg">{highlight.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{highlight.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="rounded-3xl border border-dashed border-border/70 bg-primary/5 px-6 py-10 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">
        Pronto para usar
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight">
        Acesse os certificados pagos e gere o documento agora mesmo.
      </h2>
      <p className="mt-2 text-muted-foreground">
        Valores por quantidade emitida e PDF pronto logo apos o pagamento. Sem burocracia extra.
      </p>
      <Button asChild size="lg" className="mt-6">
        <Link href="/certificados">
          Abrir os certificados
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-foreground">AdiGreja Certificados</p>
          <p>Site publico focado na emissao paga de certificados.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/certificados" className="hover:text-foreground">
            Certificados
          </Link>
          <Link href="/certificados/batismo" className="hover:text-foreground">
            Batismo
          </Link>
          <Link href="/certificados/casamento" className="hover:text-foreground">
            Casamento
          </Link>
        </div>
        <p className="text-xs">{new Date().getFullYear()} Adigreja. Modelos mantidos conforme o padrao original.</p>
      </div>
    </footer>
  );
}

