import type { IMigrationConfig } from "../interfaces/migration-config.interface.ts";
import type { ISyncStats } from "../interfaces/migration-result.interface.ts";
import type { ICsvRow } from "../interfaces/csv-row.interface.ts";
import { readCsvFile } from "../helpers/csv-parser.helper.ts";
import { processBatches, measureTime } from "../helpers/batch-processor.helper.ts";
import {
  fetchFormByTemplateReleaseId,
  updateFormTitle,
} from "../repositories/strapi-api.repository.ts";
import { SYNC_REPORT_FILE } from "../constants/index.ts";

interface SyncAnalysis {
  matching: ICsvRow[];
  titleMismatches: Array<ICsvRow & { strapiTitle: string; strapiId: number }>;
  missing: ICsvRow[];
}

class FormSyncService {

  /**
   * Analyze forms against CSV without making changes
   */
  async analyze(config: IMigrationConfig): Promise<SyncAnalysis> {
    console.log("\n🔍 Analyzing forms against CSV...\n");

    const csvResult = await readCsvFile();

    const analysis: SyncAnalysis = {
      matching: [],
      titleMismatches: [],
      missing: [],
    };

    const results = await processBatches(
      csvResult.rows,
      async (row: ICsvRow) => {
        const strapiForm = await fetchFormByTemplateReleaseId(config, row.template_release_id);
        return { row, strapiForm };
      },
      { progressLabel: "forms" }
    );

    for (const { success, result } of results) {
      if (!success || !result) continue;

      const { row, strapiForm } = result;

      if (!strapiForm) {
        analysis.missing.push(row);
      } else {
        if (strapiForm.title === row.title) {
          analysis.matching.push(row);
        } else {
          analysis.titleMismatches.push({ ...row, strapiTitle: strapiForm.title, strapiId: strapiForm.id });
        }
      }
    }

    // Print analysis
    console.log("\n" + "=".repeat(80));
    console.log("SYNC ANALYSIS");
    console.log("=".repeat(80));
    console.log(`Total CSV rows: ${csvResult.rows.length}`);
    console.log(`Matching forms: ${analysis.matching.length}`);
    console.log(`Title mismatches: ${analysis.titleMismatches.length}`);
    console.log(`Missing forms: ${analysis.missing.length}`);

    if (analysis.titleMismatches.length > 0) {
      console.log("\n📝 TITLE MISMATCHES:");
      for (const form of analysis.titleMismatches.slice(0, 10)) {
        console.log(`  - ${form.template_release_id}:`);
        console.log(`      CSV:    "${form.title}"`);
        console.log(`      Strapi: "${form.strapiTitle}"`);
      }
      if (analysis.titleMismatches.length > 10) {
        console.log(`  ... and ${analysis.titleMismatches.length - 10} more`);
      }
    }

    if (analysis.missing.length > 0) {
      console.log("\n📝 MISSING FORMS (no templateReleaseId match):");
      for (const form of analysis.missing.slice(0, 10)) {
        console.log(`  - ${form.template_release_id}: "${form.title}"`);
      }
      if (analysis.missing.length > 10) {
        console.log(`  ... and ${analysis.missing.length - 10} more`);
      }
    }

    const reportLines = [
      "SYNC ANALYSIS REPORT",
      "=".repeat(40),
      `Total CSV rows: ${csvResult.rows.length}`,
      `Matching forms: ${analysis.matching.length}`,
      `Title mismatches: ${analysis.titleMismatches.length}`,
      `Missing forms: ${analysis.missing.length}`,
      "",
      "TITLE MISMATCHES:",
      ...analysis.titleMismatches.map(
        (f) => `${f.template_release_id}: CSV="${f.title}" vs Strapi="${f.strapiTitle}"`
      ),
      "",
      "MISSING FORMS:",
      ...analysis.missing.map((f) => `${f.template_release_id}: "${f.title}"`),
    ];

    await Deno.writeTextFile(SYNC_REPORT_FILE, reportLines.join("\n"));
    console.log(`\n📄 Report saved to: ${SYNC_REPORT_FILE}`);

    return analysis;
  }

  /**
   * Sync forms with CSV (rename mismatches, create missing)
   */
  async sync(config: IMigrationConfig, dryRun = false): Promise<ISyncStats> {
    const startTime = Date.now();

    console.log("\n" + "=".repeat(80));
    console.log(dryRun ? "SYNCING FORMS (DRY RUN)" : "SYNCING FORMS");
    console.log("=".repeat(80) + "\n");

    const analysis = await this.analyze(config);

    const stats: ISyncStats = {
      formsRenamed: 0,
      formsMissing: 0,
      errors: 0,
      durationSeconds: 0,
    };

    if (analysis.titleMismatches.length > 0) {
      console.log("\n📝 Step 1: Renaming forms with title mismatches...\n");

      const renameResults = await processBatches(
        analysis.titleMismatches,
        async (form) => {
          if (dryRun) {
            console.log(`[DRY RUN] Would rename ${form.template_release_id}: "${form.strapiTitle}" → "${form.title}"`);
            return { success: true };
          }

          const success = await updateFormTitle(config, form.strapiId, form.title);
          if (success) {
            console.log(`✓ Renamed ${form.template_release_id}: "${form.strapiTitle}" → "${form.title}"`);
          }
          return { success };
        },
        { progressLabel: "forms" }
      );

      for (const { success, result } of renameResults) {
        if (success && result?.success) {
          stats.formsRenamed++;
        } else {
          stats.errors++;
        }
      }

      console.log(`\n✅ Renamed ${stats.formsRenamed} forms`);
    }

    if (analysis.missing.length > 0) {
      console.log("\n⚠️  Missing forms (no templateReleaseId match in Strapi):");
      console.log(`   ${analysis.missing.length} forms not found`);
      console.log("   These forms need to have their templateReleaseId set in Strapi first.");
      stats.formsMissing = analysis.missing.length;
    }

    stats.durationSeconds = measureTime(startTime);

    // Print summary
    console.log("\n" + "=".repeat(80));
    console.log("SYNC COMPLETE");
    console.log("=".repeat(80));
    console.log(`⏱️  Duration: ${stats.durationSeconds}s`);
    console.log(`Forms renamed: ${stats.formsRenamed}`);
    console.log(`Forms missing: ${stats.formsMissing}`);
    console.log(`Errors: ${stats.errors}`);

    if (dryRun) {
      console.log("\n⚠️  This was a DRY RUN. No changes were made.");
    }

    return stats;
  }
}

export const formSyncService = new FormSyncService();
