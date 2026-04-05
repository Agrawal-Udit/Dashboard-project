import type { Transaction } from "../types";

const CSV_HEADER_COLUMNS = [
  "date",
  "description",
  "category",
  "type",
  "amount",
] as const;
const DANGEROUS_CSV_PREFIX = /^(?:[=+\-@\t\r]|[ \t\r]+[=+\-@])/;

export function sanitizeCsvCell(value: string): string {
  const normalized = String(value);
  const escapedQuotes = normalized.replaceAll('"', '""');

  if (DANGEROUS_CSV_PREFIX.test(escapedQuotes)) {
    return `'${escapedQuotes}`;
  }

  return escapedQuotes;
}

function toQuotedCsvCell(value: string): string {
  return `"${sanitizeCsvCell(value)}"`;
}

export function transactionsToCsv(rows: Transaction[]): string {
  const header = CSV_HEADER_COLUMNS.join(",");

  if (rows.length === 0) {
    return header;
  }

  const csvRows = rows.map((row) => {
    const csvCells = [
      toQuotedCsvCell(row.date),
      toQuotedCsvCell(row.description),
      toQuotedCsvCell(row.category),
      toQuotedCsvCell(row.type),
      String(row.amount),
    ];

    return csvCells.join(",");
  });

  return [header, ...csvRows].join("\n");
}

export function transactionsToJson(rows: Transaction[]): string {
  return JSON.stringify(rows, null, 2);
}

export function downloadTextFile(
  filename: string,
  content: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);
}
