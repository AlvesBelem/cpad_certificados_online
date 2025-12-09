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
    preview: "/certificado_batismo.jpg",
  },
  {
    slug: "ebd",
    title: "Certificado EBD",
    description: "Modelo inspirado na Escola Bíblica Dominical com trimestre, classe e assinaturas.",
    preview: "/certificado_ebd_trimestre.jpg",
  },
  {
    slug: "ebd-anual",
    title: "Certificado EBD Anual",
    description: "Registro anual para promoção de turma na Escola Bíblica Dominical.",
    preview: "/certificado_ebd_anual.jpg",
  },
  {
    slug: "discipulado",
    title: "Certificado de Discipulado",
    description: "Modelo dourado para cursos e treinamentos de discipulado.",
    preview: "/certificado_discipulado.jpg",
  },
  {
    slug: "apresentacao-menina",
    title: "Apresentação de Crianças (Menina)",
    description: "Certificado especial para apresentação feminina, mantendo o layout original.",
    preview: "/certificado_menina.jpg",
  },
  {
    slug: "apresentacao-menino",
    title: "Apresentação de Crianças (Menino)",
    description: "Variante masculina do certificado de apresentação infantil.",
    preview: "/certificado_menino.jpg",
  },
  {
    slug: "casamento",
    title: "Certificado de Casamento",
    description: "Modelo floral inspirado no layout tradicional de casamento cristão.",
    preview: "/certificado_casamento.jpg",
  },
  {
    slug: "honra-merito-assembleia",
    title: "Certificado de Honra ao Mérito (Assembleia)",
    description: "Modelo de homenagem com logos e assinaturas para serviços prestados.",
    preview: "/certificado_discipulado.jpg",
  },
  {
    slug: "ordenacao-pastoral",
    title: "Certificado de Ordenação Pastoral",
    description: "Registro de ordenação ao ministério pastoral com dados completos.",
    preview: "/certificado_ordenacao.jpg",
  },
  {
    slug: "ordenacao-presbitero",
    title: "Certificado de Ordenação Presbítero",
    description: "Certificado para ordenação ao presbitério, seguindo o padrão dos demais.",
    preview: "/certificado_prebitero.jpg",
  },
  {
    slug: "ordenacao-diacono",
    title: "Certificado de Ordenação Diácono",
    description: "Certificado para ordenação diaconal, no mesmo formato dos outros modelos.",
    preview: "/certificado_diacono.jpg",
  },
  {
    slug: "ordenacao-evangelista",
    title: "Certificado de Ordenação Evangelista",
    description: "Certificado para ordenação ao ministério evangelista, com os campos essenciais.",
    preview: "/certificado_evangelista.jpg",
  },
  {
    slug: "ordenacao-missionario",
    title: "Certificado de Ordenação Ministério Missionário",
    description: "Certificado para ordenação ao ministério missionário, seguindo o padrão dourado.",
    preview: "/certificado_missionario.jpg",
  },
  {
    slug: "dizimista-fiel",
    title: "Certificado de Dizimista Fiel",
    description: "Reconhecimento de fidelidade nos dízimos, com nome, data e versículo.",
    preview: "/certificado_dizimista.jpg",
  },
  {
    slug: "encontro-casais",
    title: "Certificado de Encontro de Casais",
    description: "Certificado romântico para encontros de casais, com dados do casal e assinaturas.",
    preview: "/certificado_casais.jpg",
  },
  {
    slug: "participacao-celula",
    title: "Certificado de Participação em Célula",
    description: "Registro da participação em células ou pequenos grupos.",
    preview: "/certificado_discipulado.jpg",
  },
];
