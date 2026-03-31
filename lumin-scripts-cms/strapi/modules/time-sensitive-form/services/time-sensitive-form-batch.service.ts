import { Colors } from "@strapi/config/enum.ts";
import { DASH_LENGTH } from "@strapi/config/settings.ts";
import { timeSensitiveFormManagerService } from "./time-sensitive-form-manager.service.ts";
import { timeSensitiveFormPreviewService } from "./time-sensitive-form-preview.service.ts";
import { readCSVFile } from "@strapi/utils/file.ts";
import { CONFIGURATION } from "@strapi/config/settings.ts";

export class TimeSensitiveFormBatchService {
  public async createTimeSensitiveFormsFromCSV(): Promise<void> {
    console.log("🚀 ~ Creating time-sensitive forms from CSV ⏳");

    const csvData = await readCSVFile(CONFIGURATION.TEMPLATE_IMPORT_CSV_PATH);

    const { hasNewForms, newFormNames } = await timeSensitiveFormPreviewService
      .checkNewTimeSensitiveForms(csvData);

    if (!hasNewForms) {
      console.log(`${Colors.Green}✅ No new time-sensitive forms to create${Colors.Reset}`);
      return;
    }

    console.log(
      `${Colors.Blue}📊 ~ Creating ${newFormNames.length} new time-sensitive forms${Colors.Reset}`,
    );

    let createdCount = 0;
    let failedCount = 0;

    for (const formName of newFormNames) {
      try {
        console.log(`${Colors.Blue}🔄 Creating: "${formName}"${Colors.Reset}`);

        const newId = await timeSensitiveFormManagerService.getOrCreateTimeSensitiveFormId(
          formName,
        );

        if (newId) {
          createdCount++;
          console.log(`${Colors.Green}✅ Created: "${formName}" (ID: ${newId})${Colors.Reset}`);
        } else {
          failedCount++;
          console.log(`${Colors.Red}❌ Failed to create: "${formName}"${Colors.Reset}`);
        }
      } catch (error) {
        failedCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(
          `${Colors.Red}❌ Error creating "${formName}": ${errorMessage}${Colors.Reset}`,
        );
      }
    }

    console.log("\n" + "=".repeat(DASH_LENGTH));
    console.log(
      `${Colors.Green}${Colors.Bold}✅ Time-sensitive form creation completed${Colors.Reset}`,
    );
    console.log(`${Colors.Green}📊 Created: ${Colors.Bold}${createdCount}${Colors.Reset}`);
    console.log(`${Colors.Red}❌ Failed: ${Colors.Bold}${failedCount}${Colors.Reset}`);
    console.log(`${Colors.Blue}📁 Updated JSON cache with new forms${Colors.Reset}`);
    console.log("=".repeat(DASH_LENGTH));
  }
}

export const timeSensitiveFormBatchService = new TimeSensitiveFormBatchService();
