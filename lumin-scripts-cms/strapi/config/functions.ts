// Function configuration for run.ts
// This file is separated to avoid importing service instances

export const functionConfigs: Record<string, { heavy?: boolean; media?: boolean }> = {
  previewTemplatesCSV: { heavy: true },
  genThumbnailImages: { media: true },
};
