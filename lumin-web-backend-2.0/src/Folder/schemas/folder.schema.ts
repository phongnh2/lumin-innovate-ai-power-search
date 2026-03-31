import * as mongoose from 'mongoose';

import ShareSettingSchema from 'Document/schemas/document.share.setting.schema';

const FolderSchema = new mongoose.Schema({
  ownerId: mongoose.Schema.Types.ObjectId,
  name: String,
  shareSetting: ShareSettingSchema,
  listUserStar: [String],
  path: String,
  depth: Number,
  parentId: mongoose.Schema.Types.ObjectId,
  color: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

FolderSchema.index({ ownerId: 1 });
FolderSchema.index({ name: 1, listUserStar: 1 });
FolderSchema.index({ ownerId: 1, path: 1 });
FolderSchema.index({ parentId: 1 });
FolderSchema.index({ path: 1, depth: 1 });

// Indexing for querying on data system.
FolderSchema.index({ createdAt: 1 });

export default FolderSchema;
