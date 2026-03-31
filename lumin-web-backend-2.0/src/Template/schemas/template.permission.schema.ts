import * as mongoose from 'mongoose';
import { TemplateRole } from 'Template/template.enum';

const TemplatePermissionSchema = new mongoose.Schema({
  refId: mongoose.Schema.Types.ObjectId,
  templateId: mongoose.Schema.Types.ObjectId,
  role: {
    type: String,
    enum: TemplateRole,
  },
  groupPermissions: {
    type: Object,
    default: {},
  },
}, {
  timestamps: {
    createdAt: true,
    updatedAt: false,
  },
});

TemplatePermissionSchema.index({ refId: 1 });
TemplatePermissionSchema.index({ refId: 1, templateId: 1 });

export default TemplatePermissionSchema;
