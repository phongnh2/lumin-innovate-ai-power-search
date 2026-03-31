import moment from "moment";
import { Colors } from "@strapi/config/enum.ts";
import { DASH_LENGTH } from "@strapi/config/settings.ts";
import { IForm, IStrapiForm } from "../interfaces/index.ts";
import { FORM_JSON_PATH, FORM_SLUG_JSON_PATH } from "../constants/index.ts";
import { writeDataToCSV, writeJsonFile } from "@strapi/utils/file.ts";
import { isProductionEnv } from "@strapi/utils/helpers.ts";
import { formRepository } from "@strapi/modules/form/repositories/form.repository.ts";
import { ParentCategory } from "@strapi/modules/category/constants/index.ts";
import { IStrapiCategory } from "@strapi/modules/category/interfaces/index.ts";

export class FormExportService {
  public async exportFromDataAsJSON(): Promise<void> {
    console.log("🚀 ~ Exporting form data as JSON ⏳");

    let totalForms = 0;
    const results: IForm[] = [];

    await formRepository.handleGetForms((result) => {
      totalForms = result.meta.pagination.total;
      for (const item of result.data) {
        const {
          title,
          subTitle,
          metaTitle,
          metaDescription,
          description,
          eSignCompatible,
          accessible,
          domain,
          language,
          slug,
          publishedDate,
          ranking,
          categories = { data: [] },
          templateReleaseId,
          faqCountry,
          faqState,
          countryCode,
          stateCode,
          faqPublisher,
          faqWhoNeedsToFill,
          faqSummary,
          faqWhereToSubmit,
          file,
          thumbnails = { data: [] },
          amountUsed,
          initUsed,
          tempUsedCount,
        } = item.attributes;

        const categoriesData = categories.data.map(({ id = 0, attributes }) => {
          const { parent } = attributes;
          return {
            id,
            ...attributes,
            parent: parent?.data?.id,
          };
        });

        const thumbnailData = thumbnails.data?.map(({ id = 0, attributes }) => ({
          id,
          alternativeText: attributes.alternativeText ?? "",
          url: attributes.url ?? "",
        })) ?? [];

        const fileData = file && file.data
          ? {
            id: file.data.id,
            alternativeText: file.data.attributes.alternativeText ?? "",
            url: file.data.attributes.url ?? "",
          }
          : null;

        const alternativeText = fileData?.alternativeText ?? "";

        results.push({
          id: item.id,
          title,
          subTitle,
          metaTitle,
          metaDescription,
          description,
          eSignCompatible,
          accessible,
          domain,
          language,
          slug,
          publishedDate,
          ranking,
          templateReleaseId,
          faqCountry,
          faqState,
          countryCode,
          stateCode,
          categories: categoriesData,
          faqPublisher,
          faqWhoNeedsToFill,
          faqSummary,
          faqWhereToSubmit,
          thumbnails: thumbnailData,
          file: fileData,
          amountUsed,
          initUsed,
          tempUsedCount,
          alternativeText,
          relatedForms: [],
          metaKeywords: "",
          createdAt: moment(new Date()).format("YYYY-MM-DD"),
          updatedAt: moment(new Date()).format("YYYY-MM-DD"),
          publishedAt: null,
          internalNotes: "",
          outdated: false,
          longFormContent: null,
          legalReview: null,
          writerName: null,
          bioLink: null,
          role: null,
          publish: false,
          pdfUrl: null,
        });
      }
    });

    const formJsonPath = isProductionEnv() ? FORM_JSON_PATH.PRODUCTION : FORM_JSON_PATH.STAGING;
    await writeJsonFile(results, formJsonPath);

    console.log("\n" + "=".repeat(DASH_LENGTH));
    console.log(`${Colors.Green}${Colors.Bold}✅ Form export completed${Colors.Reset}`);
    console.log(`📊 Total forms: ${Colors.Bold}${totalForms}${Colors.Reset}`);
    console.log(`📁 File: ${Colors.Dim}${formJsonPath}${Colors.Reset}`);
    console.log("=".repeat(DASH_LENGTH));
  }

