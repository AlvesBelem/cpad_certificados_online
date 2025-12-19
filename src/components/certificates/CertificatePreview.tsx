"use client";

import Image from "next/image";
import { ReactNode, RefObject, CSSProperties, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useCertificateModelContext } from "@/contexts/certificate-model-context";

export const SCREEN_CERTIFICATE_WIDTH_MM = 279.168;
export const SCREEN_CERTIFICATE_HEIGHT_MM = 174.979;
export const PRINT_CERTIFICATE_WIDTH_MM = 297; // A4 landscape width
export const PRINT_CERTIFICATE_HEIGHT_MM = 210; // A4 landscape height

type CertificatePreviewProps = {
  certificateRef?: RefObject<HTMLDivElement | null>;
  children: ReactNode;
  widthMm?: number;
  heightMm?: number;
  contentClassName?: string;
  withFrameBands?: boolean;
  frameColor?: string;
  mobileImage?: string;
  mobileAlt?: string;
  allowOverflow?: boolean;
  autoHeight?: boolean;
  printWidthMm?: number;
  printHeightMm?: number;
};

const baseContainerClass = "certificate-preview relative rounded-[24px] bg-transparent select-none";
const baseContentClass =
  "certificate-content relative flex h-full w-full flex-col overflow-hidden rounded-[32px] bg-white p-6 text-center md:p-10 print:mx-auto print:my-auto print:h-auto print:w-[94%] print:max-w-[285mm] print:rounded-[32px] print:p-12";

export function CertificatePreview({
  certificateRef,
  children,
  widthMm = SCREEN_CERTIFICATE_WIDTH_MM,
  heightMm = SCREEN_CERTIFICATE_HEIGHT_MM,
  contentClassName,
  withFrameBands = false,
  frameColor,
  mobileImage,
  mobileAlt = "Previa do certificado",
  allowOverflow = false,
  autoHeight = false,
  printWidthMm = PRINT_CERTIFICATE_WIDTH_MM,
  printHeightMm = PRINT_CERTIFICATE_HEIGHT_MM,
}: CertificatePreviewProps) {
  const containerClass = cn(baseContainerClass, allowOverflow ? "overflow-visible" : "overflow-hidden");
  const certificateModel = useCertificateModelContext();
  const contentStyle: CSSProperties | undefined = frameColor ? ({ ["--certificate-frame-color" as string]: frameColor } as CSSProperties) : undefined;
  const contentClass = cn(baseContentClass, contentClassName, withFrameBands && "certificate-frame-bands");

  useEffect(() => {
    const listenerOptions: AddEventListenerOptions = { capture: true };
    function handlePrintShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }

    window.addEventListener("keydown", handlePrintShortcut, listenerOptions);
    return () => window.removeEventListener("keydown", handlePrintShortcut, listenerOptions);
  }, []);

  const previewStyle: CSSProperties = { width: "100%", maxWidth: `${widthMm}mm` };
  if (!autoHeight) {
    previewStyle.height = `${heightMm}mm`;
  }

  const printPreviewStyle: CSSProperties = {
    width: `${printWidthMm * 0.9}mm`,
    maxWidth: "none",
    margin: "0 auto",
  };
  if (!autoHeight) {
    printPreviewStyle.height = `${printHeightMm * 0.9}mm`;
  }

  const printWrapperStyle: CSSProperties = {
    minHeight: `${printHeightMm}mm`,
    height: `${printHeightMm}mm`,
    width: "100%",
  };

  const renderContent = (showWatermark: boolean) => (
    <div className={contentClass} style={contentStyle}>
      {showWatermark ? (
        <>
          <div data-watermark="true" className="pointer-events-none absolute inset-0 z-50 opacity-60 mix-blend-multiply">
            <div className="h-full w-full bg-[radial-gradient(circle,_rgba(0,0,0,0.08)_1px,_transparent_1px)] bg-[length:32px_32px]" />
          </div>
          <div
            data-watermark="true"
            className="pointer-events-none absolute inset-0 z-50 flex flex-wrap select-none text-center text-xs font-bold uppercase tracking-[0.3em] text-black/10 blur-[0.3px]"
          >
            {Array.from({ length: 40 }).map((_, index) => (
              <span key={index} className="m-3 rotate-[-20deg]">
                MODELO
              </span>
            ))}
          </div>
        </>
      ) : null}
      {certificateModel?.backgroundImage ? (
        <Image
          src={certificateModel.backgroundImage}
          alt="Fundo do certificado"
          fill
          sizes="100vw"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-30"
          priority
        />
      ) : null}
      {certificateModel?.topBorderImage ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center">
          <Image
            src={certificateModel.topBorderImage}
            alt="Borda superior"
            width={1100}
            height={240}
            className="h-auto w-full max-w-[95%] object-contain"
            priority={false}
          />
        </div>
      ) : null}
      {certificateModel?.bottomBorderImage ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center">
          <Image
            src={certificateModel.bottomBorderImage}
            alt="Borda inferior"
            width={1100}
            height={240}
            className="h-auto w-full max-w-[95%] object-contain"
            priority={false}
          />
        </div>
      ) : null}
      <div className="relative z-30 h-full w-full">{children}</div>
    </div>
  );

  const actualPreview = (
    <div
      ref={certificateRef}
      className={cn(containerClass, "print:hidden mobile-hidden md:static md:opacity-100 md:pointer-events-auto md:w-full")}
      style={previewStyle}
      onContextMenu={(event) => event.preventDefault()}
    >
      {renderContent(true)}
    </div>
  );

  const mobilePlaceholder = mobileImage ? (
    <div className="certificate-mobile-photo md:hidden print:hidden">
      <div className="certificate-mobile-photo-frame">
        <Image src={mobileImage} alt={mobileAlt} width={600} height={380} className="h-full w-full rounded-[20px] object-cover" />
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="certificate-preview-wrapper">
        {mobilePlaceholder}
        {actualPreview}
      </div>
      <div
        className="certificate-preview-print hidden print:flex print:w-full print:items-center print:justify-center"
        style={printWrapperStyle}
      >
        <div className={containerClass} style={printPreviewStyle}>
          {renderContent(false)}
        </div>
      </div>
    </>
  );
}
