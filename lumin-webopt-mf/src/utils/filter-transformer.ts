import type { IUseTemplateButtonProps } from "@/components/Shared/UseTemplateButton/UseTemplateButton.interface";

import type {
  ITemplate,
  ITemplateTimeSensitiveGrouping,
} from "@/interfaces/template.interface";

export const getThumbnailAlt = ({
  alt,
  pageIndex,
  templateName,
}: {
  alt: string | undefined;
  pageIndex?: number;
  templateName: string;
}) => {
  const pageText = pageIndex !== undefined ? `page ${pageIndex}` : "";
  if (!alt) {
    return `Thumbnail of ${templateName} - ${pageText}`;
  }
  return `${alt} ${pageText}`;
};

export const getTemplateWithStylingVariation = (
  templateData: ITemplate,
  variationIdentifier: string,
) => {
  if (!variationIdentifier || !templateData.variation) {
    return templateData;
  }

  const variation = templateData.variation.find(
    ({ variationIdentifier: variationId }) =>
      variationId === variationIdentifier,
  );

  return {
    ...templateData,
    thumbnails: variation?.thumbnails ?? templateData.thumbnails,
  };
};

export const transformTemplateNavigate = ({
  id,
  slug,
  eSignCompatible,
  fileNavigation,
  categories,
  file,
}: Omit<ITemplate, "thumbnails">): IUseTemplateButtonProps => ({
  id: Number(id),
  slug,
  eSignCompatible,
  categoryAttr: categories.map((category) => category.name).join(", "),
  fileNavigation,
  file: { url: file.url },
});

export const transformTemplateRevisionNavigate = ({
  id,
  slug,
  eSignCompatible,
  fileUrl,
  categoryNames,
  fileNavigation,
}: ITemplateTimeSensitiveGrouping): IUseTemplateButtonProps => ({
  id: Number(id),
  slug,
  eSignCompatible,
  categoryAttr: categoryNames,
  file: { url: fileUrl },
  fileNavigation,
});
