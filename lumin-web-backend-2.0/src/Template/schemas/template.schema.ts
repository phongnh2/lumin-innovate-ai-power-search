import * as mongoose from 'mongoose';
import { TemplateOwnerType } from 'graphql.schema';

const TemplateCounterSchema = new mongoose.Schema({
  view: {
    type: Number,
    default: 0,
  },
  download: {
    type: Number,
    default: 0,
  },
});

const TemplateSchema = new mongoose.Schema({
  name: String,
  size: Number,
  remoteId: String,
  thumbnail: String,
  ownerId: mongoose.Schema.Types.ObjectId,
  description: String,
  ownerType: {
    type: String,
    enum: TemplateOwnerType,
    required: true,
  },
  counter: {
    type: TemplateCounterSchema,
    default: {},
  },
}, {
  timestamps: {
    createdAt: true,
    updatedAt: false,
  },
});

TemplateSchema.index({ ownerId: 1 });

export default TemplateSchema;
