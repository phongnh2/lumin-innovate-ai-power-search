import * as mongoose from 'mongoose';
import { PaymentPlanEnums } from 'Payment/payment.enum';

const { ObjectId } = mongoose.Schema.Types;

const UserMetricSchema = new mongoose.Schema({
  userId: {
    type: ObjectId,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  initPlan: {
    type: String,
    default: PaymentPlanEnums.FREE,
  },
  shareCount: {
    type: Number,
    default: 0,
  },
  annotateCount: {
    type: Number,
    default: 0,
  },
  openDocument: {
    ownedCount: {
      type: Number,
      default: 0,
    },
    freeCount: {
      type: Number,
      default: 0,
    },
    freeTrialCount: {
      type: Number,
      default: 0,
    },
    premiumCount: {
      type: Number,
      default: 0,
    },
    teamCount: {
      type: Number,
      default: 0,
    },
  },
  plan: {
    type: {
      type: String,
      default: '',
    },
    period: {
      type: String,
      default: '',
    },
  },
});

UserMetricSchema.index({ userId: 1 });
UserMetricSchema.index({ email: 1 });

export { UserMetricSchema };
