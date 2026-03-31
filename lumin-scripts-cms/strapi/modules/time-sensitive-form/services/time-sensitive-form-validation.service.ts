import { Colors } from "@strapi/config/enum.ts";
import { ITimeSensitiveForm } from "../interfaces/index.ts";
import { getTimeSensitiveFormJsonPath } from "../constants/index.ts";
import { readJsonFile } from "@strapi/utils/file.ts";

export class TimeSensitiveFormValidationService {
  private cachedTimeSensitiveForms: ITimeSensitiveForm[] = [];
  private cacheLoaded = false;

  public async validateOutdatedForms(
    groupingName: string | undefined,
    isOutdated: boolean,
  ): Promise<{ isValid: boolean; errors: string[] }> {
    if (!groupingName?.trim()) {
      return { isValid: true, errors: [] };
    }

    const trimmedGroupingName = groupingName.trim();
    await this.loadCache();

    const existingGroup = this.cachedTimeSensitiveForms.find(
      (form) => form.name.trim() === trimmedGroupingName,
    );

    if (!existingGroup) {
      return { isValid: true, errors: [] };
    }

    const nonOutdatedForms = existingGroup.forms.filter((form) => !form.outdated);

    if (!isOutdated && nonOutdatedForms.length > 0) {
      const existingNonOutdatedTitles = nonOutdatedForms.map((f) => f.title).join(", ");
      return {
        isValid: false,
        errors: [
          `Time-sensitive group "${trimmedGroupingName}" already has non-outdated form(s): ${existingNonOutdatedTitles}`,
        ],
      };
    }

    return { isValid: true, errors: [] };
  }

  private async loadCache(): Promise<void> {
    if (this.cacheLoaded) {
      return;
    }

    try {
      const jsonPath = getTimeSensitiveFormJsonPath();
      this.cachedTimeSensitiveForms = await readJsonFile(jsonPath, []);
      this.cacheLoaded = true;
    } catch (error) {
      console.log(
        `${Colors.Yellow}⚠️ Could not load time-sensitive forms for validation: ${error}${Colors.Reset}`,
      );
      this.cachedTimeSensitiveForms = [];
      this.cacheLoaded = true;
    }
  }

  public clearCache(): void {
    this.cacheLoaded = false;
    this.cachedTimeSensitiveForms = [];
  }
}

export const timeSensitiveFormValidationService = new TimeSensitiveFormValidationService();
