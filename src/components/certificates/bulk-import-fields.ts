import type { BulkImportField } from "./bulk-import-panel";

type FieldMetadata = {
  label: string;
  example?: string;
  required?: boolean;
};

const FIELD_LIBRARY: Record<string, FieldMetadata> = {
  ano: { label: "Ano", example: "2025" },
  bairro: { label: "Bairro", example: "Centro" },
  cep: { label: "CEP", example: "12345-000" },
  cidade: { label: "Cidade", example: "Sao Paulo" },
  cidadeNascimento: { label: "Cidade de nascimento", example: "Recife" },
  cidadeResidencia: { label: "Cidade de residencia", example: "Fortaleza" },
  classe: { label: "Classe", example: "Adultos" },
  classeAtual: { label: "Classe atual", example: "Intermediarios" },
  congregacao: { label: "Congregação", example: "Congregação Central" },
  data: { label: "Data", example: "2025-12-01" },
  dataApresentacao: { label: "Data da apresentacao", example: "2025-03-10" },
  dataBatismo: { label: "Data do batismo", example: "2025-04-15" },
  dataCasamento: { label: "Data do casamento", example: "2025-06-20" },
  dataConclusao: { label: "Data de conclusao", example: "2025-12-05" },
  dataFim: { label: "Data de termino", example: "2025-08-15" },
  dataInicio: { label: "Data de inicio", example: "2025-06-01" },
  dataNascimento: { label: "Data de nascimento", example: "2000-01-15" },
  dataOrdenacao: { label: "Data da ordenacao", example: "2025-09-25" },
  dataRegistro: { label: "Data de registro", example: "2025-01-05" },
  estado: { label: "Estado", example: "SP" },
  estadoNascimento: { label: "Estado de nascimento", example: "PE" },
  estadoResidencia: { label: "Estado de residencia", example: "CE" },
  igreja: { label: "Igreja", example: "Assembleia Central" },
  igrejaCerimonia: { label: "Igreja da cerimonia", example: "Igreja Central" },
  igrejaOrdenadora: { label: "Igreja ordenadora", example: "ADI Matriz" },
  liderCelula: { label: "Lider de celula", example: "Marcos Lima" },
  localBatismo: { label: "Local do batismo", example: "Rio local" },
  localNascimento: { label: "Local de nascimento", example: "Hospital Vida" },
  ministro: { label: "Ministro celebrante", example: "Pr. Carlos" },
  nomeAluno: { label: "Nome do aluno", example: "Lucas Silva" },
  nomeBatizando: { label: "Nome do batizando", example: "Mariana Costa" },
  nomeCrianca: { label: "Nome da crianca", example: "Ana Clara" },
  nomeEsposa: { label: "Nome da esposa", example: "Camila Rocha" },
  nomeEsposo: { label: "Nome do esposo", example: "Rafael Rocha" },
  nomeHomenageado: { label: "Nome do homenageado", example: "Pr. Joao Silva", required: true },
  nomeMae: { label: "Nome da mae", example: "Juliana Costa" },
  nomeMembro: { label: "Nome do membro", example: "Joao Pereira" },
  nomeNoiva: { label: "Nome da noiva", example: "Isabela Nunes" },
  nomeNoivo: { label: "Nome do noivo", example: "Gabriel Ribeiro" },
  nomeOrdenando: { label: "Nome do ordenando", example: "Paulo Dias" },
  nomePai: { label: "Nome do pai", example: "Carlos Costa" },
  nomeParticipante: { label: "Nome do participante", example: "Livia Santos" },
  nomePastor: { label: "Nome do pastor", example: "Pr. Elias" },
  nomeSecretario: { label: "Nome do secretario(a)", example: "Maria Lopes" },
  observacao: { label: "Observacao", example: "Participou de todas as aulas" },
  observacoes: { label: "Observacoes", example: "Concluiu com excelencia" },
  oficiante: { label: "Oficiante", example: "Ev. Roberto" },
  pastor: { label: "Pastor responsavel", example: "Pr. Daniel" },
  pastorOrdenante: { label: "Pastor ordenante", example: "Pr. Adilson" },
  professor: { label: "Professor(a)", example: "Irma Sandra" },
  proximaClasse: { label: "Proxima classe", example: "Juvenis" },
  secretario: { label: "Secretario(a)", example: "Irma Paula" },
  sexo: { label: "Sexo", example: "Feminino" },
  superintendente: { label: "Superintendente", example: "Irmao Marcos" },
  trimestre: { label: "Trimestre", example: "2o" },
  uf: { label: "UF", example: "SP" },
  versiculo: { label: "Versiculo", example: "Mateus 28:19" },
};

function humanizeKey(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

export function resolveBulkFields(keys: string[]): BulkImportField[] {
  return keys.map((key) => {
    const metadata = FIELD_LIBRARY[key] ?? {};
    return {
      key,
      label: metadata.label ?? humanizeKey(key),
      example: metadata.example,
      required: metadata.required,
    };
  });
}
