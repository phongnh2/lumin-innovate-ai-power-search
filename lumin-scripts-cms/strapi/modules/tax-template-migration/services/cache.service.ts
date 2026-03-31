import type { IMigrationConfig } from "../interfaces/migration-config.interface.ts";
import { FORMS_GROUPING_CACHE_PATH } from "../constants/index.ts";
import { Colors } from "@strapi/config/enum.ts";
import { DASH_LENGTH } from "@strapi/config/settings.ts";
import { writeJsonFile, readJsonFile } from "@strapi/utils/file.ts";
import { isProductionEnv } from "@strapi/utils/helpers.ts";
import {
  fetchAllFormsWithGroupings,
  fetchAllTimeSensitiveForms,
} from "../repositories/strapi-api.repository.ts";

export interface IFormCacheEntry {
  templateReleaseId: string;
  strapiId: number;
  groupingId: number | null;
  groupingName: string | null;
  title: string;
}

export interface ITimeSensitiveFormCacheEntry {
  id: number;
  name: string;
}

export interface ICacheData {
  exportedAt: string;
  endpoint: string;
  forms: IFormCacheEntry[];
  timeSensitiveForms: ITimeSensitiveFormCacheEntry[];
}

function getCachePath(): string {
  return isProductionEnv()
    ? FORMS_GROUPING_CACHE_PATH.PRODUCTION
    : FORMS_GROUPING_CACHE_PATH.STAGING;
}

class CacheService {
  async exportCache(config: IMigrationConfig): Promise<void> {
    console.log(`${Colors.Blue}🚀 ~ Exporting forms grouping cache ⏳${Colors.Reset}`);

    console.log("\n📥 Fetching all forms with groupings...");
    const formsMap = await fetchAllFormsWithGroupings(config);
    console.log(`✅ Fetched ${formsMap.size} forms`);

    console.log("\n📥 Fetching all time-sensitive forms...");
    const timeSensitiveForms = await fetchAllTimeSensitiveForms(config);
    console.log(`✅ Fetched ${timeSensitiveForms.length} time-sensitive forms`);

    const formsCache: IFormCacheEntry[] = [];
    for (const [templateReleaseId, data] of formsMap) {
      formsCache.push({
        templateReleaseId,
        strapiId: data.strapiId,
        groupingId: data.groupingId,
        groupingName: data.groupingName || null,
        title: data.title || "",
      });
    }

    const timeSensitiveFormsCache: ITimeSensitiveFormCacheEntry[] =
      timeSensitiveForms.map((f) => ({
        id: f.id,
        name: f.attributes?.name || f.name || "",
      }));

    const cacheData: ICacheData = {
      exportedAt: new Date().toISOString(),
      endpoint: config.endpoint,
      forms: formsCache,
      timeSensitiveForms: timeSensitiveFormsCache,
    };

    const cachePath = getCachePath();
    await writeJsonFile(cacheData, cachePath);

    console.log("\n" + "=".repeat(DASH_LENGTH));
    console.log(`${Colors.Green}${Colors.Bold}✅ Cache export completed${Colors.Reset}`);
    console.log(`📊 Forms: ${Colors.Bold}${formsCache.length}${Colors.Reset}`);
    console.log(`📊 Time-sensitive forms: ${Colors.Bold}${timeSensitiveFormsCache.length}${Colors.Reset}`);
    console.log(`📁 File: ${Colors.Dim}${cachePath}${Colors.Reset}`);
    console.log("=".repeat(DASH_LENGTH));
  }

  async loadFormsCache(): Promise<Map<string, { strapiId: number; groupingId: number | null; groupingName: string | null; title: string }>> {
    const cachePath = getCachePath();
    const data = await readJsonFile<ICacheData | null>(cachePath, null);

    if (!data) {
      throw new Error(
        `Cache file not found: ${cachePath}\n` +
        `Run 'deno task strapi taxTemplateExportCache' first to generate the cache.`
      );
    }

    console.log(`📂 Loaded cache from: ${Colors.Dim}${cachePath}${Colors.Reset}`);
    console.log(`   Exported at: ${data.exportedAt}`);
    console.log(`   Forms: ${data.forms.length}`);

    const map = new Map<string, { strapiId: number; groupingId: number | null; groupingName: string | null; title: string }>();
    for (const form of data.forms) {
      map.set(form.templateReleaseId, {
        strapiId: form.strapiId,
        groupingId: form.groupingId,
        groupingName: form.groupingName,
        title: form.title,
      });
    }
    return map;
  }

  async loadTimeSensitiveFormsCache(): Promise<Map<string, number>> {
    const cachePath = getCachePath();
    const data = await readJsonFile<ICacheData | null>(cachePath, null);

    if (!data) {
      throw new Error(
        `Cache file not found: ${cachePath}\n` +
        `Run 'deno task strapi taxTemplateExportCache' first to generate the cache.`
      );
    }

    console.log(`📂 Loaded time-sensitive forms from cache`);
    console.log(`   Time-sensitive forms: ${data.timeSensitiveForms.length}`);

    const map = new Map<string, number>();
    for (const form of data.timeSensitiveForms) {
      const normalizedName = form.name.toLowerCase().trim();
      map.set(normalizedName, form.id);
    }
    return map;
  }

  async cacheExists(): Promise<boolean> {
    const cachePath = getCachePath();
    const data = await readJsonFile<ICacheData | null>(cachePath, null);
    return data !== null;
  }
}

export const cacheService = new CacheService();
