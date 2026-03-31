import { Colors } from "@strapi/config/enum.ts";
import { ITimeSensitiveForm } from "../interfaces/index.ts";
import { getTimeSensitiveFormJsonPath } from "../constants/index.ts";
import { readCSVFile, readJsonFile } from "@strapi/utils/file.ts";
import { ICsvRawData } from "@strapi/modules/form/interfaces/index.ts";
import { timeSensitiveFormNameDictionaryService } from "./time-sensitive-form-name-dictionary.service.ts";
import { CONFIGURATION } from "@strapi/config/settings.ts";

export class TimeSensitiveFormPreviewService {
  public async checkNewTimeSensitiveFormsFromCSV(): Promise<boolean> {
    const csvData = await readCSVFile(CONFIGURATION.TEMPLATE_IMPORT_CSV_PATH);
    const { hasNewForms } = await this.checkNewTimeSensitiveForms(csvData);
    return hasNewForms;
  }

  public async checkNewTimeSensitiveForms(csvData: ICsvRawData[]): Promise<{
    hasNewForms: boolean;
    newFormNames: string[];
    existingForms: ITimeSensitiveForm[];
  }> {
    console.log(
      `${Colors.Cyan}🔍 ~ Checking for new time-sensitive forms using name dictionary...${Colors.Reset}`,
    );

    const existingForms = await this.loadExistingForms();

    const existingCanonicalNames = new Set(
      existingForms.map((form) =>
        timeSensitiveFormNameDictionaryService.getCanonicalName(form.name).toLowerCase()
      ),
    );

    const csvFormNames = new Set<string>();

    for (const row of csvData) {
      if (row.time_sensitive_grouping && typeof row.time_sensitive_grouping === "string") {
        const canonicalName = timeSensitiveFormNameDictionaryService.getCanonicalName(
          row.time_sensitive_grouping.trim(),
        );
        csvFormNames.add(canonicalName);
      }
    }

    const newFormNames = Array.from(csvFormNames).filter(
      (canonicalName) => !existingCanonicalNames.has(canonicalName.toLowerCase()),
    );

    console.log(
      `${Colors.Blue}📊 ~ Found ${existingForms.length} existing time-sensitive forms${Colors.Reset}`,
    );
    console.log(
      `${Colors.Blue}📊 ~ Found ${csvFormNames.size} unique groupings in CSV${Colors.Reset}`,
    );
    console.log(
      `${Colors.Blue}📊 ~ Detected ${newFormNames.length} new time-sensitive forms${Colors.Reset}`,
    );

    if (newFormNames.length > 0) {
      this.displayNewFormsWarning(newFormNames);
    }

    return {
      hasNewForms: newFormNames.length > 0,
      newFormNames,
      existingForms,
    };
  }

  public displayNewFormsWarning(newFormNames: string[]): void {
    console.log("\n" + "🚨".repeat(50));
    console.log(
      `${Colors.Red}${Colors.Bold}⚠️  WARNING: NEW TIME-SENSITIVE FORMS DETECTED! ⚠️${Colors.Reset}`,
    );
    console.log("🚨".repeat(50));
    console.log(
      `${Colors.Yellow}${Colors.Bold}📋 New time-sensitive forms found in CSV:${Colors.Reset}`,
    );

    newFormNames.forEach((name, index) => {
      console.log(`${Colors.Cyan}   ${index + 1}. "${name}"${Colors.Reset}`);
    });

    console.log(`\n${Colors.Red}${Colors.Bold}🛑 REQUIRED ACTION:${Colors.Reset}`);
    console.log(
      `${Colors.Yellow}   Run this command first to create time-sensitive forms:${Colors.Reset}`,
    );
    console.log(
      `${Colors.Green}${Colors.Bold}   deno task strapi createTimeSensitiveFormsFromCSV${Colors.Reset}`,
    );
    console.log(`\n${Colors.Yellow}   Then run your original command again.${Colors.Reset}`);
    console.log("🚨".repeat(50) + "\n");
  }

  private async loadExistingForms(): Promise<ITimeSensitiveForm[]> {
    try {
      const jsonPath = getTimeSensitiveFormJsonPath();
      return await readJsonFile(jsonPath, []);
    } catch (error) {
      console.log(
        `${Colors.Yellow}⚠️ Could not load existing time-sensitive forms: ${error}${Colors.Reset}`,
      );
      return [];
    }
  }
}

export const timeSensitiveFormPreviewService = new TimeSensitiveFormPreviewService();
