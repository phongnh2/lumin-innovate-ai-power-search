/**
 * Form Download Service
 *
 * Handles downloading PDF and Lumin files from Google Drive or other sources.
 * Includes retry logic and fallback mechanisms.
 */

import { Colors } from "@strapi/config/enum.ts";
import { CONFIGURATION, DASH_LENGTH, LT_CARD } from "@strapi/config/settings.ts";
import { ICsvRawData, IResultDownloadPDF, ResultStatus } from "../interfaces/index.ts";
import { readCSVFile, writeDataToCSV } from "@strapi/utils/file.ts";
import { logChunkHeader } from "@strapi/utils/helpers.ts";
import {
  getFormData,
  isValidateTemplate,
  loadCurrentFormSlugs,
} from "../helpers/form-data.helper.ts";
import { convertToGoogleDriveDownloadUrl } from "../helpers/url.helper.ts";
import { formatTitleForFileName } from "../helpers/string.helper.ts";

export class FormDownloadService {
  private currentTime = new Date().toISOString();

  /**
   * Download PDF files from CSV
   * Handles Google Drive URLs with token authentication
   */
  public async downloadPDFFromCSV(): Promise<void> {
    const csvData = await readCSVFile(CONFIGURATION.TEMPLATE_IMPORT_CSV_PATH);
    const slugsArray = await loadCurrentFormSlugs();
    const currentFormSlugs = new Set(slugsArray);

    const chunkSize = 5;
    let totalDownloaded = 0;
    let totalFailed = 0;

    const errorLogPath = `strapi/logs/errors-download-templates-${this.currentTime}.csv`;
    await writeDataToCSV(
      `template_release_id,template_name,pdf_url,review_import_status,error`,
      errorLogPath,
    );

    console.log("🚀 ~ Starting PDF download from CSV ⏳");
    console.log(`📊 ~ Total templates to process: ${csvData.length}`);

    for (let i = 0; i < csvData.length; i += chunkSize) {
      logChunkHeader(i, csvData.length, chunkSize);

      const chunk = csvData.slice(i, i + chunkSize);

      const results: PromiseSettledResult<IResultDownloadPDF>[] = await Promise.allSettled(
        chunk.map(async (csvFormData: ICsvRawData) => {
          try {
            const { result: formData } = await getFormData({
              data: csvFormData,
              currentFormSlugs,
            });

            const { isValid } = isValidateTemplate(formData);
            if (!isValid) {
              throw new Error("Invalid template");
            }

            const fileName = formData?.fileName;
            const pdfUrl = formData?.pdfUrl;

            if (!pdfUrl) {
              throw new Error("Missing PDF URL");
            }

            console.log(`${Colors.Blue}📥 Downloading: ${formData?.title}${Colors.Reset}`);

            const pdfDir = `strapi/data/pdf/${LT_CARD}`;
            const pdfPath = `${pdfDir}/${fileName}.pdf`;

            await Deno.mkdir(pdfDir, { recursive: true });

            let downloadPdfUrl = pdfUrl;
            if (pdfUrl.includes("drive.google.com")) {
              const ggDriveUrl = convertToGoogleDriveDownloadUrl(pdfUrl);
              if (ggDriveUrl) {
                downloadPdfUrl = ggDriveUrl;
              }
            }

            try {
              await this.downloadPDF(downloadPdfUrl, pdfPath);
              console.log(`${Colors.Green}✅ Downloaded: ${fileName}.pdf${Colors.Reset}`);
              totalDownloaded++;
              return { success: true, formData: csvFormData };
            } catch (_error) {
              console.log(
                `${Colors.Yellow}⚠️  Retrying with fallback: ${fileName}.pdf${Colors.Reset}`,
              );

              try {
                await this.downloadPDFWithFetch(downloadPdfUrl, pdfPath);
                console.log(
                  `${Colors.Green}✅ Downloaded (fallback): ${fileName}.pdf${Colors.Reset}`,
                );
                totalDownloaded++;
                return { success: true, formData: csvFormData };
              } catch (fallbackError) {
                throw new Error(
                  `Download failed: ${
                    fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
                  }`,
                );
              }
            }
          } catch (error) {
            const formId = csvFormData[CONFIGURATION.PRIMARY_TEMPLATE_ID_FIELD];
            const title = csvFormData["template_name"];
            const pdfUrl = csvFormData[CONFIGURATION.PRIMARY_PDF_URL_FIELD];
            const status = csvFormData[CONFIGURATION.PRIMARY_IMPORT_STATUS_FIELD];

            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Failed: ${title || formId} - ${errorMessage}`);

            const errorRow = `"${formId}","${title?.replace(/"/g, '""') || ""}","${
              pdfUrl || ""
            }","${status || ""}","${errorMessage.replace(/"/g, '""')}"`;

            totalFailed++;

            await writeDataToCSV(errorRow, errorLogPath);

            return { success: false, error, formData: csvFormData };
          }
        }),
      );

      results.forEach((result: PromiseSettledResult<IResultDownloadPDF>, index: number) => {
        if (result.status === ResultStatus.REJECTED) {
          console.error(`❌ Promise rejected for item ${index + i + 1}:`, result.reason);
          totalFailed++;
        }
      });

      console.log(
        `${Colors.Gray}📊 Chunk completed: ${
          Math.min(i + chunkSize, csvData.length)
        }/${csvData.length}${Colors.Reset}`,
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("\n" + "=".repeat(DASH_LENGTH));
    console.log(`${Colors.Green}${Colors.Bold}✅ PDF download completed${Colors.Reset}`);
    console.log(
      `${Colors.Green}📊 Downloaded: ${Colors.Bold}${totalDownloaded}${Colors.Reset}/${csvData.length}`,
    );
    console.log(`${Colors.Yellow}❌ Failed: ${Colors.Bold}${totalFailed}${Colors.Reset}`);
    console.log(`📝 Error log: ${Colors.Dim}${errorLogPath}${Colors.Reset}`);
    console.log("=".repeat(DASH_LENGTH));
  }

  /**
   * Download Lumin files from CSV
   * Similar to PDF download but for .lumin files
   */
  public async downloadLuminFileFromCSV(): Promise<void> {
    const csvData = await readCSVFile(CONFIGURATION.TEMPLATE_IMPORT_CSV_PATH);
    const slugsArray = await loadCurrentFormSlugs();
    const currentFormSlugs = new Set(slugsArray);

    const chunkSize = 5;
    let totalDownloaded = 0;
    let totalFailed = 0;

    const errorLogPath = `strapi/logs/errors-download-lumin-${this.currentTime}.csv`;
    await writeDataToCSV(
      `template_release_id,template_name,lumin_url,review_import_status,error`,
      errorLogPath,
    );

    console.log("🚀 ~ Starting Lumin file download from CSV ⏳");
    console.log(`📊 ~ Total templates to process: ${csvData.length}`);

    for (let i = 0; i < csvData.length; i += chunkSize) {
      logChunkHeader(i, csvData.length, chunkSize);

      const chunk = csvData.slice(i, i + chunkSize);

      const results: PromiseSettledResult<IResultDownloadPDF>[] = await Promise.allSettled(
        chunk.map(async (csvFormData: ICsvRawData) => {
          try {
            const { result: formData } = await getFormData({
              data: csvFormData,
              currentFormSlugs,
            });

            const { isValid } = isValidateTemplate(formData);
            if (!isValid) {
              throw new Error("Invalid template");
            }

            const fileName = formData?.fileName;
            const luminUrl = formData?.luminUrl;

            if (!luminUrl) {
              throw new Error("Missing Lumin URL");
            }

            console.log(`${Colors.Blue}📥 Downloading: ${formData?.title}${Colors.Reset}`);

            const luminDir = `strapi/data/lumin/${LT_CARD}`;
            const luminPath = `${luminDir}/${fileName}.lumin`;

            await Deno.mkdir(luminDir, { recursive: true });

            let downloadLuminUrl = luminUrl;
            if (luminUrl.includes("drive.google.com")) {
              const ggDriveUrl = convertToGoogleDriveDownloadUrl(luminUrl);
              if (ggDriveUrl) {
                downloadLuminUrl = ggDriveUrl;
              }
            }

            try {
              await this.downloadPDF(downloadLuminUrl, luminPath);
              console.log(`${Colors.Green}✅ Downloaded: ${fileName}.lumin${Colors.Reset}`);
              totalDownloaded++;
              return { success: true, formData: csvFormData };
            } catch (_error) {
              console.log(
                `${Colors.Yellow}⚠️  Retrying with fallback: ${fileName}.lumin${Colors.Reset}`,
              );

              try {
                await this.downloadPDFWithFetch(downloadLuminUrl, luminPath);
                console.log(
                  `${Colors.Green}✅ Downloaded (fallback): ${fileName}.lumin${Colors.Reset}`,
                );
                totalDownloaded++;
                return { success: true, formData: csvFormData };
              } catch (fallbackError) {
                throw new Error(
                  `Download failed: ${
                    fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
                  }`,
                );
              }
            }
          } catch (error) {
            const formId = csvFormData[CONFIGURATION.PRIMARY_TEMPLATE_ID_FIELD];
            const title = csvFormData["template_name"];
            const luminUrl = csvFormData[CONFIGURATION.PRIMARY_LUMIN_FILE_FIELD];
            const status = csvFormData[CONFIGURATION.PRIMARY_IMPORT_STATUS_FIELD];

            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Failed: ${title || formId} - ${errorMessage}`);

            const errorRow = `"${formId}","${title?.replace(/"/g, '""') || ""}","${
              luminUrl || ""
            }","${status || ""}","${errorMessage.replace(/"/g, '""')}"`;

            totalFailed++;

            await writeDataToCSV(errorRow, errorLogPath);

            return { success: false, error, formData: csvFormData };
          }
        }),
      );

      results.forEach((result: PromiseSettledResult<IResultDownloadPDF>, index: number) => {
        if (result.status === ResultStatus.REJECTED) {
          console.error(`❌ Promise rejected for item ${index + i + 1}:`, result.reason);
          totalFailed++;
        }
      });

      console.log(
        `${Colors.Gray}📊 Chunk completed: ${
          Math.min(i + chunkSize, csvData.length)
        }/${csvData.length}${Colors.Reset}`,
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("\n" + "=".repeat(DASH_LENGTH));
    console.log(`${Colors.Green}${Colors.Bold}✅ Lumin file download completed${Colors.Reset}`);
    console.log(
      `${Colors.Green}📊 Downloaded: ${Colors.Bold}${totalDownloaded}${Colors.Reset}/${csvData.length}`,
    );
    console.log(`${Colors.Yellow}❌ Failed: ${Colors.Bold}${totalFailed}${Colors.Reset}`);
    console.log(`📝 Error log: ${Colors.Dim}${errorLogPath}${Colors.Reset}`);
    console.log("=".repeat(DASH_LENGTH));
  }

  /**
   * Download file with retry logic
   * Handles redirects and content-type validation
   */
  private downloadPDF(url: string, outputPath: string, retries = 3): Promise<void> {
    return new Promise((resolve, reject) => {
      const requestOptions = {
        headers: {
          Authorization: `Bearer ${CONFIGURATION.GOOGLE_ACCESS_TOKEN}`,
          "User-Agent": "Deno/1.0",
        },
      };

      fetch(url, requestOptions)
        .then(async (response) => {
          if (response.status === 302 || response.status === 301) {
            const location = response.headers.get("location");
            if (location) {
              try {
                const result = await this.downloadPDF(location, outputPath);
                resolve(result);
              } catch (error) {
                reject(error);
              }
              return;
            }
          }

          if (!response.ok) {
            reject(new Error(`Failed to download PDF. Status Code: ${response.status}`));
            return;
          }

          const contentType = response.headers.get("content-type");
          if (
            contentType &&
            !(
              contentType.includes("application/pdf") ||
              contentType.includes("application/octet-stream")
            )
          ) {
            reject(new Error(`Invalid content-type: ${contentType}`));
            return;
          }

          const arrayBuffer = await response.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);

          await Deno.writeFile(outputPath, uint8Array);

          resolve(void 0);
        })
        .catch(async (err) => {
          if (retries > 0) {
            console.log(`Retrying download... (${retries} attempts remaining)`);
            try {
              await this.downloadPDF(url, outputPath, retries - 1);
              resolve(void 0);
            } catch (error) {
              reject(error);
            }
          } else {
            reject(err);
          }
        });
    });
  }

  /**
   * Fallback download method using direct fetch
   * Used when primary download method fails
   */
  private async downloadPDFWithFetch(url: string, outputPath: string): Promise<void> {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${CONFIGURATION.GOOGLE_ACCESS_TOKEN}`,
        "User-Agent": "Deno/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    await Deno.writeFile(outputPath, uint8Array);
  }
}

export const formDownloadService = new FormDownloadService();
