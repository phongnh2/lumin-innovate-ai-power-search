import { Colors } from "@strapi/config/enum.ts";
import { CONFIGURATION } from "@strapi/config/settings.ts";
import { FormToUpdateType, IForm } from "../interfaces/index.ts";
import { FORM_JSON_PATH } from "../constants/index.ts";
import { readCSVFile, readJsonFile, writeDataToCSV } from "@strapi/utils/file.ts";
import { isProductionEnv } from "@strapi/utils/helpers.ts";
import { formRepository } from "../repositories/form.repository.ts";
import { getFormData } from "../helpers/form-data.helper.ts";

export class FormUtilityService {
  private currentTime = new Date().toISOString();

  public async findDuplicateReleaseId(): Promise<void> {
    console.log("🚀 ~ Starting duplicate release ID check ⏳");

    const formJsonPath = isProductionEnv() ? FORM_JSON_PATH.PRODUCTION : FORM_JSON_PATH.STAGING;
    const currentForms = await readJsonFile(formJsonPath, []) as IForm[];

    const releaseMap: Record<string, number[]> = {};
    const duplicates: Record<string, number[]> = {};

    currentForms.forEach((item) => {
      const releaseId = item.templateReleaseId;
      if (!releaseId) return;

      if (!releaseMap[releaseId]) {
        releaseMap[releaseId] = [item.id];
      } else {
        releaseMap[releaseId].push(item.id);
        duplicates[releaseId] = releaseMap[releaseId];
      }
    });

    console.log(`📊 ~ Total forms checked: ${currentForms.length}`);
    console.log(`🔍 ~ Unique release IDs: ${Object.keys(releaseMap).length}`);
    console.log(`⚠️ ~ Duplicate release IDs found: ${Object.keys(duplicates).length}`);

    if (Object.keys(duplicates).length === 0) {
      console.log("✅ ~ No duplicates found!");
      return;
    }

    console.log("\n📋 ~ Duplicate Details:");
    Object.entries(duplicates).forEach(([releaseId, ids]: [string, number[]]) => {
      console.log(`⚡️ Template release ID ${releaseId} appears in forms: [${ids.join(", ")}]`);
    });

    await this.generateDuplicateReport(duplicates, currentForms);
    console.log("✅ ~ Duplicate check completed");
  }

  public async checkThumbnailsSort(): Promise<void> {
    const formJsonPath = isProductionEnv() ? FORM_JSON_PATH.PRODUCTION : FORM_JSON_PATH.STAGING;
    const forms = await readJsonFile(formJsonPath, []) as IForm[];

    console.log("🚀 ~ Checking thumbnail sort order ⏳");
    let unsortedCount = 0;

    forms.forEach((form) => {
      const thumbnails = form.thumbnails;
      const sortedThumbnails = [...thumbnails].sort((a, b) => a.name.localeCompare(b.name));

      const isSorted = thumbnails.every((thumbnail, index) =>
        thumbnail.name === sortedThumbnails[index].name
      );

      if (!isSorted) {
        unsortedCount++;
        console.log(
          `${Colors.Yellow}⚠️  Release id: ${form.templateReleaseId}, ` +
            `Template id: ${form.id}, ` +
            `Slug: ${form.slug}${Colors.Reset}`,
        );
        console.log(
          `   Link: https://essential-whisper-5a506b0cf9.strapiapp.com/admin/content-manager/collectionType/api::form.form/${form.id}`,
        );
        console.log(
          `   ${Colors.Dim}Unsorted thumbnails: ${
            thumbnails.map((t) => t.name).join(", ")
          }${Colors.Reset}`,
        );
      }
    });

    console.log("\n✅ ~ Thumbnail sort check completed");
    console.log(`📊 ~ Total forms checked: ${forms.length}`);
    console.log(`${Colors.Yellow}⚠️  Unsorted forms: ${unsortedCount}${Colors.Reset}`);
  }

