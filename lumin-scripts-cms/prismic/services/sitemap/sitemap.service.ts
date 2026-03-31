import { ISitemapService, ISitemapUrl, IUrlCheckResult } from "./sitemap.interface.ts";
import { csvService } from "../csv-service/csv.service.ts";
import { PRISMIC_CONFIG, SITEMAP_CONFIG } from "../../config/settings.ts";
import { writeDataToCSV } from "../../utils/helpers.ts";

export class SitemapService implements ISitemapService {
  public async parseSitemapXml(filePath: string): Promise<ISitemapUrl[]> {
    try {
      console.log(`📝 Reading sitemap file: ${filePath}`);
      const content = await Deno.readTextFile(filePath);

      const urls: ISitemapUrl[] = [];

      // Simple regex to extract URLs from XML
      const urlRegex = /<loc>(.*?)<\/loc>/g;
      let match;
      while ((match = urlRegex.exec(content)) !== null) {
        urls.push({
          loc: match[1],
        });
      }

      console.log(`📊 Total URLs found in sitemap: ${urls.length}`);
      return urls;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error parsing sitemap:`, errorMessage);
      throw error;
    }
  }

  public async checkUrlsInSitemap(): Promise<void> {
    try {
      console.log("🚀 Starting URL check process ⏳");

      const sitemapPath = `${PRISMIC_CONFIG.XML_DIR}/sitemap-prismic-0.xml`;
      const csvPath = `${PRISMIC_CONFIG.CSV_DIR}/check-url.csv`;
      const outputPath = `${PRISMIC_CONFIG.OUTPUT_DIR}/${SITEMAP_CONFIG.OUTPUT_FILE}`;

      await Deno.mkdir(PRISMIC_CONFIG.OUTPUT_DIR, { recursive: true });

      console.log("📝 Reading sitemap and CSV files...");
      const [sitemapUrls, csvData] = await Promise.all([
        this.parseSitemapXml(sitemapPath),
        csvService.readCsvFile(csvPath),
      ]);

      // Extract paths from sitemap URLs
      // const sitemapPaths = new Set<string>();
      const sitemapPaths: string[] = [];
      for (const url of sitemapUrls) {
        try {
          const urlObj = new URL(url.loc);
          const path = urlObj.pathname;
          sitemapPaths.push(path);
        } catch (error) {
          console.log(`⚠️ Invalid URL in sitemap: ${url.loc}`);
        }
      }
      console.log(`📊 Sitemap contains ${sitemapPaths.length} unique paths`);

      const urlColumn = "testing_link";
      console.log(`🔍 Using column: ${urlColumn}`);

      const csvUrls = csvService.extractUrlsFromCsv(csvData, urlColumn);

      const results: IUrlCheckResult[] = [];
      let foundCount = 0;
      let notFoundCount = 0;

      console.log("🔍 Checking URLs...");
      console.log("📊 Sample sitemap paths:", sitemapPaths.slice(0, 5));
      console.log("📊 Sample CSV URLs:", csvUrls.slice(0, 3));

      for (const url of csvUrls) {
        let exists = false;
        let pathToCheck = "";

        try {
          const urlObj = new URL(url);
          pathToCheck = urlObj.pathname;

          // Check both with and without trailing slash
          exists = sitemapPaths.includes(pathToCheck) ||
            sitemapPaths.includes(pathToCheck + "/") ||
            sitemapPaths.includes(pathToCheck.slice(0, -1));

          // Debug first few URLs
          if (csvUrls.indexOf(url) < 3) {
            console.log(`🔍 Checking: ${url}`);
            console.log(`   Path: ${pathToCheck}`);
            console.log(`   Exists: ${exists}`);
            if (!exists) {
              // Check if similar path exists
              const similarPaths = sitemapPaths.filter((p) =>
                p.includes(pathToCheck.split("/").pop() || "")
              );
              console.log(`   Similar paths found: ${similarPaths.length}`);
              if (similarPaths.length > 0) {
                console.log(`   Similar: ${similarPaths.slice(0, 3)}`);
              }
            }
          }
        } catch (error) {
          const pathMatch = url.match(/https?:\/\/[^\/]+(.*)/);
          if (pathMatch) {
            pathToCheck = pathMatch[1];
            exists = sitemapPaths.includes(pathToCheck) ||
              sitemapPaths.includes(pathToCheck + "/") ||
              sitemapPaths.includes(pathToCheck.slice(0, -1));
          }
        }

        results.push({ url, exists });

        if (exists) {
          foundCount++;
        } else {
          notFoundCount++;
        }
      }

      console.log("📝 Writing results to CSV...");
      await Deno.writeTextFile(outputPath, "url,exists\n");

      for (const result of results) {
        const csvRow = `"${result.url}","${result.exists}"`;
        await writeDataToCSV(csvRow, outputPath);
      }

      console.log("✅ URL check completed");
      console.log(`📊 Total URLs checked: ${results.length}`);
      console.log(`✅ URLs found in sitemap: ${foundCount}`);
      console.log(`❌ URLs not found in sitemap: ${notFoundCount}`);
      console.log(`📝 Results saved to: ${outputPath}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ URL check process failed:", errorMessage);
      throw error;
    }
  }
}

export const sitemapService = new SitemapService();
