import * as mongoose from 'mongoose';

const OrganizationDocStackSchema = new mongoose.Schema({
  documentId: mongoose.Schema.Types.ObjectId,
  orgId: mongoose.Schema.Types.ObjectId,
  expireAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

OrganizationDocStackSchema.index({ orgId: 1, documentId: 1 });
OrganizationDocStackSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

// Indexing for querying on data system.
OrganizationDocStackSchema.index({ createdAt: 1 });

export default OrganizationDocStackSchema;
