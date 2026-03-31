import * as mongoose from 'mongoose';

import { DocumentRoleEnum } from 'Document/document.enum';

const DocumentRequestAccessSchema = new mongoose.Schema({
  documentId: mongoose.Schema.Types.ObjectId,
  requesterId: mongoose.Schema.Types.ObjectId,
  documentRole: {
    type: String,
    enum: DocumentRoleEnum,
    default: DocumentRoleEnum.SPECTATOR,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

DocumentRequestAccessSchema.index({ documentId: 1 });
DocumentRequestAccessSchema.index({ requesterId: 1 });

export default DocumentRequestAccessSchema;
