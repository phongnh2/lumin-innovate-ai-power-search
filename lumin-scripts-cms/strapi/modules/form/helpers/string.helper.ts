import { slugify } from "@sudeepgumaste/slugify";
import { latinizeString } from "@strapi/utils/latinize.ts";

export function formatTitleForFileName(title?: string): string {
  if (!title) {
    return "";
  }

  return title
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("_") || title;
}

export function removeRevisionDateFromTitle(title: string): string {
  const patternToRemove = "\\(Rev\\. [A-Za-z]+ \\d{4}\\)";
  const regex = new RegExp(patternToRemove, "g");
  return title.replace(regex, "")?.trim();
}

export function generateSlug(title: string): string {
  return slugify(removeRevisionDateFromTitle(title)).toLowerCase();
}

export function compareCategoryArrays(array1: string[], array2: string[]): boolean {
  if (array1.length !== array2.length) {
    return false;
  }

  const normalizedArray1 = array1.map((item) => latinizeString(item)).sort();
  const normalizedArray2 = array2.map((item) => latinizeString(item)).sort();

  return normalizedArray1.every((value, index) => value === normalizedArray2[index]);
}
