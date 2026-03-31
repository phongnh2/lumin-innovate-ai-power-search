import { Colors } from "@strapi/config/enum.ts";
import { CONFIGURATION, DASH_LENGTH, LT_CARD } from "@strapi/config/settings.ts";
import { ICsvRawData, IUpdatePayload } from "../interfaces/index.ts";
import { readCSVFile, writeDataToCSV } from "@strapi/utils/file.ts";
import { logChunkHeader } from "@strapi/utils/helpers.ts";
import {
  getFormData,
  isValidateTemplate,
  loadCurrentForms,
  loadCurrentFormSlugs,
} from "../helpers/form-data.helper.ts";
import { formRepository } from "../repositories/form.repository.ts";
import { formatTitleForFileName } from "../helpers/string.helper.ts";
import { timeSensitiveFormManagerService } from "@strapi/modules/time-sensitive-form/services/time-sensitive-form-manager.service.ts";

export class FormUpdateService {
  private currentTime = new Date().toISOString();

  public async updateFormDataFromCSV(): Promise<void> {
    const csvData = await readCSVFile(CONFIGURATION.TEMPLATE_IMPORT_CSV_PATH);
    const slugsArray = await loadCurrentFormSlugs();
    const currentFormSlugs = new Set(slugsArray);

    const chunkSize = 1;
    let totalUpdated = 0;
    let totalSkipped = 0;

    console.log("🚀 ~ Starting form data update from CSV ⏳");
    console.log(`📊 ~ Total templates to process: ${csvData.length}`);

    const errorLogPath = `strapi/logs/error-update-forms-csv-${this.currentTime}.csv`;
    await writeDataToCSV(`template_id,title,operation,error`, errorLogPath);

    for (let i = 0; i < csvData.length; i += chunkSize) {
      logChunkHeader(i, csvData.length, chunkSize);

      const chunk = csvData.slice(i, i + chunkSize);
      const promises = chunk.map(async (csvFormData: ICsvRawData) => {
        try {
          const { result: formData, errors: formErrors } = await getFormData({
            data: csvFormData,
            currentFormSlugs: Array.from(currentFormSlugs),
          });

          const { isValid, errors: validationErrors } = isValidateTemplate(formData);
          const allErrors = [...formErrors, ...validationErrors];

          if (!isValid || allErrors.length > 0) {
            console.log(
              `${Colors.Yellow}⚠️  Skipping invalid: ${
                formData.title || formData.id
              }${Colors.Reset}`,
            );
            totalSkipped++;
            await writeDataToCSV(
              `"${formData.id}","${formData.title || ""}","validation","${
                allErrors.join("; ").replace(/"/g, '""')
              }"`,
              errorLogPath,
            );
            return { updated: false };
          }

          console.log(`${Colors.Blue}🔄 Updating: ${formData.title ?? formData.id}${Colors.Reset}`);

          const updateData = {
            data: {
              isScripting: true,
              ...formData,
            },
          };

          const result = await formRepository.updateForm(
            formData.id,
            updateData as { data: IUpdatePayload },
          );

          if (result && !result.error) {
            if (formData.timeSensitiveGrouping && formData.id) {
              await timeSensitiveFormManagerService.addFormToTimeSensitiveGroup(
                formData.timeSensitiveGrouping,
                formData.id,
              );
            }

            totalUpdated++;
            console.log(
              `${Colors.Green}✅ Updated: ${formData.title} ${Colors.Dim}(ID: ${formData.id})${Colors.Reset}`,
            );
            return { updated: true };
          } else {
            const errorMessage = result?.error || "Unknown update error";
            console.error(`❌ Failed to update ${formData.id}:`, errorMessage);

            await writeDataToCSV(
              `"${formData.id}","${formData.title || ""}","update","${
                errorMessage.toString().replace(/"/g, '""')
              }"`,
              errorLogPath,
            );
            return { updated: false };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`❌ Error processing form update:`, errorMessage);

          const templateId = csvFormData[CONFIGURATION.PRIMARY_TEMPLATE_ID_FIELD] || "Unknown";
          await writeDataToCSV(
            `"${templateId}","","processing","${errorMessage.replace(/"/g, '""')}"`,
            errorLogPath,
          );
          return { updated: false };
        }
      });

      await Promise.all(promises);
      console.log(
        `${Colors.Gray}📊 Chunk completed: ${
          Math.min(i + chunkSize, csvData.length)
        }/${csvData.length}${Colors.Reset}`,
      );
    }

    console.log("\n" + "=".repeat(DASH_LENGTH));
    console.log(`${Colors.Green}${Colors.Bold}✅ Form data update completed${Colors.Reset}`);
    console.log(
      `${Colors.Green}📊 Updated: ${Colors.Bold}${totalUpdated}${Colors.Reset}/${csvData.length}`,
    );
    console.log(`${Colors.Yellow}⏭️  Skipped: ${Colors.Bold}${totalSkipped}${Colors.Reset}`);
    console.log(`📝 Error log: ${Colors.Dim}${errorLogPath}${Colors.Reset}`);
    console.log("=".repeat(DASH_LENGTH));
  }

