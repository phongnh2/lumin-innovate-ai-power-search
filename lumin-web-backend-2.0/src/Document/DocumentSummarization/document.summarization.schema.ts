import * as mongoose from 'mongoose';

import { DocumentSummarizationStatus, DocumentSummarizationVote } from 'graphql.schema';

export interface DocumentSummarization {
  userId: string;
  documentId: string;
  documentVersion: number;
  content: string;
  vote: DocumentSummarizationVote;
  externalSummaryId: string;
  status: DocumentSummarizationStatus;
}

const DocumentSummarizationSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  documentId: mongoose.Schema.Types.ObjectId,
  documentVersion: Number,
  externalSummaryId: String,
  content: String,
  status: {
    type: String,
    enum: DocumentSummarizationStatus,
    default: 'PROCESSING',
  },
  vote: {
    type: String,
    default: null,
  },
});

DocumentSummarizationSchema.index({ documentId: 1 });

export default DocumentSummarizationSchema;
