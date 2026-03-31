import * as mongoose from 'mongoose';

import { DEFAULT_ANNOT_ORDER } from 'Document/documentConstant';

const DocumentAnnotation = new mongoose.Schema({
  xfdf: String,
  annotationId: String,
  documentId: mongoose.Schema.Types.ObjectId,
  order: {
    type: Number,
    default: DEFAULT_ANNOT_ORDER,
  },
  /**
   * @deprecated We don't need this field anymore, the annotation will be deleted permanently instead of soft delete
   */
  isDeleted: {
    type: Boolean,
    default: false,
  },
  pageIndex: {
    type: Number,
    default: 1,
  },
}, {
  timestamps: true,
});

DocumentAnnotation.index({ annotationId: 1 });
DocumentAnnotation.index({
  documentId: 1, isDeleted: 1, order: 1, createdAt: 1,
}, {
  partialFilterExpression: {
    isDeleted: { $ne: true },
  },
});
DocumentAnnotation.pre('find', function middlewareSoftDelete() {
  this.where({ isDeleted: { $ne: true } });
});

export default DocumentAnnotation;
