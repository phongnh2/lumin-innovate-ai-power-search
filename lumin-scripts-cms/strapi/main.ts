import { categoryController } from "@strapi/modules/category/category.controller.ts";
import { formController } from "@strapi/modules/form/form.controller.ts";
import { uploadController } from "@strapi/modules/upload/upload.controller.ts";
import { mediaController } from "@strapi/modules/media/media.controller.ts";
import { taxTemplateMigrationController } from "@strapi/modules/tax-template-migration/tax-template-migration.controller.ts";
import { timeSensitiveFormController } from "@strapi/modules/time-sensitive-form/time-sensitive-form.controller.ts";

import { load } from "@std/dotenv";
import { logMemoryUsage } from "@strapi/utils/helpers.ts";

export const functions = {
  // EXPORT PRODUCTION DATA TASK
  exportProductionDataAsJSON: async () => {
    try {
      console.log("🚀 Starting Export Production Data Pipeline...\n");

      console.log("  📂 STAGE 1: Exporting category data as JSON");
      console.log("     └─ 🔄 Processing categories...");
      await categoryController.exportCategoryDataAsJSON();
      console.log("     └─ ✅ Categories exported successfully\n");

      console.log("  ⏰ STAGE 2: Exporting time-sensitive form data as JSON");
      console.log("     └─ 🔄 Processing time-sensitive forms...");
      await timeSensitiveFormController.exportTimeSensitiveFormDataAsJSON();
      console.log("     └─ ✅ Time-sensitive forms exported successfully\n");

      console.log("  📋 STAGE 3: Exporting form data as JSON");
      console.log("     └─ 🔄 Processing forms...");
      await formController.exportFromDataAsJSON();
      console.log("     └─ ✅ Forms exported successfully\n");

      console.log("🎉 " + "=".repeat(60));
      console.log("🎯 Export Production Data Pipeline completed successfully!");
      console.log("=".repeat(64));
    } catch (error) {
      console.error("💥 Export Production Data Pipeline failed:", error);
      throw error;
    }
  },

  // PREVIEW DATA TASK
  previewData: async () => {
    try {
      console.log("🔍 Starting Data Preview Pipeline...\n");

      console.log("  📄 STAGE 1: Previewing templates from CSV");
      console.log("     └─ 🔄 Analyzing template data...");
      await formController.previewTemplatesCSV();
      console.log("     └─ ✅ Template preview completed\n");

      console.log("  ⏰ STAGE 2: Checking time-sensitive forms");
      console.log("     └─ 🔄 Scanning for new time-sensitive forms...");
      await timeSensitiveFormController.checkNewTimeSensitiveFormsFromCSV();
      console.log("     └─ ✅ Time-sensitive forms check completed\n");

      console.log("  🧠 STAGE 3: Validating outdated logic");
      console.log("     └─ 🔄 Running outdated logic validation...");
      await timeSensitiveFormController.checkOutdatedLogic();
      console.log("     └─ ✅ Outdated logic validation completed\n");

      console.log("🎉 " + "=".repeat(60));
      console.log("👀 Data Preview Pipeline completed successfully!");
      console.log("=".repeat(64));
    } catch (error) {
      console.error("💥 Data Preview Pipeline failed:", error);
      throw error;
    }
  },

  // DOWNLOAD & MEDIA GENERATION TASK
  downloadPDF: async () => {
    try {
      console.log("⬇️ Starting Download & Media Generation Pipeline...\n");

      console.log("  📄 STAGE 1: Downloading PDF files");
      console.log("     └─ 🔄 Fetching PDFs from CSV sources...");
      await formController.downloadPDFFromCSV();
      console.log("     └─ ✅ PDF downloads completed\n");

      console.log("  🖼️ STAGE 2: Generating thumbnail images");
      console.log("     └─ 🔄 Creating thumbnails from PDFs...");
      await mediaController.generateThumbnailsFromFile();
      console.log("     └─ ✅ Thumbnail generation completed\n");

      console.log("🎉 " + "=".repeat(60));
      console.log("📦 Download & Media Generation Pipeline completed successfully!");
      console.log("=".repeat(64));
    } catch (error) {
      console.error("💥 Download & Media Generation Pipeline failed:", error);
      throw error;
    }
  },

  // IMPORT & UPLOAD TASK
  importForm: async () => {
    try {
      console.log("📤 Starting Import & Upload Pipeline...\n");

      console.log("  📋 STAGE 1: Uploading form data");
      console.log("     └─ 🔄 Processing forms from CSV...");
      await formController.uploadFormFromCSV();
      console.log("     └─ ✅ Forms uploaded successfully\n");

      console.log("  🖼️ STAGE 2: Uploading thumbnail images");
      console.log("     └─ 🔄 Uploading generated thumbnails...");
      await uploadController.uploadThumbnails();
      console.log("     └─ ✅ Thumbnails uploaded successfully\n");

      console.log("  📄 STAGE 3: Uploading PDF files");
      console.log("     └─ 🔄 Uploading downloaded PDFs...");
      await uploadController.uploadPDFs();
      console.log("     └─ ✅ PDFs uploaded successfully\n");

      console.log("🎉 " + "=".repeat(60));
      console.log("🚀 Import & Upload Pipeline completed successfully!");
      console.log("=".repeat(64));
    } catch (error) {
      console.error("💥 Import & Upload Pipeline failed:", error);
      throw error;
    }
  },

  // 🔄 UPDATE OUTDATED FIELDS TASK
  updateOutdated: async () => {
    try {
      console.log("🔄 Starting Outdated Fields Update Pipeline...\n");

      console.log("  📝 STAGE 1: Publishing forms and updating outdated status");
      console.log("     └─ 🔄 Processing form publication and outdated field updates...");
      await formController.publishFormsAndUpdateOutdated();
      console.log("     └─ ✅ Outdated fields updated successfully\n");

      console.log("🎉 " + "=".repeat(60));
      console.log("🎯 Outdated Fields Update Pipeline completed successfully!");
      console.log("=".repeat(64));
    } catch (error) {
      console.error("💥 Outdated Fields Update Pipeline failed:", error);
      throw error;
    }
  },

  // 🔄 ALTERNATIVE UPDATE OUTDATED FIELDS TASK
  updateOutdatedAlternative: async () => {
    try {
      console.log("🔄 Starting Alternative Outdated Fields Update Pipeline...\n");

      console.log("  🦊 STAGE 1: Exporting time-sensitive form data");
      console.log("     └─ 🔄 Generating fresh time-sensitive form data...");
      await timeSensitiveFormController.exportTimeSensitiveFormDataAsJSON();
      console.log("     └─ ✅ Time-sensitive form data exported\n");

      console.log("  👁️ STAGE 2: Previewing templates");
      console.log("     └─ 🔄 Analyzing current template state...");
      await formController.previewTemplatesCSV();
      console.log("     └─ ✅ Template preview completed\n");

      console.log("  🧠 STAGE 3: Validating outdated logic");
      console.log("     └─ 🔄 Running comprehensive outdated logic check...");
      await timeSensitiveFormController.checkOutdatedLogic();
      console.log("     └─ ✅ Outdated logic validation completed\n");

      console.log("  ⚡ STAGE 4: Applying outdated field updates");
      console.log("     └─ 🔄 Updating outdated fields based on rules...");
      await timeSensitiveFormController.updateOutdatedFieldsByRule();
      console.log("     └─ ✅ Outdated field updates applied\n");

      console.log("🎉 " + "=".repeat(60));
      console.log("🎯 Alternative Outdated Fields Update Pipeline completed successfully!");
      console.log("=".repeat(64));
    } catch (error) {
      console.error("💥 Alternative Outdated Fields Update Pipeline failed:", error);
      throw error;
    }
  },

  initCategories: () => categoryController.initializeCategories(),

  exportCategoryDataAsJSON: () => categoryController.exportCategoryDataAsJSON(),
  exportCategoryDataAsCSV: () => categoryController.exportCategoryDataAsCSV(),

  exportSlugFormDataAsJSON: () => formController.exportSlugFormDataAsJSON(),
  exportFormDataAsJSON: () => formController.exportFromDataAsJSON(),
  exportFormDataAsCSV: () => formController.exportFromDataAsCSV(),

  exportTimeSensitiveFormDataAsJSON: () =>
    timeSensitiveFormController.exportTimeSensitiveFormDataAsJSON(),
  exportTimeSensitiveFormDataAsCSV: () =>
    timeSensitiveFormController.exportTimeSensitiveFormDataAsCSV(),

  checkTimeSensitiveForms: () => timeSensitiveFormController.checkNewTimeSensitiveFormsFromCSV(),
  createTimeSensitiveFormsFromCSV: () =>
    timeSensitiveFormController.createTimeSensitiveFormsFromCSV(),
  updateOutdatedFieldsByRule: () => timeSensitiveFormController.updateOutdatedFieldsByRule(),
  checkOutdatedLogic: () => timeSensitiveFormController.checkOutdatedLogic(),

  previewTemplatesCSV: () => formController.previewTemplatesCSV(),

  downloadPDFFromCSV: () => formController.downloadPDFFromCSV(),
  downloadLuminFileFromCSV: () => formController.downloadLuminFileFromCSV(),

  genThumbnailImages: () => mediaController.generateThumbnailsFromFile(),

  uploadFormFromCSV: () => formController.uploadFormFromCSV(),
  uploadThumbnails: () => uploadController.uploadThumbnails(),
  uploadPDFs: () => uploadController.uploadPDFs(),
  uploadLuminFiles: () => uploadController.uploadLuminFiles(),
  uploadThumbnailsFromJSON: () => uploadController.uploadThumbnailsFromJSON(),
  uploadPDFsFromJSON: () => uploadController.uploadPDFsFromJSON(),
  reuploadFailedThumbnails: () => uploadController.retryFailedThumbnailUploads(),
  reuploadFailedPDFs: () => uploadController.retryFailedPDFUploads(),

  updateFormDataFromCSV: () => formController.updateFormDataFromCSV(),
  updateFormDataFromJSON: () => formController.updateFormDataFromJSON(),
  updateCustomForm: () => formController.updateCustomForm(),
  updateMediaFileFromJSON: () => uploadController.updateMediaFileMetadata(),

  verifyAfterImport: () => formController.verifyAfterImport(),
  publishFormsAndUpdateOutdated: () => formController.publishFormsAndUpdateOutdated(),

  findDuplicateReleaseId: () => formController.findDuplicateReleaseId(),
  checkThumbnailsSort: () => formController.checkThumbnailsSort(),

  migrateCsvFilesWithJsonMapping: () =>
    formController.migrateCsvFilesWithJsonMapping([
      "strapi/data/csv/LT-721.csv",
      "strapi/data/csv/LT-721-2.csv",
    ]),

  // =========================================================================
  // Tax Template Migration - Time-Sensitive Form Groupings
  // =========================================================================

  // Report & Validation (read-only)
  taxTemplateReport: () => taxTemplateMigrationController.generateReport(),
  taxTemplateValidate: () => taxTemplateMigrationController.validate(),

  // Sync Forms (rename mismatches, create missing forms)
  taxTemplateSyncAnalyze: () => taxTemplateMigrationController.syncAnalyze(),
  taxTemplateSyncDryRun: () => taxTemplateMigrationController.syncDryRun(),
  taxTemplateSync: () => taxTemplateMigrationController.sync(),

  // Reset Groupings (unlink forms, delete time-sensitive forms)
  taxTemplateResetDryRun: () => taxTemplateMigrationController.resetDryRun(),
  taxTemplateReset: () => taxTemplateMigrationController.reset(),

  // Migrate (create groupings as drafts, link forms)
  taxTemplateMigrateDryRun: () => taxTemplateMigrationController.migrateDryRun(),
  taxTemplateMigrate: () => taxTemplateMigrationController.migrate(),

  // Cache-based migration (faster - export first, then migrate using cache)
  taxTemplateExportCache: () => taxTemplateMigrationController.exportCache(),
  taxTemplateMigrateWithCacheDryRun: () => taxTemplateMigrationController.migrateWithCacheDryRun(),
  taxTemplateMigrateWithCache: () => taxTemplateMigrationController.migrateWithCache(),

  // Mapping in two batches: first 10 forms, then remaining
  taxTemplateMigrateMappingFirst10: () => taxTemplateMigrationController.migrateMappingFirst10(),
  taxTemplateMigrateMappingRemaining: () => taxTemplateMigrationController.migrateMappingRemaining(),
  taxTemplateMigrateWithCacheMappingFirst10: () => taxTemplateMigrationController.migrateWithCacheMappingFirst10(),
  taxTemplateMigrateWithCacheMappingRemaining: () => taxTemplateMigrationController.migrateWithCacheMappingRemaining(),

  // Publish state sync (match CSV published column with Strapi publishedAt)
  taxTemplatePublishSyncAnalyze: () => taxTemplateMigrationController.publishSyncAnalyze(),
  taxTemplatePublishSyncDryRun: () => taxTemplateMigrationController.publishSyncDryRun(),
  taxTemplatePublishSync: () => taxTemplateMigrationController.publishSync(),
};

if (import.meta.main) {
  const functionName = Deno.args[0];

  if (!functionName) {
    console.log("❌ No function name provided");
    console.log("📝 AVAILABLE FUNCTIONS:");
    Object.keys(functions).forEach((fn) => console.log(`  🦴 ${fn}`));
    Deno.exit(1);
  }

  const targetFunction = functions[functionName as keyof typeof functions];

  if (!targetFunction) {
    console.log(`❌ Function '${functionName}' not found`);
    console.log("💡 Did you mean one of these bro?");
    Object.keys(functions)
      .filter((fn) => fn.toLowerCase().includes(functionName.toLowerCase()))
      .forEach((fn) => console.log(`  🦴 ${fn}`));
    Deno.exit(1);
  }

  try {
    await load({ export: true });
    console.log(`🚀 Executing: ${functionName}`);
    logMemoryUsage("Before execution");
    await targetFunction();
    logMemoryUsage("After execution");
    console.log(`✅ Completed: ${functionName}`);
    Deno.exit(0);
  } catch (error) {
    console.error(`❌ Error executing '${functionName}':`, error);
    Deno.exit(1);
  }
}
