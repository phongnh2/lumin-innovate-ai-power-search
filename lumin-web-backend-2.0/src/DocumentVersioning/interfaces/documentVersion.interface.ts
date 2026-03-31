import { InferSchemaType, Types } from 'mongoose';

import { DocumentVersioningSchema } from 'DocumentVersioning/schemas/documentVersioning.schema';

export interface IDocumentVersion {
  documentId: Types.ObjectId;
  versionId?: string;
  annotationPath?: string;
  modifiedBy: Types.ObjectId;
}

export interface IDocumentVersionModel extends IDocumentVersion{
  createdAt: Date;
}

export type DocumentVersioningType = InferSchemaType<typeof DocumentVersioningSchema>;
