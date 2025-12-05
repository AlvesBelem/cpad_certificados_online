"use client";

import { useState, type ChangeEvent } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DiscipuladoCertificateBuilder } from "../_components/discipulado-certificate-builder";

export default function CertificadoDiscipuladoPage() {
  const [igrejaNome, setIgrejaNome] = useState("Igreja local");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPath, setLogoPath] = useState<string | null>(null);

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoPath(URL.createObjectURL(file));
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-12 md:px-10 lg:px-16">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">Certificados</p>
        <h1 className="text-2xl font-semibold text-foreground">Certificado de Discipulado</h1>
        <p className="text-sm text-muted-foreground">
          Preencha os dados do curso de discipulado e gere o certificado com apenas um clique.
        </p>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/certificados">Voltar para os certificados</Link>
        </Button>
      </header>

      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle>Identidade da igreja (opcional)</CardTitle>
          <CardDescription>Use o nome e o logo da igreja para personalizar o cabeçalho do certificado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Identidade visual do certificado</p>
            <p className="text-xs text-muted-foreground">Defina como a marca da igreja vai aparecer na arte.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="igrejaNome">Nome da igreja</Label>
              <Input
                id="igrejaNome"
                value={igrejaNome}
                onChange={(event) => setIgrejaNome(event.target.value)}
                placeholder="Ex.: Assembleia de Deus - Sede"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl">URL do logo (opcional)</Label>
              <Input
                id="logoUrl"
                value={logoUrl}
                onChange={(event) => setLogoUrl(event.target.value)}
                placeholder="https://exemplo.com/logo.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUpload">Upload da logo</Label>
              <Input id="logoUpload" type="file" accept="image/*" onChange={handleLogoUpload} />
              <p className="text-xs text-muted-foreground">PNG/JPG. Sem upload usamos a logo padrão (igreja.png).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle>Informações do certificado</CardTitle>
          <CardDescription>Preencha os campos do curso para gerar o certificado de discipulado.</CardDescription>
        </CardHeader>
        <CardContent>
          <DiscipuladoCertificateBuilder igrejaNome={igrejaNome || "Igreja"} logoUrl={logoUrl || undefined} logoPath={logoPath} />
        </CardContent>
      </Card>
    </main>
  );
}
