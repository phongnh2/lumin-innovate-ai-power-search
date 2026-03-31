import { Colors } from "@strapi/config/enum.ts";
import { CONFIGURATION, LT_CARD } from "@strapi/config/settings.ts";
import { readCSVFile, writeDataToCSV } from "@strapi/utils/file.ts";
import { getFormData, isValidateTemplate } from "@strapi/modules/form/helpers/form-data.helper.ts";
import {
  ensureDirectoryExists,
  generateWithPdfToCairo,
} from "../helpers/thumbnail-generator.helper.ts";

export class ThumbnailGenerationService {
  private timestamp = new Date().toISOString();
  private outputDirectory = `./strapi/data/thumbnails/${LT_CARD}`;

  public async generateThumbnailsFromFile(): Promise<void> {
    const csvData = await readCSVFile(CONFIGURATION.TEMPLATE_IMPORT_CSV_PATH);

    console.log(`${Colors.Blue}🚀 Starting thumbnail generation from file ⏳${Colors.Reset}`);
    let failedThumbnailCount = 0;

    const errorLogHeader = `"id", "column_file_name", "link_pdf", "error_message"`;
    const errorLogPath = `strapi/logs/error-generate-thumbnail-${this.timestamp}.csv`;
    await writeDataToCSV(errorLogHeader, errorLogPath);

    await ensureDirectoryExists(this.outputDirectory);

    for (const rowData of csvData) {
      const { result: formData } = await getFormData({
        data: rowData,
        currentFormSlugs: new Set(),
      });

      const { isValid, errors: validationErrors } = isValidateTemplate(formData);
      if (!isValid || validationErrors.length) {
        continue;
      }

      const formId = formData?.id;
      const fileName = formData?.fileName;

      console.log(`🧼 Generating thumbnail for file: ${fileName}`);
      const pdfUrl = formData.pdfUrl;

      try {
        const pdfPath = `${CONFIGURATION.PDF_PATH}${fileName}.pdf`;
        const thumbnailName = `thumbnail_${fileName}`;

        try {
          await Deno.stat(pdfPath);
        } catch (_statError) {
          throw new Error(`PDF file not found: ${pdfPath}`);
        }

        await generateWithPdfToCairo(pdfPath, thumbnailName, this.outputDirectory);
        console.log(`${Colors.Green}✅ Generated thumbnail for: ${fileName}${Colors.Reset}`);
      } catch (error) {
        failedThumbnailCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);

        await writeDataToCSV(
          `"${formId}", "${fileName?.replace(/\n/g, "")}", "${pdfUrl}", "${
            errorMessage.replace(/"/g, '""')
          }"`,
          errorLogPath,
        );

        console.error(
          `${Colors.Red}❌ Error generating thumbnail for ${fileName}:${Colors.Reset}`,
          errorMessage,
        );
      }
    }

    console.log(`${Colors.Green}✅ Thumbnail generation completed${Colors.Reset}`);
    console.log(`${Colors.Yellow}🐞 Failed thumbnails: ${failedThumbnailCount}${Colors.Reset}`);
  }

  public async generateThumbnailsFromPdfFolder(): Promise<void> {
    const outputThumbnail = CONFIGURATION.PATH_THUMBNAIL;
    console.log(`${Colors.Blue}🚀 Output thumbnail directory: ${outputThumbnail}${Colors.Reset}`);

    let successCount = 0;
    let failedCount = 0;

    await ensureDirectoryExists(outputThumbnail);

    const pdfFolderPath = `strapi/data/pdf/${CONFIGURATION.PATH_THUMBNAIL}`;

    try {
      const dirInfo = await Deno.stat(pdfFolderPath);
      if (!dirInfo.isDirectory) {
        throw new Error(`PDF path is not a directory: ${pdfFolderPath}`);
      }
    } catch (error) {
      console.error(`${Colors.Red}❌ PDF folder not found: ${pdfFolderPath}${Colors.Reset}`);
      throw error;
    }

    console.log(`${Colors.Blue}🚀 Starting thumbnail generation from PDF folder ⏳${Colors.Reset}`);

    for await (const dirEntry of Deno.readDir(pdfFolderPath)) {
      if (dirEntry.isFile && dirEntry.name.endsWith(".pdf")) {
        const pdfFileName = dirEntry.name;
        const pdfPath = `${pdfFolderPath}/${pdfFileName}`;
        const thumbnailName = pdfFileName.replace(".pdf", "");

        console.log(`🧼 Generating thumbnail for: ${pdfFileName}`);

        try {
          await generateWithPdfToCairo(pdfPath, thumbnailName, outputThumbnail);
          successCount++;
          console.log(
            `${Colors.Green}✅ Generated thumbnail for: ${pdfFileName}${Colors.Reset}`,
          );
        } catch (error) {
          failedCount++;
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(
            `${Colors.Red}❌ Error generating thumbnail for ${pdfFileName}:${Colors.Reset}`,
            errorMessage,
          );
        }
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log(
      `${Colors.Green}✅ Thumbnail generation from PDF folder completed${Colors.Reset}`,
    );
    console.log(
      `${Colors.Green}📊 Successfully generated: ${successCount} thumbnails${Colors.Reset}`,
    );
    console.log(`${Colors.Yellow}❌ Failed: ${failedCount} thumbnails${Colors.Reset}`);
    console.log("=".repeat(50));
  }
}

export const thumbnailGenerationService = new ThumbnailGenerationService();
