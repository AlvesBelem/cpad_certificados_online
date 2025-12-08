"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PDF_LOCK_MESSAGE } from "@/constants/pdf-lock";

interface CertificateFormProps {
    isShareSupported: boolean;
    isGenerating: boolean;
    handleShare?: () => void;
    handleGeneratePDF?: () => void;
    onAddToCart?: () => void;
    isAddingToCart?: boolean;
    canSubmit?: boolean;
    showGenerate?: boolean;
    pdfLocked?: boolean;
    pdfLockMessage?: string;
}

export function CertificateForm({
    isShareSupported,
    isGenerating,
    handleShare,
    handleGeneratePDF,
    onAddToCart,
    isAddingToCart,
    canSubmit = true,
    showGenerate = false,
    pdfLocked = true,
    pdfLockMessage = PDF_LOCK_MESSAGE,
}: CertificateFormProps) {
    const handleLockedAction = () => {
        toast.info(pdfLockMessage);
    };

    const handleGenerateClick = () => {
        if (pdfLocked) {
            handleLockedAction();
            return;
        }
        handleGeneratePDF?.();
    };

    const handleShareClick = () => {
        if (pdfLocked) {
            handleLockedAction();
            return;
        }
        handleShare?.();
    };

    return (
        <form className="certificate-form space-y-4 rounded-2xl border border-border/50 bg-background/70 p-4 shadow-sm print:hidden">
            <div className="hidden gap-2 pt-2 md:flex">
                {showGenerate && (
                    <Button
                        type="button"
                        size="sm"
                        className="flex-1 bg-emerald-700 text-white hover:bg-emerald-800"
                        onClick={handleGenerateClick}
                        disabled={isGenerating || !canSubmit}
                    >
                        {isGenerating ? "Gerando PDF..." : "Gerar PDF"}
                    </Button>
                )}
                {onAddToCart && (
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="flex-1 border-primary/40 text-primary hover:bg-primary/10"
                        onClick={onAddToCart}
                        disabled={isAddingToCart || isGenerating || !canSubmit}
                    >
                        {isAddingToCart ? "Adicionando..." : "Adicionar ao carrinho"}
                    </Button>
                )}
            </div>
            <div className="flex gap-2 pt-2 md:hidden">
                {showGenerate && (
                    <Button
                        type="button"
                        className="flex-1 bg-emerald-700 text-white hover:bg-emerald-800"
                        onClick={handleGenerateClick}
                        disabled={isGenerating || !canSubmit}
                    >
                        {isGenerating ? "Gerando PDF..." : "Gerar PDF"}
                    </Button>
                )}
                {showGenerate && isShareSupported && (
                    <Button
                        type="button"
                        variant={isGenerating ? "outline" : "default"}
                        className="flex-1"
                        onClick={handleShareClick}
                        disabled={isGenerating || !canSubmit}
                    >
                        {isGenerating ? "Gerando PDF..." : "Compartilhar PDF"}
                    </Button>
                )}
                {onAddToCart && (
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={onAddToCart}
                        disabled={isAddingToCart || isGenerating || !canSubmit}
                    >
                        {isAddingToCart ? "Adicionando..." : "Adicionar ao carrinho"}
                    </Button>
                )}
            </div>
        </form>
    );
}
