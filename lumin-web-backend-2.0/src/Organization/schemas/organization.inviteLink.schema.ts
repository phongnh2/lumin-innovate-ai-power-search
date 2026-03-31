import * as mongoose from 'mongoose';

import { OrganizationRoleEnums } from 'Organization/organization.enum';

const OrganizationInviteLinkSchema = new mongoose.Schema({
  orgId: mongoose.Schema.Types.ObjectId,
  inviteId: {
    type: String,
  },
  role: {
    type: String,
    enum: [OrganizationRoleEnums.BILLING_MODERATOR, OrganizationRoleEnums.MEMBER],
  },
  actorId: mongoose.Schema.Types.ObjectId,
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

OrganizationInviteLinkSchema.index({ orgId: 1 }, { unique: true });
OrganizationInviteLinkSchema.index({ inviteId: 1 });

export default OrganizationInviteLinkSchema;
