"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import type { Worksheet } from "exceljs";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/slugify";
import { calculateCertificatePricing } from "@/lib/pricing";

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
  onRowsChange?: (rows: ParsedRow[]) => void;
};

export type ParsedRow = Record<string, string>;

export function BulkImportPanel({ certificateTitle, certificateSlug, fields, onApplyRow, onRowsChange }: Props) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
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

  const handleDownloadTemplate = async () => {
    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Certificados");
    const header = fields.map((field) => field.label);
    const examples = fields.map((field) => field.example ?? "");
    worksheet.addRow(header);
    worksheet.addRow(examples);

    const buffer = await workbook.xlsx.writeBuffer();
    downloadWorkbook(buffer, templateFileName);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setError(null);
    setRows([]);
    onRowsChange?.([]);

    try {
      const workbook = await loadWorkbookFromFile(file);
      const firstSheet = workbook.worksheets[0];
      if (!firstSheet) {
        throw new Error("Planilha vazia ou sem abas.");
      }
      const rawRows = extractRowsFromWorksheet(firstSheet);
      if (!rawRows.length) {
        throw new Error("Nao encontramos linhas na planilha enviada.");
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
      onRowsChange?.(parsed);
      setFileName(file.name);
      toast.success(`Importamos ${parsed.length} linha(s) da planilha.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nao foi possivel ler a planilha enviada.";
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
    toast.success("Dados aplicados ao formulario. Revise antes de gerar o certificado.");
  };

  const clearRows = () => {
    setRows([]);
    onRowsChange?.([]);
    setFileName(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const previewRows = rows.slice(0, 5);
  const pricing = useMemo(() => calculateCertificatePricing(rows.length), [rows.length]);

  const handleCreateOrder = async () => {
    if (!rows.length) {
      toast.error("Importe a planilha antes de registrar o pedido.");
      return;
    }

    setSubmittingOrder(true);
    try {
      const response = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: "PIX_MANUAL",
          status: "PAID",
          quantity: pricing.quantity,
          totalAmountInCents: pricing.totalInCents,
          notes: `Planilha ${certificateTitle} (${pricing.quantity} certificados)`,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message || "Nao foi possivel registrar o pedido.");
      }

      toast.success(
        `Pedido registrado: ${pricing.quantity} certificados por R$ ${(pricing.totalInCents / 100).toFixed(2)}.`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao registrar o pedido.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <section className="rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-primary/70">Importacao em massa</p>
          <h3 className="text-base font-semibold text-foreground">Planilha Excel</h3>
          <p className="text-xs text-muted-foreground">
            Baixe o modelo, preencha as colunas e importe para aplicar rapidamente cada linha ao formulario do certificado.
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
          accept=".xlsx,.csv"
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
            <span>{parsing ? "Processando planilha..." : "Aceita arquivos .xlsx ou .csv"}</span>
          </div>
        )}
      </div>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
      {rows.length > 0 ? (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Encontramos <span className="font-semibold text-foreground">{rows.length}</span>{" "}
            {rows.length === 1 ? "linha" : "linhas"}. Clique em &ldquo;Aplicar&rdquo; para preencher o formulario com os dados
            de cada participante.
          </p>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-xs">
            <p className="font-semibold text-foreground">
              Resumo: {pricing.quantity} certificados ·{" "}
              <span className="text-primary">R$ {(pricing.totalInCents / 100).toFixed(2)}</span> (R${" "}
              {(pricing.unitInCents / 100).toFixed(2)} cada)
            </p>
            <Button
              type="button"
              size="sm"
              className="ml-auto"
              onClick={handleCreateOrder}
              disabled={submittingOrder}
            >
              {submittingOrder ? "Registrando..." : "Registrar pedido manual"}
            </Button>
          </div>
          <div className="max-h-64 overflow-auto rounded-2xl border border-border/60 bg-background/70">
            <table className="w-full min-w-full text-left text-xs text-muted-foreground">
              <thead className="bg-muted/60 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                <tr>
                  {fields.map((field) => (
                    <th key={field.key} className="px-3 py-2 font-semibold text-foreground">
                      {field.label}
                    </th>
                  ))}
                  <th className="px-3 py-2 font-semibold text-foreground">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, index) => (
                  <tr key={`${index}-${row[fields[0].key] ?? index}`} className="border-t border-border/40">
                    {fields.map((field) => (
                      <td key={`${field.key}-${index}`} className="px-3 py-2 text-foreground">
                        {row[field.key] || <span className="text-muted-foreground/70">-</span>}
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
              Mostrando {previewRows.length} linhas de {rows.length}. Continue importando linha por linha usando o botao aplicar.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function downloadWorkbook(buffer: ArrayBuffer, fileName: string) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

async function loadWorkbookFromFile(file: File) {
  const extension = getFileExtension(file.name);
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  const buffer = await file.arrayBuffer();

  if (extension === "csv") {
    const text = new TextDecoder().decode(buffer);
    const rows = parseCsv(text);
    const worksheet = workbook.addWorksheet("Planilha");
    rows.forEach((cells) => worksheet.addRow(cells));
    return workbook;
  }

  if (extension === "xlsx") {
    await workbook.xlsx.load(buffer);
    return workbook;
  }

  if (extension === "xls") {
    throw new Error("Arquivos .xls nao sao suportados. Salve o arquivo como .xlsx ou .csv.");
  }

  throw new Error("Formato de arquivo nao suportado. Envie um .xlsx ou .csv.");
}

function extractRowsFromWorksheet(worksheet: Worksheet) {
  const rows: string[][] = [];
  let columnCount = 0;

  worksheet.eachRow({ includeEmpty: true }, (row) => {
    const values = row.values as Array<unknown>;
    const cells = values.slice(1).map(formatCellValue);
    columnCount = Math.max(columnCount, cells.length);
    rows.push(cells);
  });

  if (!rows.length || columnCount === 0) {
    return [];
  }

  return rows.map((cells) =>
    cells.length < columnCount ? [...cells, ...Array(columnCount - cells.length).fill("")] : cells,
  );
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "";

  if (value instanceof Date) {
    const iso = value.toISOString();
    return iso.includes("T") ? iso.slice(0, 10) : iso;
  }

  if (typeof value === "object") {
    const cell = value as { result?: unknown; text?: string; richText?: Array<{ text?: string }> };
    if (cell.result !== undefined) {
      return formatCellValue(cell.result);
    }
    if (Array.isArray(cell.richText)) {
      return cell.richText.map((segment) => segment.text ?? "").join("");
    }
    if (cell.text !== undefined) {
      return cleanDateString(String(cell.text));
    }
  }

  return cleanDateString(String(value));
}

function cleanDateString(text: string) {
  const trimmed = text.trim();
  const isoWithTimeMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})T/);
  if (isoWithTimeMatch) {
    return isoWithTimeMatch[1];
  }
  return trimmed;
}

function getFileExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1) return "";
  return fileName.slice(lastDotIndex + 1).toLowerCase();
}

function normalizeValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function parseCsv(text: string) {
  const delimiter = detectDelimiter(text);
  const rows: string[][] = [];
  let currentCell = "";
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i += 1; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    const isDelimiter = char === delimiter && !inQuotes;
    const isNewline = (char === "\n" || char === "\r") && !inQuotes;

    if (isDelimiter) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if (isNewline) {
      if (char === "\r" && nextChar === "\n") {
        i += 1; // skip CRLF
      }
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentCell = "";
      currentRow = [];
      continue;
    }

    currentCell += char;
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
  }
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
}

function detectDelimiter(text: string) {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const commaCount = (firstLine.match(/,/g) ?? []).length;
  const semicolonCount = (firstLine.match(/;/g) ?? []).length;
  if (semicolonCount > commaCount) return ";";
  return ",";
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
