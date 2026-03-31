import * as path from "@std/path";
import { Colors } from "@strapi/config/enum.ts";
import { CONFIGURATION, LT_CARD } from "@strapi/config/settings.ts";
import {
  ensureDirectoryExists,
  readCSVFile,
  readJsonFile,
  writeJsonFile,
} from "@strapi/utils/file.ts";
import { isProductionEnv } from "@strapi/utils/helpers.ts";
import { FORM_JSON_PATH } from "@strapi/modules/form/constants/index.ts";
import { getFormData, isValidateTemplate } from "@strapi/modules/form/helpers/form-data.helper.ts";
import { getFormIdByTemplateReleaseId } from "@strapi/modules/form/helpers/form-mapping.helper.ts";
import { formRepository } from "@strapi/modules/form/repositories/form.repository.ts";
import { uploadRepository } from "../repositories/upload.repository.ts";
import { getThumbnailFiles } from "../helpers/file.helper.ts";
import { IUploadResult } from "../interfaces/index.ts";

export class UploadThumbnailService {
  private readonly thumbnailDirectory = `strapi/data/thumbnails/${LT_CARD}/`;

  public async uploadThumbnails(): Promise<void> {
    const csvData = await readCSVFile(CONFIGURATION.TEMPLATE_IMPORT_CSV_PATH);
    const forms = [];
    const chunkSize = 1;
    const failedUploads: unknown[] = [];

    console.log(`${Colors.Blue}🚀 Starting thumbnail upload process ⏳${Colors.Reset}`);

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

      if (!formId) {
        console.log(`${Colors.Yellow}⚠️  Could not find form ID for template${Colors.Reset}`);
        continue;
      }

      const fileName = formData?.fileName;
      const thumbnailFiles = await getThumbnailFiles(this.thumbnailDirectory, fileName ?? "");

      const thumbnails = thumbnailFiles.map((thumbnail) => {
        return {
          alternativeText: formData.alternativeText,
          file: thumbnail,
        };
      }).sort((a, b) => a.file.localeCompare(b.file));

      forms.push({
        id: formId,
        thumbnails,
        categories: formData.categories,
      });
    }

    let uploadedThumbnailCount = 0;

