import * as mongoose from 'mongoose';

const DocumentImage = new mongoose.Schema({
  documentId: mongoose.Schema.Types.ObjectId,
  remoteId: String,
});

DocumentImage.index({ documentId: 1, remoteId: 1 });

export default DocumentImage;
