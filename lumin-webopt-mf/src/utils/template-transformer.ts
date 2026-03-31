import dayjs from "dayjs";

import { MeilisearchTemplateAttr } from "@/enum/template.enum";
import type { ICategory } from "@/interfaces/category.interface";
import type {
  BaseTemplateInput,
  ITransformCategoryData,
  TemplateInput,
  ThumbnailInput,
  TimeSensitiveGroupingInput,
  VariationInput,
} from "@/interfaces/template-input.interface";
import type { ITemplate } from "@/interfaces/template.interface";
import type { IThumbnail } from "@/interfaces/thumbnail.interface";

import { formatNumber } from "./format-number";

export const transformParentCategory = (category: {
  id: string;
  name: string;
}) => category;

export const transformCategoryData = (
  categories: ITransformCategoryData[],
): ICategory[] => {
  if (!categories) {
    return [];
  }
  return categories.map(
    ({
      id: categoryId,
      name,
      slug: categorySlug,
      parent,
      ...otherFields
    }: ITransformCategoryData) =>
      ({
        id: categoryId,
        _id: categoryId,
        name,
        slug: categorySlug,
        ...(parent && { parent: transformParentCategory(parent) }),
        ...otherFields,
      }) as unknown as ICategory,
  );
};

export const transformThumbnails = ({
  thumbnails = [],
  title,
}: {
  thumbnails: ThumbnailInput[];
  title: string;
}) =>
  thumbnails.map(
    ({
      [MeilisearchTemplateAttr.ThumbnailUrl]: url,
      [MeilisearchTemplateAttr.ThumbnailAlt]: alt,
    }) => ({
      src: url,
      alt,
      templateName: title,
    }),
  );

const transformVariation = (
  variation: VariationInput[],
  title: string,
  defaultThumbnails: IThumbnail[],
) =>
  variation.map(({ thumbnails, ...rest }) => ({
    ...rest,
    thumbnails: transformThumbnails({ thumbnails, title }) ?? defaultThumbnails,
  }));

const transformTimeSensitiveGrouping = (
  currentId: number,
  timeSensitiveGrouping: TimeSensitiveGroupingInput[] = [],
) =>
  timeSensitiveGrouping
    .map(({ totalUsed, publishedDate, ...rest }) => ({
      ...rest,
      totalUsed: formatNumber(Number(totalUsed)),
      totalUsedNumber: totalUsed,
      publishedDate: publishedDate
        ? dayjs(publishedDate).format("MMM YYYY")
        : "Unknown Date",
    }))
    .filter(
      ({ id: timeSensitiveGroupId, outdated }) =>
        Number(timeSensitiveGroupId) !== Number(currentId) && outdated,
    );

const transformTemplateCore = (data: BaseTemplateInput) => {
  const {
    id,
    title,
    slug,
    domain,
    totalUsed,
    categories,
    relatedFormByDomain = [],
  } = data;

  return {
    id,
    title,
    slug,
    owner: { link: domain },
    categories: transformCategoryData(categories),
    totalUsed: formatNumber(Number(totalUsed)),
    totalUsedNumber: totalUsed,
    relatedFormByDomain,
  };
};

export const transformTemplate = (
  data: TemplateInput,
): ITemplate & { totalUsedNumber: string } => {
  const {
    [MeilisearchTemplateAttr.Thumbnails]: thumbnailsAttr = [],
    variation,
    [MeilisearchTemplateAttr.TimeSensitiveGrouping]: timeSensitiveGrouping = [],
    ...otherFields
  } = data;
  const coreData = transformTemplateCore(data);

  const defaultThumbnails = transformThumbnails({
    thumbnails: thumbnailsAttr,
    title: data.title,
  });

  const variationData = variation
    ? transformVariation(variation, data.title, defaultThumbnails)
    : [];
  const formattedTimeSensitiveGrouping = transformTimeSensitiveGrouping(
    Number(data.id),
    timeSensitiveGrouping,
  );

  return {
    ...otherFields,
    ...coreData,
    thumbnails: defaultThumbnails,
    variation: variationData,
    timeSensitiveGrouping: formattedTimeSensitiveGrouping,
  };
};

export const transformTemplateData = (data: TemplateInput[]): ITemplate[] => {
  if (!data) {
    return [];
  }
  return data.map((template) => transformTemplate(template));
};