  public async updateFormDataFromJSON(): Promise<void> {
    const chunkSize = 2;
    let totalUpdated = 0;
    let totalSkipped = 0;

    const currentForms = await loadCurrentForms();

    console.log("🚀 ~ Starting form data update from JSON ⏳");
    console.log(`📊 ~ Total forms to process: ${currentForms.length}`);

    const errorLogPath = `strapi/logs/error-update-forms-json-${this.currentTime}.csv`;
    await writeDataToCSV(`form_id,title,operation,error`, errorLogPath);

    for (let i = 0; i < currentForms.length; i += chunkSize) {
      logChunkHeader(i, currentForms.length, chunkSize);

      const chunk = currentForms.slice(i, i + chunkSize);
      const promises = chunk.map(async (formData) => {
        try {
          let needUpdate = false;
          const updateData: IUpdatePayload = {};

          if (formData.tempUsedCount && formData.tempUsedCount > 0) {
            updateData.tempUsedCount = 0;
            updateData.amountUsed = (formData.amountUsed || 0) + formData.tempUsedCount;
            needUpdate = true;
          }

          if (needUpdate) {
            console.log(
              `${Colors.Blue}🔄 Updating: ${formData.title || formData.id}${Colors.Reset}`,
            );

            const payload = {
              data: updateData,
            };

            const result = await formRepository.updateForm(formData.id, payload);

            if (result && !result.error) {
              if (updateData.timeSensitiveGrouping && formData.id) {
                await timeSensitiveFormManagerService.addFormToTimeSensitiveGroup(
                  updateData.timeSensitiveGrouping,
                  formData.id,
                );
              }

              totalUpdated++;
              console.log(
                `${Colors.Green}✅ Updated: ${formData.title} ${Colors.Dim}(ID: ${formData.id})${Colors.Reset}`,
              );
              return { updated: true };
            } else {
              const errorMessage = result?.error || "Unknown update error";
              console.error(`❌ Failed to update ${formData.id}:`, errorMessage);

              await writeDataToCSV(
                `"${formData.id}","${formData.title || ""}","update","${
                  errorMessage.toString().replace(/"/g, '""')
                }"`,
                errorLogPath,
              );
              return { updated: false };
            }
          } else {
            totalSkipped++;
            console.log(
              `${Colors.Gray}⏭️  No updates needed: ${
                formData.title || formData.id
              }${Colors.Reset}`,
            );
            return { updated: false };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`❌ Error processing form ${formData.id}:`, errorMessage);

          await writeDataToCSV(
            `"${formData.id}","${formData.title || ""}","processing","${
              errorMessage.replace(/"/g, '""')
            }"`,
            errorLogPath,
          );
          return { updated: false };
        }
      });

      await Promise.all(promises);
      console.log(
        `${Colors.Gray}📊 Chunk completed: ${
          Math.min(i + chunkSize, currentForms.length)
        }/${currentForms.length}${Colors.Reset}`,
      );
    }

    console.log("\n" + "=".repeat(DASH_LENGTH));
    console.log(`${Colors.Green}${Colors.Bold}✅ Form data update completed${Colors.Reset}`);
    console.log(
      `${Colors.Green}📊 Updated: ${Colors.Bold}${totalUpdated}${Colors.Reset}/${currentForms.length}`,
    );
    console.log(
      `${Colors.Gray}⏭️  Skipped (no changes): ${Colors.Bold}${totalSkipped}${Colors.Reset}`,
    );
    console.log(`📝 Error log: ${Colors.Dim}${errorLogPath}${Colors.Reset}`);
    console.log("=".repeat(DASH_LENGTH));
  }

  public async updateCustomForm(): Promise<void> {
    try {
      console.log("🚀 ~ Starting custom form update ⏳");
      const templateCSVData = await readCSVFile(CONFIGURATION.TEMPLATE_IMPORT_CSV_PATH);

      const folderPDF = `strapi/data/pdf/${LT_CARD}`;
      const pdfFiles: { fileName: string; pdfPath: string }[] = [];

      try {
        for await (const entry of Deno.readDir(folderPDF)) {
          if (entry.isFile && entry.name.toLowerCase().endsWith(".pdf")) {
            const pdfPath = `${folderPDF}/${entry.name}`;
            const fileNameWithoutExt = entry.name.replace(/\.pdf$/i, "");
            pdfFiles.push({
              fileName: fileNameWithoutExt,
              pdfPath: pdfPath,
            });
          }
        }
      } catch (_error) {
        console.log(`⚠️ PDF folder not found: ${folderPDF}`);
      }

      console.log("🚀 ~ PDF files found:", pdfFiles.length);

      const chunkSize = 100;
      let totalMatched = 0;

      for (let i = 0; i < templateCSVData.length; i += chunkSize) {
        const chunk = templateCSVData.slice(i, i + chunkSize);
        const promises = chunk.map(async (csvFormData: ICsvRawData) => {
          const templateName = csvFormData["template_name"];

          const fileName = csvFormData[CONFIGURATION.PRIMARY_FILE_NAME_FIELD]
            ? csvFormData[CONFIGURATION.PRIMARY_FILE_NAME_FIELD]
            : formatTitleForFileName(templateName);

          const pdfFile = pdfFiles.find((f) => f.fileName === fileName);

          const logRow = `"${csvFormData[CONFIGURATION.PRIMARY_TEMPLATE_ID_FIELD]}","${fileName}"`;
          await writeDataToCSV(logRow, "strapi/logs/log-pdf-matching.csv");

          if (pdfFile) {
            totalMatched++;
          }
        });

        await Promise.all(promises);
        console.log(
          `📈 ~ Progress: ${
            Math.min(i + chunkSize, templateCSVData.length)
          }/${templateCSVData.length} templates processed`,
        );
      }

      console.log("✅ ~ Custom form update completed");
      console.log(`📊 ~ Total matched: ${totalMatched}`);
      console.log(`📊 ~ Total templates: ${templateCSVData.length}`);
      console.log("⚠️ ~ Do not delete mapping file before update/upload operations");
    } catch (error) {
      console.error("❌ ~ FormStrapiScript ~ updateCustomForm ~ error:", error);
    }
  }
}

export const formUpdateService = new FormUpdateService();
