import * as mongoose from 'mongoose';

import { S3KeyMaxLength } from 'Common/constants/ValidationConstants';

const DocumentVersioningSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Document',
  },
  /**
   * @description versionId is the version id of the document in the s3 bucket
   */
  versionId: {
    type: String,
    maxLength: S3KeyMaxLength,
  },
  /**
   * @description annotationPath is the path of the annotation file in the s3 bucket
   */
  annotationPath: {
    type: String,
    maxLength: S3KeyMaxLength,
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  /**
   * @description default expiration time for the document versioning in milliseconds
   */
  expireAt: {
    type: Date,
    required: false,
    default: Date.now,
  },
  isOriginal: {
    type: Boolean,
  },
  /* storageMetadata: {}, */
}, {
  timestamps: {
    createdAt: true,
    updatedAt: false,
  },
});

DocumentVersioningSchema.index({ createdAt: 1 });
DocumentVersioningSchema.index({ expireAt: 1 }, { expireAfterSeconds: Number(process.env.LUMIN_DOCUMENT_VERSIONING_EXPIRATION_IN_SECONDS) });
DocumentVersioningSchema.index({ documentId: 1, createdAt: 1 });

export { DocumentVersioningSchema };
