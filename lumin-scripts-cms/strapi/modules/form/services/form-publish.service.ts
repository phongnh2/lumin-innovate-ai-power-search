import { Colors } from "@strapi/config/enum.ts";
import { CONFIGURATION, DASH_LENGTH } from "@strapi/config/settings.ts";
import { StrapiService } from "@strapi/modules/strapi/strapi.service.ts";
import { readCSVFile, writeJsonFile } from "@strapi/utils/file.ts";
import { ICsvRawData, IMappingTemplateId } from "../interfaces/index.ts";
import { formRepository } from "../repositories/form.repository.ts";
import { TIME_SENSITIVE_FORM_JSON_PATH } from "@strapi/modules/time-sensitive-form/constants/index.ts";
import { ITimeSensitiveForm } from "@strapi/modules/time-sensitive-form/interfaces/index.ts";
import { isProductionEnv } from "@strapi/utils/helpers.ts";
import { timeSensitiveFormNameDictionaryService } from "@strapi/modules/time-sensitive-form/services/time-sensitive-form-name-dictionary.service.ts";

interface IOutdatedMappingEntry {
  formId: number;
  templateReleaseId: string;
  title: string;
  timeSensitiveGroup: string;
  shouldBeOutdated: boolean;
  reason: string;
}

export class FormPublishService extends StrapiService {
  private currentTime = new Date().toISOString();
  private mappingData: IMappingTemplateId[] = [];
  private timeSensitiveForms: ITimeSensitiveForm[] = [];

