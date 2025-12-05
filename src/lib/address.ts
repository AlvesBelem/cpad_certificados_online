import { z } from "zod";
import { prisma } from "@/lib/prisma";

const nullableText = z
  .string()
  .optional()
  .transform((value) => {
    if (!value) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  });

export const enderecoSchema = z.object({
  logradouro: nullableText,
  numero: nullableText,
  complemento: nullableText,
  bairro: nullableText,
  cidade: nullableText,
  estado: nullableText,
  cep: nullableText,
  referencia: nullableText,
});

export type EnderecoInput = z.infer<typeof enderecoSchema>;
export type EnderecoDisplay = {
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  referencia?: string | null;
} | null;

function hasEnderecoData(data: EnderecoInput) {
  return Object.values(data).some((value) => !!value && value.length > 0);
}

const campoMap: Record<keyof EnderecoInput, string> = {
  logradouro: "Logradouro",
  numero: "Numero",
  complemento: "Complemento",
  bairro: "Bairro",
  cidade: "Cidade",
  estado: "Estado",
  cep: "Cep",
  referencia: "Referencia",
};

export function parseEnderecoFromForm(
  formData: FormData,
  prefix = "endereco",
  options?: { mode?: "prefixed" | "plain" },
): EnderecoInput {
  const payload = {} as Record<keyof EnderecoInput, FormDataEntryValue | undefined>;
  const plain = options?.mode === "plain";
  (Object.entries(campoMap) as Array<[keyof EnderecoInput, string]>).forEach(([key, suffix]) => {
    const fieldName = plain
      ? `${suffix.charAt(0).toLowerCase()}${suffix.slice(1)}`
      : `${prefix}${suffix}`;
    const raw = formData.get(fieldName);
    payload[key] = typeof raw === "string" ? raw : undefined;
  });
  return enderecoSchema.parse(payload);
}

export async function persistEndereco(data: EnderecoInput, currentEnderecoId?: string | null) {
  const hasData = hasEnderecoData(data);

  if (!hasData) {
    if (currentEnderecoId) {
      await prisma.endereco.delete({ where: { id: currentEnderecoId } });
    }
    return null;
  }

  if (currentEnderecoId) {
    await prisma.endereco.update({
      where: { id: currentEnderecoId },
      data,
    });
    return currentEnderecoId;
  }

  const novo = await prisma.endereco.create({
    data,
  });
  return novo.id;
}

export function formatEnderecoDisplay(endereco?: EnderecoDisplay) {
  if (!endereco) return null;
  const primeiraLinha = [endereco.logradouro, endereco.numero].filter(Boolean).join(", ");
  const segundaLinha = [endereco.bairro, endereco.cidade, endereco.estado].filter(Boolean).join(" • ");
  const terceiraLinha = endereco.cep ? `CEP ${endereco.cep}` : null;
  const partes = [primeiraLinha, segundaLinha, terceiraLinha].filter((parte) => parte);
  if (endereco.referencia) {
    partes.push(`Ref.: ${endereco.referencia}`);
  }
  return partes.length ? partes.join(" · ") : null;
}
