# Resumo da Implementação de PDFem Certificados

## ✅ Status Atual

### **Componentes Atualizados:**
1. ✅ **Igreja (Batismo)** - Funcionando perfeitamente
2. ✅ **Apresentação de Menina** - Funcionando perfeitamente
3. ⏳ **Apresentação de Menino** - Pendente
4. ⏳ **Casamento** - Pendente

### **Infraestrutura Criada:**
- ✅ Hook reutilizável: `src/hooks/use-certificate-pdf.ts`
- ✅ Documentação completa: `docs/como-usar-certificate-pdf.md`
- ✅ Bibliotecas instaladas: `html2canvas` + `jsPDF`

## 🎯 O que foi Implementado

### **Desktop (sem mudanças):**
- Botão "Imprimir certificado" funciona normalmente
- Usa `window.print()` nativo do navegador
- Totalmente funcional

### **Mobile (nova funcionalidade):**
- Botão "Imprimir" está **escondido** no mobile
- Novo botão "Compartilhar PDF" aparece **apenas no mobile**
- Gera PDF em formato **A4 paisagem** (297mm x 210mm)
- Certificado ocupa **90% da folha**, centralizado
- PDF compartilhável via WhatsApp, Email, etc.

## 📝 Como Aplicar em Novos Certificados

Para aplicar a funcionalidade de PDF em um certificado existente:

### 1. **Adicionar Import:**
```tsx
import { useCertificatePDF } from "@/hooks/use-certificate-pdf";
```

### 2. **Usar o Hook:**
```tsx
const { certificateRef, isGenerating, isShareSupported, handleShare, handlePrint } = useCertificatePDF({
  fileName: `certificado-${campos.nome || 'documento'}.pdf`,
  title: "Título do Certificado",
  text: `Descrição para ${campos.nome || "membro"}`
});
```

### 3. **Remover Código Antigo:**
Remover estas linhas (se existirem):
```tsx
// ❌ Remover:
const isShareSupported = typeof navigator !== "undefined" && typeof navigator.share === "function";

const handlePrint = () => {
  window.print();
};

const handleShare = async () => {
  if (!isShareSupported) return;
  try {
    await navigator.share({
      title: "...",
      text: `...`,
      url: window.location.href,
    });
  } catch (err) {
    console.error(err);
  }
};
```

### 4. **Adicionar Ref ao Container do Certificado:**
```tsx
<div 
  ref={certificateRef}  // ← Adicionar esta linha
  className="certificate-preview ..."
>
  {/* Conteúdo do certificado */}
</div>
```

### 5. **Atualizar Botões:**
```tsx
{/* Botão Desktop - Esconder no mobile */}
<Button 
  type="button" 
  className="hidden flex-1 sm:flex"  // ← Adicionar: hidden sm:flex
  onClick={handlePrint}
>
  Imprimir certificado
</Button>

{/* Botão Mobile - Mostrar apenas no mobile */}
{isShareSupported ? (
  <Button 
    type="button" 
    variant={isGenerating ? "outline" : "default"}  // ← Mudar variant
    className="flex-1 sm:hidden" 
    onClick={handleShare}
    disabled={isGenerating}  // ← Adicion ar disabled
  >
    {isGenerating ? "Gerando PDF..." : "Compartilhar PDF"}  {/* ← Mudar texto */}
  </Button>
) : null}
```

## 🔧 Para Completar a Implementação

### **Certificado de Apresentação de Menino:**
1. Abrir: `src/app/dashboard/certificados/_components/apresentacao-menino-certificate-builder.tsx`
2. Seguir os 5 passos acima
3. Testar no mobile

### **Certificado de Casamento:**
1. Abrir: `src/app/dashboard/certificados/_components/casamento-certificate-builder.tsx`
2. Seguir os 5 passos acima
3. Testar no mobile

## ✨ Benefícios

- **Código Limpo**: Todo código duplicado foi removido e centralizado no hook
- **Reutilizável**: Qualquer novo certificado pode usar o mesmo hook
- **Manutenível**: Mudanças na lógica de PDF precisam ser feitas apenas no hook
- **Profissional**: PDF gerado em formato padrão A4, pronto para impressão
- **Compartilhável**: Funciona com qualquer app de compartilhamento do mobile

## 📱 Como Testar

1. Abra o certificado no mobile (ou DevTools responsive)
2. Preencha os campos do formulário
3. Clique em "Compartilhar PDF"
4. Aguarde "Gerando PDF..."
5. Escolha como compartilhar (WhatsApp, Email, etc.)
6. Verifique o PDF gerado em A4 paisagem

---

**Última atualização**: 21 de Novembro de 2025
**Status**: 2 de 4 certificados completos ✅
