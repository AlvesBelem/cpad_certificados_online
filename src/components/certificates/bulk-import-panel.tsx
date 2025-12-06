"use client";

import { useMemo, useRef, useState } from "react";
import { read, utils, writeFile } from "xlsx";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/slugify";

export type BulkImportField = {
  key: string;
  label: string;
  example?: string;
  required?: boolean;
};

type Props = {
  certificateTitle: string;
  certificateSlug?: string;
  fields: BulkImportField[];
  onApplyRow: (row: Record<string, string>) => void;
};

type ParsedRow = Record<string, string>;

export function BulkImportPanel({ certificateTitle, certificateSlug, fields, onApplyRow }: Props) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const normalizedFields = useMemo(
    () =>
      fields.map((field) => ({
        ...field,
        normalizedKey: normalizeValue(field.key),
        normalizedLabel: normalizeValue(field.label),
      })),
    [fields],
  );

  const resolvedSlug = useMemo(() => certificateSlug || slugify(certificateTitle), [certificateSlug, certificateTitle]);
  const templateFileName = `modelo-${resolvedSlug || "certificado"}.xlsx`;

  const handleDownloadTemplate = () => {
    const header = fields.map((field) => field.label);
    const examples = fields.map((field) => field.example ?? "");
    const worksheet = utils.aoa_to_sheet([header, examples]);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Certificados");
    writeFile(workbook, templateFileName);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setError(null);
    setRows([]);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new Error("Planilha vazia ou sem abas.");
      }
      const sheet = workbook.Sheets[firstSheetName];
      const rawRows = utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false, defval: "" });
      if (!rawRows.length) {
        throw new Error("Não encontramos linhas na planilha enviada.");
      }
      const headers = rawRows[0].map((cell) => normalizeValue(String(cell)));
      const dataRows = rawRows.slice(1);
      const parsed = dataRows
        .map((cells) => mapRowFromSheet(cells, headers, normalizedFields))
        .filter((row) => Object.values(row).some((value) => value && value.trim().length > 0));

      if (!parsed.length) {
        throw new Error("Nenhuma linha com dados foi encontrada.");
      }

      setRows(parsed);
      setFileName(file.name);
      toast.success(`Importamos ${parsed.length} linha(s) da planilha.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível ler a planilha enviada.";
      setError(message);
    } finally {
      setParsing(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const applyRow = (row: ParsedRow) => {
    onApplyRow(row);
    toast.success("Dados aplicados ao formulário. Revise antes de gerar o certificado.");
  };

  const clearRows = () => {
    setRows([]);
    setFileName(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const previewRows = rows.slice(0, 5);

  return (
    <section className="rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-primary/70">Importação em massa</p>
          <h3 className="text-base font-semibold text-foreground">Planilha Excel</h3>
          <p className="text-xs text-muted-foreground">
            Baixe o modelo, preencha as colunas e importe para aplicar rapidamente cada linha ao formulário do certificado.
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={handleDownloadTemplate}>
          <Download className="h-4 w-4" />
          Baixar modelo
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Input
          type="file"
          ref={inputRef}
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          disabled={parsing}
          className="max-w-md cursor-pointer"
        />
        {fileName ? (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="truncate font-medium text-foreground">{fileName}</span>
            <button
              type="button"
              className="text-destructive underline-offset-4 hover:underline"
              onClick={clearRows}
            >
              Limpar
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Upload className={cn("h-4 w-4", parsing ? "animate-pulse text-primary" : "text-muted-foreground")} />
            <span>{parsing ? "Processando planilha..." : "Aceita arquivos .xlsx, .xls ou .csv"}</span>
          </div>
        )}
      </div>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
      {rows.length > 0 ? (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Encontramos <span className="font-semibold text-foreground">{rows.length}</span>{" "}
            {rows.length === 1 ? "linha" : "linhas"}. Clique em &ldquo;Aplicar&rdquo; para preencher o formulário com os dados
            de cada participante.
          </p>
          <div className="max-h-64 overflow-auto rounded-2xl border border-border/60 bg-background/70">
            <table className="w-full min-w-full text-left text-xs text-muted-foreground">
              <thead className="bg-muted/60 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                <tr>
                  {fields.map((field) => (
                    <th key={field.key} className="px-3 py-2 font-semibold text-foreground">
                      {field.label}
                    </th>
                  ))}
                  <th className="px-3 py-2 font-semibold text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, index) => (
                  <tr key={`${index}-${row[fields[0].key] ?? index}`} className="border-t border-border/40">
                    {fields.map((field) => (
                      <td key={`${field.key}-${index}`} className="px-3 py-2 text-foreground">
                        {row[field.key] || <span className="text-muted-foreground/70">—</span>}
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      <Button type="button" size="sm" onClick={() => applyRow(row)}>
                        Aplicar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > previewRows.length ? (
            <p className="text-[11px] text-muted-foreground">
              Mostrando {previewRows.length} linhas de {rows.length}. Continue importando linha por linha usando o botão aplicar.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function normalizeValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function mapRowFromSheet(
  row: string[],
  headers: string[],
  fields: Array<BulkImportField & { normalizedKey: string; normalizedLabel: string }>,
): ParsedRow {
  const parsed: ParsedRow = {};
  fields.forEach((field, defaultIndex) => {
    let headerIndex = headers.findIndex(
      (header) => header === field.normalizedLabel || header === field.normalizedKey,
    );
    if (headerIndex === -1 && defaultIndex < row.length) {
      headerIndex = defaultIndex;
    }
    const value = row[headerIndex] ?? "";
    parsed[field.key] = typeof value === "string" ? value.trim() : String(value ?? "").trim();
  });
  return parsed;
}