  public async publishFormsAndUpdateOutdated(): Promise<void> {
    console.log("🚀 ~ Publishing forms and updating outdated status ⏳");
    console.log("=".repeat(DASH_LENGTH));

    try {
      await this.loadMappingData();
      await this.loadTimeSensitiveForms();

      const csvData = await readCSVFile(CONFIGURATION.TEMPLATE_IMPORT_CSV_PATH);
      console.log(`📊 ~ Processing ${csvData.length} forms from CSV`);

      const outdatedMapping = this.createOutdatedMapping(csvData);

      const outdatedMappingPath =
        `strapi/data/mapping-template/outdated-mapping-${this.currentTime}.json`;
      const standardOutdatedPath = "strapi/data/mapping-template/outdated-mapping.json";

      await writeJsonFile(outdatedMapping, outdatedMappingPath);
      await writeJsonFile(outdatedMapping, standardOutdatedPath);

      console.log(`📝 ~ Outdated mapping saved to: ${outdatedMappingPath}`);

      await this.updateOutdatedFormsDirectly(outdatedMapping);

      console.log("\n" + "=".repeat(DASH_LENGTH));
      console.log(`${Colors.Green}${Colors.Bold}✅ Form publishing completed${Colors.Reset}`);
      console.log(`${Colors.Blue}📁 Outdated mapping: ${outdatedMappingPath}${Colors.Reset}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`${Colors.Red}❌ Publishing failed: ${errorMessage}${Colors.Reset}`);
      throw error;
    }
  }

  private async loadMappingData(): Promise<void> {
    try {
      const mappingPath = CONFIGURATION.MAPPING_TEMPLATE_ID_JSON_PATH;
      const mappingContent = await Deno.readTextFile(mappingPath);
      this.mappingData = JSON.parse(mappingContent);
      console.log(
        `${Colors.Blue}📋 Loaded ${this.mappingData.length} form mappings${Colors.Reset}`,
      );
    } catch (error) {
      console.error(`${Colors.Red}❌ Error loading mapping data:${Colors.Reset}`, error);
      throw error;
    }
  }

  private async loadTimeSensitiveForms(): Promise<void> {
    try {
      const jsonPath = isProductionEnv()
        ? TIME_SENSITIVE_FORM_JSON_PATH.PRODUCTION
        : TIME_SENSITIVE_FORM_JSON_PATH.STAGING;

      const jsonContent = await Deno.readTextFile(jsonPath);
      this.timeSensitiveForms = JSON.parse(jsonContent);
      console.log(
        `${Colors.Blue}📋 Loaded ${this.timeSensitiveForms.length} time-sensitive forms${Colors.Reset}`,
      );
    } catch (error) {
      console.error(`${Colors.Red}❌ Error loading time-sensitive forms:${Colors.Reset}`, error);
      throw error;
    }
  }

  private getFormIdFromMapping(templateReleaseId: string): number | null {
    const mapping = this.mappingData.find(
      (entry) => entry.templateReleaseId?.toString() === templateReleaseId,
    );
    return mapping ? mapping.templateId : null;
  }

  private createOutdatedMapping(csvData: ICsvRawData[]): IOutdatedMappingEntry[] {
    console.log(`${Colors.Blue}📋 Creating outdated mapping based on CSV order...${Colors.Reset}`);

    const mapping: IOutdatedMappingEntry[] = [];
    const timeSensitiveGroups = new Map<string, ICsvRawData[]>();

    for (const row of csvData) {
      const timeSensitiveGroup = row.time_sensitive_grouping as string;
      if (timeSensitiveGroup?.trim()) {
        const canonicalName = timeSensitiveFormNameDictionaryService.getCanonicalName(
          timeSensitiveGroup.trim(),
        );

        if (!timeSensitiveGroups.has(canonicalName)) {
          timeSensitiveGroups.set(canonicalName, []);
        }
        timeSensitiveGroups.get(canonicalName)!.push(row);
      }
    }

    console.log(
      `${Colors.Blue}📊 Found ${timeSensitiveGroups.size} time-sensitive groups${Colors.Reset}`,
    );

    for (const [groupName, groupForms] of timeSensitiveGroups.entries()) {
      console.log(
        `${Colors.Cyan}🔍 Processing group: "${groupName}" with ${groupForms.length} forms${Colors.Reset}`,
      );

      const nonOutdatedForms = groupForms.filter((form) => {
        const outdatedValue = (form["outdated (Y/N)"] as string)?.trim().toUpperCase();
        return !outdatedValue || outdatedValue === "" || outdatedValue === "N";
      });

      if (nonOutdatedForms.length === 0) {
        console.log(
          `${Colors.Gray}  No non-outdated forms in this group, skipping...${Colors.Reset}`,
        );
        continue;
      }

      const activeForm = nonOutdatedForms[nonOutdatedForms.length - 1];
      const activeFormId = this.getFormIdFromMapping(
        activeForm[CONFIGURATION.PRIMARY_TEMPLATE_ID_FIELD] as string,
      );

      if (!activeFormId) {
        console.log(
          `${Colors.Yellow}⚠️ Could not find form ID for active form: ${activeForm.template_name}${Colors.Reset}`,
        );
        continue;
      }

      mapping.push({
        formId: activeFormId,
        templateReleaseId: activeForm[CONFIGURATION.PRIMARY_TEMPLATE_ID_FIELD] as string,
        title: activeForm.template_name as string,
        timeSensitiveGroup: groupName,
        shouldBeOutdated: false,
        reason: "Last form in CSV order for time-sensitive group",
      });

      console.log(
        `${Colors.Green}  ✅ Active form: ${activeForm.template_name} (ID: ${activeFormId})${Colors.Reset}`,
      );

      for (const form of nonOutdatedForms) {
        if (form === activeForm) continue;

        const formId = this.getFormIdFromMapping(
          form[CONFIGURATION.PRIMARY_TEMPLATE_ID_FIELD] as string,
        );
        if (formId) {
          mapping.push({
            formId,
            templateReleaseId: form[CONFIGURATION.PRIMARY_TEMPLATE_ID_FIELD] as string,
            title: form.template_name as string,
            timeSensitiveGroup: groupName,
            shouldBeOutdated: true,
            reason: "Not the last form in CSV order for time-sensitive group",
          });

          console.log(
            `${Colors.Yellow}  ⚠️ Outdated form: ${form.template_name} (ID: ${formId})${Colors.Reset}`,
          );
        }
      }
    }

    console.log(
      `${Colors.Green}✅ Created outdated mapping for ${mapping.length} forms${Colors.Reset}`,
    );
    return mapping;
  }

  private async updateOutdatedFormsDirectly(
    outdatedMapping: IOutdatedMappingEntry[],
  ): Promise<void> {
    console.log(`${Colors.Blue}🔄 Updating outdated status directly...${Colors.Reset}`);
    console.log(
      `${Colors.Blue}📊 Processing ${outdatedMapping.length} forms for outdated updates${Colors.Reset}`,
    );

    let updatedCount = 0;

    for (const entry of outdatedMapping) {
      try {
        await formRepository.updateForm(entry.formId, {
          data: {
            outdated: entry.shouldBeOutdated,
          },
        });

        updatedCount++;
        const status = entry.shouldBeOutdated ? "outdated" : "latest";
        console.log(
          `${Colors.Green}✅ Updated: ${entry.title} (ID: ${entry.formId}) → ${status}${Colors.Reset}`,
        );
      } catch (error) {
        console.error(`${Colors.Red}❌ Error updating form ${entry.formId}:`, error);
      }
    }

    console.log(
      `${Colors.Green}📊 Updated ${updatedCount}/${outdatedMapping.length} forms${Colors.Reset}`,
    );
  }
}

export const formPublishService = new FormPublishService();
