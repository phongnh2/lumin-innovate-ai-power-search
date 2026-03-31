import type { IMigrationConfig } from "./interfaces/migration-config.interface.ts";
import { groupingMigrationService, groupingResetService, formSyncService, cacheService, publishSyncService } from "./services/index.ts";
import { getStrapiEndpoint, getStrapiApiToken } from "./constants/index.ts";

function getConfig(): IMigrationConfig {
  const endpoint = getStrapiEndpoint();
  const token = getStrapiApiToken();

  if (!token) {
    throw new Error(
      "Missing Strapi token. Set STRAPI_API_TOKEN environment variable."
    );
  }

  console.log(`\n🔧 Configuration:`);
  console.log(`   Endpoint: ${endpoint}`);
  console.log(`   Token: ${token.substring(0, 30)}...`);

  return { endpoint, token };
}

class TaxTemplateMigrationController {
  async generateReport(): Promise<void> {
    console.log("🚀 Tax Template Migration - Generate Report");
    await groupingMigrationService.generateReport();
  }

  async validate(): Promise<void> {
    console.log("🚀 Tax Template Migration - Validate");
    const config = getConfig();
    await groupingMigrationService.validate(config);
  }

  async syncAnalyze(): Promise<void> {
    console.log("🚀 Tax Template Migration - Sync Analyze");
    const config = getConfig();
    await formSyncService.analyze(config);
  }

  async syncDryRun(): Promise<void> {
    console.log("🚀 Tax Template Migration - Sync Dry Run");
    const config = getConfig();
    await formSyncService.sync(config, true);
  }

  async sync(): Promise<void> {
    console.log("🚀 Tax Template Migration - Sync");
    const config = getConfig();
    await formSyncService.sync(config, false);
  }

  async resetDryRun(): Promise<void> {
    console.log("🚀 Tax Template Migration - Reset Dry Run");
    const config = getConfig();
    await groupingResetService.reset(config, true);
  }

  async reset(): Promise<void> {
    console.log("🚀 Tax Template Migration - Reset");
    const config = getConfig();
    await groupingResetService.reset(config, false);
  }

  async migrateDryRun(): Promise<void> {
    console.log("🚀 Tax Template Migration - Migrate Dry Run");
    const config = getConfig();
    await groupingMigrationService.migrate(config, { dryRun: true, silent: false });
  }

  async migrate(): Promise<void> {
    console.log("🚀 Tax Template Migration - Migrate");
    const config = getConfig();
    await groupingMigrationService.migrate(config, { dryRun: false, silent: false });
  }

  async exportCache(): Promise<void> {
    console.log("🚀 Tax Template Migration - Export Cache");
    const config = getConfig();
    await cacheService.exportCache(config);
  }

  async migrateWithCache(): Promise<void> {
    console.log("🚀 Tax Template Migration - Migrate (using cache)");
    const config = getConfig();
    await groupingMigrationService.migrate(config, { dryRun: false, silent: false, useCache: true });
  }

  async migrateWithCacheDryRun(): Promise<void> {
    console.log("🚀 Tax Template Migration - Migrate Dry Run (using cache)");
    const config = getConfig();
    await groupingMigrationService.migrate(config, { dryRun: true, silent: false, useCache: true });
  }

  async migrateMappingFirst10(): Promise<void> {
    console.log("🚀 Tax Template Migration - Migrate (mapping: first 10 forms only)");
    const config = getConfig();
    await groupingMigrationService.migrate(config, { dryRun: false, silent: false, mappingBatch: "first10" });
  }

  async migrateMappingRemaining(): Promise<void> {
    console.log("🚀 Tax Template Migration - Migrate (mapping: remaining forms)");
    const config = getConfig();
    await groupingMigrationService.migrate(config, { dryRun: false, silent: false, mappingBatch: "remaining" });
  }

  async migrateWithCacheMappingFirst10(): Promise<void> {
    console.log("🚀 Tax Template Migration - Migrate with cache (mapping: first 10 forms only)");
    const config = getConfig();
    await groupingMigrationService.migrate(config, { dryRun: false, silent: false, useCache: true, mappingBatch: "first10" });
  }

  async migrateWithCacheMappingRemaining(): Promise<void> {
    console.log("🚀 Tax Template Migration - Migrate with cache (mapping: remaining forms)");
    const config = getConfig();
    await groupingMigrationService.migrate(config, { dryRun: false, silent: false, useCache: true, mappingBatch: "remaining" });
  }

  async publishSyncAnalyze(): Promise<void> {
    console.log("🚀 Tax Template Migration - Publish Sync Analyze");
    const config = getConfig();
    await publishSyncService.analyze(config);
  }

  async publishSyncDryRun(): Promise<void> {
    console.log("🚀 Tax Template Migration - Publish Sync Dry Run");
    const config = getConfig();
    await publishSyncService.sync(config, true);
  }

  async publishSync(): Promise<void> {
    console.log("🚀 Tax Template Migration - Publish Sync");
    const config = getConfig();
    await publishSyncService.sync(config, false);
  }
}

export const taxTemplateMigrationController = new TaxTemplateMigrationController();
