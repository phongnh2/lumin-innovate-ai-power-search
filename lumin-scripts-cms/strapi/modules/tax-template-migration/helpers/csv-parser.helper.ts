import type { ICsvRow, ICsvParseResult } from "../interfaces/index.ts";
import { CSV_FILE_PATH } from "../constants/index.ts";

export function parseCsvContent(csvContent: string): ICsvParseResult {
  const lines = csvContent.split("\n");
  const rows: ICsvRow[] = [];
  let skippedRows = 0;

  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("strapi_id,")) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    throw new Error("Could not find header row in CSV (expected row starting with 'strapi_id,')");
  }

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(",");
    if (parts.length < 6) {
      skippedRows++;
      continue;
    }

    // CSV has strapi_id column, but we use it as templateReleaseId for lookups
    const row: ICsvRow = {
      template_release_id: parts[0].trim(),
      time_sensitive_grouping: parts[1].trim(),
      title: parts[2].trim(),
      published_date: parts[3].trim(),
      outdated: parts[4].trim(),
      published: parts[5].trim(),
    };

    if (!row.template_release_id) {
      skippedRows++;
      continue;
    }

    rows.push(row);
  }

  return {
    rows,
    totalRows: lines.length - headerIndex - 1,
    validRows: rows.length,
    skippedRows,
  };
}

export async function readCsvFile(filePath?: string): Promise<ICsvParseResult> {
  const path = filePath || CSV_FILE_PATH;

  try {
    const content = await Deno.readTextFile(path);
    console.log(`📄 Reading CSV from: ${path}`);
    const result = parseCsvContent(content);
    console.log(`   ✓ Parsed ${result.validRows} valid rows (${result.skippedRows} skipped)`);
    return result;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new Error(`CSV file not found: ${path}`);
    }
    throw error;
  }
}

export function extractTemplateReleaseIds(rows: ICsvRow[]): string[] {
  const ids = new Set<string>();
  for (const row of rows) {
    if (row.template_release_id) {
      ids.add(row.template_release_id);
    }
  }
  return Array.from(ids);
}

export function extractGroupingNames(rows: ICsvRow[]): string[] {
  const names = new Set<string>();
  for (const row of rows) {
    if (row.time_sensitive_grouping) {
      names.add(row.time_sensitive_grouping);
    }
  }
  return Array.from(names);
}
