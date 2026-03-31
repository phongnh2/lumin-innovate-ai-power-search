import * as mongoose from 'mongoose';

import PermissionSchema from 'Common/schemas/permission.schema';

import {
  DocumentActionPermissionPrinciple,
  DocumentActionPermissionResource,
} from '../enums/action.permission.enum';

const DocumentActionPermissionSchema = new mongoose.Schema(
  {
    resource: {
      type: String,
      enum: DocumentActionPermissionResource,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    principle: {
      type: String,
      enum: DocumentActionPermissionPrinciple,
    },
    permissions: [PermissionSchema],
    version: Number,
  },
  {
    timestamps: true,
  },
);

DocumentActionPermissionSchema.index({ resource: 1, resourceId: 1, principle: 1 }, { unique: true });

export default DocumentActionPermissionSchema;
