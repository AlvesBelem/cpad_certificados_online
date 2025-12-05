# Como Usar o Hook useCertificatePDF

Este guia explica como adicionar geração e compartilhamento de PDF em certificados.

## 📦 Requisitos

As bibliotecas `html2canvas` e `jsPDF` já estão instaladas no projeto.

## 🚀 Uso Básico

### 1. Importe o hook no seu componente de certificado:

```tsx
import { useCertificatePDF } from "@/hooks/use-certificate-pdf";
```

### 2. Use o hook dentro do componente:

```tsx
export function MeuCertificadoBuilder({ igrejaNome }: Props) {
  const [campos, setCampos] = useState({
    nome: "",
    data: "",
    // ... outros campos
  });

  // Configure o hook
  const { certificateRef, isGenerating, isShareSupported, handleShare, handlePrint } = useCertificatePDF({
    fileName: `certificado-${campos.nome || 'membro'}.pdf`,
    title: "Título do Certificado",
    text: `Certificado para ${campos.nome || "membro"}`
  });

  // ... resto do componente
}
```

### 3. Adicione a ref ao elemento do certificado:

```tsx
<div 
  ref={certificateRef}
  className="certificate-preview ..."
>
  {/* Conteúdo do certificado */}
</div>
```

### 4. Configure os botões (Desktop + Mobile):

```tsx
<div className="flex flex-wrap gap-2 pt-2">
  {/* Botão IMPRIMIR - apenas desktop */}
  <Button 
    type="button" 
    className="hidden flex-1 sm:flex" 
    onClick={handlePrint}
  >
    Imprimir certificado
  </Button>
  
  {/* Botão COMPARTILHAR PDF - apenas mobile */}
  {isShareSupported ? (
    <Button 
      type="button" 
      variant={isGenerating ? "outline" : "default"}
      className="flex-1 sm:hidden" 
      onClick={handleShare}
      disabled={isGenerating}
    >
      {isGenerating ? "Gerando PDF..." : "Compartilhar PDF"}
    </Button>
  ) : null}
</div>
```

## 📝 Exemplo Completo

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCertificatePDF } from "@/hooks/use-certificate-pdf";

type Campos = {
  nome: string;
  data: string;
};

export function NovoCertificado({ igrejaNome }: { igrejaNome: string }) {
  const [campos, setCampos] = useState<Campos>({ nome: "", data: "" });

  const { certificateRef, isGenerating, isShareSupported, handleShare, handlePrint } = useCertificatePDF({
    fileName: `meu-certificado-${campos.nome || 'documento'}.pdf`,
    title: "Meu Certificado",
    text: `Certificado gerado para ${campos.nome}`
  });

  return (
    <section className="grid gap-6 lg:grid-cols-[360px,1fr] print:block print:gap-0">
      {/* Formulário */}
      <form className="certificate-form print:hidden">
        <Input 
          value={campos.nome} 
          onChange={(e) => setCampos(prev => ({ ...prev, nome: e.target.value }))}
        />
        
        {/* Botões */}
        <div className="flex gap-2">
          <Button className="hidden sm:flex" onClick={handlePrint}>
            Imprimir
          </Button>
          {isShareSupported && (
            <Button 
              className="sm:hidden" 
              onClick={handleShare} 
              disabled={isGenerating}
            >
              {isGenerating ? "Gerando..." : "Compartilhar"}
            </Button>
          )}
        </div>
      </form>

      {/* Preview do Certificado */}
      <div ref={certificateRef} className="certificate-preview">
        <h1>{igrejaNome}</h1>
        <p>{campos.nome}</p>
      </div>
    </section>
  );
}
```

## ⚙️ Como Funciona

1. **Desktop**: Usa `window.print()` nativo - sem mudanças
2. **Mobile**: 
   - Captura o HTML do certificado como imagem (html2canvas)
   - Gera PDF em formato A4 paisagem (297mm x 210mm)
   - Certificado ocupa 90% da folha e é centralizado
   - Compartilha via API nativa do navegador

## 🎨 Classes CSS Importantes

- `hidden sm:flex`: Esconde no mobile, mostra no desktop
- `flex-1 sm:hidden`: Mostra no mobile, esconde no desktop
- `print:hidden`: Esconde na impressão
- `print:max-w-[267mm]`: Tamanho do certificado na impressão (90% de 297mm)

## ✅ Certificados Já Atualizados

- ✅ Igreja (Batismo)
- ✅ Apresentação de Menina

## 📋 Próximos Passos

Para criar um novo certificado:
1. Copie a estrutura de um certificado existente
2. Importe e use o hook `useCertificatePDF`
3. Adicione a ref ao container do certificado
4. Configure os botões com as classes corretas

Pronto! 🎉
