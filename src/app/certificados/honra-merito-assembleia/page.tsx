"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HonraMeritoAssembleiaCertificateBuilder } from "@/app/certificados/_components/honra-merito-assembleia-certificate-builder";

export default function HonraMeritoAssembleiaPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-12 md:px-10 lg:px-16">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">Certificados</p>
        <h1 className="text-2xl font-semibold text-foreground">Certificado de Honra ao Mérito</h1>
        <p className="text-sm text-muted-foreground">
          Modelo para homenagens da Assembleia de Deus, com campos dinâmicos para igreja, congregação, pastor,
          homenageado e data.
        </p>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/certificados">Voltar para os certificados</Link>
        </Button>
      </header>

      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle>Personalize os dados</CardTitle>
          <CardDescription>Preencha o texto da homenagem e confira a prévia antes de gerar o PDF.</CardDescription>
        </CardHeader>
        <CardContent>
          <HonraMeritoAssembleiaCertificateBuilder />
        </CardContent>
      </Card>
    </main>
  );
}
