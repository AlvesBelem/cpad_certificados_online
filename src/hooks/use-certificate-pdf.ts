import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { PDF_LOCK_MESSAGE } from "@/constants/pdf-lock";

type UseCertificatePDFOptions = {
  fileName: string;
  title?: string;
  text?: string;
};

const PDF_LOCK_ENABLED = true;
const PAGE_WIDTH_MM = 297;
const PAGE_HEIGHT_MM = 210;
const PREVIEW_SCALE = 0.9;
const PADDING_X_MM = ((1 - PREVIEW_SCALE) * PAGE_WIDTH_MM) / 2;
const PADDING_Y_MM = ((1 - PREVIEW_SCALE) * PAGE_HEIGHT_MM) / 2;

export function useCertificatePDF(options: UseCertificatePDFOptions) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const isShareSupported = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const isIOS = typeof navigator !== "undefined" && /iP(hone|od|ad)/i.test(navigator.userAgent || "");

  const waitForNextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

  const captureCanvas = useCallback(async () => {
    if (!certificateRef.current) return null;

    const element = certificateRef.current;
    const clone = element.cloneNode(true) as HTMLElement;
    clone.classList.remove("mobile-hidden");
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.width = `${PAGE_WIDTH_MM}mm`;
    clone.style.maxWidth = `${PAGE_WIDTH_MM}mm`;
    clone.style.height = `${PAGE_HEIGHT_MM}mm`;
    clone.style.maxHeight = `${PAGE_HEIGHT_MM}mm`;
    clone.style.opacity = "1";
    clone.style.paddingTop = `${PADDING_Y_MM}mm`;
    clone.style.paddingBottom = `${PADDING_Y_MM}mm`;
    clone.style.paddingLeft = `${PADDING_X_MM}mm`;
    clone.style.paddingRight = `${PADDING_X_MM}mm`;
    clone.style.transform = "none";
    clone.style.marginTop = "0";
    clone.style.marginBottom = "0";
    clone.style.display = "flex";
    clone.style.alignItems = "center";
    clone.style.justifyContent = "center";
    clone.style.boxSizing = "border-box";
    clone.style.backgroundColor = "#ffffff";
    clone.querySelectorAll<HTMLElement>("[data-watermark='true']").forEach((node) => node.remove());
    clone.querySelectorAll<HTMLElement>(".certificate-content").forEach((node) => {
      node.style.display = "block";
      node.style.margin = "0 auto";
      node.style.maxWidth = "100%";
      node.style.height = "100%";
    });
    document.body.appendChild(clone);

    await waitForNextFrame();

    try {
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      return canvas;
    } finally {
      clone.remove();
    }
  }, []);

  const buildPdf = async () => {
    const canvas = await captureCanvas();
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

  const capturePreviewImage = useCallback(async () => {
    const canvas = await captureCanvas();
    if (!canvas) return null;
    return canvas.toDataURL("image/png");
  }, [captureCanvas]);

  const handleShare = async () => {
    if (PDF_LOCK_ENABLED) {
      toast.info(PDF_LOCK_MESSAGE);
      return;
    }
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
    if (PDF_LOCK_ENABLED) {
      toast.info(PDF_LOCK_MESSAGE);
      return;
    }
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
    capturePreviewImage,
  };
}
