import { StrapiService } from "../strapi.service.ts";
import { ExportOptions } from "../interfaces/index.ts";
import { writeJsonFile } from "@strapi/utils/file.ts";

export class ExportRepository extends StrapiService {
  public async exportData<T>(
    dataType: string,
    options: ExportOptions,
  ): Promise<T[]> {
    const { slug } = options;
    const exportEndpoint =
      `${this.getStrapiEndpoint}/api/import-export-entries/content/export/contentTypes`;

    console.log(`🚀 Exporting ${dataType} data - operation started ⏳`);

    try {
      const response = await fetch(exportEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.getStrapiApiToken,
        },
        body: JSON.stringify({
          exportFormat: "json-v2",
          ...options,
        }),
      });

      const responseJson = await response.json();
      const rawResults = JSON.parse(responseJson.data)["data"][slug];

      const results = Object.values(rawResults) as T[];

      await writeJsonFile(results, `strapi/data/${dataType}.json`);

      console.log(`✅ Export completed - Total ${dataType} records: ${results.length}`);
      return results;
    } catch (error) {
      console.log(`❌ Export data operation failed for ${dataType}: ${error}`);
      throw error;
    }
  }
}

export const exportRepository = new ExportRepository();
