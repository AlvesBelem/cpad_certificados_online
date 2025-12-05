"use client";

import { useState, type ChangeEvent } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrdenacaoObreiroCertificateBuilder } from "../_components/ordenacao-obreiro-certificate-builder";

export default function CertificadoOrdenacaoObreiroPage() {
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
        <h1 className="text-2xl font-semibold text-foreground">Certificado de Ordenação Obreiro</h1>
        <p className="text-sm text-muted-foreground">
          Registre a ordenação a Obreiro com os dados do ordenando, igreja ordenadora e data da imposição de mãos.
        </p>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/certificados">Voltar para os certificados</Link>
        </Button>
      </header>

      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle>Identidade da igreja (opcional)</CardTitle>
          <CardDescription>Adicione o nome e o logo para aparecerem no certificado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Identidade visual do certificado</p>
            <p className="text-xs text-muted-foreground">Escolha como a logo da igreja será exibida.</p>
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
              <Input id="logoUrl" value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} placeholder="https://exemplo.com/logo.png" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUpload">Upload da logo</Label>
              <Input id="logoUpload" type="file" accept="image/*" onChange={handleLogoUpload} />
              <p className="text-xs text-muted-foreground">PNG/JPG são aceitos. Sem upload usamos a logo padrão (igreja.png).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle>Informações de ordenação</CardTitle>
          <CardDescription>Preencha os dados e veja a prévia do certificado na hora.</CardDescription>
        </CardHeader>
        <CardContent>
          <OrdenacaoObreiroCertificateBuilder igrejaNome={igrejaNome || "Igreja"} logoUrl={logoUrl || undefined} logoPath={logoPath} />
        </CardContent>
      </Card>
    </main>
  );
}
