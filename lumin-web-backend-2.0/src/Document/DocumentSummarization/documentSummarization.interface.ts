import { Observable } from 'rxjs';

import {
  DocumentSummarizationStatus,
  DocumentSummarizationVote,
} from 'graphql.schema';

export interface DocumentSummarization {
  userId: string;
  documentId: string;
  documentVersion: number;
  content: string;
  vote: DocumentSummarizationVote;
  externalSummaryId: string;
  status: DocumentSummarizationStatus;
}

export interface Status {
  code: number;
  error_code?: string;
  message?: string;
}

// TODO map to camelCase
export interface InitDocSummarizationRequest {
  doc_id: string;
  doc_version: string;
  doc_name: string;
  text: string;
  force_new: boolean;
}

export interface GetSummaryResponse {
  status: Status;
}

export interface UpdateVotingRequest {
  summary_id: string;
  vote: string;
}

export interface UpdateVotingResponse {
  status: any;
}

export interface CompleteSummarizationRequest {
  status: Status;
  doc_id: string;
  summary_id: string;
  summary_content: string;
}

// TODO generate from proto file
export interface DocSumService {
  GetSummary(req: InitDocSummarizationRequest): Observable<GetSummaryResponse>;
  UpdateVoting(req: UpdateVotingRequest): Observable<UpdateVotingResponse>;
  CompleteSummarization(req: CompleteSummarizationRequest): Observable<Status>;
}
