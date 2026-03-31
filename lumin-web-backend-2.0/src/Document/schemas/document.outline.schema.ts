import * as mongoose from 'mongoose';

const DocumentOutlineSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
  },
  parentId: {
    type: String,
    default: null,
  },
  pathId: {
    type: String,
    required: true,
    unique: true,
  },
  parentPath: {
    type: String,
    default: null,
  },
  level: {
    type: Number,
  },
  lexicalRanking: {
    type: String,
    required: true,
  },
  pageNumber: {
    type: Number,
    default: null,
  },
  verticalOffset: {
    type: Number,
  },
  horizontalOffset: {
    type: Number,
  },
  hasChildren: {
    type: Boolean,
  },
}, {
  timestamps: true,
});

DocumentOutlineSchema.index({ lexicalRanking: 1 });

DocumentOutlineSchema.index({ documentId: 1, lexicalRanking: 1 });

DocumentOutlineSchema.index({ documentId: 1, level: 1 });

DocumentOutlineSchema.index({ documentId: 1, parentPath: 1 });

DocumentOutlineSchema.index({ documentId: 1, pathId: 1 });

export { DocumentOutlineSchema };
