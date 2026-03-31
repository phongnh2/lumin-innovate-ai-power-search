import { Colors } from "@strapi/config/enum.ts";
import { StrapiService } from "@strapi/modules/strapi/strapi.service.ts";
import { readJsonFile } from "@strapi/utils/file.ts";
import { isProductionEnv } from "@strapi/utils/helpers.ts";
import { CATEGORY_JSON_PATH } from "@strapi/modules/category/constants/index.ts";
import { ICategory, ICategoryResult } from "./interfaces/index.ts";
import { categoryInitService } from "./services/category-init.service.ts";
import { categoryExportService } from "./services/category-export.service.ts";
import { getCategoriesFromFormData } from "./helpers/category-parser.helper.ts";
import { ICsvRawData } from "@strapi/modules/form/interfaces/index.ts";

export class CategoryController extends StrapiService {
  private categories: ICategory[] = [];

  constructor() {
    super();
    this.loadCategories();
  }

  private async loadCategories(): Promise<void> {
    try {
      const categoryJsonPath = isProductionEnv()
        ? CATEGORY_JSON_PATH.PRODUCTION
        : CATEGORY_JSON_PATH.STAGING;
      this.categories = await readJsonFile(categoryJsonPath, []) as ICategory[];

      if (this.categories.length > 0) {
        console.log(
          `${Colors.Green}✅ Loaded ${this.categories.length} categories${Colors.Reset}`,
        );
      }
    } catch (_error) {
      console.log(
        `${Colors.Yellow}📝 No existing category.json found, starting fresh${Colors.Reset}`,
      );
      this.categories = [];
    }
  }

  public getCategoriesFromFormData(formData: ICsvRawData): ICategoryResult {
    return getCategoriesFromFormData(formData, this.categories);
  }

  public initializeCategories = categoryInitService.initializeCategories.bind(
    categoryInitService,
  );
  public exportCategoryDataAsCSV = categoryExportService.exportCategoryDataAsCSV.bind(
    categoryExportService,
  );
  public exportCategoryDataAsJSON = categoryExportService.exportCategoryDataAsJSON.bind(
    categoryExportService,
  );
}

export const categoryController = new CategoryController();
