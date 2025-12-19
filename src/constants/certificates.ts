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
    preview: "/certificates/batismo/certificado_batismo.jpg",
  },
  {
    slug: "ebd",
    title: "Certificado EBD",
    description: "Modelo inspirado na Escola Biblica Dominical com trimestre, classe e assinaturas.",
    preview: "/certificates/ebd/certificado_ebd_trimestre.jpg",
  },
  {
    slug: "ebd-anual",
    title: "Certificado EBD Anual",
    description: "Registro anual para promocao de turma na Escola Biblica Dominical.",
    preview: "/certificates/ebd-anual/certificado_ebd_anual.jpg",
  },
  {
    slug: "discipulado",
    title: "Certificado de Discipulado",
    description: "Modelo dourado para cursos e treinamentos de discipulado.",
    preview: "/certificates/discipulado/certificado_discipulado.jpg",
  },
  {
    slug: "apresentacao-menina",
    title: "Apresentacao de Criancas (Menina)",
    description: "Certificado especial para apresentacao feminina, mantendo o layout original.",
    preview: "/certificates/apresentacao-menina/certificado_menina.jpg",
  },
  {
    slug: "apresentacao-menino",
    title: "Apresentacao de Criancas (Menino)",
    description: "Variante masculina do certificado de apresentacao infantil.",
    preview: "/certificates/apresentacao-menino/certificado_menino.jpg",
  },
  {
    slug: "casamento",
    title: "Certificado de Casamento",
    description: "Modelo floral inspirado no layout tradicional de casamento cristao.",
    preview: "/certificates/casamento/certificado_casamento.jpg",
  },
  {
    slug: "honra-merito-assembleia",
    title: "Certificado de Honra ao Merito (Assembleia)",
    description: "Modelo de homenagem com logos e assinaturas para servicos prestados.",
    preview: "/certificates/honra-merito-assembleia/certificado_honra_ao_merito.jpg",
  },
  {
    slug: "ordenacao-pastoral",
    title: "Certificado de Ordenacao Pastoral",
    description: "Registro de ordenacao ao ministerio pastoral com dados completos.",
    preview: "/certificates/ordenacao-pastoral/certificado_ordenacao.jpg",
  },
  {
    slug: "ordenacao-presbitero",
    title: "Certificado de Ordenacao Presbitero",
    description: "Certificado para ordenacao ao presbiterio, seguindo o padrao dos demais.",
    preview: "/certificates/ordenacao-presbitero/certificado_prebitero.jpg",
  },
  {
    slug: "ordenacao-diacono",
    title: "Certificado de Ordenacao Diacono",
    description: "Certificado para ordenacao diaconal, no mesmo formato dos outros modelos.",
    preview: "/certificates/ordenacao-diacono/certificado_diacono.jpg",
  },
  {
    slug: "ordenacao-evangelista",
    title: "Certificado de Ordenacao Evangelista",
    description: "Certificado para ordenacao ao ministerio evangelista, com os campos essenciais.",
    preview: "/certificates/ordenacao-evangelista/certificado_evangelista.jpg",
  },
  {
    slug: "ordenacao-missionario",
    title: "Certificado de Ordenacao Ministerio Missionario",
    description: "Certificado para ordenacao ao ministerio missionario, seguindo o padrao dourado.",
    preview: "/certificates/ordenacao-missionario/certificado_missionario.jpg",
  },
  {
    slug: "dizimista-fiel",
    title: "Certificado de Dizimista Fiel",
    description: "Reconhecimento de fidelidade nos dizimos, com nome, data e versiculo.",
    preview: "/certificates/dizimista-fiel/certificado_dizimista.jpg",
  },
  {
    slug: "encontro-casais",
    title: "Certificado de Encontro de Casais",
    description: "Certificado romantico para encontros de casais, com dados do casal e assinaturas.",
    preview: "/certificates/encontro-casais/certificado_casais.jpg",
  },
  {
    slug: "participacao-celula",
    title: "Certificado de Participacao em Celula",
    description: "Registro da participacao em celulas ou pequenos grupos.",
    preview: "/certificates/discipulado/certificado_discipulado.jpg",
  },
];
