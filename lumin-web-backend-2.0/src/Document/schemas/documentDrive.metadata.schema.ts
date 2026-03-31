import mongoose from 'mongoose';

const DocumentDriveMetadataSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  remoteId: {
    type: String,
    required: true,
  },
  sharers: [mongoose.Schema.Types.Mixed],
});

DocumentDriveMetadataSchema.index({ documentId: 1, remoteId: 1 });

export default DocumentDriveMetadataSchema;
