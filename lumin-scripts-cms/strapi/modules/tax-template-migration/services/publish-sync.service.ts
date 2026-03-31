import type { IMigrationConfig } from "../interfaces/migration-config.interface.ts";
import { readCsvFile } from "../helpers/csv-parser.helper.ts";
import { processBatches, measureTime } from "../helpers/batch-processor.helper.ts";
import {
  fetchAllFormsWithPublishState,
  publishForm,
  unpublishForm,
  type IFormPublishState,
  type IPublishResult,
} from "../repositories/strapi-api.repository.ts";
import { Colors } from "@strapi/config/enum.ts";
import { DASH_LENGTH } from "@strapi/config/settings.ts";

interface IPublishMismatch {
  templateReleaseId: string;
  strapiId: number;
  title: string;
  csvPublished: boolean;
  strapiPublished: boolean;
}

interface IPublishSyncStats {
  totalChecked: number;
  matching: number;
  needsPublish: number;
  needsUnpublish: number;
  published: number;
  unpublished: number;
  errors: number;
  validationErrors: number;
  notFound: number;
  durationSeconds: number;
}

interface IValidationFailure {
  templateReleaseId: string;
  title: string;
  error: string;
}

class PublishSyncService {
  async analyze(config: IMigrationConfig): Promise<IPublishMismatch[]> {
    console.log(`${Colors.Blue}🚀 ~ Analyzing publish state of forms ⏳${Colors.Reset}`);

    const csvResult = await readCsvFile();
    const formStates = await fetchAllFormsWithPublishState(config);

    const mismatches: IPublishMismatch[] = [];
    let matching = 0;
    let notFound = 0;

    for (const row of csvResult.rows) {
      const csvPublished = row.published === "Y";
      const strapiForm = formStates.get(row.template_release_id);

      if (!strapiForm) {
        notFound++;
        continue;
      }

      if (strapiForm.isPublished !== csvPublished) {
        mismatches.push({
          templateReleaseId: row.template_release_id,
          strapiId: strapiForm.strapiId,
          title: strapiForm.title,
          csvPublished,
          strapiPublished: strapiForm.isPublished,
        });
      } else {
        matching++;
      }
    }

    const needsPublish = mismatches.filter((m) => m.csvPublished).length;
    const needsUnpublish = mismatches.filter((m) => !m.csvPublished).length;

    console.log("\n" + "=".repeat(DASH_LENGTH));
    console.log(`${Colors.Green}${Colors.Bold}✅ Publish state analysis completed${Colors.Reset}`);
    console.log(`📊 Total CSV forms: ${Colors.Bold}${csvResult.rows.length}${Colors.Reset}`);
    console.log(`✅ Matching: ${Colors.Bold}${matching}${Colors.Reset}`);
    console.log(`📤 Needs publish: ${Colors.Bold}${needsPublish}${Colors.Reset}`);
    console.log(`📥 Needs unpublish: ${Colors.Bold}${needsUnpublish}${Colors.Reset}`);
    console.log(`❓ Not found in Strapi: ${Colors.Bold}${notFound}${Colors.Reset}`);
    console.log("=".repeat(DASH_LENGTH));

    if (mismatches.length > 0) {
      console.log("\n📋 MISMATCHES:");

      const toPublish = mismatches.filter((m) => m.csvPublished);
      const toUnpublish = mismatches.filter((m) => !m.csvPublished);

      if (toPublish.length > 0) {
        console.log(`\n  📤 Need to PUBLISH (${toPublish.length}):`);
        toPublish.slice(0, 10).forEach((m) => {
          console.log(`     - ${m.templateReleaseId}: "${m.title}"`);
        });
        if (toPublish.length > 10) console.log(`     ... and ${toPublish.length - 10} more`);
      }

      if (toUnpublish.length > 0) {
        console.log(`\n  📥 Need to UNPUBLISH (${toUnpublish.length}):`);
        toUnpublish.slice(0, 10).forEach((m) => {
          console.log(`     - ${m.templateReleaseId}: "${m.title}"`);
        });
        if (toUnpublish.length > 10) console.log(`     ... and ${toUnpublish.length - 10} more`);
      }
    }

    return mismatches;
  }

