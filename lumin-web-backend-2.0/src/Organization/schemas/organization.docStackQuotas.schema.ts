import * as mongoose from 'mongoose';

const OrganizationDocStackQuotaSchema = new mongoose.Schema({
  orgId: mongoose.Schema.Types.ObjectId,
  docStack: Number,
  expireAt: Date,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

OrganizationDocStackQuotaSchema.index({ orgId: 1 });
OrganizationDocStackQuotaSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
OrganizationDocStackQuotaSchema.index({ createdAt: 1 });

export default OrganizationDocStackQuotaSchema;
