import { Colors } from "@strapi/config/enum.ts";
import { CONFIGURATION } from "@strapi/config/settings.ts";
import { readCSVFile, readJsonFile } from "@strapi/utils/file.ts";
import { isProductionEnv } from "@strapi/utils/helpers.ts";
import { FORM_JSON_PATH } from "@strapi/modules/form/constants/index.ts";
import { IForm } from "@strapi/modules/form/interfaces/index.ts";
import { uploadRepository } from "../repositories/upload.repository.ts";

export class UploadMetadataService {
  public async updateMediaFileMetadata(): Promise<void> {
    const formJsonPath = isProductionEnv() ? FORM_JSON_PATH.PRODUCTION : FORM_JSON_PATH.STAGING;
    const formData = await readJsonFile(formJsonPath, []) as IForm[];
    const csvData = await readCSVFile(CONFIGURATION.TEMPLATE_IMPORT_CSV_PATH);

    const mediaFiles = [];
    const chunkSize = 2;

    console.log(`${Colors.Blue}🚀 Starting media metadata update process ⏳${Colors.Reset}`);

    for (const data of csvData) {
      const csvFormId = Number(data[CONFIGURATION.PRIMARY_TEMPLATE_ID_FIELD]);
      const form = formData.find(
        (item) => Number(item.templateReleaseId) === csvFormId,
      );

      if (!form) {
        continue;
      }

      const rawAltText = data[CONFIGURATION.PRIMARY_ALTERNATIVE_TEXT_FIELD] || "";
      const altText = rawAltText.startsWith("Alt Text: ")
        ? rawAltText.replace("Alt Text: ", "").trim()
        : rawAltText.trim();

      if (form.thumbnails && Array.isArray(form.thumbnails)) {
        const thumbnailMedia = form.thumbnails.map((thumbnail) => {
          return {
            id: thumbnail.id,
            alternativeText: altText,
          };
        });
        mediaFiles.push(...thumbnailMedia);
      }

      if (form.file && form.file.id) {
        const pdfFileMedia = {
          id: form.file.id,
          alternativeText: altText,
        };
        mediaFiles.push(pdfFileMedia);
      }
    }
    try {
      for (let i = 0; i < mediaFiles.length; i += chunkSize) {
        const mediaBatch = mediaFiles.slice(i, i + chunkSize);
        console.log(
          `${Colors.Blue}🔄 Updating metadata for media files: ${Colors.Reset}`,
          mediaBatch.map((media) => media?.id),
        );

        const updateMediaPromises = mediaBatch.map(async (media) => {
          const payload = {
            fileInfo: {
              alternativeText: media.alternativeText,
            },
          };

          return await uploadRepository.updateFileMetadata(media.id, payload);
        });

        await Promise.all(updateMediaPromises);
        console.log(
          `${Colors.Green}✅ Updated metadata for media files: ${Colors.Reset}`,
          mediaBatch.map((media) => media.id),
        );
      }
      console.log(
        `${Colors.Green}🎉 Media metadata update completed | Total files: ${mediaFiles.length}${Colors.Reset}`,
      );
    } catch (error) {
      console.error(`${Colors.Red}❌ Error updating media metadata:${Colors.Reset}`, error);
    }
  }
}

export const uploadMetadataService = new UploadMetadataService();
