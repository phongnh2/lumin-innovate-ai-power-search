import * as path from "@std/path";
import { Colors } from "@strapi/config/enum.ts";
import { CONFIGURATION } from "@strapi/config/settings.ts";
import { ensureDirectoryExists, readCSVFile, writeJsonFile } from "@strapi/utils/file.ts";
import { getFormData, isValidateTemplate } from "@strapi/modules/form/helpers/form-data.helper.ts";
import { getFormIdByTemplateReleaseId } from "@strapi/modules/form/helpers/form-mapping.helper.ts";
import { formRepository } from "@strapi/modules/form/repositories/form.repository.ts";
import { uploadRepository } from "../repositories/upload.repository.ts";

export class UploadLuminService {
  public async uploadLuminFiles(): Promise<void> {
    const csvData = await readCSVFile(CONFIGURATION.TEMPLATE_IMPORT_CSV_PATH);
    const forms = [];
    const chunkSize = 2;
    const failedUploads: unknown[] = [];

    console.log(`${Colors.Blue}🚀 Starting Lumin file upload process ⏳${Colors.Reset}`);

    for (const csvRowData of csvData) {
      const { result: formData } = await getFormData({
        data: csvRowData,
        currentFormSlugs: new Set(),
      });

      const { isValid } = isValidateTemplate(formData);
      if (!isValid) {
        continue;
      }

      const formId = await getFormIdByTemplateReleaseId(
        Number(csvRowData[CONFIGURATION.PRIMARY_TEMPLATE_ID_FIELD]),
      );

      const fileName = formData?.fileName;
      const luminFile = `${CONFIGURATION.LUMIN_PATH}${fileName}.lumin`;

      forms.push({
        id: formId,
        luminFile,
        alternativeText: formData.alternativeText,
        categories: formData.categories,
      });
    }

    let uploadedLuminCount = 0;

    try {
      for (let i = 0; i < forms.length; i += chunkSize) {
        const formBatch = forms.slice(i, i + chunkSize);
        console.log(
          `${Colors.Blue}📄 Processing Lumin file batch for forms: ${Colors.Reset}`,
          formBatch.map((form) => form?.id),
        );

        const uploadResults = await Promise.all(
          formBatch.map(async (form) => {
            try {
              return await uploadRepository.uploadFileToStrapi(form.luminFile, {
                fileName: path.basename(form.luminFile),
                alternativeText: form.alternativeText ?? "",
              });
            } catch (uploadError) {
              const errorMessage = uploadError instanceof Error
                ? uploadError.message
                : String(uploadError);
              failedUploads.push({
                luminFile: form.luminFile,
                alternativeText: form.alternativeText ?? "",
                formId: form.id,
                error: errorMessage,
                categories: form.categories,
              });
              return null;
            }
          }),
        );

        const successfulUploads = uploadResults
          .filter((res) => res !== null)
          .map((res) => ({ id: (res as any)?.[0]?.id, name: (res as any)?.[0]?.name }));

        const updateFormPromises = formBatch.map(async (form) => {
          const luminId = successfulUploads.find(
            (lumin) => lumin.name === path.basename(form.luminFile),
          )?.id;

          if (luminId) {
            const formPayload = {
              data: {
                file: luminId,
                categories: form.categories,
              },
            };

            return await formRepository.updateForm(form.id, formPayload);
          }
          return null;
        });

        await Promise.all(updateFormPromises);

        console.log(
          `${Colors.Green}✅ Uploaded Lumin files for forms: ${Colors.Reset}`,
          formBatch.map((form) => form.id),
        );

        uploadedLuminCount += successfulUploads.length;
      }

      console.log(
        `${Colors.Yellow}📊 Failed uploads summary:${Colors.Reset}`,
        failedUploads,
      );
      if (failedUploads.length > 0) {
        await ensureDirectoryExists(CONFIGURATION.FAILED_UPLOADS_LUMIN_PATH);
        await writeJsonFile(
          failedUploads,
          `${CONFIGURATION.FAILED_UPLOADS_LUMIN_PATH}`,
        );
        console.log(
          `${Colors.Yellow}⚠️  ${failedUploads.length} Lumin files failed to upload${Colors.Reset}`,
        );
      }

      console.log(
        `${Colors.Green}🎉 Lumin file upload completed | Total successful uploads: ${uploadedLuminCount}${Colors.Reset}`,
      );
    } catch (error) {
      console.error(
        `${Colors.Red}❌ Unexpected error during Lumin file upload:${Colors.Reset}`,
        error,
      );
    }
  }
}

export const uploadLuminService = new UploadLuminService();
