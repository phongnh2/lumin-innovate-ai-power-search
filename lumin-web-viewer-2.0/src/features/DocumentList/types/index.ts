import { DocumentTemplate, IDocumentBase } from 'interfaces/document/document.interface';
import { IFolder } from 'interfaces/folder/folder.interface';

export type DocumentActionsType = {
  viewInfo: () => void;
  open: () => void;
  makeACopy: () => void;
  rename: () => void;
  markFavorite: () => void;
  remove: () => void;
  copyLink: () => void;
  share: () => void;
  move: () => void;
  makeOffline: () => void;
};

type DocumentSubscriptionCommonPayload = {
  statusCode: number;
  type: string;
  teamId?: string;
  organizationId?: string;
  additionalSettings?: Record<string, unknown>;
};

type DeletedOriginalDocumentInfo = {
  documentId: string;
  documentFolder?: string;
};

export interface DeleteOriginalDocumentPayload extends DocumentSubscriptionCommonPayload {
  documentList: DeletedOriginalDocumentInfo[];
}

export interface UpdateDocumentListPayload extends DocumentSubscriptionCommonPayload {
  document: IDocumentBase;
  organizationId?: string;
}

export interface SubscriptionUpdateDocumentInfoPayload {
  document: IDocumentBase;
}

export interface SubscriptionDeleteDocumentListPayload {
  documentIds: string[];
}

export interface SubscriptionAddDocumentListPayload {
  document: IDocumentBase;
  organizationId?: string;
}

export interface UpdateDocumentTemplateCommonPayload {
  teamId?: string;
  organizationId?: string;
  clientId: string;
  type: string;
  statusCode: number;
}

export interface UpdateDocumentTemplateListPayload extends UpdateDocumentTemplateCommonPayload {
  document: DocumentTemplate;
}

export interface DeleteDocumentTemplatePayload extends UpdateDocumentTemplateCommonPayload {
  documentTemplateId: string;
}

export interface SubscriptionUpdateTemplateListPayload {
  document: DocumentTemplate;
}

export interface SubscriptionDeleteDocumentTemplatePayload {
  documentTemplateId: string;
}

export interface SubscriptionFunctionParams {
  event: string;
  payload:
    | SubscriptionUpdateDocumentInfoPayload
    | SubscriptionDeleteDocumentListPayload
    | SubscriptionAddDocumentListPayload
    | SubscriptionUpdateFolderPayload
    | SubscriptionUpdateTemplateListPayload
    | SubscriptionDeleteDocumentTemplatePayload;
}

export type FolderActionsType = {
  open: () => void;
  viewInfo: () => void;
  rename: () => void;
  markFavorite: () => void;
  remove: () => void;
};

export type FolderSubscriptionPayload = {
  folder: IFolder;
  folders?: IFolder[];
  userId: string;
  subscriptionEvent: string;
};

export interface SubscriptionUpdateFolderPayload {
  folder: IFolder;
  folders: IFolder[];
}
