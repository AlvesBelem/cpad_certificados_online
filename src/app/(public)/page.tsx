"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const certificatePreviews = [
  {
    title: "Batismo",
    href: "/certificados/batismo",
    image: "/certificates/batismo/certificado_batismo.jpg",
    description: "Layout solene com espaço para dados do batizando, ministros e igreja.",
  },
  {
    title: "EBD",
    href: "/certificados/ebd",
    image: "/certificates/ebd/certificado_ebd_trimestre.jpg",
    description: "Modelo clássico da Escola Bíblica Dominical por trimestre.",
  },
  {
    title: "Discipulado",
    href: "/certificados/discipulado",
    image: "/certificates/discipulado/certificado_discipulado.jpg",
    description: "Certificado dourado para cursos e treinamentos de discipulado.",
  },
  {
    title: "Apresentação Menina",
    href: "/certificados/apresentacao-menina",
    image: "/certificates/apresentacao-menina/certificado_menina.jpg",
    description: "Versão delicada para apresentação infantil feminina.",
  },
  {
    title: "Apresentação Menino",
    href: "/certificados/apresentacao-menino",
    image: "/certificates/apresentacao-menino/certificado_menino.jpg",
    description: "Layout dedicado para apresentação infantil masculina.",
  },
  {
    title: "Casamento",
    href: "/certificados/casamento",
    image: "/certificates/casamento/certificado_casamento.jpg",
    description: "Arte floral com espaço para data, local e assinaturas.",
  },
  {
    title: "EBD Anual",
    href: "/certificados/ebd-anual",
    image: "/certificates/ebd-anual/certificado_ebd_anual.jpg",
    description: "Registro anual para promoção de turma na Escola Bíblica Dominical.",
  },
  {
    title: "Ordenação Pastoral",
    href: "/certificados/ordenacao-pastoral",
    image: "/certificates/ordenacao-pastoral/certificado_ordenacao.jpg",
    description: "Documento de ordenação pastoral com campos completos.",
  },
  {
    title: "Dizimista Fiel",
    href: "/certificados/dizimista-fiel",
    image: "/certificates/dizimista-fiel/certificado_dizimista.jpg",
    description: "Reconhecimento de fidelidade nos dízimos com verso bíblico.",
  },
  {
    title: "Encontro de Casais",
    href: "/certificados/encontro-casais",
    image: "/certificates/encontro-casais/certificado_casais.jpg",
    description: "Certificado romântico para eventos e encontros de casais.",
  },
  {
    title: "Honra ao Mérito Assembleia",
    href: "/certificados/honra-merito-assembleia",
    image: "/certificates/honra-merito-assembleia/certificado_honra_ao_merito.jpg",
    description: "Certificado romântico para eventos e encontros de casais.",
  },
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
        <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Emita certificados evangélicos com agilidade, clareza e credibilidade.
        </h1>
        <p className="text-balance text-lg text-muted-foreground">
          Ideal para igrejas que valorizam excelência e precisam emitir em escala.
        </p>
        <ul className="space-y-2 text-base text-muted-foreground">
          <li>📄 Certificados prontos para Batismo, Casamento, Discipulado, Ordenação e muito mais</li>
          <li>📥 Emissão em massa com importação de planilha .xlsx</li>
          <li>💰 Cobrança por volume, sem mensalidade. Mais você emite, menos paga.</li>
        </ul>
        <ul className="space-y-2 text-base text-muted-foreground">
          <li>✅ Modelos revisados e aprovados</li>
          <li>✅ PDF pronto para imprimir</li>
          <li>✅ Emissão rápida individual ou por lote</li>
          <li>✅ Preços a partir de R$1,80</li>
        </ul>
        <hr className="border-border/60" />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 px-8 text-base">
            <Link href="/certificados">
              Começar a emitir certificados
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
            <Link href="/certificados#modelos">Ver modelos disponíveis</Link>
          </Button>
        </div>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle>Benefícios imediatos</CardTitle>
          <CardDescription className="text-base">
            Tudo que o time de secretaria precisa para manter o padrão visual impecável.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="flex items-center justify-between rounded-xl border border-primary/15 bg-background/60 px-4 py-3">
            <span>🖼 Templates padronizados</span>
            <span className="text-xl font-semibold text-foreground">15+</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-primary/15 bg-background/60 px-4 py-3">
            <span>📥 Importação em lote</span>
            <span className="text-xl font-semibold text-foreground">Planilha .xlsx</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-primary/15 bg-background/60 px-4 py-3">
            <span>💰 Preços inteligentes</span>
            <span className="text-xl font-semibold text-foreground">R$1,80 a R$2,50</span>
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
        <h2 className="text-3xl font-bold tracking-tight">Pague só o que emitir — sem surpresas.</h2>
        <p className="text-muted-foreground">
          <strong>Modelo de preço inteligente:</strong>
        </p>
        <ul className="space-y-2 text-base text-muted-foreground">
          <li>1 a 10 certificados – R$2,50 cada</li>
          <li>11 a 50 certificados – R$2,00 cada</li>
          <li>51+ certificados – R$1,80 cada</li>
        </ul>
        <p className="text-base text-muted-foreground">
          💡 Dica esperta: Faltou 1 certificado pra mudar de faixa? A gente avisa antes do pagamento.
        </p>
      </div>
      <hr className="border-border/60" />
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

  const activeItem = certificatePreviews[currentIndex];

  return (
    <section id="modelos" className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Fluxo completo</p>
        <h2 className="text-3xl font-bold tracking-tight">Faça tudo em minutos, com padrão visual impecável.</h2>
        <ol className="list-decimal space-y-2 pl-5 text-base text-muted-foreground">
          <li>Escolha o modelo</li>
          <li>Preencha ou importe dados via planilha .xlsx</li>
          <li>Gere o PDF pronto para impressão</li>
          <li>Pague só pelo que usar</li>
        </ol>
      </div>

      <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-primary/8 via-card/70 to-background p-4 shadow-lg">
        <div className="grid items-center gap-6 lg:grid-cols-[1.15fr,0.85fr]">
          <div className="relative h-[340px] w-full overflow-hidden rounded-2xl bg-black/5 sm:h-[420px]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(120,102,255,0.08),transparent_45%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(12,148,136,0.12),transparent_40%)]" />
            <Image
              src={activeItem.image || "/certificates/batismo/certificado_batismo.jpg"}
              alt={`Prévia do certificado ${activeItem.title}`}
              fill
              className="object-contain p-4 drop-shadow-2xl"
              sizes="(min-width: 1024px) 720px, 100vw"
              priority
            />
          </div>

          <div className="flex h-full flex-col justify-between gap-6 rounded-2xl bg-background/90 px-6 py-5 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.6)]">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary/70">Modelo em destaque</p>
              <h3 className="text-2xl font-bold text-foreground md:text-3xl">{activeItem.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{activeItem.description}</p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Campos editáveis</span>
                <span className="rounded-full bg-primary/15 px-3 py-1 text-primary">PDF imediato</span>
                <span className="rounded-full bg-slate-200/70 px-3 py-1 text-slate-700">Fiel ao layout original</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link href={activeItem.href}>
                  Abrir modelo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <div className="flex flex-wrap items-center gap-2">
                {certificatePreviews.map((item, index) => {
                  const isActive = index === currentIndex;
                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className="group relative h-11 w-28 overflow-hidden rounded-xl bg-card/80 p-[2px] text-left shadow-inner transition hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      aria-label={`Ver modelo ${item.title}`}
                    >
                      <div
                        className={`absolute inset-0 rounded-[10px] transition ${isActive ? "bg-primary/15" : "bg-muted"}`}
                      />
                      <div className="relative z-10 flex h-full items-center gap-2 px-3 text-xs font-semibold">
                        <span
                          className={`h-2 w-2 rounded-full transition ${isActive ? "bg-primary" : "bg-muted-foreground/50"}`}
                        />
                        <span className="truncate">{item.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
function HowItWorks() {
  const resources = [
    "?? Templates prontos e padronizados",
    "?? Importa??o via planilha .xlsx para emiss?o em massa",
    "? Menos tempo preenchendo, mais tempo cuidando das pessoas",
    "?? PDF pronto para imprimir com qualidade profissional",
  ];

  return (
    <section className="grid gap-6 rounded-3xl border border-border/80 bg-card px-6 py-10 md:grid-cols-[1fr,1.1fr]">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Recursos que importam</p>
        <h2 className="text-3xl font-bold tracking-tight">Recursos que facilitam a vida da secretaria da igreja:</h2>
        <ul className="space-y-2 text-base text-muted-foreground">
          {resources.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <hr className="border-border/60" />
        <Button asChild className="mt-2 w-fit">
          <Link href="/certificados">
            Conferir modelos dispon?veis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {resources.map((item) => (
          <Card key={item} className="border-border/60 bg-background/70">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">{item}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Highlights() {
  return (
    <section className="space-y-6 rounded-3xl border border-border/80 bg-card px-6 py-10">
      <div className="space-y-3">
        <h2 className="text-3xl font-bold tracking-tight">Comece agora com zero burocracia</h2>
        <ul className="space-y-2 text-base text-muted-foreground">
          <li>? Sem mensalidades</li>
          <li>? Interface simples</li>
          <li>? Emiss?o com 3 cliques</li>
        </ul>
      </div>
      <hr className="border-border/60" />
    </section>
  );
}

function FinalCta() {
  return (
    <section className="rounded-3xl border border-dashed border-border/70 bg-primary/5 px-6 py-10 text-center">
      <h2 className="text-3xl font-bold tracking-tight">Fácil de começar, fácil de escalar</h2>
      <p className="mt-2 text-muted-foreground">
        Emita certificados evangélicos com clareza, mantenha o padrão visual e pague apenas pelo que usar.
      </p>
      <div style={{ marginTop: "1rem" }} className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/certificados"
          className="btn-primary inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-base font-semibold text-background shadow transition hover:bg-primary/90"
        >
          Começar a emitir certificados
        </Link>
        <Link
          href="/certificados#modelos"
          className="btn-secondary inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-base font-semibold text-foreground transition hover:bg-background"
        >
          Ver modelos disponíveis
        </Link>
      </div>
      <hr className="border-border/60" />
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

