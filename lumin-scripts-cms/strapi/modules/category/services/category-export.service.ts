import { Colors } from "@strapi/config/enum.ts";
import { DASH_LENGTH } from "@strapi/config/settings.ts";
import { writeDataToCSV, writeJsonFile } from "@strapi/utils/file.ts";
import { isProductionEnv } from "@strapi/utils/helpers.ts";
import { CATEGORY_JSON_PATH } from "@strapi/modules/category/constants/index.ts";
import { ICategory } from "../interfaces/index.ts";
import { categoryRepository } from "../repositories/category.repository.ts";

export class CategoryExportService {
  public async exportCategoryDataAsCSV(): Promise<void> {
    const initialRow =
      `strapi_id,name,slug,parent_type,parent_id,meta_keywords,meta_title,meta_description,title,hero_sub_copy,what_is_form,what_is_form_body,lumin_for_category,lumin_for_category_body_copy,published`;
    await writeDataToCSV(initialRow, "strapi/data/categoryData.csv");
    let totalCategories = 0;

    await categoryRepository.fetchAllCategories((result) => {
      totalCategories = result.meta.pagination.total;
      for (const item of result.data) {
        const {
          name,
          slug,
          parent,
          publishedAt,
          metaTitle,
          metaDescription,
          title,
          heroSubCopy,
          whatIsForm,
          whatIsFormBody,
          luminForCategory,
          luminForCategoryBodyCopy,
          metaKeywords,
        } = item.attributes;

        const published = publishedAt ? "Y" : "N";
        const parentType = parent?.data ? parent.data.attributes.name : "";
        const parentId = parent?.data ? parent.data.id : "";

        const row = `${item.id},"${name}","${slug}","${parentType}","${parentId}","${
          metaKeywords || ""
        }","${metaTitle || ""}","${metaDescription || ""}","${title || ""}","${
          heroSubCopy || ""
        }","${whatIsForm || ""}","${whatIsFormBody || ""}","${luminForCategory || ""}","${
          luminForCategoryBodyCopy || ""
        }",${published}`;
        writeDataToCSV(row, "strapi/data/categoryData.csv");
      }
    });
    console.log(
      `${Colors.Green}📊 Total categories exported to CSV: ${totalCategories}${Colors.Reset}`,
    );
  }

  public async exportCategoryDataAsJSON(): Promise<void> {
    let totalCategories = 0;
    const results: ICategory[] = [];

    console.log(`${Colors.Blue}🚀 ~ Starting category export to JSON ⏳${Colors.Reset}`);

    await categoryRepository.fetchAllCategories((result) => {
      totalCategories = result.meta?.pagination?.total ?? 0;
      for (const item of result.data) {
        const { parent } = item.attributes;

        const parentId = parent?.data ? parent.data.id : null;

        results.push({
          id: item.id,
          ...item.attributes,
          parent: parentId,
        });
      }
    });
    const categoryJsonPath = isProductionEnv()
      ? CATEGORY_JSON_PATH.PRODUCTION
      : CATEGORY_JSON_PATH.STAGING;
    await writeJsonFile(results, categoryJsonPath);

    console.log("\n" + "=".repeat(DASH_LENGTH));
    console.log(`${Colors.Green}${Colors.Bold}✅ Category export completed${Colors.Reset}`);
    console.log(`📊 Total categories: ${Colors.Bold}${totalCategories}${Colors.Reset}`);
    console.log(`💾 Saved to: ${Colors.Dim}${categoryJsonPath}${Colors.Reset}`);
    console.log("=".repeat(DASH_LENGTH));
  }
}

export const categoryExportService = new CategoryExportService();
