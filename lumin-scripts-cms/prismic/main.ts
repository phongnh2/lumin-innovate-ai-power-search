import { sitemapService } from "@prismic/services/sitemap/sitemap.service.ts";
import { prismicService } from "@prismic/services/primic-sdk/prismic.service.ts";
import { sliceExportService } from "@prismic/services/slice-export/slice-export.service.ts";

import { load } from "@std/dotenv";
import { logMemoryUsage } from "./utils/helpers.ts";

export const functions = {
  // Sitemap operations
  checkUrlsInSitemap: () => sitemapService.checkUrlsInSitemap(),

  // Prismic document operations
  exportDocuments: () =>
    prismicService.exportDocumentsByCustomType([
      "universal",
      "tool_detail",
      "tool_list",
      "blog",
      "author_bio",
      "company_detail",
      "customer_stories_detail",
      "download_detail",
      "expand_content",
      "forms",
      "guide",
      "integration_list",
      "integration_master_page",
      "integrations",
      "lumin_pdf_detail",
      "lumin_sign_detail",
      "master_landing_page",
      "partner",
      "product_detail",
      "security",
      "solution_detail_static",
      "solution_detail",
      "table_section",
      "template_section",
      "tool_homepage",
      "webinar_detail",
    ]), // Update with your custom types
  processExportedDocuments: () => prismicService.processExportedDocuments(),
  updateDocumentsFromFolder: () =>
    prismicService.updateDocumentsFromFolder("prismic/data/export/found"),
  updateAllDocuments: () => prismicService.updateAllDocuments(),
  runFullWorkflow: () => prismicService.runFullWorkflow([]), // Update with your custom types

  // Slice export operations
  exportSlicesToCSV: () => sliceExportService.exportSlicesToCSV(),
};

export const functionConfigs: Record<string, { heavy?: boolean; media?: boolean }> = {
  checkUrlsInSitemap: { heavy: true },
  exportDocuments: { heavy: true },
  processExportedDocuments: { heavy: false },
  updateDocumentsFromFolder: { heavy: false },
  updateAllDocuments: { heavy: true },
  runFullWorkflow: { heavy: true },
  exportSlicesToCSV: { heavy: false },
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
    console.log("💡 Did you mean one of these?");
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
