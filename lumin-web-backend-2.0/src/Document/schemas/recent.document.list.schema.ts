import { Schema, Types } from 'mongoose';

const RecentDocumentSchema = new Schema({
  _id: Types.ObjectId,
  openedAt: {
    type: Date,
    default: Date.now,
  },
});

const RecentDocumentListSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  // MAXIMUM_RECENT_DOCUMENTS = 300;
  documents: [RecentDocumentSchema],
});

RecentDocumentListSchema.index({ userId: 1, organizationId: 1 });
RecentDocumentListSchema.index({ 'documents.openedAt': -1 });
RecentDocumentListSchema.index({ 'documents._id': 1 });

export default RecentDocumentListSchema;
