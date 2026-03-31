import { slugify } from "@sudeepgumaste/slugify";
import { Colors } from "@strapi/config/enum.ts";
import {
  FORM_TYPES,
  INDUSTRY_CATEGORIES,
  ParentCategoryId,
  ParentCategoryName,
  TASK_CATEGORIES,
} from "@strapi/modules/category/constants/index.ts";
import { categoryRepository } from "../repositories/category.repository.ts";

export class CategoryInitService {
  public async initializeCategories(): Promise<void> {
    try {
      console.log(`${Colors.Blue}🚀 Starting categories initialization process${Colors.Reset}`);

      const parentPromises = Object.values(ParentCategoryName).map(
        async (categoryName, index) => {
          return await categoryRepository.createCategory({
            id: index + 1,
            name: categoryName,
            slug: slugify(categoryName).toLowerCase(),
            parent: null,
          });
        },
      );

      await Promise.all(parentPromises);
      console.log(`${Colors.Green}✅ Parent categories created successfully${Colors.Reset}`);

      const childCategories = [
        { items: INDUSTRY_CATEGORIES, parentId: ParentCategoryId.INDUSTRY },
        { items: TASK_CATEGORIES, parentId: ParentCategoryId.TASK },
        { items: FORM_TYPES, parentId: ParentCategoryId.FILTER },
      ];

      const childPromises = childCategories.flatMap(({ items, parentId }) =>
        items.map((item) =>
          categoryRepository.createCategory({
            name: item,
            slug: slugify(item).toLowerCase(),
            parent: parentId,
          })
        )
      );

      await Promise.all(childPromises);
      console.log(`${Colors.Green}✅ Child categories created successfully${Colors.Reset}`);

      console.log(`${Colors.Green}🎉 All categories created successfully${Colors.Reset}`);
    } catch (error) {
      console.error(`${Colors.Red}❌ Failed to initialize categories:${Colors.Reset}`, error);
      throw error;
    }
  }
}

export const categoryInitService = new CategoryInitService();
