import * as mongoose from 'mongoose';

import { FormFieldTypeEnum } from 'Document/document.annotation.enum';

const DocumentFormField = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true, maxLength: 1024 },
  value: String,
  type: { type: String, enum: FormFieldTypeEnum },
  xfdf: String,
  widgetId: String,
  pageNumber: Number,
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isInternal: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

DocumentFormField.index({ documentId: 1, name: 1 }, { unique: true });
DocumentFormField.index({ documentId: 1, isInternal: 1 });

export default DocumentFormField;
