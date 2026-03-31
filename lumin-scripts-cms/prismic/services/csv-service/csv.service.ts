import { ICsvRow, ICsvService } from "./csv.interface.ts";
import { writeDataToCSV } from "../../utils/helpers.ts";
import { parse as csvParse } from "@std/csv";

export class CsvService implements ICsvService {
  public async readCsvFile(filePath: string): Promise<ICsvRow[]> {
    try {
      console.log(`📝 Reading CSV file: ${filePath}`);
      const csvContent = await Deno.readTextFile(filePath);
      const lines = csvContent.trim().split("\n");

      if (lines.length < 2) {
        console.log("⚠️ CSV file has no data rows");
        return [];
      }

      const headers = lines[0].split(",").map((h) => h.trim());
      const csvData: ICsvRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(",").map((v) => v.trim());
        const row: ICsvRow = {};

        for (let j = 0; j < headers.length; j++) {
          row[headers[j]] = values[j] || "";
        }

        csvData.push(row);
      }

      console.log(`📊 Total rows read: ${csvData.length}`);
      return csvData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error reading CSV file:`, errorMessage);
      throw error;
    }
  }

  public async writeCsvFile(data: ICsvRow[], filePath: string): Promise<void> {
    try {
      console.log(`📝 Writing CSV file: ${filePath}`);

      if (data.length === 0) {
        console.log("⚠️ No data to write");
        return;
      }

      const headers = Object.keys(data[0]);
      const headerRow = headers.join(",");

      await Deno.writeTextFile(filePath, headerRow + "\n");

      for (const row of data) {
        const values = headers.map((header) => `"${row[header] || ""}"`);
        const csvRow = values.join(",");
        await writeDataToCSV(csvRow, filePath);
      }

      console.log(`✅ CSV file written successfully: ${data.length} rows`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error writing CSV file:`, errorMessage);
      throw error;
    }
  }

  public extractUrlsFromCsv(csvData: ICsvRow[], urlColumn: string): string[] {
    try {
      console.log(`🔍 Extracting URLs from column: ${urlColumn}`);

      const urls: string[] = [];
      for (const row of csvData) {
        const url = row[urlColumn];
        if (url && typeof url === "string" && url.trim()) {
          urls.push(url.trim());
        }
      }

      console.log(`📊 Total URLs extracted: ${urls.length}`);
      return urls;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error extracting URLs:`, errorMessage);
      throw error;
    }
  }
}

export const csvService = new CsvService();
