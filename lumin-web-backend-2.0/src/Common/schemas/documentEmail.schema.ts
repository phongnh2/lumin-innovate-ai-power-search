import * as mongoose from 'mongoose';

const DocumentEmailSchema = new mongoose.Schema({
  shareDocument: {
    type: Boolean,
    default: true,
  },
  commentDocument: {
    type: Boolean,
    default: true,
  },
  replyCommentDocument: {
    type: Boolean,
    default: true,
  },
  mentionCommentDocument: {
    type: Boolean,
    default: true,
  },
  requestAccessDocument: {
    type: Boolean,
    default: true,
  },
}, { _id: false });

export { DocumentEmailSchema };
