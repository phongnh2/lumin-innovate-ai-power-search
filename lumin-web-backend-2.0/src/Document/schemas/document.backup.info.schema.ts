import * as mongoose from 'mongoose';

const DocumentBackupInfo = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  remoteId: {
    type: String,
    required: true,
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

DocumentBackupInfo.index({ documentId: 1 });
DocumentBackupInfo.index({ orgId: 1 });

export default DocumentBackupInfo;
