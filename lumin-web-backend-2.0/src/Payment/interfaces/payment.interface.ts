import { CreateOrganizationSubscriptionPlans } from 'graphql.schema';

export interface CreateFreeTrialPlanInput {
  userId: string;
  billingEmail: string;
  sourceId?: string;
  currency?: string;
  type?: string;
}

export interface CreateSubscriptionInput {
  plan: string;
  customer: any;
  quantity: number;
  couponCode: string;
  planRemoteId: string;
}

export interface ITrialInfo {
  highestTrial: CreateOrganizationSubscriptionPlans;
  endTrial?: Date;
}

export interface SubScriptionItemSchemaInterface {
  id: string;
  planRemoteId: string;
  period: string;
  currency: string;
  paymentType: string;
  paymentStatus: string;
  quantity: number;
  productName: string;
  deleted?: boolean;
}

export interface PaymentSchemaInterface {
  customerRemoteId: string;
  subscriptionRemoteId: string;
  planRemoteId: string;
  type: string;
  period: string;
  status: string;
  quantity: number;
  currency: string;
  trialInfo: ITrialInfo;
  stripeAccountId?: string;
  subscriptionItems?: SubScriptionItemSchemaInterface[];
}

export interface ReservePaymentSchemaInterface extends PaymentSchemaInterface {
  billingCycleAnchor: string;
}

export type MakeFieldRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type UnifySubscriptionBuilderItem = Pick<SubScriptionItemSchemaInterface, 'productName' | 'paymentType' | 'quantity'> & {
  id?: string;
  paymentStatus?: string;
  period?: string;
};

export type UnifySubscriptionBuilderUpcomingPayment = Partial<Pick<PaymentSchemaInterface, 'type' | 'period' | 'status' | 'currency'>> & {
  subscriptionItems?: UnifySubscriptionBuilderItem[];
};

export interface IPaymentProto {
  customer_remote_id: string;
  subscription_remote_id: string;
  stripe_account_id?: string;
  plan_remote_id: string;
  trial_info?: {
    highest_trial: string;
    end_trial: Date;
  };
  type?: string;
  period?: string;
  status?: string;
  quantity?: number;
  currency?: string;
}
