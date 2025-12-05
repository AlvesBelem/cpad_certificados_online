"use client";

import { Button } from "@/components/ui/button";

interface CertificateFormProps {
    isShareSupported: boolean;
    isGenerating: boolean;
    handleShare: () => void;
    handleGeneratePDF: () => void;
}

export function CertificateForm({
    isShareSupported,
    isGenerating,
    handleShare,
    handleGeneratePDF,
}: CertificateFormProps) {
    return (
        <form className="certificate-form space-y-4 rounded-2xl border border-border/50 bg-background/70 p-4 shadow-sm print:hidden">
            <div className="hidden gap-2 pt-2 md:flex">
                <Button
                    type="button"
                    size="sm"
                    className="flex-1 bg-emerald-700 text-white hover:bg-emerald-800"
                    onClick={handleGeneratePDF}
                    disabled={isGenerating}
                >
                    {isGenerating ? "Gerando PDF..." : "Gerar PDF"}
                </Button>
            </div>
            <div className="flex gap-2 pt-2 md:hidden">
                {isShareSupported && (
                    <Button
                        type="button"
                        variant={isGenerating ? "outline" : "default"}
                        className="flex-1"
                        onClick={handleShare}
                        disabled={isGenerating}
                    >
                        {isGenerating ? "Gerando PDF..." : "Compartilhar PDF"}
                    </Button>
                )}
            </div>
        </form>
    );
}