  public async verifyAfterImport(): Promise<void> {
    console.log("🚀 ~ Starting import verification ⏳");

    const FIELDS_TO_VERIFY = {
      "title": "title",
      "metaTitle": "metaTitle",
      "description": "description",
    } as const;

    const csvData = await readCSVFile(CONFIGURATION.TEMPLATE_IMPORT_CSV_PATH);
    const errorLogPath = `strapi/logs/verification-errors-${this.currentTime}.csv`;

    await writeDataToCSV(
      `template_release_id,strapi_id,field,expected_value,actual_value,status,description`,
      errorLogPath,
    );

    let totalChecked = 0;
    let totalErrors = 0;
    let totalMatches = 0;

    console.log(`📊 ~ Total CSV records to verify: ${csvData.length}`);
    console.log(`🔍 ~ Fields to verify: ${Object.keys(FIELDS_TO_VERIFY).join(", ")}`);

    for (const csvRecord of csvData) {
      const templateReleaseId = csvRecord["staging_strapi_id"];
      const strapiId = csvRecord["strapi_id"];

      if (!templateReleaseId || !strapiId) {
        console.log(
          `${Colors.Yellow}⚠️  Skipping record with missing IDs: releaseId=${templateReleaseId}, strapiId=${strapiId}${Colors.Reset}`,
        );
        continue;
      }

      try {
        const formFromAPI = await formRepository.getFormFromAPI(Number(strapiId));

        if (!formFromAPI) {
          console.log(`${Colors.Red}❌ Form not found in API: ID ${strapiId}${Colors.Reset}`);
          await writeDataToCSV(
            `"${templateReleaseId}","${strapiId}","api_error","","","NOT_FOUND","Form not found in Strapi API"`,
            errorLogPath,
          );
          totalErrors++;
          continue;
        }

        const { result: expectedFormData } = await getFormData({ data: csvRecord });

        for (const [csvField, apiField] of Object.entries(FIELDS_TO_VERIFY)) {
          const expectedValue = expectedFormData[csvField as keyof FormToUpdateType];
          const actualValue = formFromAPI.attributes[apiField];

          const { isMatch, description } = this.compareFieldValues(
            csvField,
            expectedValue,
            actualValue,
          );

          if (!isMatch) {
            totalErrors++;
            console.log(
              `${Colors.Red}❌ Mismatch in ${csvField} for form ${strapiId}: expected="${expectedValue}", actual="${actualValue}"${Colors.Reset}`,
            );

            await writeDataToCSV(
              `"${templateReleaseId}","${strapiId}","${csvField}","${
                String(expectedValue).replace(/"/g, '""')
              }","${String(actualValue).replace(/"/g, '""')}","MISMATCH","${description}"`,
              errorLogPath,
            );
          } else {
            totalMatches++;
          }

          totalChecked++;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(
          `${Colors.Red}❌ Error verifying form ${strapiId}:${Colors.Reset}`,
          errorMessage,
        );

        await writeDataToCSV(
          `"${templateReleaseId}","${strapiId}","verification_error","","","ERROR","${
            errorMessage.replace(/"/g, '""')
          }"`,
          errorLogPath,
        );
        totalErrors++;
      }
    }

    console.log("\n✅ ~ Import verification completed");
    console.log(`📊 ~ Total fields checked: ${totalChecked}`);
    console.log(`${Colors.Green}✅ ~ Field matches: ${totalMatches}${Colors.Reset}`);
    console.log(`${Colors.Red}❌ ~ Mismatches: ${totalErrors}${Colors.Reset}`);
    console.log(`📝 ~ Detailed error log: ${Colors.Dim}${errorLogPath}${Colors.Reset}`);
  }

  private async generateDuplicateReport(
    duplicates: Record<string, number[]>,
    currentForms: IForm[],
  ): Promise<void> {
    const reportPath = `strapi/logs/duplicate-release-ids-${this.currentTime}.csv`;
    const header = `release_id,form_ids,form_count,titles,slugs`;

    await writeDataToCSV(header, reportPath);

    for (const [releaseId, formIds] of Object.entries(duplicates)) {
      const forms = currentForms.filter((form) => formIds.includes(form.id));
      const titles = forms.map((form) => form.title || "No Title").join(" | ");
      const slugs = forms.map((form) => form.slug || "no-slug").join(" | ");

      const row = `"${releaseId}","${formIds.join(";")}","${formIds.length}","${
        titles.replace(/"/g, '""')
      }","${slugs}"`;
      await writeDataToCSV(row, reportPath);
    }

    console.log(`📝 ~ Detailed report saved to: ${reportPath}`);
  }

  private compareFieldValues(
    field: string,
    expected: unknown,
    actual: unknown,
  ): { isMatch: boolean; description: string } {
    switch (field) {
      case "title": {
        const expectedTitle = String(expected || "").trim();
        const actualTitle = String(actual || "").trim();
        const titleMatch = expectedTitle === actualTitle;
        return {
          isMatch: titleMatch,
          description: titleMatch
            ? "Title matches"
            : `Title mismatch: expected "${expectedTitle}" but got "${actualTitle}"`,
        };
      }

      case "slug": {
        const expectedSlug = String(expected || "").toLowerCase();
        const actualSlug = String(actual || "").toLowerCase();
        const slugMatch = expectedSlug === actualSlug;
        return {
          isMatch: slugMatch,
          description: slugMatch
            ? "Slug matches"
            : `Slug mismatch: expected "${expectedSlug}" but got "${actualSlug}"`,
        };
      }

      case "metaTitle": {
        const expectedMetaTitle = String(expected || "").trim();
        const actualMetaTitle = String(actual || "").trim();
        const metaTitleMatch = expectedMetaTitle === actualMetaTitle;
        return {
          isMatch: metaTitleMatch,
          description: metaTitleMatch
            ? "Meta title matches"
            : `Meta title mismatch: expected "${expectedMetaTitle}" but got "${actualMetaTitle}"`,
        };
      }

      case "templateReleaseId": {
        const expectedReleaseId = String(expected || "");
        const actualReleaseId = String(actual || "");
        const releaseIdMatch = expectedReleaseId === actualReleaseId;
        return {
          isMatch: releaseIdMatch,
          description: releaseIdMatch
            ? "Template release ID matches"
            : `Template release ID mismatch: expected "${expectedReleaseId}" but got "${actualReleaseId}"`,
        };
      }

      default: {
        const expectedStr = String(expected || "");
        const actualStr = String(actual || "");
        const match = expectedStr === actualStr;
        return {
          isMatch: match,
          description: match
            ? `${field} matches`
            : `${field} mismatch: expected "${expectedStr}" but got "${actualStr}"`,
        };
      }
    }
  }
}

export const formUtilityService = new FormUtilityService();
