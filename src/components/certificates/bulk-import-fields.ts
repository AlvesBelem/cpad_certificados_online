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
  cidade: { label: "Cidade", example: "São Paulo" },
  cidadeNascimento: { label: "Cidade de nascimento", example: "Recife" },
  cidadeResidencia: { label: "Cidade de residência", example: "Fortaleza" },
  classe: { label: "Classe", example: "Adultos" },
  classeAtual: { label: "Classe atual", example: "Intermediários" },
  dataApresentacao: { label: "Data da apresentação", example: "2025-03-10" },
  dataBatismo: { label: "Data do batismo", example: "2025-04-15" },
  dataCasamento: { label: "Data do casamento", example: "2025-06-20" },
  dataConclusao: { label: "Data de conclusão", example: "2025-12-05" },
  dataFim: { label: "Data de término", example: "2025-08-15" },
  dataInicio: { label: "Data de início", example: "2025-06-01" },
  dataNascimento: { label: "Data de nascimento", example: "2000-01-15" },
  dataOrdenacao: { label: "Data da ordenação", example: "2025-09-25" },
  dataRegistro: { label: "Data de registro", example: "2025-01-05" },
  estado: { label: "Estado", example: "SP" },
  estadoNascimento: { label: "Estado de nascimento", example: "PE" },
  estadoResidencia: { label: "Estado de residência", example: "CE" },
  igreja: { label: "Igreja", example: "Assembleia Central" },
  igrejaCerimonia: { label: "Igreja da cerimônia", example: "Igreja Central" },
  igrejaOrdenadora: { label: "Igreja ordenadora", example: "ADI Matriz" },
  liderCelula: { label: "Líder de célula", example: "Marcos Lima" },
  localBatismo: { label: "Local do batismo", example: "Rio local" },
  localNascimento: { label: "Local de nascimento", example: "Hospital Vida" },
  ministro: { label: "Ministro celebrante", example: "Pr. Carlos" },
  nomeAluno: { label: "Nome do aluno", example: "Lucas Silva" },
  nomeBatizando: { label: "Nome do batizando", example: "Mariana Costa" },
  nomeCrianca: { label: "Nome da criança", example: "Ana Clara" },
  nomeEsposa: { label: "Nome da esposa", example: "Camila Rocha" },
  nomeEsposo: { label: "Nome do esposo", example: "Rafael Rocha" },
  nomeMae: { label: "Nome da mãe", example: "Juliana Costa" },
  nomeMembro: { label: "Nome do membro", example: "João Pereira" },
  nomeNoiva: { label: "Nome da noiva", example: "Isabela Nunes" },
  nomeNoivo: { label: "Nome do noivo", example: "Gabriel Ribeiro" },
  nomeOrdenando: { label: "Nome do ordenando", example: "Paulo Dias" },
  nomePai: { label: "Nome do pai", example: "Carlos Costa" },
  nomeParticipante: { label: "Nome do participante", example: "Lívia Santos" },
  nomePastor: { label: "Nome do pastor", example: "Pr. Elias" },
  nomeSecretario: { label: "Nome do secretário(a)", example: "Maria Lopes" },
  observacao: { label: "Observação", example: "Participou de todas as aulas" },
  observacoes: { label: "Observações", example: "Concluiu com excelência" },
  oficiante: { label: "Oficiante", example: "Ev. Roberto" },
  pastor: { label: "Pastor responsável", example: "Pr. Daniel" },
  pastorOrdenante: { label: "Pastor ordenante", example: "Pr. Adilson" },
  professor: { label: "Professor(a)", example: "Irmã Sandra" },
  proximaClasse: { label: "Próxima classe", example: "Juvenis" },
  secretario: { label: "Secretário(a)", example: "Irmã Paula" },
  sexo: { label: "Sexo", example: "Feminino" },
  superintendente: { label: "Superintendente", example: "Irmão Marcos" },
  trimestre: { label: "Trimestre", example: "2º" },
  uf: { label: "UF", example: "SP" },
  versiculo: { label: "Versículo", example: "Mateus 28:19" },
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
