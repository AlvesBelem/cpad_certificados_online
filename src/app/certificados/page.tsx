import Link from "next/link";
import { ArrowRight, Download, Printer } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CERTIFICATE_TEMPLATES } from "@/constants/certificates";

export default function CertificadosPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-12 md:px-10 lg:px-16">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/70">Certificados</p>
        <h1 className="text-2xl font-semibold text-foreground">Selecione o modelo</h1>
        <p className="text-sm text-muted-foreground">
          Escolha um certificado para preencher e imprimir. Os templates foram mantidos intactos para preservar o
          padrão visual.
        </p>
      </header>

      <Card className="border-none bg-accent/40 shadow-sm">
        <CardHeader>
          <CardTitle>Como usar</CardTitle>
          <CardDescription>Escolha, preencha, gere o PDF e imprima quando quiser.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">1. Escolha o certificado</p>
            <p className="text-sm text-muted-foreground">
              Selecione o modelo e informe o nome da igreja e o logo (opcional).
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">2. Insira as informações</p>
            <p className="text-sm text-muted-foreground">
              Os dados aparecem na prévia imediatamente, sem login ou cadastro.
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">3. Gere o PDF</p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Printer className="h-4 w-4 text-primary" />
              <Download className="h-4 w-4 text-primary" />
              Baixe o PDF finalizado e faça a impressão a partir dele quando precisar.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {CERTIFICATE_TEMPLATES.map((certificado) => (
          <Link key={certificado.slug} href={`/certificados/${certificado.slug}`} className="block">
            <Card className="h-full border-border/60 bg-card/80 transition hover:border-primary">
              <CardHeader>
                <CardTitle>{certificado.title}</CardTitle>
                <CardDescription>{certificado.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Clique para abrir e personalizar.</span>
                <ArrowRight className="h-4 w-4 text-primary" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
