import { ExploredFeatureKeys } from 'graphql.schema';

export const EXPLORED_FEATURE_MAPPING: Record<string, {
  key: string,
  maxUsage: number,
}> = {
  [ExploredFeatureKeys.EDIT_PDF]: {
    key: 'editPdf',
    maxUsage: 1,
  },
  [ExploredFeatureKeys.FORM_BUILDER]: {
    key: 'formBuilder',
    maxUsage: 1,
  },
  [ExploredFeatureKeys.SPLIT_PDF]: {
    key: 'splitPdf',
    maxUsage: 1,
  },
  [ExploredFeatureKeys.OCR]: {
    key: 'ocr',
    maxUsage: 1,
  },
  [ExploredFeatureKeys.SUMMARIZATION]: {
    key: 'summarization',
    maxUsage: 3,
  },
  [ExploredFeatureKeys.REDACT_PDF]: {
    key: 'redactPdf',
    maxUsage: 1,
  },
  [ExploredFeatureKeys.PROTECT_PDF]: {
    key: 'protectPdf',
    maxUsage: 1,
  },
};
