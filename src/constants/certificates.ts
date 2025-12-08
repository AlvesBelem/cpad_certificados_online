export type CertificateTemplate = {
  slug: string;
  title: string;
  description?: string;
  preview?: string;
};

export const CERTIFICATE_TEMPLATES: CertificateTemplate[] = [
  {
    slug: "batismo",
    title: "Certificado de Batismo",
    description: "Modelo com campos para dados do batizando, data e assinaturas.",
  },
  {
    slug: "ebd",
    title: "Certificado EBD",
    description: "Modelo inspirado na Escola Bíblica Dominical com trimestre, classe e assinaturas.",
  },
  {
    slug: "ebd-anual",
    title: "Certificado EBD Anual",
    description: "Registro anual para promoção de turma na Escola Bíblica Dominical.",
  },
  {
    slug: "discipulado",
    title: "Certificado de Discipulado",
    description: "Modelo dourado para cursos e treinamentos de discipulado.",
  },
  {
    slug: "apresentacao-menina",
    title: "Apresentação de Crianças (Menina)",
    description: "Certificado especial para apresentação feminina, mantendo o layout original.",
  },
  {
    slug: "apresentacao-menino",
    title: "Apresentação de Crianças (Menino)",
    description: "Variante masculina do certificado de apresentação infantil.",
  },
  {
    slug: "casamento",
    title: "Certificado de Casamento",
    description: "Modelo floral inspirado no layout tradicional de casamento cristão.",
  },
  {
    slug: "ordenacao-pastoral",
    title: "Certificado de Ordenação Pastoral",
    description: "Registro de ordenação ao ministério pastoral com dados completos.",
  },
  {
    slug: "ordenacao-presbitero",
    title: "Certificado de Ordenação Presbítero",
    description: "Certificado para ordenação ao presbitério, seguindo o padrão dos demais.",
  },
  {
    slug: "ordenacao-diacono",
    title: "Certificado de Ordenação Diácono",
    description: "Certificado para ordenação diaconal, no mesmo formato dos outros modelos.",
  },
  {
    slug: "ordenacao-evangelista",
    title: "Certificado de Ordenação Evangelista",
    description: "Certificado para ordenação ao ministério evangelista, com os campos essenciais.",
  },
  {
    slug: "ordenacao-missionario",
    title: "Certificado de Ordenação Ministério Missionário",
    description: "Certificado para ordenação ao ministério missionário, seguindo o padrão dourado.",
  },
  {
    slug: "dizimista-fiel",
    title: "Certificado de Dizimista Fiel",
    description: "Reconhecimento de fidelidade nos dízimos, com nome, data e versículo.",
  },
  {
    slug: "encontro-casais",
    title: "Certificado de Encontro de Casais",
    description: "Certificado romântico para encontros de casais, com dados do casal e assinaturas.",
  },
  {
    slug: "participacao-celula",
    title: "Certificado de Participação em Célula",
    description: "Registro da participação em células ou pequenos grupos.",
  },
];
