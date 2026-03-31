import { Colors } from "@strapi/config/enum.ts";
import { ITimeSensitiveForm } from "../interfaces/index.ts";
import { getTimeSensitiveFormJsonPath } from "../constants/index.ts";
import { readJsonFile } from "@strapi/utils/file.ts";

export class TimeSensitiveFormOutdatedTestService {
  public async checkOutdatedLogic(): Promise<void> {
    console.log("🚀 ~ Checking outdated logic ⏳");

    const timeSensitiveForms = await this.loadTimeSensitiveForms();

    if (timeSensitiveForms.length === 0) {
      console.log(`${Colors.Yellow}⚠️ No time-sensitive forms found${Colors.Reset}`);
      return;
    }

    let totalGroups = 0;
    let totalFormsChecked = 0;
    let correctOutdatedCount = 0;
    let incorrectOutdatedCount = 0;

    for (const group of timeSensitiveForms) {
      if (group.forms.length === 0) {
        continue;
      }

      const allForms = group.forms;

      if (allForms.length === 0) {
        continue;
      }

      totalGroups++;
      const highestIdForm = allForms.reduce((max, form) => form.id > max.id ? form : max);

      console.log(
        `${Colors.Blue}📋 Group: "${group.name}" (${allForms.length} published forms)${Colors.Reset}`,
      );
      console.log(
        `${Colors.Cyan}   📍 Highest ID: "${highestIdForm.title}" (ID: ${highestIdForm.id})${Colors.Reset}`,
      );

      for (const form of allForms) {
        const shouldBeOutdated = form.id !== highestIdForm.id;
        const isCorrect = form.outdated === shouldBeOutdated;

        totalFormsChecked++;

        if (isCorrect) {
          correctOutdatedCount++;
          console.log(
            `${Colors.Green}   ✅ "${form.title}" (ID: ${form.id}) - outdated: ${form.outdated} (correct)${Colors.Reset}`,
          );
        } else {
          incorrectOutdatedCount++;
          console.log(
            `${Colors.Red}   ❌ "${form.title}" (ID: ${form.id}) - outdated: ${form.outdated}, should be: ${shouldBeOutdated}${Colors.Reset}`,
          );
        }
      }

      console.log("");
    }

    console.log("=".repeat(60));
    console.log(`${Colors.Green}${Colors.Bold}📊 Check Results${Colors.Reset}`);
    console.log(
      `${Colors.Blue}🏷️ Total groups processed: ${Colors.Bold}${totalGroups}${Colors.Reset}`,
    );
    console.log(
      `${Colors.Blue}📄 Total forms checked: ${Colors.Bold}${totalFormsChecked}${Colors.Reset}`,
    );
    console.log(
      `${Colors.Green}✅ Correct outdated status: ${Colors.Bold}${correctOutdatedCount}${Colors.Reset}`,
    );
    console.log(
      `${Colors.Red}❌ Incorrect outdated status: ${Colors.Bold}${incorrectOutdatedCount}${Colors.Reset}`,
    );

    if (incorrectOutdatedCount === 0) {
      console.log(
        `${Colors.Green}${Colors.Bold}🎉 All forms have correct outdated status!${Colors.Reset}`,
      );
    } else {
      console.log(
        `${Colors.Yellow}⚠️ ${incorrectOutdatedCount} forms need outdated status update${Colors.Reset}`,
      );
    }
    console.log("=".repeat(60));
  }

  private async loadTimeSensitiveForms(): Promise<ITimeSensitiveForm[]> {
    try {
      const jsonPath = getTimeSensitiveFormJsonPath();
      return await readJsonFile(jsonPath, []);
    } catch (error) {
      console.log(
        `${Colors.Yellow}⚠️ Could not load time-sensitive forms: ${error}${Colors.Reset}`,
      );
      return [];
    }
  }
}

export const timeSensitiveFormOutdatedTestService = new TimeSensitiveFormOutdatedTestService();
