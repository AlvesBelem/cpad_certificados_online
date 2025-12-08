import { createContext, useContext, type ReactNode } from "react";
import type { CertificateModelOption } from "@/hooks/use-certificate-models";

const CertificateModelContext = createContext<CertificateModelOption | null>(null);

export function CertificateModelProvider({
  value,
  children,
}: {
  value: CertificateModelOption | null;
  children: ReactNode;
}) {
  return <CertificateModelContext.Provider value={value}>{children}</CertificateModelContext.Provider>;
}

export function useCertificateModelContext() {
  return useContext(CertificateModelContext);
}
