interface ParsedInternalNotes {
  thumbnail: string;
  file: string;
}

export const parseInternalNotes = (
  internalNotes: string,
): ParsedInternalNotes | null => {
  try {
    return JSON.parse(internalNotes);
  } catch {
    return null;
  }
};

export const getHighResThumbnail = (url: string): string => {
  if (url.includes("imagedelivery.net")) {
    return url.replace(/\/(?:\d+x(?:,blurring)?|blurring)$/, "/4x");
  }
  return url;
};

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
