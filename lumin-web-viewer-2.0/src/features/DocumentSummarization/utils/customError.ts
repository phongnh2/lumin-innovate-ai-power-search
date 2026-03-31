import { SummarizationErrorTypes, SummarizeErrorType } from '../constants';

export class SummaryTextContentError extends Error {
  constructor(message: string) {
    super(message);
    const errorCode = Object.keys(SummarizationErrorTypes).find(
      (key: SummarizeErrorType) => SummarizationErrorTypes[key] === message
    );
    this.name = errorCode;
  }
}
