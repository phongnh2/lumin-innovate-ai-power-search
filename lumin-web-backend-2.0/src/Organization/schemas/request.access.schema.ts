import * as mongoose from 'mongoose';

const RequestAccessSchema = new mongoose.Schema({
  actor: String,
  entity: Object,
  target: String,
  type: {
    type: String,
    default: 'normal',
  },
  inviterId: mongoose.Types.ObjectId,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

RequestAccessSchema.index({ actor: 1 });
RequestAccessSchema.index({ target: 1, actor: 1 });

// Indexing for querying on data system.
RequestAccessSchema.index({ createdAt: 1 });
RequestAccessSchema.index({ 'entity.role': 1, createdAt: -1 });

export default RequestAccessSchema;
