import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type UseCertificatePDFOptions = {
  fileName: string;
  title?: string;
  text?: string;
};

export function useCertificatePDF(options: UseCertificatePDFOptions) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const isShareSupported = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const isIOS = typeof navigator !== "undefined" && /iP(hone|od|ad)/i.test(navigator.userAgent || "");

  const waitForNextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

  const buildPdf = async () => {
    if (!certificateRef.current) return null;

    const element = certificateRef.current;
    const clone = element.cloneNode(true) as HTMLElement;
    clone.classList.remove("mobile-hidden");
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.width = "297mm";
    clone.style.maxWidth = "297mm";
    clone.style.height = "210mm";
    clone.style.maxHeight = "210mm";
    clone.style.opacity = "1";
    clone.style.paddingTop = "0";
    clone.style.paddingBottom = "0";
    clone.style.transform = "none";
    clone.style.marginTop = "0";
    clone.style.marginBottom = "0";
    clone.style.display = "flex";
    clone.style.alignItems = "center";
    clone.style.justifyContent = "center";
    clone.querySelectorAll<HTMLElement>(".certificate-content").forEach((node) => {
      node.style.display = "block";
      node.style.marginTop = "30mm";
      node.style.marginBottom = "0";
    });
    document.body.appendChild(clone);

    await waitForNextFrame();

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    clone.remove();

    if (!canvas) return null;

    const pdf = new jsPDF("landscape", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const marginX = 0;
    const marginY = 0;
    const usableWidth = pageWidth - marginX * 2;
    const usableHeight = pageHeight - marginY * 2;
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    if (imgWidth === 0 || imgHeight === 0) {
      return pdf;
    }

    const scale = Math.min(usableWidth / imgWidth, usableHeight / imgHeight);
    const targetWidth = imgWidth * scale;
    const targetHeight = imgHeight * scale;
    const offsetX = marginX + (usableWidth - targetWidth) / 2;
    const offsetY = marginY + (usableHeight - targetHeight) / 2;
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", offsetX, offsetY, targetWidth, targetHeight);

    return pdf;
  };

  const handleShare = async () => {
    setIsGenerating(true);
    try {
      const pdf = await buildPdf();
      if (!pdf) return;

      const pdfBlob = pdf.output("blob");
      const file = new File([pdfBlob], options.fileName, { type: "application/pdf" });

      const canShareFiles = typeof navigator !== "undefined" && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });

      if (!isShareSupported || isIOS || !canShareFiles) {
        pdf.save(options.fileName);
        return;
      }

      await navigator.share({
        title: options.title || "Certificado",
        text: options.text || "Certificado gerado",
        files: [file],
      });
    } catch (err) {
      console.error("Erro ao gerar/compartilhar PDF:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const pdf = await buildPdf();
      if (!pdf) return;
      pdf.save(options.fileName);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    certificateRef,
    isGenerating,
    isShareSupported,
    handleShare,
    handleGeneratePDF,
  };
}
