import * as mongoose from 'mongoose';

const OrganizationMemberSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  orgId: mongoose.Schema.Types.ObjectId,
  groups: [mongoose.Schema.Types.ObjectId],
  internal: Boolean,
  role: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

OrganizationMemberSchema.index({ userId: 1 });
OrganizationMemberSchema.index({ orgId: 1, role: 1 });
OrganizationMemberSchema.index({ orgId: 1, userId: 1 }, { unique: true });
OrganizationMemberSchema.index({ createdAt: 1, role: 1 });
OrganizationMemberSchema.index({ orgId: 1, userId: 1, role: 1 });
OrganizationMemberSchema.index({ orgId: 1, createdAt: -1 });

export default OrganizationMemberSchema;