  async sync(config: IMigrationConfig, dryRun = false): Promise<IPublishSyncStats> {
    const startTime = Date.now();

    console.log("\n" + "=".repeat(80));
    console.log(dryRun ? "SYNCING PUBLISH STATE (DRY RUN)" : "SYNCING PUBLISH STATE");
    console.log("=".repeat(80) + "\n");

    const mismatches = await this.analyze(config);

    const stats: IPublishSyncStats = {
      totalChecked: mismatches.length,
      matching: 0,
      needsPublish: mismatches.filter((m) => m.csvPublished).length,
      needsUnpublish: mismatches.filter((m) => !m.csvPublished).length,
      published: 0,
      unpublished: 0,
      errors: 0,
      validationErrors: 0,
      notFound: 0,
      durationSeconds: 0,
    };

    const validationFailures: IValidationFailure[] = [];

    if (mismatches.length === 0) {
      console.log("\n✅ All forms already have correct publish state. Nothing to do.");
      stats.durationSeconds = measureTime(startTime);
      return stats;
    }

    console.log(`\n📝 Processing ${mismatches.length} forms with mismatched publish state...\n`);

    const results = await processBatches(
      mismatches,
      async (mismatch) => {
        if (dryRun) {
          const action = mismatch.csvPublished ? "PUBLISH" : "UNPUBLISH";
          console.log(`[DRY RUN] Would ${action}: "${mismatch.title}" (${mismatch.templateReleaseId})`);
          return { success: true, action: mismatch.csvPublished ? "publish" : "unpublish", mismatch };
        }

        if (mismatch.csvPublished) {
          const result = await publishForm(config, mismatch.strapiId);
          if (result.success) {
            console.log(`✓ Published: "${mismatch.title}" (${mismatch.templateReleaseId})`);
          } else if (result.validationError) {
            console.log(`⚠️  Cannot publish "${mismatch.title}": ${result.error}`);
          }
          return { ...result, action: "publish", mismatch };
        } else {
          const success = await unpublishForm(config, mismatch.strapiId);
          if (success) {
            console.log(`✓ Unpublished: "${mismatch.title}" (${mismatch.templateReleaseId})`);
          }
          return { success, action: "unpublish", mismatch };
        }
      },
      { progressLabel: "forms" }
    );

    for (const { success, result } of results) {
      if (success && result?.success) {
        if (result.action === "publish") {
          stats.published++;
        } else {
          stats.unpublished++;
        }
      } else if (result?.validationError) {
        stats.validationErrors++;
        validationFailures.push({
          templateReleaseId: result.mismatch.templateReleaseId,
          title: result.mismatch.title,
          error: result.error || "Unknown validation error",
        });
      } else {
        stats.errors++;
      }
    }

    stats.durationSeconds = measureTime(startTime);

    console.log("\n" + "=".repeat(80));
    console.log("PUBLISH SYNC COMPLETE");
    console.log("=".repeat(80));
    console.log(`⏱️  Duration: ${stats.durationSeconds}s`);
    console.log(`📤 Published: ${stats.published}`);
    console.log(`📥 Unpublished: ${stats.unpublished}`);
    console.log(`⚠️  Validation errors: ${stats.validationErrors}`);
    console.log(`❌ Other errors: ${stats.errors}`);

    if (validationFailures.length > 0) {
      console.log(`\n⚠️  FORMS THAT COULDN'T BE PUBLISHED (missing category, etc.):`);
      validationFailures.slice(0, 20).forEach((f) => {
        console.log(`   - ${f.templateReleaseId}: "${f.title}" → ${f.error}`);
      });
      if (validationFailures.length > 20) {
        console.log(`   ... and ${validationFailures.length - 20} more`);
      }
      console.log(`\n   💡 These forms need a category assigned in Strapi before they can be published.`);
    }

    if (dryRun) {
      console.log("\n⚠️  This was a DRY RUN. No changes were made.");
    }

    return stats;
  }
}

export const publishSyncService = new PublishSyncService();
