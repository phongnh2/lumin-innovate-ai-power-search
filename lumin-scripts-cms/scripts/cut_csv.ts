#!/usr/bin/env -S deno run --allow-read --allow-write

import { parse, stringify } from "@std/csv";

if (Deno.args.length !== 3) {
  console.error("Usage: cut_csv.ts <filename> <startRow> <endRow>");
  Deno.exit(1);
}

const [file, startStr, endStr] = Deno.args;
const start = parseInt(startStr, 10);
const end = parseInt(endStr, 10);

const inputPath = `strapi/data/csv/${file}.csv`;
const outputPath = `strapi/data/csv/${file}-updated.csv`;

// Read CSV as text
const text = await Deno.readTextFile(inputPath);

// Parse CSV (handles multi-line cells)
const rows = await parse(text, { skipFirstRow: false }) as string[][];

if (rows.length === 0) {
  console.error("Empty CSV");
  Deno.exit(1);
}

// Keep header
const header = rows[0];

// Slice rows after header
// start, end are 1-based counting after header
// rows[0] = header, rows[1] = first data row
// So for row 6 (1-based), we need rows[6] (0-based index)
const sliced = rows.slice(start - 1, end);
const result = [header, ...sliced];

// Write back to CSV
const outputCsv = await stringify(result);
await Deno.writeTextFile(outputPath, outputCsv);

console.log(`✅ File created: ${outputPath}`);
