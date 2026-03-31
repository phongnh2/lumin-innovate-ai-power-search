export enum COMPRESS_QUALITY {
  NONE = 'NONE',
  STANDARD = 'STANDARD',
  MAXIMUM = 'MAXIMUM',
}

export const COMPRESS_RESOLUTION: Record<COMPRESS_QUALITY, string> = {
  [COMPRESS_QUALITY.NONE]: 'none',
  [COMPRESS_QUALITY.STANDARD]: 'ebook',
  [COMPRESS_QUALITY.MAXIMUM]: 'screen',
};

export const COMPRESS_LEVELS = Object.values(COMPRESS_QUALITY).map((quality) => ({
  quality,
  transKey: quality.toLowerCase(),
  resolution: COMPRESS_RESOLUTION[quality],
}));

export const RESOLUTION_TO_QUALITY = Object.fromEntries(
  Object.entries(COMPRESS_RESOLUTION).map(([key, value]) => [value, key])
) as Record<string, COMPRESS_QUALITY>;

export const COMPRESS_TIMEOUT_ERROR = 'COMPRESS_TIMEOUT_ERROR';

export const COLOR_IMAGE_RESOLUTION = {
  [COMPRESS_RESOLUTION.STANDARD]: 150,
  [COMPRESS_RESOLUTION.MAXIMUM]: 96,
};

export const JPEG_QUALITY = {
  [COMPRESS_RESOLUTION.STANDARD]: 96,
  [COMPRESS_RESOLUTION.MAXIMUM]: 72,
};
