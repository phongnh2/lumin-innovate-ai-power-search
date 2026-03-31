import { SummarizationErrorTypes, SummarizeErrorType } from "./constants";
import { DocumentSummarizationStatus, DocumentSummarizationVote, SummarizationAvailability } from "./enum";

export interface ISummarizedError {
  error_code: SummarizeErrorType,
  description: string,
  user_message: string,
};
export interface IDocumentSummarized {
  content: string,
  vote: string,
  status?: DocumentSummarizationStatus,
  availability?: SummarizationAvailability,
  documentVersion?: number,
};
interface IRegenerateSummarizationInput {
  text: string;
};
interface IGetDocumentSummarizationOptions {
  regenerate: IRegenerateSummarizationInput;
};

export interface IGetDocumentSummarization {
  documentId: string;
  options?: IGetDocumentSummarizationOptions;
};

export interface IUpdateSummarizationInput {
  vote: DocumentSummarizationVote,
};

export interface IUpdateSummarization {
  documentId: string;
  input: IUpdateSummarizationInput,
};

export interface IOnSocketSummarizationCompleted {
  content: string,
  status: {
    code: number,
    error_code: keyof typeof SummarizationErrorTypes,
    message: string,
  },
}