  public async exportSlugFormDataAsJSON(): Promise<void> {
    console.log("🚀 ~ Exporting form slugs as JSON ⏳");

    let totalSlugs = 0;
    const results: string[] = [];

    await formRepository.handleGetSlugForms((result) => {
      totalSlugs = result.meta.pagination.total;
      for (const item of result.data) {
        const { slug } = item.attributes;
        results.push(slug);
      }
    });

    const formSlugPath = isProductionEnv()
      ? FORM_SLUG_JSON_PATH.PRODUCTION
      : FORM_SLUG_JSON_PATH.STAGING;
    await writeJsonFile(results, formSlugPath);

    console.log("\n" + "=".repeat(DASH_LENGTH));
    console.log(`${Colors.Green}${Colors.Bold}✅ Form slug export completed${Colors.Reset}`);
    console.log(`📊 Total slugs: ${Colors.Bold}${totalSlugs}${Colors.Reset}`);
    console.log(`📁 File: ${Colors.Dim}${formSlugPath}${Colors.Reset}`);
    console.log("=".repeat(DASH_LENGTH));
  }

  public async exportFromDataAsCSV(): Promise<void> {
    console.log("🚀 ~ Exporting form data as CSV ⏳");

    const csvPath = "strapi/data/formData.csv";
    const headers = [
      "strapi_id",
      "title",
      "eSignCompatible",
      "domain",
      "language",
      "slug",
      "publishedDate",
      "ranking",
      "industry_categories",
      "task_categories",
      "form_type_filter",
      "related_template",
      "outdated",
      "published",
      "website_url",
      "templateReleaseId",
    ];
    const initialRow = headers.join(",");
    await writeDataToCSV(initialRow, csvPath);
    let totalForms = 0;

    await formRepository.handleGetForms((result) => {
      totalForms = result.meta.pagination.total;
      for (const item of result.data) {
        const {
          title,
          eSignCompatible,
          domain,
          language,
          slug,
          publishedDate,
          ranking,
          categories,
          relatedForms,
          outdated,
          publishedAt,
          templateReleaseId,
        } = item.attributes;

        const publishedText = publishedAt ? "Y" : "N";
        const outdatedText = outdated ? "Y" : "N";

        const relatedTemplate = relatedForms.data
          .map((x: IStrapiForm) => x.id)
          .join(";");

        const industryCategories = categories.data
          .filter((category: IStrapiCategory) => {
            const categorySlug = category.attributes.parent.data.attributes.slug ?? "";
            return categorySlug === ParentCategory.INDUSTRY;
          })
          .map((category: IStrapiCategory) => category.attributes.name)
          .join(";");

        const taskCategories = categories.data
          .filter((category: IStrapiCategory) => {
            const categorySlug = category.attributes.parent.data.attributes.slug ?? "";
            return categorySlug === ParentCategory.TASK;
          })
          .map((category: IStrapiCategory) => category.attributes.name)
          .join(";");

        const formTypeCategories = categories.data
          .filter((category: IStrapiCategory) => {
            const categorySlug = category.attributes.parent.data.attributes.slug ?? "";
            return categorySlug === ParentCategory.FILTER;
          })
          .map((category: IStrapiCategory) => category.attributes.name)
          .join(";");

        const websiteUrl = [Deno.env.get("TEMPLATES_LIBRARY_URL"), "template", item.id, slug].join(
          "/",
        );

        const rowData = [
          item.id,
          `"${title}"`,
          eSignCompatible,
          domain,
          language,
          slug,
          publishedDate,
          ranking,
          `"${industryCategories}"`,
          `"${taskCategories}"`,
          `"${formTypeCategories}"`,
          `"${relatedTemplate}"`,
          outdatedText,
          publishedText,
          websiteUrl,
          templateReleaseId,
        ];
        const row = rowData.join(",");
        writeDataToCSV(row, csvPath);
      }
    });

    console.log("\n" + "=".repeat(DASH_LENGTH));
    console.log(`${Colors.Green}${Colors.Bold}✅ Form CSV export completed${Colors.Reset}`);
    console.log(`📊 Total forms: ${Colors.Bold}${totalForms}${Colors.Reset}`);
    console.log(`📁 File: ${Colors.Dim}${csvPath}${Colors.Reset}`);
    console.log("=".repeat(DASH_LENGTH));
  }
}

export const formExportService = new FormExportService();
