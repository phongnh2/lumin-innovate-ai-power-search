import * as mongoose from 'mongoose';
import { DocumentEmailSchema } from 'Common/schemas/documentEmail.schema';
import { OrganizationEmailSchema } from 'Common/schemas/organizationEmail.schema';

const SettingSchema = new mongoose.Schema({
  marketingEmail: {
    type: Boolean,
    default: true,
  },
  subscriptionEmail: {
    type: Boolean,
    default: true,
  },
  otherEmail: {
    type: Boolean,
    default: true,
  },
  featureUpdateEmail: {
    type: Boolean,
    default: true,
  },
  dataCollection: {
    type: Boolean,
    default: true,
  },
  documentEmail: {
    type: DocumentEmailSchema,
    default: {},
  },
  organizationEmail: {
    type: OrganizationEmailSchema,
    default: {},
  },
  defaultWorkspace: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
}, { _id: false });

export { SettingSchema };
