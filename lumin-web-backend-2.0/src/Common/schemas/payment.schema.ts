import * as mongoose from 'mongoose';

import { CreateOrganizationSubscriptionPlans, UnifySubscriptionPlan } from 'graphql.schema';
import {
  PaymentCurrencyEnums,
  PaymentPeriodEnums,
  PaymentStatusEnums,
  PaymentProductEnums,
} from 'Payment/payment.enum';

const SubscriptionItemSchema = new mongoose.Schema({
  id: String,
  planRemoteId: String,
  period: {
    type: String,
    enum: PaymentPeriodEnums,
  },
  currency: {
    type: String,
    enum: PaymentCurrencyEnums,
  },
  paymentType: {
    type: String,
    enum: UnifySubscriptionPlan,
  },
  paymentStatus: {
    type: String,
    enum: PaymentStatusEnums,
  },
  quantity: Number,
  productName: {
    type: String,
    enum: PaymentProductEnums,
  },
  deleted: Boolean,
}, { _id: false });

const PaymentSchema = new mongoose.Schema({
  type: String,
  quantity: Number,
  dueDate: Date,
  planRemoteId: String,
  // All fields above is deprecated, keep for backward compatibility
  customerRemoteId: String,
  subscriptionRemoteId: String,
  status: String,
  period: String,
  currency: String,
  subscriptionItems: [SubscriptionItemSchema],
  trialInfo: {
    highestTrial: {
      type: String,
      enum: CreateOrganizationSubscriptionPlans,
    },
    endTrial: {
      type: Date,
    },
  },
  stripeAccountId: {
    type: String,
  },
}, { _id: false });

const ReservePaymentSchema = new mongoose.Schema({
  ...PaymentSchema.obj,
  billingCycleAnchor: String,
}, { _id: false });

PaymentSchema.index({ customerRemoteId: 1 });
PaymentSchema.index({ customerRemoteId: 1, stripeAccountId: 1 });

export { PaymentSchema, ReservePaymentSchema };
