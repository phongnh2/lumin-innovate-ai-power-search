import * as mongoose from 'mongoose';

const OrganizationEmailSchema = new mongoose.Schema({
  inviteToOrganization: {
    type: Boolean,
    default: true,
  },
  inviteToOrganizationTeam: {
    type: Boolean,
    default: true,
  },
}, { _id: false });

export { OrganizationEmailSchema };
