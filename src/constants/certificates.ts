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
    description: "Modelo inspirado na Escola B��blica Dominical com trimestre, classe e assinaturas.",
    preview: "/certificado_ebd_trimestre.jpg",
  },
  {
    slug: "ebd-anual",
    title: "Certificado EBD Anual",
    description: "Registro anual para promo��ǜo de turma na Escola B��blica Dominical.",
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
    title: "Apresenta��ǜo de Crian��as (Menina)",
    description: "Certificado especial para apresenta��ǜo feminina, mantendo o layout original.",
    preview: "/certificado_menina.jpg",
  },
  {
    slug: "apresentacao-menino",
    title: "Apresenta��ǜo de Crian��as (Menino)",
    description: "Variante masculina do certificado de apresenta��ǜo infantil.",
    preview: "/certificado_menino.jpg",
  },
  {
    slug: "casamento",
    title: "Certificado de Casamento",
    description: "Modelo floral inspirado no layout tradicional de casamento cristǜo.",
    preview: "/certificado_casamento.jpg",
  },
  {
    slug: "ordenacao-pastoral",
    title: "Certificado de Ordena��ǜo Pastoral",
    description: "Registro de ordena��ǜo ao ministǸrio pastoral com dados completos.",
    preview: "/certificado_ordenacao.jpg",
  },
  {
    slug: "ordenacao-presbitero",
    title: "Certificado de Ordena��ǜo Presb��tero",
    description: "Certificado para ordena��ǜo ao presbitǸrio, seguindo o padrǜo dos demais.",
    preview: "/certificado_prebitero.jpg",
  },
  {
    slug: "ordenacao-diacono",
    title: "Certificado de Ordena��ǜo Diǭcono",
    description: "Certificado para ordena��ǜo diaconal, no mesmo formato dos outros modelos.",
    preview: "/certificado_diacono.jpg",
  },
  {
    slug: "ordenacao-evangelista",
    title: "Certificado de Ordena��ǜo Evangelista",
    description: "Certificado para ordena��ǜo ao ministǸrio evangelista, com os campos essenciais.",
    preview: "/certificado_evangelista.jpg",
  },
  {
    slug: "ordenacao-missionario",
    title: "Certificado de Ordena��ǜo MinistǸrio Missionǭrio",
    description: "Certificado para ordena��ǜo ao ministǸrio missionǭrio, seguindo o padrǜo dourado.",
    preview: "/certificado_missionario.jpg",
  },
  {
    slug: "dizimista-fiel",
    title: "Certificado de Dizimista Fiel",
    description: "Reconhecimento de fidelidade nos d��zimos, com nome, data e vers��culo.",
    preview: "/certificado_dizimista.jpg",
  },
  {
    slug: "encontro-casais",
    title: "Certificado de Encontro de Casais",
    description: "Certificado romǽntico para encontros de casais, com dados do casal e assinaturas.",
    preview: "/certificado_casais.jpg",
  },
  {
    slug: "participacao-celula",
    title: "Certificado de Participa��ǜo em CǸlula",
    description: "Registro da participa��ǜo em cǸlulas ou pequenos grupos.",
    preview: "/certificado_discipulado.jpg",
  },
];
