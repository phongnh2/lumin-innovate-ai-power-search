import * as mongoose from 'mongoose';

const DocumentManipultation = new mongoose.Schema({
  documentId: mongoose.Schema.Types.ObjectId,
  refId: mongoose.Schema.Types.ObjectId,
  type: String,
  option: Object,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

DocumentManipultation.index({ documentId: 1 });
DocumentManipultation.index({ refId: 1 });
export default DocumentManipultation;
