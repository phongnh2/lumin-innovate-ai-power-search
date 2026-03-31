import * as path from "@std/path";
import { Colors } from "@strapi/config/enum.ts";
import { CONFIGURATION, LT_CARD } from "@strapi/config/settings.ts";
import {
  ensureDirectoryExists,
  readCSVFile,
  readJsonFile,
  writeDataToCSV,
  writeJsonFile,
} from "@strapi/utils/file.ts";
import { isProductionEnv } from "@strapi/utils/helpers.ts";
import { FORM_JSON_PATH } from "@strapi/modules/form/constants/index.ts";
import { getFormData, isValidateTemplate } from "@strapi/modules/form/helpers/form-data.helper.ts";
import { getFormIdByTemplateReleaseId } from "@strapi/modules/form/helpers/form-mapping.helper.ts";
import { formRepository } from "@strapi/modules/form/repositories/form.repository.ts";
import { uploadRepository } from "../repositories/upload.repository.ts";
import { IUploadResult } from "../interfaces/index.ts";

export class UploadPdfService {
  public async uploadPDFs(): Promise<void> {
    const csvData = await readCSVFile(CONFIGURATION.TEMPLATE_IMPORT_CSV_PATH);
    const forms = [];
    const chunkSize = 2;
    const failedUploads: unknown[] = [];

    console.log(`${Colors.Blue}🚀 Starting PDF upload process ⏳${Colors.Reset}`);

    for (const csvRowData of csvData) {
      const { result: formData } = await getFormData({
        data: csvRowData,
        currentFormSlugs: new Set(),
      });

      const { isValid } = isValidateTemplate(formData);
      if (!isValid) {
        continue;
      }

      let formId: number | null;
      if (CONFIGURATION.JIRA_CART_IMPORT_TYPE === "IMPORT") {
        formId = await getFormIdByTemplateReleaseId(
          Number(csvRowData[CONFIGURATION.PRIMARY_TEMPLATE_ID_FIELD]),
        );
      } else {
        formId = formData.id;
      }

      const fileName = formData?.fileName;
      const pdfFile = `${CONFIGURATION.PDF_PATH}${fileName}.pdf`;

      forms.push({
        id: formId,
        pdfFile: pdfFile,
        alternativeText: formData.alternativeText,
        categories: formData.categories,
      });
    }

    let uploadedPdfCount = 0;

    try {
      for (let i = 0; i < forms.length; i += chunkSize) {
        const formBatch = forms.slice(i, i + chunkSize);
        console.log(
          `${Colors.Blue}📄 Processing PDF batch for forms: ${Colors.Reset}`,
          formBatch.map((form) => form?.id),
        );

        const uploadResults = await Promise.all(
          formBatch.map(async (form) => {
            try {
              return await uploadRepository.uploadFileToStrapi(form.pdfFile, {
                fileName: path.basename(form.pdfFile),
                alternativeText: form.alternativeText ?? "",
              });
            } catch (uploadError) {
              const errorMessage = uploadError instanceof Error
                ? uploadError.message
                : String(uploadError);
              failedUploads.push({
                pdfFile: form.pdfFile,
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
          .map((res: unknown) => ({ id: (res as any)?.[0]?.id, name: (res as any)?.[0]?.name }));

        const updateFormPromises = formBatch.map(async (form) => {
          const pdfId = successfulUploads.find(
            (pdf) => pdf.name === path.basename(form.pdfFile),
          )?.id;

          if (pdfId) {
            const formPayload = {
              data: {
                file: pdfId,
                categories: form.categories,
              },
            };

            return await formRepository.updateForm(form.id, formPayload);
          }
          return null;
        });

        await Promise.all(updateFormPromises);

        console.log(
          `${Colors.Green}✅ Uploaded PDFs for forms: ${Colors.Reset}`,
          formBatch.map((form) => form.id),
        );

        uploadedPdfCount += successfulUploads.length;
      }

      console.log(
        `${Colors.Yellow}📊 Failed uploads summary:${Colors.Reset}`,
        failedUploads,
      );
      if (failedUploads.length > 0) {
        await ensureDirectoryExists(CONFIGURATION.FAILED_UPLOADS_PDF_PATH);
        await writeJsonFile(
          failedUploads,
          `${CONFIGURATION.FAILED_UPLOADS_PDF_PATH}`,
        );
        console.log(
          `${Colors.Yellow}⚠️  ${failedUploads.length} PDFs failed to upload${Colors.Reset}`,
        );
      }

      console.log(
        `${Colors.Green}🎉 PDF upload completed | Total successful uploads: ${uploadedPdfCount}${Colors.Reset}`,
      );
    } catch (error) {
      console.error(`${Colors.Red}❌ Unexpected error during PDF upload:${Colors.Reset}`, error);
    }
  }

  public async retryFailedPDFUploads(): Promise<IUploadResult | undefined> {
    try {
      const failedUploadsPath = `${Deno.cwd()}/${CONFIGURATION.FAILED_UPLOADS_PDF_PATH}`;
      const failedUploads = await readJsonFile(
        failedUploadsPath,
        [],
      ) as unknown[];

      if (failedUploads.length === 0) {
        console.log(`${Colors.Blue}ℹ️  No failed uploads to retry${Colors.Reset}`);
        return;
      }

      const retriedUploads: unknown[] = [];
      const stillFailedUploads = [];

      for (const uploadItem of failedUploads) {
        const upload = uploadItem as any;
        try {
          const uploadResult = await uploadRepository.uploadFileToStrapi(upload.pdfFile, {
            fileName: path.basename(upload.pdfFile),
            alternativeText: upload.alternativeText ?? "",
          }) as any;

          const pdfId = uploadResult[0].id;
          const formPayload = {
            data: {
              file: pdfId,
            },
          };

          await formRepository.updateForm(upload.formId, formPayload);

          retriedUploads.push(upload);
        } catch (retryError) {
          const errorMessage = retryError instanceof Error
            ? retryError.message
            : String(retryError);
          stillFailedUploads.push({
            ...upload,
            retryError: errorMessage,
          });
        }
      }

      await writeJsonFile(
        stillFailedUploads,
        `${CONFIGURATION.FAILED_UPLOADS_THUMBNAIL_PATH}/failed-uploads-pdf.json`,
      );

      console.log(
        `${Colors.Green}✅ Successfully retried ${retriedUploads.length} uploads${Colors.Reset}`,
      );
      console.log(
        `${Colors.Yellow}⚠️  ${stillFailedUploads.length} uploads still failed${Colors.Reset}`,
      );

      return {
        retriedUploads,
        stillFailedUploads,
      };
    } catch (error) {
      console.error(`${Colors.Red}❌ Error during retry process:${Colors.Reset}`, error);
      return undefined;
    }
  }

  public async uploadPDFsFromJSON(): Promise<void> {
    const formJsonPath = isProductionEnv() ? FORM_JSON_PATH.PRODUCTION : FORM_JSON_PATH.STAGING;
    const formData = await readJsonFile(formJsonPath, []) as unknown[];
    const csvData = await readCSVFile(CONFIGURATION.TEMPLATE_IMPORT_CSV_PATH);
    const forms = [];
    const chunkSize = 5;

    console.log(`${Colors.Blue}🚀 Starting PDF upload from JSON data ⏳${Colors.Reset}`);

    for (const dataItem of formData) {
      const data = dataItem as any;
      const formId = Number(data.id);

      const csvRow = csvData.find(
        (csvRowData) => csvRowData.template_release_id === data.templateReleaseId,
      );

      if (!csvRow) {
        console.log(
          `${Colors.Yellow}⚠️  No CSV data found for template ID ${data.templateReleaseId}${Colors.Reset}`,
        );
        continue;
      }

      const fileName = csvRow?.file_name;
      const pdfFile = `${CONFIGURATION.PDF_PATH}${fileName}.pdf`;

      forms.push({
        id: formId,
        pdfFile: pdfFile,
        alternativeText: data[CONFIGURATION.PRIMARY_ALTERNATIVE_TEXT_FIELD] ?? "",
      });
    }

    try {
      for (let i = 0; i < forms.length; i += chunkSize) {
        const formBatch = forms.slice(i, i + chunkSize);
        console.log(
          `${Colors.Blue}📄 Processing PDF batch for forms: ${Colors.Reset}`,
          formBatch.map((form) => form.id),
        );

        const pdfFilesForUpload = formBatch.map((form) => ({
          pdfFile: form.pdfFile,
          alternativeText: form.alternativeText,
        }));

        const uploadResults = await Promise.all(
          pdfFilesForUpload.map(({ pdfFile, alternativeText }) =>
            uploadRepository.uploadFileToStrapi(pdfFile, {
              fileName: path.basename(pdfFile),
              alternativeText,
            })
          ),
        );

        const pdfIds = uploadResults.map((res) => (res as any)[0]?.id);

        for (let index = 0; index < formBatch.length; index++) {
          const form = formBatch[index];
          const rowData = `${form.id},${form.pdfFile},${pdfIds[index]}`;
          await writeDataToCSV(
            rowData,
            `strapi/data/map/${LT_CARD}-pdf-mapping.csv`,
          );
        }

        const updateFormPromises = formBatch.map(async (form, idx) => {
          const formPayload = {
            data: {
              file: pdfIds[idx],
            },
          };
          return await formRepository.updateForm(form.id, formPayload);
        });

        await Promise.all(updateFormPromises);
        console.log(
          `${Colors.Green}✅ Uploaded PDFs for forms: ${Colors.Reset}`,
          formBatch.map((form) => form.id),
        );
      }
      console.log(`${Colors.Green}🎉 PDF upload from JSON completed${Colors.Reset}`);
    } catch (error) {
      console.error(`${Colors.Red}❌ Error uploading PDFs from JSON:${Colors.Reset}`, error);
    }
  }
}

export const uploadPdfService = new UploadPdfService();
