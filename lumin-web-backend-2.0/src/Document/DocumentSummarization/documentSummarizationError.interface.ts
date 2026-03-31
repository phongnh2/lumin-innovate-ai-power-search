/* eslint-disable max-classes-per-file */
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';

export class DocumentSummarizationError {
  status: number;

  errorCode: string;

  errorMessage: string;

  constructor(status: number, errorCode: string, errorMessage: string) {
    this.status = status;
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
  }

  public toGraphqlException() {
    return GraphErrorException.BadRequest(
      this.errorMessage,
      this.errorCode,
    );
  }
}

export class GenerateRequiredError extends DocumentSummarizationError {
  constructor() {
    super(400, 'GENERATE_REQUIRED', 'No available summarization found, provide document key for generation');
  }
}

export class SummarizationUsageExceedError extends DocumentSummarizationError {
  constructor() {
    super(400, 'REQUEST_LIMIT_EXCEEDED', 'Summarization usage exceed for this day');
  }
}
