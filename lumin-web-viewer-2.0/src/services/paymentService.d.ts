import { UnifySubscriptionProduct } from 'constants/organization.enum';
import { PaymentPeriod, PaymentCurrency } from 'constants/plan.enum';

import { IBasicResponse } from 'interfaces/common';
import {
  ICard,
  IOrganizationPayment,
  IPayment,
  ISubscription,
  IPreviewDocStackInvoice,
  ICustomerInfo,
  IRetrieveSetupIntentResponse,
  IPaymentMethod,
  UpdatePaymentMethodResponse,
  PreviewUpcomingSubscriptionInvoiceParams,
  PreviewUpcomingSubscriptionInvoiceResponse,
  CreateFreeTrialUnifySubscriptionParams,
  GetUnifySubscriptionData,
} from 'interfaces/payment/payment.interface';

export type RetrieveBillingInfoPayload = {
  subscription: ISubscription;
  upcomingInvoice: ISubscription;
};

export type PreviewUpcomingDocStackType = {
  orgId: string;
  plan: string;
  period: PaymentPeriod;
  currency: PaymentCurrency;
  couponCode?: string;
  startTrial: boolean;
  stripeAccountId?: string;
};

export type CreateFreeTrialSubcriptionParams = {
  orgId: string;
  issuedId?: string;
  issuer?: string;
  period: PaymentPeriod;
  currency: PaymentCurrency;
  plan: string;
  stripeAccountId: string;
  isBlockedPrepaidCardOnTrial?: boolean;
};

export type CancelUnifySubscriptionInputItem = {
  productName: UnifySubscriptionProduct;
};

export type CancelUnifySubscriptionInput = {
  clientId: string;
  type: string;
  subscriptionItems: CancelUnifySubscriptionInputItem[];
};

declare namespace paymentServices {
  export function retrieveBillingInfo(clientId: string, type: string): Promise<RetrieveBillingInfoPayload>;

  export function getCard({ type, clientId, fetchOptions }: { type: string, clientId: string, fetchOptions: unknown }): Promise<{
    card: ICard;
    customerInfo: ICustomerInfo;
  }>;

  export function subscription({ clientId, type }: { clientId: string, type: string }): Promise<ISubscription>;

  export function reactivateSubscription(): Promise<{ data: IPayment }>;

  export function cancelSubscription({ clientId, type }: { clientId: string, type: string }): Promise<{data: IOrganizationPayment}>;

  export function cancelUnifySubscription({ clientId, type, subscriptionItems }: CancelUnifySubscriptionInput): Promise<{data: IOrganizationPayment}>;

  export function cancelOrganizationFreeTrial(orgId: string): Promise<{ data: IOrganizationPayment }>;

  export function previewUpcomingDocStackInvoice({
    orgId,
    plan,
    period,
    currency,
    startTrial,
    stripeAccountId,
  }: PreviewUpcomingDocStackType): Promise<IPreviewDocStackInvoice>;

  export function previewUpcomingSubscriptionInvoice(
    params: PreviewUpcomingSubscriptionInvoiceParams
  ): Promise<PreviewUpcomingSubscriptionInvoiceResponse>;

  export function removePersonalPaymentMethod(): Promise<IBasicResponse>;

  export function removeOrganizationPaymentMethod(orgId: string): Promise<IBasicResponse>;

  export function retrieveSetupIntent({
    reCaptchaTokenV3,
    reCaptchaAction,
  }: {
    reCaptchaTokenV3: string;
    reCaptchaAction: string;
  }): Promise<IRetrieveSetupIntentResponse>;

  export function retrieveOrganizationSetupIntent({
    orgId,
    type,
    reCaptchaTokenV3,
    reCaptchaAction,
  }: {
    orgId: string;
    type: string;
    reCaptchaTokenV3: string;
    reCaptchaAction: string;
  }): Promise<IRetrieveSetupIntentResponse>;

  export function deactivateSetupIntent({ stripeAccountId }: { stripeAccountId: string }): Promise<void>;

  export function deactivateOrganizationSetupIntent({ orgId, stripeAccountId }: { orgId: string, stripeAccountId: string }): Promise<void>;

  export function getPaymentMethodAndCustomerInfo({
    type,
    clientId,
    fetchOptions,
  }: {
    type: string;
    clientId: string;
    fetchOptions: unknown;
  }): Promise<[IPaymentMethod, ICustomerInfo]>;

  export function updatePaymentMethod({
    clientId,
    paymentMethodId,
    email,
    type,
  }: {
    clientId: string;
    paymentMethodId: string;
    email: string;
    type: string;
  }): Promise<UpdatePaymentMethodResponse>;

  export function createFreeTrialSubcription({
    orgId,
    issuedId,
    issuer,
    period,
    currency,
    plan,
    stripeAccountId,
    isBlockedPrepaidCardOnTrial,
  }: CreateFreeTrialSubcriptionParams): Promise<IOrganizationPayment>;

  export function createFreeTrialUnifySubscription(
    params: CreateFreeTrialUnifySubscriptionParams
  ): Promise<IOrganizationPayment>;

  export function getUnifySubscription({
    clientId,
    type,
  }: {
    clientId: string;
    type: string;
  }): Promise<GetUnifySubscriptionData>;
}

export default paymentServices;
