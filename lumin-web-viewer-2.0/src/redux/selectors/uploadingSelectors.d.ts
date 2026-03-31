import { IDocumentBase } from 'interfaces/document/document.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';

import { RootState } from '../store';

export function getIsCompletedUploadDocuments(state: RootState): boolean;

export function getUploadingDocumentsStat(state: RootState): {
  failed: number;
  uploading: number;
  completed: number;
  total: number;
};

export function getUploadBoxQueue(state: RootState): string[];

export function getUploadingDocumentByGroupId(
  state: RootState,
  groupId: string,
  attributes: string[]
): {
  groupId: string;
  fileData: {
    file: {
      name: string;
      size: number;
    };
  };
  thumbnail: string;
  progress: number;
  status: string;
  errorMessage: string;
  errorCode: string;
  documentId: string;
  document: IDocumentBase;
  organization: IOrganization;
};

export function isOpenUploadingPopper(state: RootState): boolean;
