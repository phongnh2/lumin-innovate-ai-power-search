export const MAXIMUM_SUMMARIZE_DOCUMENT_SIZE = 20 * 1024 * 1024;

export const SummarizationContentRequire = { MAX: 48000, MIN: 50 };

export const AI_Partner = {
  name: 'Gemini',
  link: 'https://cloud.google.com/gemini/docs/discover/data-governance',
};

export const SummarizationDebounceActions = { FEEDBACK: 3000, COPY: 2000 };

export const SummarizationErrorTypes = {
  CONTENT_LENGTH_EXCEEDED: 'contentLengthExceeded',
  INSUFFICIENT_TEXT: 'insufficientText',
  DOCUMENT_CONTENT_ERROR: 'undefinedContent',
  THIRD_PARTY_ERROR: 'thirdPartyError',
  UNSUPPORTED_LANGUAGE: 'unsupportedLanguage',
  REQUEST_LIMIT_EXCEEDED: 'requestLimitExceeded',
} as const;

export type SummarizeErrorType = keyof typeof SummarizationErrorTypes;

export const ContentLengthErrors = [
  SummarizationErrorTypes.CONTENT_LENGTH_EXCEEDED,
  SummarizationErrorTypes.INSUFFICIENT_TEXT,
] as string[];

export const GiveSummarizeFeedbackURL =
  'https://feedback.luminpdf.com/feature-requests?selectedCategory=summarize-ai';

export const WarningUseSummarizeURL = 'https://help.luminpdf.com/summarize-using-pdf-ai';
