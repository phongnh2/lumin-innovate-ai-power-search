import * as mongoose from 'mongoose';

import { PaymentSchema } from 'Common/schemas/payment.schema';

import { TemplateWorkspaceEnum } from 'Organization/organization.enum';
import { PaymentPlanEnums } from 'Payment/payment.enum';

const TeamSettingSchema = new mongoose.Schema({
  templateWorkspace: {
    type: String,
    default: TemplateWorkspaceEnum.ORGANIZATION_TEAM,
    enum: TemplateWorkspaceEnum,
  },
}, { _id: false });

const TeamMetadataSchema = new mongoose.Schema({
  hasProcessedIndexingDocuments: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

const TeamSchema = new mongoose.Schema({
  name: String,
  ownerId: mongoose.Schema.Types.ObjectId,
  belongsTo: mongoose.Schema.Types.ObjectId,
  payment: {
    type: PaymentSchema,
    default: {
      type: PaymentPlanEnums.FREE,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  avatarRemoteId: {
    type: String,
    default: '',
  },
  endTrial: Date,
  isMigrated: Boolean,
  settings: {
    type: TeamSettingSchema,
    default: () => ({}),
  },
  metadata: {
    type: TeamMetadataSchema,
    default: {},
  },
});
TeamSchema.index({ ownerId: 1 });

TeamSchema.index({ belongsTo: 1 }, { sparse: true });
TeamSchema.index({ isMigrated: 1 });

export default TeamSchema;
