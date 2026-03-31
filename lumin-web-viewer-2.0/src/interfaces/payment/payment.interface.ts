import { UnifySubscriptionPlan, UnifySubscriptionProduct } from 'constants/organization.enum';
import {
  PaymentPeriod,
  PriceVersion,
  PaymentCurrency,
  PaymentPlans,
  PaymentSignPlans,
  BillingWarningType,
  PaymentMethodTypeEnums,
  CardWallet,
  PaymentStatus,
} from 'constants/plan.enum';

import { IOrganization } from 'interfaces/organization/organization.interface';

export interface PaymentSubScriptionItem {
  id: string;
  quantity: number;
  planRemoteId: string;
  period: PaymentPeriod;
  currency: PaymentCurrency;
  paymentType: UnifySubscriptionPlan;
  paymentStatus: PaymentStatus;
  productName: UnifySubscriptionProduct;
}

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface IPayment {
  customerRemoteId: string;
  subscriptionRemoteId: string;
  planRemoteId: string;
  type: PaymentPlans;
  period: string;
  status: string;
  quantity: number;
  currency: string;
  priceVersion?: string;
  stripeAccountId: string;
  subscriptionItems?: PaymentSubScriptionItem[];
}

export interface IUserPayment extends IPayment {}

export interface ITrialInfo {
  highestTrial: string;
  endTrial: Date;
  canStartTrial: boolean;
  canUseStarterTrial: boolean;
  canUseProTrial: boolean;
  canUseBusinessTrial: boolean;
}

export interface IOrganizationPayment extends IPayment {
  trialInfo: ITrialInfo;
}

export interface ISubscription {
  quantity: number;
  amount: number;
  nextInvoice: number;
  billingInterval: string;
  currency: PaymentCurrency;
  creditBalance?: number;
  payment?: IPayment | IOrganizationPayment;
}

export interface IChargeData {
  subscriptionRemoteId?: string;
  customerRemoteId?: string;
  planRemoteId?: string;
  type?: string;
  period: PaymentPeriod;
  status?: string;
  quantity?: number;
  currency?: string;
  productId?: string;
  priceVersion?: PriceVersion;
}

export interface ICard {
  last4: string;
  expMonth: number;
  expYear: number;
  wallet: CardWallet;
}

export interface ICustomerInfo {
  email: string;
  name?: string;
  currency: PaymentCurrency;
}

export interface IPreviewDocStackInvoice {
  amountDue?: number;
  remaining?: number;
  total?: number;
  discount?: number;
  nextBillingPrice?: number;
  nextBillingCycle?: string;
  quantity?: number;
  currency?: PaymentCurrency;
  creditBalance?: number;
  discountDescription?: string;
  isUpgradeDocStackAnnual?: boolean;
}

export type CreateUnifySubscriptionItem = {
  productName: UnifySubscriptionProduct;
  planName: UnifySubscriptionPlan;
  quantity: number;
};

export type PreviewUpcomingSubscriptionInvoiceParams = {
  orgId: string;
  period: PaymentPeriod;
  currency: PaymentCurrency;
  couponCode?: string;
  stripeAccountId?: string;
  startTrial?: boolean;
  subscriptionItems: CreateUnifySubscriptionItem[];
};

export type PreviewUpcomingSubscriptionInvoiceResponse = Omit<
  IPreviewDocStackInvoice,
  'quantity' | 'isUpgradeDocStackAnnual'
>;

export interface IRetrieveSetupIntentResponse {
  clientSecret: string;
  accountId: string;
}

export interface IUserSignPayment {
  customerId: string;
  subscriptionId: string;
  planId: string;
  type: PaymentSignPlans;
  period: string;
  status: string;
  quantity: number;
  currency: string;
}

interface RenewAttempt {
  attemptCount?: number;
  nextPaymentAttempt?: string;
  clientId?: string;
  paymentType?: string;
  declineCode?: string;
  cardLast4?: string;
}

interface RenewBillingWarningPayload {
  attempt?: RenewAttempt;
  metadata?: {
    organization?: IOrganization;
  };
}

interface SubCancelBillingWarningPayload {
  remainingDay?: number;
  expireDate?: string;
  lastSubscriptionEndedAt?: number;
  metadata?: {
    organization?: IOrganization;
  };
}

export interface IBillingWarning {
  renewPayload?: RenewBillingWarningPayload;
  subCancelPayload?: SubCancelBillingWarningPayload;
  warnings: BillingWarningType[];
}

export type IBillingWarningState = Record<string, IBillingWarning>;

export interface ILink {
  email: string;
}

export interface ICashApp {
  email: string;
}

export interface IPaymentMethod {
  type: PaymentMethodTypeEnums;
  card?: ICard;
  link?: ILink;
  cashapp?: ICashApp;
}

export interface UpdatePaymentMethodResponse {
  statusCode: number;
  message: string;
  paymentMethod: IPaymentMethod;
  billingEmail: string;
}

export type CreateFreeTrialUnifySubscriptionParams = {
  paymentMethod?: string;
  period: PaymentPeriod;
  currency: PaymentCurrency;
  orgId: string;
  stripeAccountId?: string;
  isBlockedPrepaidCardOnTrial?: boolean;
  subscriptionItems: CreateUnifySubscriptionItem[];
};

export interface PaymentChargeData {
  subscriptionRemoteId?: string;
  customerRemoteId?: string;
  planRemoteId?: string;
  type?: string;
  period: PaymentPeriod;
  status?: string;
  quantity?: number;
  currency?: PaymentCurrency;
  productId?: string;
  priceVersion?: PriceVersion;
  subscriptionItems?: PaymentSubScriptionItem[];
}

export type SubScriptionItemWithAmount = PaymentSubScriptionItem & { amount: number };

export type UnifySubscription = {
  payment: Pick<IOrganizationPayment, 'currency' | 'period' | 'status'> & {
    subscriptionItems: SubScriptionItemWithAmount[];
    remainingPlan: {
      currency: string;
      remaining?: number;
      total?: number;
      nextBillingCycle?: string;
      nextBillingPrice?: number;
      amountDue?: number;
      quantity?: number;
      creditBalance?: number;
      discount?: number;
    };
  };
  creditBalance?: number;
  nextInvoice?: number;
  amount?: number;
};

export type UnifyUpcomingInvoice = {
  amount?: number;
  nextInvoice?: number;
  currency?: PaymentCurrency;
  creditBalance?: number;
};

export type GetUnifySubscriptionData = {
  subscription: UnifySubscription;
  upcomingInvoice: UnifyUpcomingInvoice;
};
