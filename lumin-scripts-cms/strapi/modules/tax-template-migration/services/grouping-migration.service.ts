import type { IMigrationConfig, IMigrationOptions, MappingBatch } from "../interfaces/migration-config.interface.ts";
import type { IMigrationResult, IMigrationStats, IValidationResult } from "../interfaces/migration-result.interface.ts";
import type { ITimeSensitiveGrouping, IStrapiTimeSensitiveForm } from "../interfaces/grouping.interface.ts";
import { readCsvFile } from "../helpers/csv-parser.helper.ts";
import { processData, generateReport } from "../helpers/data-processor.helper.ts";
import { processBatches, measureTime } from "../helpers/batch-processor.helper.ts";
import {
  fetchAllTimeSensitiveForms,
  createTimeSensitiveForm,
  updateFormGrouping,
  fetchFormByTemplateReleaseId,
  fetchAllFormsWithGroupings,
  normalizeGroupingName,
  getGroupingName,
} from "../repositories/strapi-api.repository.ts";
import { cacheService } from "./cache.service.ts";
import { MIGRATION_REPORT_FILE, MAPPING_FIRST_BATCH_SIZE } from "../constants/index.ts";

class GroupingMigrationService {
  private existingGroupings: IStrapiTimeSensitiveForm[] = [];
  private formGroupingCache: Map<string, { strapiId: number; groupingId: number | null; groupingName: string | null; title: string }> = new Map();

  async generateReport(): Promise<void> {
    console.log("\n🚀 Generating Tax Template Migration Report...\n");

    const csvResult = await readCsvFile();
    const migrationData = processData(csvResult.rows);
    const report = generateReport(migrationData);

    await Deno.writeTextFile(MIGRATION_REPORT_FILE, report);

    console.log("\n" + report);
    console.log(`\n📄 Report saved to: ${MIGRATION_REPORT_FILE}`);
  }

  async validate(config: IMigrationConfig): Promise<IValidationResult> {
    const startTime = Date.now();

    console.log("\n🔍 Validating Tax Template Forms Against Strapi...\n");

    const csvResult = await readCsvFile();
    const migrationData = processData(csvResult.rows);

    const formsToValidate: Array<{ template_release_id: string; title: string; grouping: string }> = [];
    for (const [name, grouping] of migrationData.timeSensitiveGroupings) {
      for (const form of grouping.forms) {
        formsToValidate.push({
          template_release_id: form.template_release_id,
          title: form.title,
          grouping: name,
        });
      }
    }

    console.log(`📊 Validating ${formsToValidate.length} forms...\n`);

    const results = await processBatches(
      formsToValidate,
      async (form) => {
        const strapiForm = await fetchFormByTemplateReleaseId(config, form.template_release_id);
        return { form, strapiForm };
      },
      { progressLabel: "forms" }
    );

    const missingForms: IValidationResult["missingForms"] = [];
    const titleMismatches: IValidationResult["titleMismatches"] = [];

    for (const { success, result } of results) {
      if (!success || !result) continue;

      const { form, strapiForm } = result;

      if (!strapiForm) {
        missingForms.push({
          template_release_id: form.template_release_id,
          csv_title: form.title,
          grouping: form.grouping,
        });
      } else {
        if (strapiForm.title && strapiForm.title !== form.title) {
          titleMismatches.push({
            template_release_id: form.template_release_id,
            csv_title: form.title,
            strapi_title: strapiForm.title,
            grouping: form.grouping,
          });
        }
      }
    }

    const validationResult: IValidationResult = {
      missingForms,
      titleMismatches,
      totalChecked: formsToValidate.length,
      durationSeconds: measureTime(startTime),
    };

    // Print results
    console.log("\n" + "=".repeat(80));
    console.log("VALIDATION RESULTS");
    console.log("=".repeat(80));
    console.log(`⏱️  Duration: ${validationResult.durationSeconds}s`);
    console.log(`Forms checked: ${validationResult.totalChecked}`);
    console.log(`Missing forms: ${missingForms.length}`);
    console.log(`Title mismatches: ${titleMismatches.length}`);

    if (missingForms.length > 0) {
      console.log("\n⚠️  MISSING FORMS:");
      for (const form of missingForms.slice(0, 10)) {
        console.log(`  - ${form.template_release_id}: ${form.csv_title}`);
      }
      if (missingForms.length > 10) {
        console.log(`  ... and ${missingForms.length - 10} more`);
      }
    }

    if (titleMismatches.length > 0) {
      console.log("\n⚠️  TITLE MISMATCHES:");
      for (const form of titleMismatches.slice(0, 10)) {
        console.log(`  - ${form.template_release_id}: CSV="${form.csv_title}" vs Strapi="${form.strapi_title}"`);
      }
      if (titleMismatches.length > 10) {
        console.log(`  ... and ${titleMismatches.length - 10} more`);
      }
    }

    if (missingForms.length === 0 && titleMismatches.length === 0) {
      console.log("\n✅ All forms validated successfully!");
    }

    return validationResult;
  }

