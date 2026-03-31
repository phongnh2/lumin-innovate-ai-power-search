import * as mongoose from 'mongoose';

import { DocumentIndexingStatusEnum, DocumentFromSourceEnum } from 'Document/document.enum';
import ShareSettingSchema from 'Document/schemas/document.share.setting.schema';

const DocumentSchema = new mongoose.Schema({
  ownerId: mongoose.Schema.Types.ObjectId,
  lastModifiedBy: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    default: '',
  },
  size: Number,
  service: String,
  remoteId: String,
  remoteEmail: String,
  mimeType: String,
  shareSetting: {
    type: ShareSettingSchema,
    default: () => ({}),
  },
  downloadUrl: String,
  isPersonal: Boolean,
  ownerName: String,
  manipulationStep: String,
  thumbnail: String,
  bookmarks: String,
  listUserStar: [String],
  enableGoogleSync: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  annotations: String,
  lastModify: {
    type: Date,
    default: '',
  },
  lastAccess: {
    type: Date,
    default: Date.now,
  },
  folderId: mongoose.Schema.Types.ObjectId,
  version: {
    type: Number,
    default: 1,
  },
  temporaryRemoteId: {
    type: String,
    default: '',
  },
  metadata: {
    hasAppliedOCR: {
      default: false,
      type: Boolean,
    },
    hasMerged: {
      default: false,
      type: Boolean,
    },
    hasOutlines: {
      default: false,
      type: Boolean,
    },
    hasClearedAnnotAndManip: {
      default: false,
      type: Boolean,
    },
    indexingStatus: {
      default: DocumentIndexingStatusEnum.PENDING,
      type: String,
      enum: DocumentIndexingStatusEnum,
    },
  },
  fromSource: {
    type: String,
    enum: DocumentFromSourceEnum,
    default: DocumentFromSourceEnum.USER_UPLOAD,
  },
  externalStorageAttributes: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({}),
  },
}, {
  discriminatorKey: 'kind',
});

DocumentSchema.index({ ownerId: 1 });
DocumentSchema.index({ folderId: 1 });
DocumentSchema.index({ lastAccess: -1, _id: -1 });
DocumentSchema.index(
  { createdAt: -1, service: 1 },
  {
    partialFilterExpression: {
      createdAt: { $gt: new Date('2022-10-20T00:00:00.000+00:00') },
    },
  },
);
DocumentSchema.index({ remoteEmail: 1, ownerId: 1 });
DocumentSchema.index({ kind: 1 });

export default DocumentSchema;
