import { Colors } from "@strapi/config/enum.ts";
import { DASH_LENGTH } from "@strapi/config/settings.ts";
import { ITimeSensitiveForm } from "../interfaces/index.ts";
import { getTimeSensitiveFormJsonPath } from "../constants/index.ts";
import { readJsonFile } from "@strapi/utils/file.ts";
import { formRepository } from "@strapi/modules/form/repositories/form.repository.ts";

export class TimeSensitiveFormOutdatedService {
  public async updateOutdatedFieldsByRule(): Promise<void> {
    console.log("🚀 ~ Updating outdated fields by rule ⏳");

    const timeSensitiveForms = await this.loadTimeSensitiveForms();

    if (timeSensitiveForms.length === 0) {
      console.log(`${Colors.Yellow}⚠️ No time-sensitive forms found${Colors.Reset}`);
      return;
    }

    let totalUpdated = 0;
    let totalFailed = 0;
    let totalProcessed = 0;

    for (const group of timeSensitiveForms) {
      if (group.forms.length === 0) {
        console.log(`${Colors.Blue}ℹ️ Group "${group.name}" has no forms${Colors.Reset}`);
        continue;
      }

      const allForms = group.forms;

      if (allForms.length === 0) {
        console.log(`${Colors.Blue}ℹ️ Group "${group.name}" has no published forms${Colors.Reset}`);
        continue;
      }

      const highestIdForm = allForms.reduce((max, form) => form.id > max.id ? form : max);

      console.log(
        `${Colors.Blue}🔄 Processing group "${group.name}" (${allForms.length} published forms)${Colors.Reset}`,
      );
      console.log(
        `${Colors.Cyan}   📍 Highest ID form: "${highestIdForm.title}" (ID: ${highestIdForm.id})${Colors.Reset}`,
      );

      for (const form of allForms) {
        const shouldBeOutdated = form.id !== highestIdForm.id;

        if (form.outdated === shouldBeOutdated) {
          console.log(
            `${Colors.Dim}   ⏭️ Form "${form.title}" (ID: ${form.id}) already correct (outdated: ${form.outdated})${Colors.Reset}`,
          );
          continue;
        }

        try {
          console.log(
            `${Colors.Blue}   🔄 Updating: "${form.title}" (ID: ${form.id}) -> outdated: ${shouldBeOutdated}${Colors.Reset}`,
          );

          const result = await formRepository.updateForm(form.id, {
            data: {
              outdated: shouldBeOutdated,
            },
          });

          if (result && !result.error) {
            totalUpdated++;
            console.log(
              `${Colors.Green}   ✅ Updated: "${form.title}" -> outdated: ${shouldBeOutdated}${Colors.Reset}`,
            );
          } else {
            totalFailed++;
            const errorMessage = result?.error?.message || "Unknown error";
            console.error(
              `${Colors.Red}   ❌ Failed to update "${form.title}": ${errorMessage}${Colors.Reset}`,
            );
          }
        } catch (error) {
          totalFailed++;
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(
            `${Colors.Red}   ❌ Error updating "${form.title}": ${errorMessage}${Colors.Reset}`,
          );
        }

        totalProcessed++;
      }
    }

    console.log("\n" + "=".repeat(DASH_LENGTH));
    console.log(`${Colors.Green}${Colors.Bold}✅ Outdated field update completed${Colors.Reset}`);
    console.log(`${Colors.Green}📊 Updated: ${Colors.Bold}${totalUpdated}${Colors.Reset}`);
    console.log(`${Colors.Red}❌ Failed: ${Colors.Bold}${totalFailed}${Colors.Reset}`);
    console.log(`${Colors.Blue}🔢 Total processed: ${Colors.Bold}${totalProcessed}${Colors.Reset}`);
    console.log(
      `${Colors.Blue}💡 Tip: Run exportTimeSensitiveFormDataAsJSON to refresh cache${Colors.Reset}`,
    );
    console.log("=".repeat(DASH_LENGTH));
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

export const timeSensitiveFormOutdatedService = new TimeSensitiveFormOutdatedService();
