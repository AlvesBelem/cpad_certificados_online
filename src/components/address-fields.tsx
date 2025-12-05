"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const fieldLabels = {
  cep: "CEP",
  logradouro: "Logradouro",
  numero: "Numero",
  complemento: "Complemento",
  bairro: "Bairro",
  cidade: "Cidade",
  estado: "Estado",
  referencia: "Referencia",
};

export type AddressValue = {
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  referencia?: string | null;
};

type AddressFieldsProps = {
  namePrefix?: string;
  idPrefix?: string;
  initialValue?: AddressValue | null;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
};

export function AddressFields({
  namePrefix = "endereco",
  idPrefix,
  initialValue,
  className,
  collapsible = false,
  defaultExpanded,
}: AddressFieldsProps) {
  const [address, setAddress] = useState<AddressValue>({
    cep: initialValue?.cep ?? "",
    logradouro: initialValue?.logradouro ?? "",
    numero: initialValue?.numero ?? "",
    complemento: initialValue?.complemento ?? "",
    bairro: initialValue?.bairro ?? "",
    cidade: initialValue?.cidade ?? "",
    estado: initialValue?.estado ?? "",
    referencia: initialValue?.referencia ?? "",
  });

  const formatFieldName = (key: keyof AddressValue) => `${namePrefix}${key.charAt(0).toUpperCase()}${key.slice(1)}`;

  const handleChange = (key: keyof AddressValue) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = key === "cep" ? event.target.value.replace(/\D/g, "") : event.target.value;
    setAddress((prev) => ({ ...prev, [key]: value }));
  };

  const [lastLookupCep, setLastLookupCep] = useState<string | null>(null);

  useEffect(() => {
    const cep = (address.cep ?? "").replace(/\D/g, "");
    if (cep.length !== 8 || cep === lastLookupCep) {
      return;
    }

    let active = true;

    const lookup = async () => {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (!response.ok) return;
        const data = await response.json();
        if (data.erro) return;
        if (!active) return;
        setAddress((prev) => ({
          ...prev,
          logradouro: data.logradouro ?? prev.logradouro ?? "",
          bairro: data.bairro ?? prev.bairro ?? "",
          cidade: data.localidade ?? prev.cidade ?? "",
          estado: data.uf ?? prev.estado ?? "",
        }));
        setLastLookupCep(cep);
      } catch {
        // ignore lookup failures
      }
    };

    lookup();

    return () => {
      active = false;
    };
  }, [address.cep, lastLookupCep]);

  const hasInitialData = Boolean(
    initialValue && Object.values(initialValue).some((value) => !!value && String(value).trim().length > 0),
  );

  const [expanded, setExpanded] = useState(() => (collapsible ? defaultExpanded ?? hasInitialData : true));

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Endereco</p>
        {collapsible ? (
          <button
            type="button"
            className="text-xs font-semibold text-primary transition hover:text-primary/80"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? "Recolher" : "Adicionar"}
          </button>
        ) : null}
      </div>
      <div className={cn("grid gap-3 sm:grid-cols-2", !expanded && "hidden")}>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor={`${idPrefix ?? namePrefix}-cep`}>{fieldLabels.cep}</Label>
          <Input
            id={`${idPrefix ?? namePrefix}-cep`}
            name={formatFieldName("cep")}
            placeholder="00000000"
            inputMode="numeric"
            value={address.cep ?? ""}
            onChange={handleChange("cep")}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor={`${idPrefix ?? namePrefix}-logradouro`}>{fieldLabels.logradouro}</Label>
          <Input
            id={`${idPrefix ?? namePrefix}-logradouro`}
            name={formatFieldName("logradouro")}
            placeholder="Rua / Avenida"
            value={address.logradouro ?? ""}
            onChange={handleChange("logradouro")}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix ?? namePrefix}-numero`}>{fieldLabels.numero}</Label>
          <Input
            id={`${idPrefix ?? namePrefix}-numero`}
            name={formatFieldName("numero")}
            placeholder="123"
            value={address.numero ?? ""}
            onChange={handleChange("numero")}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix ?? namePrefix}-complemento`}>{fieldLabels.complemento}</Label>
          <Input
            id={`${idPrefix ?? namePrefix}-complemento`}
            name={formatFieldName("complemento")}
            placeholder="Apto / bloco"
            value={address.complemento ?? ""}
            onChange={handleChange("complemento")}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix ?? namePrefix}-bairro`}>{fieldLabels.bairro}</Label>
          <Input
            id={`${idPrefix ?? namePrefix}-bairro`}
            name={formatFieldName("bairro")}
            placeholder="Bairro"
            value={address.bairro ?? ""}
            onChange={handleChange("bairro")}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix ?? namePrefix}-cidade`}>{fieldLabels.cidade}</Label>
          <Input
            id={`${idPrefix ?? namePrefix}-cidade`}
            name={formatFieldName("cidade")}
            placeholder="Cidade"
            value={address.cidade ?? ""}
            onChange={handleChange("cidade")}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix ?? namePrefix}-estado`}>{fieldLabels.estado}</Label>
          <Input
            id={`${idPrefix ?? namePrefix}-estado`}
            name={formatFieldName("estado")}
            placeholder="UF"
            maxLength={2}
            value={address.estado ?? ""}
            onChange={handleChange("estado")}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor={`${idPrefix ?? namePrefix}-referencia`}>{fieldLabels.referencia}</Label>
          <Input
            id={`${idPrefix ?? namePrefix}-referencia`}
            name={formatFieldName("referencia")}
            placeholder="Ponto de referencia"
            value={address.referencia ?? ""}
            onChange={handleChange("referencia")}
          />
        </div>
      </div>
    </div>
  );
}
