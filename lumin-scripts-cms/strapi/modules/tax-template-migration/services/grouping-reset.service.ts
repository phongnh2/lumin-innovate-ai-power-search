import type { IMigrationConfig } from "../interfaces/migration-config.interface.ts";
import type { IResetStats } from "../interfaces/migration-result.interface.ts";
import { readCsvFile, extractTemplateReleaseIds, extractGroupingNames } from "../helpers/csv-parser.helper.ts";
import { processBatches, measureTime } from "../helpers/batch-processor.helper.ts";
import {
  fetchAllTimeSensitiveForms,
  fetchAllFormsWithGroupings,
  unlinkFormFromGrouping,
  deleteTimeSensitiveForm,
  normalizeGroupingName,
  getGroupingName,
} from "../repositories/strapi-api.repository.ts";

class GroupingResetService {
  async reset(config: IMigrationConfig, dryRun = false): Promise<IResetStats> {
    const startTime = Date.now();

    console.log("\n" + "=".repeat(80));
    console.log(dryRun ? "RESETTING GROUPINGS (DRY RUN)" : "RESETTING GROUPINGS");
    console.log("=".repeat(80) + "\n");

    const csvResult = await readCsvFile();
    const csvTemplateReleaseIds = new Set(extractTemplateReleaseIds(csvResult.rows));
    const csvGroupingNames = new Set(extractGroupingNames(csvResult.rows));

    console.log(`📊 CSV contains:`);
    console.log(`   - ${csvTemplateReleaseIds.size} unique template release IDs`);
    console.log(`   - ${csvGroupingNames.size} unique grouping names`);

    const stats: IResetStats = {
      formsUnlinked: 0,
      formsSkipped: 0,
      groupingsDeleted: 0,
      groupingsSkipped: 0,
      errors: 0,
      durationSeconds: 0,
    };

    console.log("\n📝 Step 1: Unlinking forms from groupings (CSV forms only)...\n");

    const allFormsWithGroupings = await fetchAllFormsWithGroupings(config);
    
    const formsToUnlink: Array<{ templateReleaseId: string; strapiId: number }> = [];
    let skippedCount = 0;
    
    for (const [templateReleaseId, data] of allFormsWithGroupings) {
      if (data.groupingId === null) continue;
      
      if (csvTemplateReleaseIds.has(templateReleaseId)) {
        formsToUnlink.push({ templateReleaseId, strapiId: data.strapiId });
      } else {
        skippedCount++;
      }
    }

    stats.formsSkipped = skippedCount;
    console.log(`   Will unlink ${formsToUnlink.length} forms, skip ${skippedCount}`);

    if (formsToUnlink.length > 0) {
      const unlinkResults = await processBatches(
        formsToUnlink,
        async (form) => {
          if (dryRun) {
            console.log(`[DRY RUN] Would unlink: ${form.templateReleaseId}`);
            return { success: true };
          }

          const success = await unlinkFormFromGrouping(config, form.strapiId);
          if (success) {
            console.log(`✓ Unlinked: ${form.templateReleaseId}`);
          }
          return { success };
        },
        { progressLabel: "forms" }
      );

      for (const { success, result } of unlinkResults) {
        if (success && result?.success) {
          stats.formsUnlinked++;
        } else {
          stats.errors++;
        }
      }
    }

    console.log(`\n✅ Unlinked ${stats.formsUnlinked} forms`);

    // Step 2: Delete time-sensitive forms (CSV groupings only, including ALL duplicates)
    console.log("\n📝 Step 2: Deleting time-sensitive forms (CSV groupings only)...\n");

    const allGroupings = await fetchAllTimeSensitiveForms(config);
    
    // Normalize CSV grouping names for comparison
    const normalizedCsvNames = new Set(
      Array.from(csvGroupingNames).map((name) => normalizeGroupingName(name))
    );
    
    // Filter groupings - match by normalized name to catch duplicates
    const groupingsToDelete = allGroupings.filter((g) => {
      const name = getGroupingName(g);
      return normalizedCsvNames.has(normalizeGroupingName(name));
    });
    const groupingsToSkip = allGroupings.filter((g) => {
      const name = getGroupingName(g);
      return !normalizedCsvNames.has(normalizeGroupingName(name));
    });

    // Check for duplicates
    const nameCount = new Map<string, number>();
    for (const g of groupingsToDelete) {
      const name = normalizeGroupingName(getGroupingName(g));
      nameCount.set(name, (nameCount.get(name) || 0) + 1);
    }
    const duplicateNames = Array.from(nameCount.entries()).filter(([_, count]) => count > 1);
    if (duplicateNames.length > 0) {
      console.log(`   ⚠️  Found ${duplicateNames.length} grouping names with duplicates:`);
      for (const [name, count] of duplicateNames.slice(0, 5)) {
        console.log(`      - "${name}" has ${count} entries`);
      }
      if (duplicateNames.length > 5) {
        console.log(`      ... and ${duplicateNames.length - 5} more`);
      }
    }

    stats.groupingsSkipped = groupingsToSkip.length;
    console.log(`   Will delete ${groupingsToDelete.length} groupings (including duplicates), skip ${groupingsToSkip.length}`);

    if (groupingsToDelete.length > 0) {
      const deleteResults = await processBatches(
        groupingsToDelete,
        async (grouping) => {
          const name = getGroupingName(grouping);

          if (dryRun) {
            console.log(`[DRY RUN] Would delete: ${name} (ID: ${grouping.id})`);
            return { success: true };
          }

          const success = await deleteTimeSensitiveForm(config, grouping.id);
          if (success) {
            console.log(`✓ Deleted: ${name} (ID: ${grouping.id})`);
          } else {
            console.error(`❌ Failed to delete: ${name} (ID: ${grouping.id})`);
          }
          return { success };
        },
        { progressLabel: "groupings" }
      );

      for (const { success, result } of deleteResults) {
        if (success && result?.success) {
          stats.groupingsDeleted++;
        } else {
          stats.errors++;
        }
      }
    }

    stats.durationSeconds = measureTime(startTime);

    // Print summary
    console.log("\n" + "=".repeat(80));
    console.log("RESET COMPLETE");
    console.log("=".repeat(80));
    console.log(`⏱️  Duration: ${stats.durationSeconds}s`);
    console.log(`Forms unlinked: ${stats.formsUnlinked} (${stats.formsSkipped} skipped)`);
    console.log(`Groupings deleted: ${stats.groupingsDeleted} (${stats.groupingsSkipped} skipped)`);
    console.log(`Errors: ${stats.errors}`);

    if (dryRun) {
      console.log("\n⚠️  This was a DRY RUN. No changes were made.");
    }

    return stats;
  }
}

export const groupingResetService = new GroupingResetService();
