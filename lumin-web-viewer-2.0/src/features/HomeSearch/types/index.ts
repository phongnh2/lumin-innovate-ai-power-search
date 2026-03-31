import { IDocumentBase } from 'interfaces/document/document.interface';
import { IFolder } from 'interfaces/folder/folder.interface';

export interface GetOrganizationResourcesPayload {
  folders: IFolder[];
  documents: IDocumentBase[];
  total: number;
  cursor: string;
}

export enum ListItemKinds {
  FOLDER = 'FOLDER',
  DOCUMENT = 'DOCUMENT',
}

export type FolderWithKind = IFolder & { kind: ListItemKinds };

export type DocumentWithKind = IDocumentBase & { kind: ListItemKinds };
