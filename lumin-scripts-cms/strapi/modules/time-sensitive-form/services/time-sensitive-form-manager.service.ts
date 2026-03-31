import { Colors } from "@strapi/config/enum.ts";
import { StrapiService } from "@strapi/modules/strapi/strapi.service.ts";
import { ITimeSensitiveForm } from "../interfaces/index.ts";
import { getTimeSensitiveFormJsonPath } from "../constants/index.ts";
import { readJsonFile, writeJsonFile } from "@strapi/utils/file.ts";
import { generateSlugFromName } from "@strapi/utils/latinize.ts";
import { timeSensitiveFormValidationService } from "./time-sensitive-form-validation.service.ts";

export class TimeSensitiveFormManagerService extends StrapiService {
  private cachedTimeSensitiveForms: ITimeSensitiveForm[] = [];
  private cacheLoaded = false;
  private creatingGroups = new Map<string, Promise<number | null>>();

  public async getOrCreateTimeSensitiveFormId(
    groupingName: string | undefined,
  ): Promise<number | null> {
    if (!groupingName?.trim()) {
      return null;
    }

    const trimmedGroupingName = groupingName.trim().toLowerCase();

    await this.loadCache();

    console.log(
      `${Colors.Blue}🔍 Searching for: "${trimmedGroupingName}" in ${this.cachedTimeSensitiveForms.length} cached forms${Colors.Reset}`,
    );

    const existingForm = this.cachedTimeSensitiveForms.find(
      (form) => form.name.trim().toLowerCase() === trimmedGroupingName,
    );

    if (existingForm) {
      console.log(
        `${Colors.Green}✅ Found existing: "${trimmedGroupingName}" → ID: ${existingForm.id}${Colors.Reset}`,
      );
      return existingForm.id;
    }

    if (this.creatingGroups.has(trimmedGroupingName)) {
      console.log(
        `${Colors.Blue}⏳ Waiting for existing creation of: "${trimmedGroupingName}"${Colors.Reset}`,
      );
      return await this.creatingGroups.get(trimmedGroupingName)!;
    }

    console.log(
      `${Colors.Yellow}⚠️ Time-sensitive form not found, creating new one${Colors.Reset}`,
    );

    const creationPromise = this.createTimeSensitiveForm(groupingName);
    this.creatingGroups.set(trimmedGroupingName, creationPromise);

    try {
      const newTimeSensitiveFormId = await creationPromise;

      if (newTimeSensitiveFormId) {
        console.log(
          `${Colors.Green}🎉 Created new time-sensitive form: ID ${newTimeSensitiveFormId}${Colors.Reset}`,
        );
        await this.refreshCache();
      }

      return newTimeSensitiveFormId;
    } finally {
      this.creatingGroups.delete(trimmedGroupingName);
    }
  }

  private async loadCache(): Promise<void> {
    if (this.cacheLoaded) {
      return;
    }

    try {
      const jsonPath = getTimeSensitiveFormJsonPath();
      this.cachedTimeSensitiveForms = await readJsonFile(jsonPath, []);
      this.cacheLoaded = true;
      console.log(
        `${Colors.Blue}📚 Loaded ${this.cachedTimeSensitiveForms.length} time-sensitive forms from cache${Colors.Reset}`,
      );
    } catch (error) {
      console.log(
        `${Colors.Yellow}⚠️ Could not load time-sensitive forms cache: ${error}${Colors.Reset}`,
      );
      this.cachedTimeSensitiveForms = [];
      this.cacheLoaded = true;
    }
  }

  private async refreshCache(): Promise<void> {
    console.log("🔄 REFRESHING CACHE...");
    this.cacheLoaded = false;
    timeSensitiveFormValidationService.clearCache();
    await this.loadCache();
    console.log(
      `✅ Cache refreshed. Total forms in cache: ${this.cachedTimeSensitiveForms.length}`,
    );
  }

