export type GetTruncatedFileNameParams = {
  filename: string;
  maxLength?: number;
  firstPart?: number;
  lastPart?: number;
  maxWidth?: number;
  charWidth?: number;
};

export const getTruncatedFileName = ({
  filename,
  maxLength = 15,
  firstPart = 5,
  lastPart = 7,
  maxWidth = 124,
  charWidth = 8,
}: GetTruncatedFileNameParams): string => {
  if (filename.length <= maxLength) {
    return filename;
  }
  const estimatedMaxChars = Math.floor(maxWidth / charWidth);
  const effectiveMaxLength = Math.min(maxLength, estimatedMaxChars);

  if (firstPart + lastPart + 3 > effectiveMaxLength) {
    const availableChars = effectiveMaxLength - 3;
    firstPart = Math.floor(availableChars / 2);
    lastPart = Math.ceil(availableChars / 2);
  }

  return `${filename.substring(0, firstPart)}...${filename.substring(filename.length - lastPart)}`;
};
