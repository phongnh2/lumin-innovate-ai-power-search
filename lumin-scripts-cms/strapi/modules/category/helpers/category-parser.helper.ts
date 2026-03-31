import { ParentCategory } from "@strapi/modules/category/constants/index.ts";
import { splitByDelimiters } from "@strapi/utils/helpers.ts";
import { latinizeString } from "@strapi/utils/latinize.ts";
import { ICategory, ICategoryResult } from "../interfaces/index.ts";
import { ICsvRawData } from "@strapi/modules/form/interfaces/index.ts";

export function getCategoriesFromFormData(
  formData: ICsvRawData,
  categories: ICategory[],
): ICategoryResult {
  if (formData["categoryIds"] && typeof formData["categoryIds"] === "string") {
    return {
      errors: [],
      result: formData["categoryIds"].split(",").map((id: string) => ({
        id: Number(id),
        name: categories.find((category) => category.id === Number(id))?.name ?? "",
      })),
    };
  }

  const taskCategories = String(formData["task_categories"] ?? formData["task_category"] ?? "");
  const industryCategories = String(
    formData["industry_categories"] ?? formData["industry_category"] ?? "",
  );
  const formTypeFilter = String(formData["form_type_filter"] ?? "");

  const categoryMapping = {
    [ParentCategory.INDUSTRY]: splitByDelimiters(industryCategories)
      .map((item: string) => item.trim())
      .filter((item: string) => item !== "Tax"),
    [ParentCategory.TASK]: splitByDelimiters(taskCategories).map((item: string) => item.trim()),
    [ParentCategory.FILTER]: splitByDelimiters(formTypeFilter).map((item: string) => item.trim()),
  };

  const parentCategoryMap = new Map(
    categories.map((category: ICategory) => [
      category.slug,
      category.id,
    ]),
  );

  const errors: string[] = [];
  const allCategories: ICategory[] = [];

  for (const [parentSlug, categoryList] of Object.entries(categoryMapping)) {
    const parentId = parentCategoryMap.get(parentSlug) as number;

    if (!parentId) continue;

    categoryList.forEach((categoryName: string) => {
      const { error, result } = findCategoryByNameAndParent(
        categoryName.trim(),
        parentId,
        categories,
      );

      if (error) {
        errors.push(error);
      } else if (result) {
        allCategories.push(result);
      }
    });
  }

  return {
    errors,
    result: allCategories,
  };
}

export function findCategoryByNameAndParent(
  categoryName: string,
  parentId: number,
  categories: ICategory[],
) {
  const result = categories.find((category) => {
    const formCategoryName = categoryName.trim().replace("С", "C").toLowerCase();
    const baseCategoryName = category.name.trim().replace("С", "C").toLowerCase();

    const isMatchingCategoryName =
      latinizeString(formCategoryName) === latinizeString(baseCategoryName);

    const isMatchingCategoryParent = Number(category.parent) === Number(parentId);

    return isMatchingCategoryName && isMatchingCategoryParent;
  });

  if (!result) {
    return {
      error: `Category '${categoryName}' could not be found`,
      result: null,
    };
  }

  return {
    error: null,
    result,
  };
}
