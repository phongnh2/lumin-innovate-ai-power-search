import * as mongoose from 'mongoose';
import PermissionSchema from 'Common/schemas/permission.schema';

const OrganizationGroupPermissionSchema = new mongoose.Schema({
  name: String,
  resource: String,
  refId: mongoose.Schema.Types.ObjectId,
  permissions: [PermissionSchema],
  version: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

OrganizationGroupPermissionSchema.index({ refId: 1 });

export default OrganizationGroupPermissionSchema;
