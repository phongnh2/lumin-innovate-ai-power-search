import { TFunction } from 'react-i18next';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';

export interface DropboxFileChooserProps {
  children?: React.ReactNode;
  folderId?: string;
  uploadFiles?: (files: File[], uploadFrom?: string) => void;
  uploadType?: string;
  onClose?: () => void;
  onPicked?: () => void;
  multiSelect?: boolean;
  currentOrganization?: IOrganization;
  updateDocumentData?: (type: string, documentData: IDocumentBase) => void;
  currentFolderType: string;
  t: TFunction;
}

declare const DropboxFileChooser: React.ComponentType<DropboxFileChooserProps>;

export default DropboxFileChooser;
