import { TFunction } from 'react-i18next';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';

import { ResponseObject } from './types';

export interface GoogleFilePickerProps {
  fileName?: string;
  mimeType?: string;
  isRequestAccess?: boolean;
  closeModal?: () => void;
  onPicked?: (data?: ResponseObject) => void;
  children: React.ReactNode;
  uploadFiles?: (files: File[], uploadFrom?: string) => void;
  onClose?: () => void;
  isUpload?: boolean;
  multiSelect?: boolean;
  folderId?: string;
  uploadType?: string;
  currentOrganization?: IOrganization;
  updateDocumentData?: (type: string, documentData: IDocumentBase) => void;
  currentFolderType?: string;
  t?: TFunction;
  onPickKeyDown?: () => void;
  handlePickThirdPartyFile?: () => void;
}

declare const GoogleFilePicker: React.ComponentType<GoogleFilePickerProps>;

export default GoogleFilePicker;
