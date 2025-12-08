import { useEffect, useMemo, useState } from "react";

export type CertificateModelOption = {
  id: string;
  name: string;
  previewImage?: string | null;
  backgroundImage?: string | null;
  topBorderImage?: string | null;
  bottomBorderImage?: string | null;
  accentColor?: string | null;
  certificateSlug?: string;
  isDefault?: boolean;
};

export function useCertificateModels(certificateSlug: string | null | undefined, defaultOption: CertificateModelOption) {
  const [models, setModels] = useState<CertificateModelOption[]>([]);
  const [selectedId, setSelectedId] = useState<string>(defaultOption.id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadModels() {
      if (!certificateSlug) {
        setModels([]);
        setIsLoading(false);
        setError(null);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/certificate-models?certificateSlug=${certificateSlug}`);
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.message || "Não foi possível carregar os modelos.");
        }
        const data = await response.json();
        if (!active) return;
        setModels(
          Array.isArray(data.models)
            ? data.models.map((item: CertificateModelOption) => ({
                ...item,
                id: item.id,
              }))
            : [],
        );
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Não foi possível carregar os modelos.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadModels();
    return () => {
      active = false;
    };
  }, [certificateSlug]);

  const options = useMemo(() => {
    return [defaultOption, ...models];
  }, [defaultOption, models]);

  useEffect(() => {
    setSelectedId(defaultOption.id);
  }, [defaultOption.id, certificateSlug]);

  const selectedModel = useMemo(() => {
    return options.find((option) => option.id === selectedId) ?? defaultOption;
  }, [options, selectedId, defaultOption]);

  return {
    options,
    selectedModel,
    selectedId,
    selectModel: setSelectedId,
    isLoading,
    error,
  };
}
