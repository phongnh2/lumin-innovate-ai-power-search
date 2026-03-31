import * as mongoose from 'mongoose';
import { DocumentWorkspace } from 'Document/document.enum';

const WorkspaceSchema = new mongoose.Schema({
  refId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: DocumentWorkspace,
  },
}, { _id: false });

export default WorkspaceSchema;
