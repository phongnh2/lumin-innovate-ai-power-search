import { Colors } from "@strapi/config/enum.ts";
import { DASH_LENGTH } from "@strapi/config/settings.ts";
import { ITimeSensitiveForm, ITimeSensitiveFormCsvRow } from "../interfaces/index.ts";
import { getTimeSensitiveFormJsonPath } from "../constants/index.ts";
import { writeDataToCSV, writeJsonFile } from "@strapi/utils/file.ts";
import { timeSensitiveFormRepository } from "../repositories/time-sensitive-form.repository.ts";

export class TimeSensitiveFormExportService {
  public async exportTimeSensitiveFormDataAsJSON(): Promise<void> {
    console.log("🚀 ~ Exporting time-sensitive form data as JSON ⏳");

    let totalTimeSensitiveForms = 0;
    const results: ITimeSensitiveForm[] = [];

    await timeSensitiveFormRepository.handleGetTimeSensitiveForms((result) => {
      totalTimeSensitiveForms = result.meta.pagination.total;
      for (const item of result.data) {
        const { name, slug } = item.attributes;
        const { forms } = item.attributes;

        const formsData = forms.data?.map((form) => ({
          id: form.id,
          title: form.attributes.title,
          outdated: form.attributes.outdated,
          slug: form.attributes.slug,
          templateReleaseId: form.attributes.templateReleaseId,
          publishedDate: form.attributes.publishedDate,
          publishedAt: form.attributes.publishedAt,
        })) ?? [];

        results.push({
          id: item.id,
          name,
          slug,
          forms: formsData,
          createdAt: item.attributes.createdAt,
          updatedAt: item.attributes.updatedAt,
          publishedAt: item.attributes.publishedAt,
        });
      }
    });

    const jsonPath = getTimeSensitiveFormJsonPath();
    await writeJsonFile(results, jsonPath);

    console.log("\n" + "=".repeat(DASH_LENGTH));
    console.log(
      `${Colors.Green}${Colors.Bold}✅ Time-sensitive form export completed${Colors.Reset}`,
    );
    console.log(
      `📊 Total time-sensitive forms: ${Colors.Bold}${totalTimeSensitiveForms}${Colors.Reset}`,
    );
    console.log(`📁 File: ${Colors.Dim}${jsonPath}${Colors.Reset}`);
    console.log("=".repeat(DASH_LENGTH));
  }

  public async exportTimeSensitiveFormDataAsCSV(): Promise<void> {
    console.log("🚀 ~ Exporting time-sensitive form data as CSV ⏳");

    const csvPath = "strapi/data/time-sensitive-form-data.csv";
    const headers = ["id", "name", "slug", "form-ids", "template-release-ids"];
    const initialRow = headers.join(",");
    await writeDataToCSV(initialRow, csvPath);

    let totalTimeSensitiveForms = 0;
    const csvRows: ITimeSensitiveFormCsvRow[] = [];

    await timeSensitiveFormRepository.handleGetTimeSensitiveForms((result) => {
      totalTimeSensitiveForms = result.meta.pagination.total;
      for (const item of result.data) {
        const { name, slug } = item.attributes;
        const { forms } = item.attributes;

        const formIds = forms.data?.map((form) => form.id).join(";") ?? "";
        const templateReleaseIds = forms.data
          ?.filter((form) => form.attributes.templateReleaseId)
          .map((form) => form.attributes.templateReleaseId)
          .join(";") ?? "";

        const csvRow: ITimeSensitiveFormCsvRow = {
          id: item.id,
          name,
          slug,
          formIds,
          templateReleaseIds,
        };

        csvRows.push(csvRow);

        const rowData = [
          item.id,
          `"${name}"`,
          `"${slug}"`,
          `"${formIds}"`,
          `"${templateReleaseIds}"`,
        ];
        const row = rowData.join(",");
        writeDataToCSV(row, csvPath);
      }
    });

    console.log("\n" + "=".repeat(DASH_LENGTH));
    console.log(
      `${Colors.Green}${Colors.Bold}✅ Time-sensitive form CSV export completed${Colors.Reset}`,
    );
    console.log(
      `📊 Total time-sensitive forms: ${Colors.Bold}${totalTimeSensitiveForms}${Colors.Reset}`,
    );
    console.log(`📁 File: ${Colors.Dim}${csvPath}${Colors.Reset}`);
    console.log("=".repeat(DASH_LENGTH));
  }
}

export const timeSensitiveFormExportService = new TimeSensitiveFormExportService();
