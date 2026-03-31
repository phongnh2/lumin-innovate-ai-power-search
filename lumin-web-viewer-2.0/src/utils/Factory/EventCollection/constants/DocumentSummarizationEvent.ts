export const DocumentSummarizationEventName = {
  SUMMARIZE_DOCUMENT: 'summarizeDocument',
  COPY_SUMMARY: 'copySummary',
  THUMB_UP: 'thumbUp',
  THUMB_DOWN: 'thumbDown',
  REGENERATE: 'regenerate',
};

export const DocumentSummarizationEventPurpose = {
  [DocumentSummarizationEventName.SUMMARIZE_DOCUMENT]: 'Summarize document in header button',
  [DocumentSummarizationEventName.COPY_SUMMARY]: 'Copy document summary',
  [DocumentSummarizationEventName.THUMB_UP]: 'Thumb up for document summary',
  [DocumentSummarizationEventName.THUMB_DOWN]: 'Thumb down for document summary',
  [DocumentSummarizationEventName.REGENERATE]: 'Regenerate document summary',
};
