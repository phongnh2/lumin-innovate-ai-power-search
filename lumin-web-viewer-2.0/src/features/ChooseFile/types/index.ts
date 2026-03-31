import { IDocumentBase } from 'interfaces/document/document.interface';
import { IFolder } from 'interfaces/folder/folder.interface';

export type CurrentFolderType = {
  name: string;
  _id: string;
};

export type CurrentLocationType = {
  name: string;
  _id: string;
  folderType: string;
};

export type ChooseFileGetDocumentsPayload = {
  documents: IDocumentBase[];
  hasNextPage: boolean;
  cursor: string;
};

type DataWithKind<T, K extends string> = T & { kind: K };

export type ListDataType = DataWithKind<IFolder, 'folder'> | DataWithKind<IDocumentBase, 'document'>;

export enum LocationTypes {
  Personal = 'PERSONAL',
  Organization = 'ORGANIZATION',
  Team = 'TEAM',
}