  async migrate(
    config: IMigrationConfig,
    options: IMigrationOptions = { dryRun: false, silent: false, useCache: false }
  ): Promise<IMigrationStats> {
    const startTime = Date.now();

    console.log("\n" + "=".repeat(80));
    console.log(options.dryRun ? "EXECUTING MIGRATION (DRY RUN)" : "EXECUTING MIGRATION");
    if (options.useCache && options.mappingBatch !== "remaining") {
      console.log("(Using cached forms - only API calls for creates/updates)");
    }
    if (options.mappingBatch === "remaining") {
      console.log("(Remaining batch: fresh form data so already-updated forms are skipped)");
    }
    console.log("=".repeat(80) + "\n");

    const csvResult = await readCsvFile();
    const migrationData = processData(csvResult.rows);

    if (!options.dryRun) {
      // Always fetch time-sensitive forms from API (few entries, fast, ensures we don't create duplicates)
      this.existingGroupings = await fetchAllTimeSensitiveForms(config);

      // For "remaining" batch, always fetch fresh form data so we see forms already updated by first batch
      const useCacheForForms = options.useCache && options.mappingBatch !== "remaining";

      if (useCacheForForms) {
        this.formGroupingCache = await cacheService.loadFormsCache();
        console.log(`✅ Using cached forms: ${this.formGroupingCache.size} forms`);
        console.log(`📡 Fetched ${this.existingGroupings.length} time-sensitive forms from API (always fresh)\n`);
      } else {
        if (options.mappingBatch === "remaining") {
          console.log("📡 Fetching fresh form data (remaining batch: see already-updated forms)...\n");
        } else {
          console.log("📡 Fetching all data from Strapi API (use --cache for faster runs)...\n");
        }
        this.formGroupingCache = await fetchAllFormsWithGroupings(config);
      }
    }

    const stats: IMigrationStats = {
      groupingsCreated: 0,
      groupingsSkipped: 0,
      formsUpdated: 0,
      formsSkipped: 0,
      errors: 0,
      durationSeconds: 0,
    };

    const groupingIdMap = new Map<string, number>();

    // Step 1: Create Time-sensitive Form entries
    console.log("\n📝 Step 1: Creating Time-sensitive Form entries...\n");

    const groupingsArray = Array.from(migrationData.timeSensitiveGroupings.entries());

    const step1Results = await processBatches(
      groupingsArray,
      async ([name, grouping]: [string, ITimeSensitiveGrouping]) => {
        // Check if already exists (normalize names for comparison)
        const normalizedName = normalizeGroupingName(name);
        const existing = this.existingGroupings.find(
          (g) => normalizeGroupingName(getGroupingName(g)) === normalizedName
        );

        if (existing) {
          console.log(`⏭️  Skipping (already exists): ${name} (ID: ${existing.id})`);
          return { name, id: existing.id, skipped: true };
        }

        if (options.dryRun) {
          console.log(`[DRY RUN] Would create: ${name}`);
          return { name, id: -1, skipped: false };
        }

        const result = await createTimeSensitiveForm(config, grouping);
        if (result) {
          console.log(`✓ Created: ${name} (ID: ${result.id})`);
          // Add to cache with attributes format to match Strapi response format
          this.existingGroupings.push({ 
            id: result.id, 
            attributes: { name } 
          } as IStrapiTimeSensitiveForm);
          return { name, id: result.id, skipped: false };
        }

        return { name, id: -1, error: true };
      },
      { progressLabel: "groupings" }
    );

    const failedGroupingNames: string[] = [];

    for (const { success, result, item } of step1Results) {
      if (success && result) {
        if (result.id > 0) {
          groupingIdMap.set(result.name, result.id);
        }
        if (result.skipped) {
          stats.groupingsSkipped++;
          groupingIdMap.set(result.name, result.id);
        } else if (!result.error) {
          stats.groupingsCreated++;
        } else {
          stats.errors++;
          failedGroupingNames.push(result.name);
        }
      } else {
        stats.errors++;
        const name = Array.isArray(item) && typeof item[0] === "string" ? item[0] : (result && typeof result === "object" && "name" in result ? (result as { name: string }).name : null);
        if (name) failedGroupingNames.push(name);
      }
    }

    console.log(`\n✅ Groupings: ${stats.groupingsCreated} created, ${stats.groupingsSkipped} skipped`);

    if (failedGroupingNames.length > 0) {
      console.log(`\n⚠️  Failed to create ${failedGroupingNames.length} grouping(s) (e.g. 503/server error):`);
      failedGroupingNames.slice(0, 15).forEach((name) => console.log(`   - ${name}`));
      if (failedGroupingNames.length > 15) {
        console.log(`   ... and ${failedGroupingNames.length - 15} more`);
      }
      console.log(`   → Re-run the migration; existing groupings will be skipped and failed ones retried.`);
    }

    // Step 2: Update forms with grouping links
    console.log("\n📝 Step 2: Updating forms with grouping links...\n");

    interface FormUpdate {
      templateReleaseId: string;
      formTitle: string;
      groupingId: number;
      publishedDate: string;
      outdated: boolean;
    }

    const formUpdates: FormUpdate[] = [];

    for (const [name, grouping] of migrationData.timeSensitiveGroupings) {
      const groupingId = groupingIdMap.get(name);
      if (!groupingId || groupingId === -1) {
        if (!options.dryRun) {
          console.error(`❌ No grouping ID for: ${name}`);
          stats.errors += grouping.forms.length;
        }
        continue;
      }

      for (const form of grouping.forms) {
        formUpdates.push({
          templateReleaseId: form.template_release_id,
          formTitle: form.title,
          groupingId,
          publishedDate: form.published_date,
          outdated: form.outdated === "Y",
        });
      }
    }

    const batchMode = options.mappingBatch ?? "all";
    const formsToProcess =
      batchMode === "first10"
        ? formUpdates.slice(0, MAPPING_FIRST_BATCH_SIZE)
        : batchMode === "remaining"
        ? formUpdates.slice(MAPPING_FIRST_BATCH_SIZE)
        : formUpdates;

    if (batchMode !== "all") {
      console.log(
        `📦 Mapping batch: ${batchMode === "first10" ? `first ${MAPPING_FIRST_BATCH_SIZE}` : "remaining"} (${formsToProcess.length} forms)`
      );
    }
    console.log(`📊 Processing ${formsToProcess.length} forms (will skip already linked)...`);

    const step2Results = await processBatches(
      formsToProcess,
      async (update: FormUpdate) => {
        if (options.dryRun) {
          console.log(`[DRY RUN] Would update: ${update.formTitle} (${update.templateReleaseId})`);
          return { success: true, skipped: false };
        }

        const cached = this.formGroupingCache.get(update.templateReleaseId);
        
        if (!cached) {
          console.error(`❌ Form not found: ${update.formTitle} (${update.templateReleaseId})`);
          return { success: false, skipped: false };
        }

        if (cached.groupingId === update.groupingId) {
          console.log(`⏭️  Skipping (already linked): ${update.formTitle} (${update.templateReleaseId})`);
          return { success: true, skipped: true };
        }

        const success = await updateFormGrouping(
          config,
          cached.strapiId,
          update.groupingId,
          update.publishedDate || null,
          update.outdated
        );

        if (success) {
          console.log(`✓ Updated: ${update.formTitle} (${update.templateReleaseId})`);
          this.formGroupingCache.set(update.templateReleaseId, { 
            strapiId: cached.strapiId, 
            groupingId: update.groupingId,
            groupingName: cached.groupingName,
            title: cached.title,
          });
        }

        return { success, skipped: false };
      },
      { progressLabel: "forms" }
    );

    // Process step 2 results
    for (const { success, result } of step2Results) {
      if (success && result) {
        if (result.skipped) {
          stats.formsSkipped++;
        } else if (result.success) {
          stats.formsUpdated++;
        }
      } else {
        stats.errors++;
      }
    }

    stats.durationSeconds = measureTime(startTime);

    // Print summary
    console.log("\n" + "=".repeat(80));
    console.log("MIGRATION COMPLETE");
    console.log("=".repeat(80));
    console.log(`⏱️  Duration: ${stats.durationSeconds}s`);
    console.log(`Groupings: ${stats.groupingsCreated} created, ${stats.groupingsSkipped} already existed`);
    console.log(`Forms: ${stats.formsUpdated} updated, ${stats.formsSkipped} already linked (skipped)`);
    console.log(`Errors: ${stats.errors}`);

    if (migrationData.formsWithMismatchedGrouping.length > 0) {
      console.log(`\n⚠️  ${migrationData.formsWithMismatchedGrouping.length} forms skipped (mismatched grouping)`);
    }

    if (options.dryRun) {
      console.log("\n⚠️  This was a DRY RUN. No changes were made.");
    }

    return stats;
  }
}

export const groupingMigrationService = new GroupingMigrationService();
