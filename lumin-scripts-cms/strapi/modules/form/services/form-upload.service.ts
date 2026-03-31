import { Colors } from "@strapi/config/enum.ts";
import { CONFIGURATION, DASH_LENGTH } from "@strapi/config/settings.ts";
import { ICsvRawData, IMappingTemplateId, IStrapiResponse } from "../interfaces/index.ts";
import { FORM_SLUG_JSON_PATH } from "../constants/index.ts";
import { readCSVFile, writeDataToCSV, writeJsonFile } from "@strapi/utils/file.ts";
import { isProductionEnv, logChunkHeader } from "@strapi/utils/helpers.ts";
import {
  getFormData,
  isValidateTemplate,
  loadCurrentFormSlugs,
} from "../helpers/form-data.helper.ts";
import { formRepository } from "../repositories/form.repository.ts";
import { timeSensitiveFormManagerService as _timeSensitiveFormManagerService } from "@strapi/modules/time-sensitive-form/services/time-sensitive-form-manager.service.ts";
import { StrapiService } from "@strapi/modules/strapi/strapi.service.ts";

export class FormUploadService extends StrapiService {
  private currentTime = new Date().toISOString();

  public async uploadFormFromCSV(): Promise<void> {
    try {
      console.log("🚀 ~ Uploading forms from CSV ⏳");
      const templateCSVData = await readCSVFile(CONFIGURATION.TEMPLATE_IMPORT_CSV_PATH);

      console.log("📋 ~ Loading existing form slugs ⏳");
      const slugsArray = await loadCurrentFormSlugs();
      const currentFormSlugs = new Set(slugsArray);
      console.log(`✅ ~ Loaded ${currentFormSlugs.size} existing form slugs`);

      const temporaryJSON: IMappingTemplateId[] = [];
      const chunkSize = 1;
      let totalCreated = 0;

      console.log(`📊 ~ Total templates to process: ${templateCSVData.length}`);

      const errorLogPath = `strapi/logs/error-upload-forms-${this.currentTime}.csv`;
      await writeDataToCSV(`template_id,title,slug,error`, errorLogPath);

      for (let i = 0; i < templateCSVData.length; i += chunkSize) {
        logChunkHeader(i, templateCSVData.length, chunkSize);

        const chunk = templateCSVData.slice(i, i + chunkSize);
        const promises = chunk.map(async (csvFormData: ICsvRawData) => {
          const { result: formData, errors: formErrors } = await getFormData({
            data: csvFormData,
            currentFormSlugs,
          });

          const { isValid, errors: validationErrors } = isValidateTemplate(formData);
          const allErrors = [...formErrors, ...validationErrors];

          if (!isValid || allErrors.length > 0) {
            console.log(
              `${Colors.Yellow}⚠️  Skipping invalid template: ${
                formData.title || formData.id
              }${Colors.Reset}`,
            );
            await writeDataToCSV(
              `"${formData.id}","${formData.title || ""}","${formData.slug || ""}","${
                allErrors.join("; ").replace(/"/g, '""')
              }"`,
              errorLogPath,
            );
            return { created: false };
          }

          console.log("=".repeat(80));
          console.log(`${Colors.Blue}🚀 Processing: ${formData.title}${Colors.Reset}`);
          console.log(`📋 Form ID: ${formData.id}`);
          console.log(`🏷️  Slug: ${formData.slug}`);
          console.log(`⏰ Outdated: ${formData.outdated}`);
          console.log(`🎯 TimeSensitiveGrouping: ${formData.timeSensitiveGrouping || "NONE"}`);
          console.log("=".repeat(80));

          if (currentFormSlugs.has(formData.slug)) {
            console.log(
              `${Colors.Yellow}⚠️  Slug conflict detected: ${formData.slug}${Colors.Reset}`,
            );
            await writeDataToCSV(
              `"${formData.id}","${formData.title}","${formData.slug}","Slug already exists"`,
              errorLogPath,
            );
            return { created: false };
          }

          try {
            const result: IStrapiResponse = await formRepository.createForm(formData);
            if (result.error) {
              const errorMessage = result.error?.message || `HTTP ${result.status}`;
              console.error(`❌ Failed to create form ${formData.title}:`, errorMessage);

              await writeDataToCSV(
                `"${formData.id}","${formData.title}","${formData.slug}","${
                  errorMessage.replace(/"/g, '""')
                }"`,
                errorLogPath,
              );
              return { created: false };
            } else {
              const newFormId = result.data?.id || 0;

              temporaryJSON.push({
                templateId: newFormId,
                templateReleaseId: Number(csvFormData[CONFIGURATION.PRIMARY_TEMPLATE_ID_FIELD]) ??
                  newFormId,
              });

              currentFormSlugs.add(formData.slug);

              console.log(
                `${Colors.Green}✅ Created: ${formData.title} ${Colors.Dim}(ID: ${newFormId})${Colors.Reset}`,
              );
              return { created: true };
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Network error creating form ${formData.title}:`, errorMessage);

            await writeDataToCSV(
              `"${formData.id}","${formData.title}","${formData.slug}","Network error: ${
                errorMessage.replace(/"/g, '""')
              }"`,
              errorLogPath,
            );
            return { created: false };
          }
        });

        const results = await Promise.all(promises);
        totalCreated += results.filter((r) => r.created).length;

        await writeJsonFile(
          temporaryJSON,
          CONFIGURATION.MAPPING_TEMPLATE_ID_JSON_PATH,
        );

        console.log(
          `${Colors.Gray}📊 Chunk completed: ${
            Math.min(i + chunkSize, templateCSVData.length)
          }/${templateCSVData.length}${Colors.Reset}`,
        );
      }

      const formSlugPath = isProductionEnv()
        ? FORM_SLUG_JSON_PATH.PRODUCTION
        : FORM_SLUG_JSON_PATH.STAGING;
      await writeJsonFile(Array.from(currentFormSlugs), formSlugPath);

      console.log("\n" + "=".repeat(DASH_LENGTH));
      console.log(`${Colors.Green}${Colors.Bold}✅ Form upload completed${Colors.Reset}`);
      console.log(
        `📊 Total created: ${Colors.Bold}${totalCreated}${Colors.Reset}/${templateCSVData.length}`,
      );
      console.log(`📝 Error log: ${Colors.Dim}${errorLogPath}${Colors.Reset}`);
      console.log(
        `🗂️  Mapping file: ${Colors.Dim}${CONFIGURATION.MAPPING_TEMPLATE_ID_JSON_PATH}${Colors.Reset}`,
      );
      console.log(
        `${Colors.Yellow}⚠️  Do not delete mapping file before update/upload operations${Colors.Reset}`,
      );
      console.log("=".repeat(DASH_LENGTH));
    } catch (error) {
      console.error("❌ ~ FormStrapiScript ~ uploadFormFromCSV ~ error:", error);
      throw error;
    }
  }
}

export const formUploadService = new FormUploadService();
