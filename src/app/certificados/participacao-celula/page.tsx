"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParticipacaoCelulaCertificateBuilder } from "../_components/participacao-celula-certificate-builder";

export default function CertificadoParticipacaoCelulaPage() {
  const [igrejaNome, setIgrejaNome] = useState("Igreja local");

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-12 md:px-10 lg:px-16">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">Certificados</p>
        <h1 className="text-2xl font-semibold text-foreground">Certificado de Participação em Célula</h1>
        <p className="text-sm text-muted-foreground">
          Registre a participação assídua na célula, com dados do participante, ano e assinaturas.
        </p>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/certificados">Voltar para os certificados</Link>
        </Button>
      </header>

      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle>Identidade da igreja</CardTitle>
          <CardDescription>Informe o nome da igreja para aparecer no certificado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="igrejaNome">Nome da igreja</Label>
            <Input
              id="igrejaNome"
              value={igrejaNome}
              onChange={(event) => setIgrejaNome(event.target.value)}
              placeholder="Ex.: Assembleia de Deus - Sede"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle>Dados do certificado</CardTitle>
          <CardDescription>Preencha os dados e veja a prévia do certificado.</CardDescription>
        </CardHeader>
        <CardContent>
          <ParticipacaoCelulaCertificateBuilder igrejaNome={igrejaNome || "Igreja"} />
        </CardContent>
      </Card>
    </main>
  );
}
