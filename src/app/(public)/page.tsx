"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Clock, Download, Printer, ShieldCheck, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const certificatePreviews = [
  { title: "Batismo", href: "/certificados/batismo", image: "/certificado_batismo.jpg" },
  { title: "EBD", href: "/certificados/ebd", image: "/certificado_ebd_trimestre.jpg" },
  { title: "Discipulado", href: "/certificados/discipulado", image: "/certificado_discipulado.jpg" },
  { title: "Apresentação Menina", href: "/certificados/apresentacao-menina", image: "/certificado_menina.jpg" },
  { title: "Apresentação Menino", href: "/certificados/apresentacao-menino", image: "/certificado_menino.jpg" },
  { title: "Casamento", href: "/certificados/casamento", image: "/certificado_casamento.jpg" },
  { title: "EBD Anual", href: "/certificados/ebd-anual", image: "/certificado_ebd_anual.jpg" },
  { title: "Ordenação Pastoral", href: "/certificados/ordenacao-pastoral", image: "/certificado_ordenacao.jpg" },
  { title: "Dizimista Fiel", href: "/certificados/dizimista-fiel", image: "/certificado_dizimista.jpg" },
  { title: "Encontro de Casais", href: "/certificados/encontro-casais", image: "/certificado_casais.jpg" },
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
  { title: "Templates aprovados", description: "Arte revisada e pronta para uso. Não alteramos o padrão dos certificados.", icon: <ShieldCheck className="h-5 w-5 text-primary" /> },
  { title: "Sem login ou pagamento", description: "Acesso livre aos modelos. Basta abrir, preencher e imprimir.", icon: <CheckCircle2 className="h-5 w-5 text-primary" /> },
  { title: "Rápido e responsivo", description: "Funciona bem no celular e no desktop. Preenchimento fluido em poucos minutos.", icon: <Clock className="h-5 w-5 text-primary" /> },
];

export default function LandingPage() {
  return (
    <main className="bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16 md:px-10 lg:px-16">
        <Hero />
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
          Gerador de certificados
        </p>
        <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Certificados prontos para batismo, casamento e ministério em poucos cliques.
        </h1>
        <p className="text-balance text-lg text-muted-foreground">
          Todos os modelos já estão desenhados. Basta escolher, preencher e imprimir. Sem conta, sem integração de pagamento.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 px-8 text-base">
            <Link href="/certificados">
              Escolher certificado
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
            <Link href="#modelos">Ver modelos disponíveis</Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Printer className="h-4 w-4 text-primary" /> Impressão a partir do PDF gerado
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" /> Sem login
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Modelos revisados
          </span>
        </div>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle>O que você encontra aqui</CardTitle>
          <CardDescription className="text-base">
            Certificados aprovados por igrejas locais, com foco em clareza e em impressão.
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
            <span>Uso gratuito</span>
            <span className="text-xl font-semibold text-foreground">100%</span>
          </div>
        </CardContent>
      </Card>
    </div>
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
  }, [certificatePreviews.length]);

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
            const imageSrc = item.image || "/certificado_batismo.png";
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
        <h2 className="text-3xl font-bold tracking-tight">Um fluxo simples para gerar certificados sem complicação.</h2>
        <p className="text-muted-foreground">
          Não há login, dashboard ou pagamentos. Apenas escolha o modelo, preencha e exporte.
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
        <h2 className="text-3xl font-bold tracking-tight">Pensado para igrejas que precisam de agilidade.</h2>
        <p className="text-muted-foreground">
          Mantivemos apenas o essencial: os certificados e o que você precisa para preenchê-los rapidamente.
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
        Acesse os certificados e gere o documento agora mesmo.
      </h2>
      <p className="mt-2 text-muted-foreground">
        Nenhum outro módulo, nenhum cadastro. Somente os modelos revisados e prontos para impressão.
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
          <p>Site público focado apenas na emissão de certificados.</p>
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
        <p className="text-xs">{new Date().getFullYear()} Adigreja. Modelos mantidos conforme o padrão original.</p>
      </div>
    </footer>
  );
}
