import { UnifySubscriptionPlan } from 'graphql.schema';
import { PaymentCurrencyEnums } from 'Payment/payment.enum';

export enum LuminPlanStatus {
  SET_TO_CANCEL = 'set_to_cancel',
  PAYMENT_FAILING = 'payment_failing',
  ACTIVE = 'active',
  FREE_TRIAL = 'free_trial',
  UNPAID = 'unpaid'
}

export enum OrganizationRole {
  ORGANIZATION_ADMIN = 'Circle Admin',
  BILLING_MODERATOR = 'Billing Moderator',
  MEMBER = 'Member'
}

export enum OrganizationPlan {
  ORG_BUSINESS = 'Business',
  ORG_PRO = 'Pro',
  ORG_STARTER = 'Starter',
  ENTERPRISE = 'Old Enterprise',
  BUSINESS = 'Old Business',
  PROFESSIONAL = 'Old Professional (individual plan)',
  FREE = 'Free',
}
export interface IAudience {
  external_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  lumin_email_address?: string;
  lumin_email_domain?: string;
  highest_lumin_plan?: string;
  highest_lumin_plan_status?: string;
  highest_lumin_plan_circle_role?: string;
  receive_marketing_emails?: boolean;
  receive_feature_update_emails?: boolean;
}

export interface IPurchaseEvent {
  external_id: string;
  currency: PaymentCurrencyEnums;
  price: number;
  product_id: string;
  time: Date;
  properties?: {
    circle_id?: string;
  }
}

export interface IRequestJoinOrganizationEvent {
  external_id: string;
  name: string,
  time: Date;
  properties: {
    targetOrganizationId: string;
    organizationAccessRequestId: string;
    circleAdmins: string[];
  }
}

export interface IBrazeCampaignTriggerRecipient {
  user_alias?: {
    alias_name: string;
    alias_label: string;
  };
  external_user_id?: string;
  email?: string;
  prioritization?: string[];
  trigger_properties?: Record<string, any>;
  send_to_existing_only?: boolean;
  attributes?: Record<string, any>;
}

export interface IBrazeCampaignTriggerAttachment {
  file_name: string;
  url: string;
}

export interface IBrazeCampaignTriggerPayload {
  campaign_id: string;
  send_id?: string;
  trigger_properties?: Record<string, any>;
  broadcast?: boolean;
  audience?: Record<string, any>;
  recipients?: IBrazeCampaignTriggerRecipient[];
  attachments?: IBrazeCampaignTriggerAttachment[];
}

export interface IRenewalEmailCampaignTriggerProperties {
  workspace_name: string;
  workspace_url: string;
  plan_name: string;
  amount_charge: string;
  currency_symbol: string;
  renewal_date: string;
  next_renewal_date: string;
  hosted_invoice_url: string;
  total_members: number;
  card_last_4: string;
  subscribed_items: UnifySubscriptionPlan[];
}

export interface IRenewalEmailCampaignTriggerPayload extends IBrazeCampaignTriggerPayload {
  trigger_properties: IRenewalEmailCampaignTriggerProperties;
}