    try {
      for (let i = 0; i < forms.length; i += chunkSize) {
        const formBatch = forms.slice(i, i + chunkSize);
        console.log(
          `${Colors.Blue}🖼️  Processing thumbnail batch for forms: ${Colors.Reset}`,
          formBatch.map((form) => form?.id),
        );

        const thumbnailBatch = formBatch.flatMap((form) => form.thumbnails);

        const uploadResults = await Promise.all(
          thumbnailBatch.map(async (thumbnail) => {
            try {
              return await uploadRepository.uploadFileToStrapi(thumbnail.file, {
                fileName: path.basename(thumbnail.file),
                alternativeText: thumbnail.alternativeText ?? "",
              });
            } catch (uploadError) {
              const errorMessage = uploadError instanceof Error
                ? uploadError.message
                : String(uploadError);
              failedUploads.push({
                thumbnail,
                formId: formBatch.find((form) => form.thumbnails.includes(thumbnail))?.id,
                alternativeText: thumbnail.alternativeText ?? "",
                error: errorMessage,
              });
              return null;
            }
          }),
        );

        const successfulUploads = uploadResults
          .filter((res) => res !== null)
          .map((res) => ({ id: (res as any)?.[0]?.id, name: (res as any)?.[0]?.name }))
          .sort((a, b) => a.name.localeCompare(b.name));

        const updateFormPromises = formBatch.map(async (form) => {
          const thumbnailIds = form.thumbnails
            .map((thumbnail) => {
              const newThumbnail = successfulUploads.find(
                (res) => res.name === path.basename(thumbnail.file),
              );
              return newThumbnail?.id;
            })
            .filter(Boolean);

          const formPayload = {
            data: {
              thumbnails: thumbnailIds,
              categories: form.categories,
            },
          };

          return await formRepository.updateForm(form.id, formPayload);
        });

        await Promise.all(updateFormPromises);

        console.log(
          `${Colors.Green}✅ Uploaded thumbnails for forms: ${Colors.Reset}`,
          formBatch.map((form) => form.id),
        );

        uploadedThumbnailCount += successfulUploads.length;
      }

      console.log(
        `${Colors.Yellow}📊 Failed uploads summary:${Colors.Reset}`,
        failedUploads,
      );
      if (failedUploads.length > 0) {
        await ensureDirectoryExists(CONFIGURATION.FAILED_UPLOADS_THUMBNAIL_PATH);
        await writeJsonFile(
          failedUploads,
          `${CONFIGURATION.FAILED_UPLOADS_THUMBNAIL_PATH}/failed-uploads-thumbnail.json`,
        );
        console.log(
          `${Colors.Yellow}⚠️  ${failedUploads.length} thumbnails failed to upload${Colors.Reset}`,
        );
      }

      console.log(
        `${Colors.Green}🎉 Thumbnail upload completed | Total successful uploads: ${uploadedThumbnailCount}${Colors.Reset}`,
      );
    } catch (error) {
      console.error(
        `${Colors.Red}❌ Unexpected error during thumbnail upload:${Colors.Reset}`,
        error,
      );
    }
  }

  public async retryFailedThumbnailUploads(): Promise<IUploadResult | undefined> {
    try {
      const failedUploadsPath = `${Deno.cwd()}/${CONFIGURATION.FAILED_UPLOADS_THUMBNAIL_PATH}`;
      const failedUploads = await readJsonFile(
        failedUploadsPath,
        [],
      ) as unknown[];

      console.log(
        `${Colors.Yellow}📊 Failed uploads to retry:${Colors.Reset}`,
        failedUploads,
      );

      if (failedUploads.length === 0) {
        console.log(`${Colors.Blue}ℹ️  No failed uploads to retry${Colors.Reset}`);
        return;
      }

      const retriedUploads = [];
      const stillFailedUploads = [];

      for (const uploadItem of failedUploads) {
        const upload = uploadItem as any;
        try {
          const uploadResult = await uploadRepository.uploadFileToStrapi(
            upload.thumbnail.file,
            {
              fileName: path.basename(upload.thumbnail.file),
              alternativeText: upload.alternativeText,
            },
          ) as any;

          const thumbnailIds = [uploadResult[0].id];
          const formPayload = {
            data: {
              thumbnails: thumbnailIds,
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
        `${CONFIGURATION.FAILED_UPLOADS_THUMBNAIL_PATH}/failed-uploads-thumbnail.json`,
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

  public async uploadThumbnailsFromJSON(): Promise<void> {
    const formJsonPath = isProductionEnv() ? FORM_JSON_PATH.PRODUCTION : FORM_JSON_PATH.STAGING;
    const formData = await readJsonFile(formJsonPath, []) as unknown[];
    const csvData = await readCSVFile(CONFIGURATION.TEMPLATE_IMPORT_CSV_PATH);
    const forms = [];
    const chunkSize = 3;

    console.log(`${Colors.Blue}🚀 Starting thumbnail upload from JSON data ⏳${Colors.Reset}`);

    let uploadedThumbnailCount = 0;
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
      const thumbnailFiles = await getThumbnailFiles(this.thumbnailDirectory, fileName);

      forms.push({
        id: formId,
        thumbnails: thumbnailFiles,
        alternativeText: data[CONFIGURATION.PRIMARY_ALTERNATIVE_TEXT_FIELD] ?? "",
      });
    }

    try {
      for (let i = 0; i < forms.length; i += chunkSize) {
        const formBatch = forms.slice(i, i + chunkSize);
        console.log(
          `${Colors.Blue}🖼️  Processing thumbnail batch for forms: ${Colors.Reset}`,
          formBatch.map((form) => form?.id),
        );

        const thumbnailBatch = formBatch.flatMap((form) => form.thumbnails);
        const uploadResults = await Promise.all(
          thumbnailBatch.map((thumbnail) =>
            uploadRepository.uploadFileToStrapi(thumbnail, {
              fileName: path.basename(thumbnail),
              alternativeText: formBatch[0]?.alternativeText,
            })
          ),
        );

        const thumbnailData = uploadResults.map((res) => {
          return { id: (res as any)?.[0]?.id, name: (res as any)?.[0]?.name };
        });

        const updateFormPromises = formBatch.map(async (form) => {
          const thumbnailIds = form.thumbnails
            .map((thumbnail) => {
              const newThumbnail = thumbnailData.find(
                (res) => res.name === path.basename(thumbnail),
              );
              return newThumbnail?.id;
            })
            .filter(Boolean);

          uploadedThumbnailCount += thumbnailIds.length;

          const formPayload = {
            data: {
              thumbnails: thumbnailIds,
            },
          };

          return await formRepository.updateForm(form.id, formPayload);
        });

        await Promise.all(updateFormPromises);
        console.log(
          `${Colors.Green}✅ Uploaded thumbnails for forms: ${Colors.Reset}`,
          formBatch.map((form) => form.id),
        );
      }
      console.log(
        `${Colors.Green}🎉 Thumbnail upload from JSON completed | Total successful uploads: ${uploadedThumbnailCount}${Colors.Reset}`,
      );
    } catch (error) {
      console.error(`${Colors.Red}❌ Error uploading thumbnails from JSON:${Colors.Reset}`, error);
    }
  }
}

export const uploadThumbnailService = new UploadThumbnailService();
