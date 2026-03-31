/**
 * Form Import from JSON Service
 *
 * Imports templates from production-form.json file.
 * Keeps thumbnail and PDF URLs directly from the JSON.
 */

import { Colors } from "@strapi/config/enum.ts";
import { DASH_LENGTH } from "@strapi/config/settings.ts";
import { IMappingTemplateId, IStrapiResponse } from "../interfaces/index.ts";
import { FORM_SLUG_JSON_PATH } from "../constants/index.ts";
import { readJsonFile, writeDataToCSV, writeJsonFile } from "@strapi/utils/file.ts";
import { isProductionEnv, logChunkHeader } from "@strapi/utils/helpers.ts";
import { loadCurrentFormSlugs } from "../helpers/form-data.helper.ts";
import { formRepository } from "../repositories/form.repository.ts";

interface IJsonFormData {
  id: number;
  title: string;
  subTitle: string;
  metaTitle: string;
  metaDescription: string;
  description: string;
  eSignCompatible: boolean;
  accessible: boolean;
  domain: string;
  language: string;
  slug: string;
  publishedDate: string | null;
  ranking: number;
  templateReleaseId: string;
  faqCountry: string;
  faqState: string;
  countryCode: string;
  stateCode: string;
  categories: { id: number; [key: string]: unknown }[];
  faqPublisher: string;
  faqWhoNeedsToFill: string;
  faqSummary: string;
  faqWhereToSubmit: string;
  thumbnails: { id: number; url: string; [key: string]: unknown }[] | null;
  file: { id: number; url: string; [key: string]: unknown } | null;
  amountUsed: number;
  initUsed: number;
  tempUsedCount: number;
  alternativeText: string;
  relatedForms: { id: number }[] | number[];
  metaKeywords: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  internalNotes: string;
  outdated: boolean;
  longFormContent: string | null;
  legalReview: unknown;
  writerName: string | null;
  bioLink: string | null;
  role: string | null;
  publish: boolean;
  pdfUrl: string | null;
}

const JSON_IMPORT_PATH = "strapi/data/json/production-form.json";
const MAPPING_OUTPUT_PATH = "strapi/data/mapping-template/json-import.json";

export class FormImportJsonService {
  private currentTime = new Date().toISOString();

