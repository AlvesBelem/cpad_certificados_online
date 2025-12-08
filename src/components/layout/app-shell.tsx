"use client";

import type { PropsWithChildren } from "react";
import { CartProvider } from "@/components/cart/cart-provider";
import { CartSheetProvider } from "@/components/cart/cart-sheet-context";
import { CartSheet } from "@/components/cart/cart-sheet";
import { SiteHeader } from "@/components/layout/site-header";
import { CertificateModelController } from "@/components/certificates/certificate-model-panel";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <CartProvider>
      <CartSheetProvider>
        <CertificateModelController>
          <div className="flex min-h-screen flex-col bg-background">
            <SiteHeader />
            <div className="flex-1">{children}</div>
            <CartSheet />
          </div>
        </CertificateModelController>
      </CartSheetProvider>
    </CartProvider>
  );
}
