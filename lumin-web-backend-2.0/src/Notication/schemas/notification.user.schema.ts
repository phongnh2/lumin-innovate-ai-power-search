import * as mongoose from 'mongoose';

import { NotificationTab } from 'graphql.schema';
import { NotificationProduct } from 'Notication/interfaces/notification.interface';

const { ObjectId } = mongoose.Schema.Types;

const NotificationUserSchema = new mongoose.Schema({
  notificationId: ObjectId,
  userId: ObjectId,
  is_read: {
    type: Boolean,
    default: false,
  },
  tab: {
    type: String,
    default: NotificationTab.GENERAL,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  product: {
    type: String,
    default: NotificationProduct.LUMIN_PDF,
  },
});

NotificationUserSchema.index({ userId: 1, tab: 1 });
NotificationUserSchema.index({ notificationId: 1 });
export default NotificationUserSchema;
