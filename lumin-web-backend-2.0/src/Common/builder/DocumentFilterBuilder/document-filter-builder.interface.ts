import { FilterQuery } from 'mongoose';

import { IDocument, IDocumentPermission } from 'Document/interfaces/document.interface';

export type IDocumentFilter = FilterQuery<IDocument>;

export type IDocumentPermissionFilter = FilterQuery<IDocumentPermission>;

export interface IDocumentFilterBuilder<TResult> {
  build(): Promise<TResult>;
}