  /**
   * Import forms from production-form.json
   * Keeps original thumbnail and PDF URLs
   */
  public async importFormFromJSON(): Promise<void> {
    try {
      console.log("🚀 ~ Importing forms from JSON ⏳");

      const jsonData = await readJsonFile<IJsonFormData[]>(JSON_IMPORT_PATH, []);
      const currentFormSlugs = await loadCurrentFormSlugs();

      if (jsonData.length === 0) {
        console.log(`${Colors.Yellow}⚠️ No data found in JSON file${Colors.Reset}`);
        return;
      }

      const temporaryJSON: IMappingTemplateId[] = [];
      const chunkSize = 1;
      let totalCreated = 0;
      let totalSkipped = 0;

      console.log(`📊 ~ Total templates to process: ${jsonData.length}`);

      const errorLogPath = `strapi/logs/error-import-json-${this.currentTime}.csv`;
      await writeDataToCSV(`original_id,title,slug,error`, errorLogPath);

      for (let i = 0; i < jsonData.length; i += chunkSize) {
        logChunkHeader(i, jsonData.length, chunkSize);

        const chunk = jsonData.slice(i, i + chunkSize);
        const promises = chunk.map(async (jsonFormData: IJsonFormData) => {
          const formData = this.transformJsonToFormData(jsonFormData);
          const { slug, title } = jsonFormData;

          // Skip if slug already exists
          // if (currentFormSlugs.includes(slug)) {
          //   console.log(
          //     `${Colors.Yellow}⚠️  Slug already exists: ${slug}${Colors.Reset}`,
          //   );
          //   await writeDataToCSV(
          //     `"${jsonFormData.id}","${title}","${slug}","Slug already exists"`,
          //     errorLogPath,
          //   );
          //   return { created: false, skipped: true };
          // }

          console.log(`${Colors.Blue}🚀 Processing: ${title}${Colors.Reset}`);

          try {
            const result: IStrapiResponse = await formRepository.createForm(formData);

            if (result.error) {
              const errorMessage = result.error?.message || `HTTP ${String(result.status)}`;
              console.error(`❌ Failed to create form ${title}:`, errorMessage);

              await writeDataToCSV(
                `"${jsonFormData.id}","${title}","${slug}","${errorMessage.replace(/"/g, '""')}"`,
                errorLogPath,
              );
              return { created: false, skipped: false };
            }

            temporaryJSON.push({
              templateId: result.data?.id || 0,
              templateReleaseId: Number(jsonFormData.templateReleaseId) || jsonFormData.id,
            });

            currentFormSlugs.push(jsonFormData.slug);

            console.log(
              `${Colors.Green}✅ Created: ${title} ${Colors.Dim}(ID: ${result?.data?.id})${Colors.Reset}`,
            );
            return { created: true, skipped: false };
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Network error creating form ${title}:`, errorMessage);

            await writeDataToCSV(
              `"${jsonFormData.id}","${title}","${slug}","Network error: ${
                errorMessage.replace(/"/g, '""')
              }"`,
              errorLogPath,
            );
            return { created: false, skipped: false };
          }
        });

        const results = await Promise.all(promises);
        totalCreated += results.filter((r) => r.created).length;
        totalSkipped += results.filter((r) => r.skipped).length;

        await writeJsonFile(temporaryJSON, MAPPING_OUTPUT_PATH);

        console.log(
          `${Colors.Gray}📊 Chunk completed: ${
            Math.min(i + chunkSize, jsonData.length)
          }/${jsonData.length}${Colors.Reset}`,
        );
      }

      const formSlugPath = isProductionEnv()
        ? FORM_SLUG_JSON_PATH.PRODUCTION
        : FORM_SLUG_JSON_PATH.STAGING;
      await writeJsonFile(currentFormSlugs, formSlugPath);

      console.log("\n" + "=".repeat(DASH_LENGTH));
      console.log(`${Colors.Green}${Colors.Bold}✅ JSON import completed${Colors.Reset}`);
      console.log(
        `📊 Total created: ${Colors.Bold}${totalCreated}${Colors.Reset}/${jsonData.length}`,
      );
      console.log(`⚠️  Total skipped: ${Colors.Bold}${totalSkipped}${Colors.Reset}`);
      console.log(`📝 Error log: ${Colors.Dim}${errorLogPath}${Colors.Reset}`);
      console.log(`🗂️  Mapping file: ${Colors.Dim}${MAPPING_OUTPUT_PATH}${Colors.Reset}`);
      console.log("=".repeat(DASH_LENGTH));
    } catch (error) {
      console.error("❌ ~ FormImportJsonService ~ importFormFromJSON ~ error:", error);
      throw error;
    }
  }

  /**
   * Transform JSON data to Strapi form data format
   * Keeps thumbnail and PDF URLs directly
   */
  private transformJsonToFormData(
    jsonData: IJsonFormData,
  ): Record<string, unknown> {
    // Categories with parent: 1 from staging-category.json
    const industryCategories = [
      482,
      483,
      484,
      485,
      486,
      487,
      488,
      489,
      490,
      491,
      492,
      493,
      494,
      495,
      496,
      497,
      498,
      499,
      500,
      501,
      502,
    ];
    // Randomly pick 3 unique categories
    const shuffled = [...industryCategories].sort(() => Math.random() - 0.5);
    const categoryIds = shuffled.slice(0, 3);

    return {
      title: jsonData.title || "",
      subTitle: jsonData.subTitle || "",
      metaTitle: jsonData.metaTitle || "",
      metaDescription: jsonData.metaDescription || "",
      metaKeywords: jsonData.metaKeywords || "",
      description: jsonData.description || "",
      eSignCompatible: jsonData.eSignCompatible ?? false,
      accessible: jsonData.accessible ?? false,
      domain: jsonData.domain || "",
      language: jsonData.language || "",
      slug: jsonData.slug || "",
      publishedDate: jsonData.publishedDate,
      ranking: jsonData.ranking ?? 0,
      templateReleaseId: jsonData.templateReleaseId || String(jsonData.id),
      faqCountry: jsonData.faqCountry || "",
      faqState: jsonData.faqState || "",
      countryCode: jsonData.countryCode || "",
      stateCode: jsonData.stateCode || "",
      faqPublisher: jsonData.faqPublisher || "",
      faqWhoNeedsToFill: jsonData.faqWhoNeedsToFill || "",
      faqSummary: jsonData.faqSummary || "",
      faqWhereToSubmit: jsonData.faqWhereToSubmit || "",
      amountUsed: jsonData.amountUsed ?? 0,
      initUsed: jsonData.initUsed ?? 0,
      tempUsedCount: jsonData.tempUsedCount ?? 0,
      alternativeText: jsonData.alternativeText || "",
      internalNotes: JSON.stringify({
        thumbnail: jsonData.thumbnails?.[0]?.url || null,
        file: jsonData.file?.url || null,
      }),
      outdated: jsonData.outdated ?? false,
      longFormContent: jsonData.longFormContent,
      legalReview: jsonData.legalReview,
      writerName: jsonData.writerName,
      bioLink: jsonData.bioLink,
      role: jsonData.role,
      publish: jsonData.publish ?? false,
      pdfUrl: jsonData.pdfUrl,
      publishedAt: new Date().toISOString(),
      published_at: new Date().toISOString(),

      // Relationships - use IDs only
      categories: categoryIds,
      relatedForms: [],

      // Keep media references with their URLs
      // These will be linked via their IDs if they exist in the target Strapi
      thumbnails: [5],
      file: 8,
    };
  }
}

export const formImportJsonService = new FormImportJsonService();
