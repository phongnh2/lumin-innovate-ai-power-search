import {
  DocumentIndexingOriginEnum, DocumentIndexingStatusEnum, DocumentRoleEnum, DocumentStorageEnum,
} from 'Document/document.enum';
import { PaymentPlanEnums } from 'Payment/payment.enum';

export interface IDocumentIndexingBacklog {
  userId: string;
  documentName: string;
  remoteId: string;
  fileSize: number;
  source: DocumentStorageEnum;
  clientId: string;
  clientType: DocumentRoleEnum;
  documentId: string;
  documentPermissionId: string;
  workspaceId: string;
  folderId?: string;
  origin: DocumentIndexingOriginEnum;
  paymentPlan: PaymentPlanEnums;
  status: DocumentIndexingStatusEnum;
  priorityScore: number;
  lastAccess: Date;
  lastEnqueuedAt?: Date;
  retryCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}
