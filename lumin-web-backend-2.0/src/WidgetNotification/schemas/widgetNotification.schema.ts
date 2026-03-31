import * as mongoose from 'mongoose';
import { WidgetType } from 'graphql.schema';

const { ObjectId } = mongoose.Schema.Types;

const WidgetNotificationSchema = new mongoose.Schema({
  userId: ObjectId,
  type: {
    type: String,
    enum: WidgetType,
  },
  isPreviewed: {
    type: Boolean,
    default: false,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
  isNewWidget: {
    type: Boolean,
    default: true,
  },
});

WidgetNotificationSchema.index({ userId: 1, type: 1 }, { unique: true });

export default WidgetNotificationSchema;
