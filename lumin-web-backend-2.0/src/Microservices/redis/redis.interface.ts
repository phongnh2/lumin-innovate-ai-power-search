import { DocumentMigrationResult } from 'Organization/interfaces/organization.interface';
import { PaymentTypeEnums, StripeDeclineCodeEnums } from 'Payment/payment.enum';

export interface ChannelMember {
  _id?: string,
  avatarRemoteId?: string,
  isActive?: boolean,
  name?: string,
  socketId?: string,
}

export interface UserDelete {
  userId: string,
  date: number,
}

export interface SetMailReminderSubscriptionExpiredInput {
  orgId: string,
  timeOffset: number,
  timeSubscriptionWillExpired: string
}
export interface IStripeRenewAttempt {
  attemptCount: number,
  nextPaymentAttempt: string,
  clientId: string,
  paymentType: PaymentTypeEnums,
  declineCode: StripeDeclineCodeEnums,
}

export interface IPricingUserMigration extends Partial<DocumentMigrationResult> {
  orgId: string;
  migratedAt: Date;
  error?: string;
}
