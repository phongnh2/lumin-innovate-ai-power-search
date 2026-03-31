import * as mongoose from 'mongoose';

import {
  DocumentIndexingOriginEnum, DocumentIndexingStatusEnum, DocumentRoleEnum, DocumentStorageEnum,
} from 'Document/document.enum';
import { PaymentPlanEnums } from 'Payment/payment.enum';

const DocumentIndexingBacklogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  documentName: {
    type: String,
    required: true,
  },
  remoteId: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  source: {
    type: String,
    required: true,
    enum: DocumentStorageEnum,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    nullable: true,
  },
  clientType: {
    type: String,
    required: true,
    enum: DocumentRoleEnum,
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  documentPermissionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  paymentPlan: {
    required: true,
    type: String,
    enum: PaymentPlanEnums,
  },
  status: {
    type: String,
    required: true,
    enum: DocumentIndexingStatusEnum,
    default: DocumentIndexingStatusEnum.PENDING,
  },
  priorityScore: {
    type: Number,
    required: true,
    default: 0,
  },
  lastEnqueuedAt: {
    type: Date,
    default: null,
  },
  lastAccess: {
    type: Date,
    required: true,
  },
  retryCount: {
    type: Number,
    required: true,
    default: 0,
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  origin: {
    type: String,
    required: true,
    enum: DocumentIndexingOriginEnum,
  },
  errorMessage: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

DocumentIndexingBacklogSchema.index({ documentId: 1 }, { unique: true });
DocumentIndexingBacklogSchema.index({ clientId: 1, clientType: 1 });
DocumentIndexingBacklogSchema.index({ status: 1, priorityScore: -1 });

export default DocumentIndexingBacklogSchema;