  private async createTimeSensitiveForm(groupingName: string): Promise<number | null> {
    try {
      const slug = generateSlugFromName(groupingName.trim());
      console.log(
        `🚀 ~ Creating time-sensitive form: ${Colors.Cyan}"${groupingName.trim()}"${Colors.Reset} → slug: ${Colors.Dim}"${slug}"${Colors.Reset}`,
      );

      const response = await fetch(`${this.getStrapiEndpoint}/api/time-sensitive-forms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.getStrapiApiToken,
        },
        body: JSON.stringify({
          data: {
            name: groupingName.trim(),
            createdAt: "",
            updatedAt: "",
            published_at: null,
            publishedAt: null,
            slug: slug,
            forms: [],
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        const errorMessage = result.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`;
        console.error(
          `${Colors.Red}❌ Failed to create time-sensitive form: ${errorMessage}${Colors.Reset}`,
        );
        return null;
      }

      const newTimeSensitiveFormId = result.data.id;

      const newTimeSensitiveForm: ITimeSensitiveForm = {
        id: newTimeSensitiveFormId,
        name: groupingName.trim(),
        slug: slug,
        forms: [],
        createdAt: result.data.attributes.createdAt,
        updatedAt: result.data.attributes.updatedAt,
        publishedAt: result.data.attributes.publishedAt,
      };

      this.cachedTimeSensitiveForms.push(newTimeSensitiveForm);

      const jsonPath = getTimeSensitiveFormJsonPath();
      await writeJsonFile(this.cachedTimeSensitiveForms, jsonPath);

      await new Promise((resolve) => setTimeout(resolve, 500));

      return newTimeSensitiveFormId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(
        `${Colors.Red}❌ Error creating time-sensitive form: ${errorMessage}${Colors.Reset}`,
      );
      return null;
    }
  }

  public async addFormToTimeSensitiveGroup(
    timeSensitiveFormId: number,
    formId: number,
  ): Promise<void> {
    try {
      console.log("=".repeat(80));
      console.log(`🔗 ADDING FORM TO TIME-SENSITIVE GROUP`);
      console.log(`   Form ID: ${formId}`);
      console.log(`   Time-Sensitive Group ID: ${timeSensitiveFormId}`);
      console.log("=".repeat(80));

      // Force refresh cache to get latest data
      await this.refreshCache();
      const timeSensitiveForm = this.cachedTimeSensitiveForms.find((f) =>
        f.id === timeSensitiveFormId
      );

      if (!timeSensitiveForm) {
        console.log("=".repeat(80));
        console.log(`${Colors.Red}❌ TIME-SENSITIVE FORM NOT FOUND IN CACHE${Colors.Reset}`);
        console.log(`   Looking for ID: ${timeSensitiveFormId}`);
        console.log("=".repeat(80));
        return;
      }

      console.log(`📋 Found time-sensitive form: "${timeSensitiveForm.name}"`);
      console.log(`   Current forms in group: ${timeSensitiveForm.forms.length}`);

      const existingFormIds = timeSensitiveForm.forms.map((f) => f.id);
      console.log(`   Existing form IDs: [${existingFormIds.join(", ")}]`);

      if (existingFormIds.includes(formId)) {
        console.log("=".repeat(80));
        console.log(`${Colors.Blue}ℹ️ FORM ALREADY EXISTS IN GROUP${Colors.Reset}`);
        console.log(
          `   Form ID ${formId} already in time-sensitive group "${timeSensitiveForm.name}"`,
        );
        console.log("=".repeat(80));
        return;
      }

      const allFormIds = [...existingFormIds, formId];
      console.log(`🔄 Updating group with form IDs: [${allFormIds.join(", ")}]`);

      const response = await fetch(
        `${this.getStrapiEndpoint}/api/time-sensitive-forms/${timeSensitiveFormId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: this.getStrapiApiToken,
          },
          body: JSON.stringify({
            data: {
              forms: allFormIds,
            },
          }),
        },
      );

      if (!response.ok) {
        const result = await response.json();
        const errorMessage = result.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`;
        console.log("=".repeat(80));
        console.error(`${Colors.Red}❌ FAILED TO UPDATE TIME-SENSITIVE GROUP${Colors.Reset}`);
        console.error(`   Error: ${errorMessage}`);
        console.error(`   Response status: ${response.status}`);
        console.log("=".repeat(80));
        return;
      }

      console.log("=".repeat(80));
      console.log(
        `${Colors.Green}✅ SUCCESSFULLY ADDED FORM TO TIME-SENSITIVE GROUP${Colors.Reset}`,
      );
      console.log(`   Form ID: ${formId}`);
      console.log(`   Time-Sensitive Group ID: ${timeSensitiveFormId}`);
      console.log(`   Total forms in group: ${allFormIds.length}`);
      console.log("=".repeat(80));
      await this.refreshCache();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(
        `${Colors.Red}❌ Error adding form to time-sensitive group: ${errorMessage}${Colors.Reset}`,
      );
    }
  }
}

export const timeSensitiveFormManagerService = new TimeSensitiveFormManagerService();
