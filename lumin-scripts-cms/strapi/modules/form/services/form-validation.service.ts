import { Colors } from "@strapi/config/enum.ts";
import { CONFIGURATION, DASH_LENGTH } from "@strapi/config/settings.ts";
import { ICsvRawData } from "../interfaces/index.ts";
import { readCSVFile, writeDataToCSV } from "@strapi/utils/file.ts";
import { logChunkHeader } from "@strapi/utils/helpers.ts";
import {
  getFormData,
  isValidateTemplate,
  loadCurrentFormSlugs,
} from "../helpers/form-data.helper.ts";
import { timeSensitiveFormPreviewService } from "@strapi/modules/time-sensitive-form/services/time-sensitive-form-preview.service.ts";

export class FormValidationService {
  private currentTime = new Date().toISOString();

  public async previewTemplatesCSV(): Promise<void> {
    const csvData = await readCSVFile(CONFIGURATION.TEMPLATE_IMPORT_CSV_PATH);

    const { hasNewForms, newFormNames } = await timeSensitiveFormPreviewService
      .checkNewTimeSensitiveForms(csvData);

    if (hasNewForms) {
      timeSensitiveFormPreviewService.displayNewFormsWarning(newFormNames);
      return;
    }

    const slugsArray = await loadCurrentFormSlugs();
    const currentFormSlugs = new Set(slugsArray);

    const chunkSize = 10;
    let validTemplate = 0;
    let invalidTemplate = 0;

    const errorLogPath = `strapi/logs/invalid-templates-${this.currentTime}.csv`;
    await writeDataToCSV(`id,errors`, errorLogPath);

    console.log("🚀 ~ Starting template preview ⏳");
    console.log(`📊 ~ Total templates to validate: ${csvData.length}`);

    for (let i = 0; i < csvData.length; i += chunkSize) {
      logChunkHeader(i, csvData.length, chunkSize);

      const chunk = csvData.slice(i, i + chunkSize);
      const promises = chunk.map(async (csvFormData: ICsvRawData) => {
        const errorsStack = [];

        const { result: formData, errors: errorForm } = await getFormData({
          data: csvFormData,
          currentFormSlugs,
        });

        const { isValid, errors: errorInvalid } = isValidateTemplate(formData);

        errorsStack.push(...errorForm, ...errorInvalid);

        if (!isValid || errorsStack.length) {
          invalidTemplate++;
          console.log(
            `${Colors.Yellow}⚠️  Invalid: ${formData.title || formData.id} ${Colors.Dim}(${
              errorsStack.join(", ")
            })${Colors.Reset}`,
          );

          await writeDataToCSV(
            `"${formData.id}","${errorsStack.join("; ").replace(/"/g, '""')}"`,
            errorLogPath,
          );
          return { valid: false };
        }

        validTemplate++;
        console.log(`${Colors.Green}✅ Valid: ${formData.title || formData.id}${Colors.Reset}`);
        return { valid: true };
      });

      await Promise.all(promises);
      console.log(
        `${Colors.Gray}📊 Chunk completed: ${
          Math.min(i + chunkSize, csvData.length)
        }/${csvData.length}${Colors.Reset}`,
      );
    }

    console.log("\n" + "=".repeat(DASH_LENGTH));
    console.log(`${Colors.Green}${Colors.Bold}✅ Template preview completed${Colors.Reset}`);
    console.log(`${Colors.Green}📊 Total valid: ${Colors.Bold}${validTemplate}${Colors.Reset}`);
    console.log(
      `${Colors.Yellow}🛑 Total invalid: ${Colors.Bold}${invalidTemplate}${Colors.Reset}`,
    );
    console.log(`📝 Error log: ${Colors.Dim}${errorLogPath}${Colors.Reset}`);
    console.log("=".repeat(DASH_LENGTH));
  }
}

export const formValidationService = new FormValidationService();
