import { IDocumentFilter, IDocumentPermissionFilter } from 'Common/builder/DocumentFilterBuilder/document-filter-builder.interface';

import { IDocument } from 'Document/interfaces/document.interface';
import { IFolder } from 'Folder/interfaces/folder.interface';
import { DocumentQueryInput } from 'graphql.schema';
import { User } from 'User/interfaces/user.interface';

export type IDocumentQueryInput = {
  query: DocumentQueryInput;
  permFilter: IDocumentPermissionFilter;
  documentFilter: IDocumentFilter;
}

export type GetDocumentsResult = {
  documents: IDocument[];
  totalDocument: number;
}

export type FolderAndOwnerMap = {
  ownerMap: Record<string, User>;
  folderMap: Record<string, IFolder>;
}

export type FolderInterceptor = {
  folder: IFolder;
  document: IDocument;
}

export type PremiumDocumentMap = Record<string, boolean>;
