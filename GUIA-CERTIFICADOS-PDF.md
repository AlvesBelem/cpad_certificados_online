# 📜 Guia Completo: Implementação de Certificados com PDF

> **Última atualização**: 21/11/2025  
> **Versão**: 1.0  
> **Status**: Todos os 4 certificados já implementados ✅

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Como Implementar um NOVO Certificado](#como-implementar-um-novo-certificado)
4. [Exemplo Completo de Código](#exemplo-completo-de-código)
5. [Checklist de Verificação](#checklist-de-verificação)
6. [Troubleshooting](#troubleshooting)
7. [Referências](#referências)

---

## 🎯 Visão Geral

### O que foi implementado?

**Sistema de geração e compartilhamento de certificados em PDF para dispositivos móveis.**

### Comportamento:

| Dispositivo | Botão "Imprimir" | Botão "Compartilhar PDF" |
|-------------|------------------|--------------------------|
| **Desktop** | ✅ Visível | ❌ Oculto |
| **Mobile** | ❌ Oculto | ✅ Visível |

### Funcionalidades:

- ✅ **Desktop**: Impressão tradicional com `window.print()`
- ✅ **Mobile**: Geração de PDF em formato A4 paisagem (297mm x 210mm)
- ✅ **Mobile**: Certificado ocupa 90% da folha, centralizado
- ✅ **Mobile**: Compartilhamento via API nativa (WhatsApp, Email, etc.)

---

## 🏗️ Arquitetura

### Componentes do Sistema:

```
📁 src/
  ├── 📁 hooks/
  │   └── 📄 use-certificate-pdf.ts          ← Hook reutilizável
  │
  ├── 📁 app/dashboard/certificados/_components/
  │   ├── 📄 igreja-certificate-builder.tsx             ← Exemplo implementado
  │   ├── 📄 casamento-certificate-builder.tsx          ← Exemplo implementado
  │   ├── 📄 apresentacao-menina-certificate-builder.tsx ← Exemplo implementado
  │   └── 📄 apresentacao-menino-certificate-builder.tsx ← Exemplo implementado
  │
  └── 📁 node_modules/
      ├── html2canvas   ← Captura HTML como imagem
      └── jspdf         ← Gera PDF profissional
```

### Hook `useCertificatePDF`:

**Localização**: `src/hooks/use-certificate-pdf.ts`

**O que faz**:
- Captura o HTML do certificado como imagem (alta resolução)
- Gera PDF em formato A4 paisagem (297mm x 210mm)
- Centraliza o conteúdo ocupando 90% da folha
- Compartilha o PDF via API nativa do navegador

**Retorna**:
- `certificateRef`: Ref para o elemento HTML do certificado
- `isGenerating`: Estado de loading durante geração do PDF
- `isShareSupported`: Se o navegador suporta compartilhamento
- `handleShare`: Função para gerar e compartilhar PDF
- `handlePrint`: Função para impressão tradicional

---

## 🚀 Como Implementar um NOVO Certificado

### Passo 1: Instalar Dependências (Já feito ✅)

```bash
npm install html2canvas jspdf
```

> **Nota**: Isso já foi feito. Não precisa repetir.

---

### Passo 2: Criar o Componente do Certificado

Crie um novo arquivo em `src/app/dashboard/certificados/_components/`:

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCertificatePDF } from "@/hooks/use-certificate-pdf";

type BuilderProps = {
  igrejaNome: string;
  logoPath?: string | null;
  logoUrl?: string | null;
};

type Campos = {
  // Defina os campos do seu certificado aqui
  nome: string;
  data: string;
  // ... outros campos
};

export function MeuCertificadoBuilder({ igrejaNome, logoPath, logoUrl }: BuilderProps) {
  // 1. ESTADO DOS CAMPOS
  const [campos, setCampos] = useState<Campos>({
    nome: "",
    data: "",
    // ... outros campos
  });

  // 2. USAR O HOOK DE PDF
  const { certificateRef, isGenerating, isShareSupported, handleShare, handlePrint } = useCertificatePDF({
    fileName: `meu-certificado-${campos.nome || 'documento'}.pdf`,
    title: "Meu Certificado",
    text: `Certificado para ${campos.nome || "membro"}`
  });

  // 3. HANDLER PARA MUDANÇAS NOS INPUTS
  const handleChange =
    (field: keyof Campos) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setCampos((prev) => ({ ...prev, [field]: event.target.value }));
    };

  return (
    <section className="grid gap-6 lg:grid-cols-[360px,1fr] print:block print:gap-0">
      {/* 4. FORMULÁRIO (esquerda) */}
      <form className="certificate-form space-y-4 rounded-2xl border border-border/50 bg-background/70 p-4 shadow-sm print:hidden">
        
        {/* Seus campos de input aqui */}
        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            value={campos.nome}
            onChange={handleChange("nome")}
            placeholder="Nome completo"
          />
        </div>

        {/* ... mais campos ... */}

        {/* 5. BOTÕES - IMPORTANTE! */}
        <div className="flex flex-wrap gap-2 pt-2">
          {/* Botão DESKTOP - Escondido no mobile */}
          <Button 
            type="button" 
            className="hidden flex-1 sm:flex"   {/* ← IMPORTANTE: hidden sm:flex */}
            onClick={handlePrint}
          >
            Imprimir certificado
          </Button>

          {/* Botão MOBILE - Escondido no desktop */}
          {isShareSupported ? (
            <Button 
              type="button" 
              variant={isGenerating ? "outline" : "default"}
              className="flex-1 sm:hidden"   {/* ← IMPORTANTE: sm:hidden */}
              onClick={handleShare}
              disabled={isGenerating}
            >
              {isGenerating ? "Gerando PDF..." : "Compartilhar PDF"}
            </Button>
          ) : null}
        </div>
      </form>

      {/* 6. PREVIEW DO CERTIFICADO (direita) */}
      <div 
        ref={certificateRef}   {/* ← IMPORTANTE: Adicionar ref aqui */}
        className="certificate-preview rounded-3xl border border-border bg-white shadow-2xl print:m-0 print:border-0 print:shadow-none print:rounded-none"
      >
        {/* 7. CONTEÚDO DO CERTIFICADO */}
        <div className="certificate-content relative overflow-hidden rounded-3xl border border-primary/50 bg-gradient-to-br from-primary/10 via-white to-primary/5 p-8 text-center print:mx-auto print:my-auto print:h-[90%] print:w-[90%] print:max-w-[267mm] print:max-h-[189mm] print:p-16 print:rounded-3xl print:border print:border-primary/50">
          
          {/* Seu design do certificado aqui */}
          <h1>{igrejaNome}</h1>
          <p>Certificado para: <strong>{campos.nome || "______"}</strong></p>
          <p>Data: {campos.data || "____/____/______"}</p>
          
          {/* ... resto do design ... */}
        </div>
      </div>
    </section>
  );
}
```

---

## 📝 Exemplo Completo de Código

### Componente Mínimo Funcional:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCertificatePDF } from "@/hooks/use-certificate-pdf";

type Campos = {
  nome: string;
};

export function CertificadoSimples({ igrejaNome }: { igrejaNome: string }) {
  const [campos, setCampos] = useState<Campos>({ nome: "" });

  const { certificateRef, isGenerating, isShareSupported, handleShare, handlePrint } = useCertificatePDF({
    fileName: `certificado-${campos.nome || 'membro'}.pdf`,
    title: "Certificado",
    text: `Certificado para ${campos.nome}`
  });

  return (
    <section className="grid gap-6 lg:grid-cols-[360px,1fr] print:block print:gap-0">
      <form className="space-y-4 print:hidden">
        <div>
          <Label htmlFor="nome">Nome</Label>
          <Input 
            id="nome" 
            value={campos.nome} 
            onChange={(e) => setCampos({ nome: e.target.value })} 
          />
        </div>

        <div className="flex gap-2">
          <Button className="hidden flex-1 sm:flex" onClick={handlePrint}>
            Imprimir
          </Button>
          {isShareSupported && (
            <Button 
              className="flex-1 sm:hidden" 
              onClick={handleShare} 
              disabled={isGenerating}
            >
              {isGenerating ? "Gerando..." : "Compartilhar PDF"}
            </Button>
          )}
        </div>
      </form>

      <div ref={certificateRef} className="certificate-preview bg-white p-8">
        <h1>{igrejaNome}</h1>
        <p>Certificamos que <strong>{campos.nome || "______"}</strong></p>
      </div>
    </section>
  );
}
```

---

## ✅ Checklist de Verificação

Use este checklist ao criar um novo certificado:

### Imports:
- [ ] `import { useCertificatePDF } from "@/hooks/use-certificate-pdf";`
- [ ] `import { Button } from "@/components/ui/button";`
- [ ] `import { Input } from "@/components/ui/input";`
- [ ] `import { Label } from "@/components/ui/label";`

### Hook:
- [ ] Chamou `useCertificatePDF()` com `fileName`, `title`, `text`
- [ ] Desestruturou: `certificateRef`, `isGenerating`, `isShareSupported`, `handleShare`, `handlePrint`

### Formulário:
- [ ] Adicionou classe `print:hidden` no `<form>`
- [ ] Criou campos de input com `useState`

### Botões:
- [ ] Botão "Imprimir" tem `className="hidden flex-1 sm:flex"`
- [ ] Botão "Imprimir" chama `onClick={handlePrint}`
- [ ] Botão "Compartilhar" tem `className="flex-1 sm:hidden"`
- [ ] Botão "Compartilhar" chama `onClick={handleShare}`
- [ ] Botão "Compartilhar" tem `disabled={isGenerating}`
- [ ] Botão "Compartilhar" mostra "Gerando PDF..." quando `isGenerating` é `true`

### Preview do Certificado:
- [ ] Container tem `ref={certificateRef}`
- [ ] Container tem classes de responsividade para impressão
- [ ] Conteúdo do certificado tem classes `print:` para impressão em A4

### Testes:
- [ ] Testou no desktop - botão "Imprimir" aparece
- [ ] Testou no mobile - botão "Compartilhar PDF" aparece
- [ ] PDF gerado está em formato A4 paisagem
- [ ] PDF compartilha corretamente no mobile

---

## 🔧 Troubleshooting

### Problema: Botões não aparecem/desaparecem corretamente

**Solução:**
```tsx
// ❌ ERRADO:
<Button className="flex-1" onClick={handlePrint}>Imprimir</Button>

// ✅ CORRETO:
<Button className="hidden flex-1 sm:flex" onClick={handlePrint}>Imprimir</Button>
//             ^^^^^^^^^^^^^^^^ Esconde no mobile, mostra no desktop
```

---

### Problema: PDF não é gerado

**Causa**: Falta a `ref` no container do certificado

**Solução:**
```tsx
// ❌ ERRADO:
<div className="certificate-preview">

// ✅ CORRETO:
<div ref={certificateRef} className="certificate-preview">
//   ^^^^^^^^^^^^^^^^^^^^^ IMPORTANTE!
```

---

### Problema: PDF está cortado ou mal formatado

**Causa**: Classes de impressão faltando

**Solução**: Adicione as classes `print:*` no container do certificado:
```tsx
<div className="certificate-content relative ... print:mx-auto print:my-auto print:h-[90%] print:w-[90%] print:max-w-[267mm] print:max-h-[189mm] print:p-16">
```

---

### Problema: Erro "Cannot read property 'share' of undefined"

**Causa**: Navegador não suporta Web Share API

**Solução**: Já está tratado pelo `isShareSupported`. Se o navegador não suportar, o botão não aparece:
```tsx
{isShareSupported ? (
  <Button onClick={handleShare}>Compartilhar PDF</Button>
) : null}
```

---

### Problema: Imagens não aparecem no PDF

**Causa**: CORS ou imagens não carregadas

**Solução**: O hook já usa `useCORS: true`. Certifique-se de que as imagens sejam servidas do mesmo domínio ou tenham CORS habilitado:
```tsx
// Se usar imagens externas, adicione unoptimized
<Image src={logoSrc} alt="Logo" unoptimized />
```

---

## 📚 Referências

### Arquivos Importantes:

| Arquivo | Descrição |
|---------|-----------|
| `src/hooks/use-certificate-pdf.ts` | Hook reutilizável |
| `src/app/dashboard/certificados/_components/igreja-certificate-builder.tsx` | Exemplo de implementação |
| `package.json` | Dependências `html2canvas` e `jspdf` |

### Certificados Existentes (para referência):

1. ✅ **Igreja (Batismo)** - Certificado de batismo religioso
2. ✅ **Casamento** - Certificado de casamento religioso
3. ✅ **Apresentação Menina** - Apresentação de crianças (feminino)
4. ✅ **Apresentação Menino** - Apresentação de crianças (masculino)

### Bibliotecas Utilizadas:

- **html2canvas** v1.4.1+ - Captura DOM como canvas
- **jsPDF** v2.5.1+ - Geração de PDF
- **Next.js** - Framework React
- **Tailwind CSS** - Estilização responsiva

---

## 📐 Especificações Técnicas

### Formato do PDF:

- **Orientação**: Paisagem (Landscape)
- **Tamanho**: A4 (297mm x 210mm)
- **Área do certificado**: 90% da folha (267.3mm x 189mm)
- **Posicionamento**: Centralizado
- **Resolução**: 2x (scale: 2) para alta qualidade
- **Formato de imagem**: PNG
- **Background**: Branco (#ffffff)

### Classes Tailwind Importantes:

```css
/* Esconder no mobile, mostrar no desktop (sm breakpoint = 640px) */
hidden sm:flex

/* Mostrar no mobile, esconder no desktop */
sm:hidden

/* Esconder na impressão */
print:hidden

/* Tamanho na impressão (A4 paisagem 90%) */
print:max-w-[267mm] print:max-h-[189mm]
print:mx-auto print:my-auto
print:h-[90%] print:w-[90%]
```

---

## 🎨 Design Recommendations

### Para um certificado bonito e profissional:

1. **Use Gradientes Suaves**:
   ```tsx
   bg-gradient-to-br from-primary/10 via-white to-primary/5
   ```

2. **Bordas Decorativas**:
   ```tsx
   <div className="border-4 border-dashed border-primary/20" />
   ```

3. **Tipografia Elegante**:
   ```tsx
   <h1 className="text-4xl font-serif text-primary">Certificado</h1>
   ```

4. **Espaçamento Generoso**:
   ```tsx
   className="space-y-6 p-8"
   ```

5. **Cores do Tema**:
   - Use `text-primary`, `bg-primary/10`, `border-primary/50`
   - Evite cores muito vibrantes

---

## 🎯 Resumo Rápido

**Para criar um novo certificado:**

1. ✅ Copie a estrutura de um certificado existente
2. ✅ Importe: `import { useCertificatePDF } from "@/hooks/use-certificate-pdf"`
3. ✅ Use o hook: `const { certificateRef, ... } = useCertificatePDF({...})`
4. ✅ Adicione `ref={certificateRef}` no container do certificado
5. ✅ Botão Imprimir: `className="hidden flex-1 sm:flex"`
6. ✅ Botão Compartilhar: `className="flex-1 sm:hidden"`
7. ✅ Teste no mobile e desktop

**Pronto! 🎉**

---

## 💡 Dicas Finais

- 📱 **Sempre teste no mobile** - Use DevTools para emular dispositivos
- 🖨️ **Teste a impressão** - Verifique se o PDF está bem formatado
- 🎨 **Mantenha o design simples** - PDFs funcionam melhor com layouts simples
- 📸 **Evite muitas imagens** - Podem aumentar o tamanho do PDF
- ⚡ **Otimize o loading** - Use `loading="lazy"` em imagens
- 🔍 **Valide os campos** - Certifique-se de que os dados estejam corretos antes de gerar o PDF

---

**Desenvolvido com ❤️ pela equipe adiGreja**  
**Última revisão**: 21/11/2025
