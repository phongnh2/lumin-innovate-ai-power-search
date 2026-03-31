/* eslint-disable camelcase */
import { HttpService } from '@nestjs/axios';
import {
  Injectable, Inject, forwardRef,
} from '@nestjs/common';
import * as csvParser from 'csv-parser';
import {
  capitalize, get, maxBy, snakeCase, isBoolean, sumBy, sortBy, differenceWith,
  differenceBy,
  intersection,
} from 'lodash';
import * as moment from 'moment';
import { map } from 'rxjs/operators';
import { Readable } from 'stream';
import Stripe from 'stripe';
import { v4 as uuid } from 'uuid';

import { PaymentCustomizeParamsBuilder } from 'Common/builder/PaymentParamsBuilder/payment.customize.params.builder';
import { RedisConstants } from 'Common/callbacks/RedisConstants';
import { EmailType } from 'Common/common.interface';
import { CommonConstants } from 'Common/constants/CommonConstants';
import { EMAIL_TYPE, SUBJECT } from 'Common/constants/EmailConstant';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { DefaultErrorCode, ErrorCode } from 'Common/constants/ErrorCode';
import { ErrorMessage } from 'Common/constants/ErrorMessage';
import { FeatureFlagKeys } from 'Common/constants/FeatureFlags';
import {
  MIN_ORGANIZATION_MEMBER, MAX_ORGANIZATION_MEMBER, ORGANIZATION_TEXT,
} from 'Common/constants/OrganizationConstants';
import {
  COUPON_DURATION_TYPE,
  FREE_30_DAYS_BUSINESS_COUPON_ID,
  INVOICE_UPCOMING_NONE,
  PLAN_TEXT,
  PLAN_TEXT_EVENT,
  ORG_PLAN_INDEX,
  SIGN_PLAN_TEXT,
} from 'Common/constants/PaymentConstant';
import { GraphqlException } from 'Common/errors/graphql/GraphException';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { GrpcErrorException } from 'Common/errors/GrpcErrorException';
import { Utils } from 'Common/utils/Utils';

import { AwsService } from 'Aws/aws.service';

import { UpgradeEnterpriseStatus } from 'Admin/admin.enum';
import { AdminPaymentService } from 'Admin/admin.payment.service';
import { AdminService } from 'Admin/admin.service';
import { CreateOldPlanSubscriptionDto } from 'Admin/dtos/admin.dto';
import { IEnterpriseInvoice } from 'Admin/interfaces/admin.interface';
import { CountryCode, CountryCodeEnums } from 'Auth/countryCode.enum';
import { IPurchaseEvent, IRenewalEmailCampaignTriggerProperties } from 'Braze/braze.interface';
import { BrazeService } from 'Braze/braze.service';
import { INITIAL_DOC_STACK_QUANTITY } from 'Document/documentConstant';
import { EmailService } from 'Email/email.service';
import { EnvironmentService } from 'Environment/environment.service';
import { GetStripePlanParam } from 'Environment/interfaces/environment.interface';
import { FeatureFlagService } from 'FeatureFlag/FeatureFlag.service';
import {
  PaymentType,
  PaymentPeriod,
  PaymentPlanSubscription,
  SubscriptionResponse,
  CancelStrategy,
  PreviewUpcomingInvoiceInput,
  PreviewUpcomingInvoicePayload,
  Currency,
  SubscriptionTrialInput,
  CustomerCreationMethod,
  PriceVersion,
  DomainVisibilitySetting,
  TrialInfo,
  PreviewDocStackInvoicePayload,
  OldPlans,
  DocStackPlan,
  PreviewPaymentLinkInvoicePayload,
  CouponValueResponse,
  CustomerInfoResponse,
  Payment,
  UnifySubscriptionPlan,
  UnifySubscriptionProduct,
  PreviewUpcomingSubscriptionInvoicePayload,
  SubscriptionItem,
  GetUnifySubscriptionPayloadSubInfo,
  CancelUnifySubscriptionInputItem,
  DiscountProducts,
  CurrentPlansAmount,
} from 'graphql.schema';
import { HubspotWorkspaceService } from 'Hubspot/hubspot-workspace.service';
import { HubspotWorkspaceEventName, WorkspaceSubscriptionChangedStatus } from 'Hubspot/hubspot.interface';
import { LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { IOrganization, IOrganizationWithRole } from 'Organization/interfaces/organization.interface';
import { OrganizationDocStackService } from 'Organization/organization.docStack.service';
import { InviteUsersSettingEnum, OrganizationRoleEnums } from 'Organization/organization.enum';
import { OrganizationService } from 'Organization/organization.service';
import {
  ICreateCustomer,
} from 'Payment/interfaces/customer.inferface';
import {
  ITrialInfo, MakeFieldRequired, PaymentSchemaInterface, SubScriptionItemSchemaInterface,
} from 'Payment/interfaces/payment.interface';
import {
  SubscriptionStatus,
  PaymentPeriodEnums,
  PaymentPlanEnums,
  PaymentStatusEnums,
  OldTeamPlanName,
  PaymentPlanConvertTeamToOrganizationEnums,
  PaymentIntervalEnums,
  CollectionMethod,
  InvoiceStatus,
  PaymentTypeEnums,
  PlanVersioning,
  IntentStatus,
  PaymentCurrencyEnums,
  DocStackPlanEnums,
  UpgradeInvoicePlanEnums,
  StripeAccountNameEnums,
  PaymentProductEnums,
  UpdateSignWsPaymentActions,
} from 'Payment/payment.enum';
import planPoliciesHandler from 'Payment/Policy/planPoliciesHandler';
import { UpdateSubscriptionParamsBuilder } from 'Payment/Policy/updateSubscriptionParamsBuilder';
import { PaymentUtilsService } from 'Payment/utils/payment.utils';
import { SlackSMBNotificationType } from 'Slack/interfaces/slack.interface';
import { SlackService } from 'Slack/slack.service';
import { IUser, IUserContext, User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

import { InvoiceUtils } from './utils/invoice.utils';
import { STRIPE_CLIENT } from '../Stripe/constants';
import { UpdateUnifySubscriptionParamsBuilder } from './Policy/updateUnifySubscriptionParamsBuilder';

type StripeRequestOptionsWithAccount = MakeFieldRequired<Stripe.RequestOptions, 'stripeAccount'>;

@Injectable()
export class PaymentService {
  public readonly defaultStripeAccountId: string;

  public readonly stripeUSAccountId: string;

  public readonly stripePlatformAccountId: string;

  public readonly stripeNZAccountId: string;

  private readonly isDisabledStripeUS: boolean;

  private smbOrganizationIdsCache: string[] = [];

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    @Inject(forwardRef(() => EmailService)) private readonly emailService: EmailService,
    @Inject(forwardRef(() => OrganizationService)) private readonly organizationService: OrganizationService,
    @Inject(forwardRef(() => AdminService))
    private readonly adminService: AdminService,
    @Inject(forwardRef(() => AdminPaymentService))
    private readonly adminPaymentService: AdminPaymentService,
    @Inject(forwardRef(() => OrganizationDocStackService))
    private readonly organizationDocStackService: OrganizationDocStackService,
    private readonly loggerService: LoggerService,
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => BrazeService))
    private readonly brazeService: BrazeService,
    @Inject(STRIPE_CLIENT) private stripe: Stripe,
    private readonly slackService: SlackService,
    @Inject(forwardRef(() => AwsService))
    private readonly awsService: AwsService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly paymentUtilsService: PaymentUtilsService,
    private readonly hubspotWorkspaceService: HubspotWorkspaceService,
  ) {
    this.defaultStripeAccountId = this.environmentService.getByKey(EnvConstants.STRIPE_NZ_CONNECTED_ACCOUNT);
    this.stripeUSAccountId = this.environmentService.getByKey(EnvConstants.STRIPE_US_CONNECTED_ACCOUNT);
    this.stripeNZAccountId = this.environmentService.getByKey(EnvConstants.STRIPE_NZ_CONNECTED_ACCOUNT);
    this.stripePlatformAccountId = this.environmentService.getByKey(EnvConstants.STRIPE_PLATFORM_ACCOUNT);
    this.isDisabledStripeUS = this.environmentService.getByKey(EnvConstants.STRIPE_US_ACCOUNT_TOGGLE) === 'DISABLED';
  }

  /* eslint-disable global-require, new-cap, no-unused-expressions, no-return-await */
  FREE_TRIAL_TIME = Number(this.environmentService.getByKey(EnvConstants.FREE_TRIAL_TIME));

  FREE_TRIAL_TIME_UNIT = this.environmentService.getByKey(EnvConstants.FREE_TRIAL_TIME_UNIT);

  gaMeasurementId = this.environmentService.getByKey(EnvConstants.GA4_MEASUREMENT_ID);

  gaApiSecret = this.environmentService.getByKey(EnvConstants.GA4_API_SECRET);

  handleStripeError(error: Error, params?: any): any {
    const { stack } = error;
    this.loggerService.error({
      context: 'stripeApiError',
      error: { stack },
      extraInfo: {
        params,
      },
    });

    if ('code' in error) {
      throw GraphErrorException.BadRequest(error.code as string);
    }
    if ('message' in error) {
      throw GraphErrorException.BadRequest(error.message);
    }
    throw GraphErrorException.BadRequest(JSON.stringify(error));
  }

  public attachSourceToCustomer(customerId: string, params: Stripe.CustomerSourceCreateParams, options: StripeRequestOptionsWithAccount)
  :Promise<Stripe.CustomerSource> {
    return this.stripe.customers.createSource(customerId, params, options);
  }

  public attachPaymentMethodToCustomer(
    paymentMethodId: string,
    params: Stripe.PaymentMethodAttachParams,
    options: StripeRequestOptionsWithAccount,
  ): Promise<Stripe.PaymentMethod> {
    return this.stripe.paymentMethods.attach(
      paymentMethodId,
      params,
      options,
    );
  }

  public createSource(params: Stripe.SourceCreateParams, options: StripeRequestOptionsWithAccount): Promise<Stripe.CustomerSource> {
    return this.stripe.sources.create(params, options);
  }

  public retrieveUpcomingInvoice(
    params: Stripe.InvoiceRetrieveUpcomingParams,
    options: StripeRequestOptionsWithAccount,
  ): Promise<Stripe.UpcomingInvoice> {
    return this.stripe.invoices.retrieveUpcoming(params, options).catch((error) => this.handleStripeError(error as Error));
  }

  public retrievePaymentToken({
    tokenId,
    params,
    options,
  } : {
    tokenId: string,
    params?: Stripe.TokenRetrieveParams,
    options: StripeRequestOptionsWithAccount
  }): Promise<Stripe.Token> {
    return this.stripe.tokens.retrieve(tokenId, params, options);
  }

  public retrieveSetupIntent(setupIntentId: string, stripeAccountId: string): Promise<Stripe.SetupIntent> {
    return this.stripe.setupIntents.retrieve(setupIntentId, {}, { stripeAccount: stripeAccountId });
  }

  public retrievePaymentIntent({
    paymentIntentId,
    params,
    options,
  } : {
    paymentIntentId: string,
    params?: Stripe.PaymentIntentRetrieveParams,
    options: StripeRequestOptionsWithAccount,
  }): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId, params, options);
  }

  public getStripeSubscriptionInfo(
    { subscriptionId, params, options }
    : { subscriptionId: string, params?: Stripe.SubscriptionRetrieveParams, options: StripeRequestOptionsWithAccount },
  ): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.retrieve(subscriptionId, params, options);
  }

  public updateStripeSubscription(subscriptionId: string, properties: Stripe.SubscriptionUpdateParams, options: StripeRequestOptionsWithAccount) {
    return this.stripe.subscriptions.update(subscriptionId, properties, options).catch((error) => this.handleStripeError(error as Error));
  }

  public getListSubscriptions(params: Stripe.SubscriptionListParams, options: StripeRequestOptionsWithAccount) {
    return this.stripe.subscriptions.list(params, options);
  }

  public voidStripeInvoice(invoiceId: string, params: Stripe.InvoiceVoidInvoiceParams, options: StripeRequestOptionsWithAccount): Promise<any> {
    return this.stripe.invoices.voidInvoice(invoiceId, params, options);
  }

  public updateStripeCustomer(customerId: string, properties: Stripe.CustomerUpdateParams, options: StripeRequestOptionsWithAccount): any {
    return this.stripe.customers.update(customerId, properties, options);
  }

  public createBalanceTransaction(customerRemoteId: string, properties: Stripe.CustomerBalanceTransactionCreateParams): any {
    return this.stripe.customers.createBalanceTransaction(customerRemoteId, properties);
  }

  public listAllCustomers(params: Stripe.CustomerListParams, options: StripeRequestOptionsWithAccount): Stripe.ApiListPromise<Stripe.Customer> {
    return this.stripe.customers.list(params, options);
  }

  public createStripeCustomer(params: Stripe.CustomerCreateParams, options: StripeRequestOptionsWithAccount) {
    return this.stripe.customers.create(params, options);
  }

  public createCardToken(params: Stripe.TokenCreateParams, options: StripeRequestOptionsWithAccount) {
    return this.stripe.tokens.create(params, options);
  }

  public listPaymentMethods(
    params: Stripe.PaymentMethodListParams,
    options: StripeRequestOptionsWithAccount,
  ): Stripe.ApiListPromise<Stripe.PaymentMethod> {
    return this.stripe.paymentMethods.list(params, options);
  }

  public getAllCustomerPaymentMethods(
    customerRemoteId: string,
    params: Stripe.CustomerListPaymentMethodsParams,
    options: StripeRequestOptionsWithAccount,
  ) {
    return this.stripe.customers.listPaymentMethods(customerRemoteId, params, options);
  }

  public detachPaymentSource(
    customerRemoteId: string,
    sourceId: string,
    params: Stripe.CustomerSourceDeleteParams,
    options: StripeRequestOptionsWithAccount,
  ) {
    return this.stripe.customers.deleteSource(customerRemoteId, sourceId, params, options);
  }

  public detachPaymentMethod(
    paymentMethodId: string,
    params: Stripe.PaymentMethodDetachParams,
    options: StripeRequestOptionsWithAccount,
  ) {
    return this.stripe.paymentMethods.detach(paymentMethodId, params, options);
  }

  public retrieveCustomer(
    customerRemoteId: string,
    params: Stripe.CustomerRetrieveParams,
    options: StripeRequestOptionsWithAccount,
  ) {
    return this.stripe.customers.retrieve(customerRemoteId, params, options);
  }

  public async retrieveStripeCoupon(
    couponCode: string,
    params?: Stripe.CouponRetrieveParams,
    options?: Stripe.RequestOptions,
  ) {
    return this.stripe.coupons.retrieve(couponCode, params, options).catch((error: Error) => this.handleStripeError(error));
  }

  public async retrieveStripePromotionCode(params: {
    code: string;
    stripeAccountId: string;
  }): Promise<Stripe.PromotionCode | null> {
    const { code, stripeAccountId } = params;
    try {
      const result = await this.stripe.promotionCodes.list(
        { code },
        { stripeAccount: stripeAccountId },
      );

      if (result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      this.loggerService.error({
        context: 'retrieveStripePromotionCode',
        error,
        extraInfo: { code, stripeAccountId },
      });
      return null;
    }
  }

  public async createRefund(params: Stripe.RefundCreateParams, options: StripeRequestOptionsWithAccount): Promise<Record<string, any>> {
    try {
      return await this.stripe.refunds.create(params, options);
    } catch (error) {
      this.loggerService.error({
        context: 'createRefund',
        error,
        extraInfo: {
          params,
        },
      });
      return Promise.resolve({});
    }
  }

  public async createNewCustomer(billingEmail: string, orgId: string, stripeAccount: string): Promise<any> {
    const user = await this.userService.findUserByEmail(billingEmail, { _id: 1, name: 1 });
    const customerObj = { email: billingEmail };
    if (user) {
      Object.assign(customerObj, { name: user.name, metadata: { lumin_user_id: user._id } });
    } else {
      const organization = await this.organizationService.getOrgById(orgId, { ownerId: 1 });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const owner = await this.userService.findUserById(organization.ownerId);
      if (owner) {
        Object.assign(customerObj, { name: owner.name, metadata: { lumin_user_id: owner._id } });
      }
    }
    return this.stripe.customers.create(customerObj, { stripeAccount });
  }

  public retrieveCharge(
    data: {chargeId: string, params?: Stripe.ChargeRetrieveParams, options: StripeRequestOptionsWithAccount },
  ) {
    const { chargeId, params, options } = data;
    return this.stripe.charges.retrieve(chargeId, params, options);
  }

  public retrieveChargeList(customerId: string, options: StripeRequestOptionsWithAccount): Stripe.ApiListPromise<Stripe.Charge> {
    return this.stripe.charges.list({ customer: customerId }, options);
  }

  public getPlan(planId: string, stripeAccountId: string): Promise<any> {
    return this.stripe.plans.retrieve(planId, null, { stripeAccount: stripeAccountId });
  }

  public createStripeSubscription(
    subscription: Stripe.SubscriptionCreateParams & { description?: string },
    options: StripeRequestOptionsWithAccount,
  ): Promise<any> {
    return this.stripe.subscriptions.create(subscription, options).catch((error) => this.handleStripeError(error as Error));
  }

  public createInvoice(params: Stripe.InvoiceCreateParams, options: StripeRequestOptionsWithAccount): Promise<Record<string, any>> {
    return this.stripe.invoices.create(params, options);
  }

  public getInvoicesFromStripe() {
    return this.stripe.invoices.list();
  }

  public updateInvoice(
    invoiceId: string,
    properties: Stripe.InvoiceUpdateParams,
    options: StripeRequestOptionsWithAccount,
  ): Promise<Record<string, any>> {
    return this.stripe.invoices.update(invoiceId, properties, options);
  }

  public finalizeInvoice(data:
    { invoiceId: string, params?: Stripe.InvoiceFinalizeInvoiceParams, options: StripeRequestOptionsWithAccount }): Promise<Stripe.Invoice> {
    const { invoiceId, params, options } = data;
    return this.stripe.invoices.finalizeInvoice(invoiceId, params, options);
  }

  public sendInvoice(
    invoiceId: string,
    params: Stripe.InvoiceSendInvoiceParams,
    options: StripeRequestOptionsWithAccount,
  ): Promise<Record<string, any>> {
    return this.stripe.invoices.sendInvoice(invoiceId, params, options);
  }

  payInvoice(data: { invoiceId: string, params?: Stripe.InvoicePayParams, options: StripeRequestOptionsWithAccount }): Promise<Stripe.Invoice> {
    const { invoiceId, params, options } = data;
    return this.stripe.invoices.pay(invoiceId, params, options);
  }

  public cancelStripeSubscription(
    subscriptionId: string,
    params: Stripe.SubscriptionCancelParams,
    options: StripeRequestOptionsWithAccount,
  ): Promise<Record<string, any>> {
    return this.stripe.subscriptions.cancel(subscriptionId, params, options);
  }

  public updateSubscriptionItem(
    id: string,
    params: Stripe.SubscriptionItemUpdateParams,
    options: StripeRequestOptionsWithAccount,
  ) {
    return this.stripe.subscriptionItems.update(id, params, options);
  }

  public createSubscriptionItem(params: Stripe.SubscriptionItemCreateParams, options: StripeRequestOptionsWithAccount): Promise<Record<string, any>> {
    return this.stripe.subscriptionItems.create(params, options);
  }

  public async retrievePaymentMethod(paymentMethodId: string, options: StripeRequestOptionsWithAccount): Promise<Stripe.PaymentMethod> {
    return this.stripe.paymentMethods.retrieve(paymentMethodId, options);
  }

  public getMainSubscriptionItem(subscription: Record<string, any>, planRemoteId: string): Record<string, any> {
    const subscriptionItems = get(subscription, 'items.data');
    const mainItem = subscriptionItems.find((item) => get(item, 'price.id') === planRemoteId);

    if (!mainItem) {
      this.loggerService.warn({
        context: this.getMainSubscriptionItem.name,
        message: 'Not found main subscription item',
        extraInfo: {
          subscriptionRemoteId: subscription.id,
        },
      });
    }

    return mainItem;
  }

  public async upgradeBusinessSubscription(input, target: IOrganization): Promise<any> {
    const {
      plan, period, quantity, sourceId, couponCode = '', blockedPrepaidCardOnTrial,
    } = input;
    const { payment } = target;
    const { currency } = payment;
    const stripeAccountId = this.getStripeAccountId({ payment, isAdminCharge: true });
    const validateSubscription = await this.isAllowUpgradeBusiness(target, { period, quantity, plan });
    if (!validateSubscription.isAllow) {
      throw GraphErrorException.BadRequest(validateSubscription.message);
    }
    if (couponCode === FREE_30_DAYS_BUSINESS_COUPON_ID) {
      const isValidCoupon = await this.validateFree30Coupon({
        orgId: target._id,
        incomingPlan: plan,
        incomingPeriod: period,
        stripeAccountId,
      });
      if (!isValidCoupon) {
        throw GraphErrorException.BadRequest('Coupon is invalid');
      }
    }
    if (!payment.subscriptionRemoteId) {
      try {
        const newSubscriptionId = await this.recoverSubscriptionId(target, PaymentType.ORGANIZATION);
        payment.subscriptionRemoteId = newSubscriptionId;
      } catch (error) {
        throw GraphErrorException.BadRequest('There is an unexpected error. Contact us to solve it.');
      }
    }
    if (sourceId) {
      await this.attachPaymentMethod(payment.customerRemoteId, sourceId as string, payment.stripeAccountId);
      if (blockedPrepaidCardOnTrial) {
        this.updateStripeCustomer(
          payment.customerRemoteId,
          { metadata: { blockedPrepaidCardOnTrial: 'true' } },
          { stripeAccount: stripeAccountId },
        );
      }
    }

    const oldSubscription = await this.getStripeSubscriptionInfo({
      subscriptionId: payment.subscriptionRemoteId,
      options: { stripeAccount: stripeAccountId },
    });
    const planRemoteId = this.getStripePlanWithOldTeam(plan, period, currency, payment.planRemoteId);

    const subscriptionItem = this.getNextSubscriptionItemParams({
      currentPayment: payment,
      nextPayment: {
        period,
        quantity,
        plan,
        currency: currency as Currency,
      },
      paymentType: PaymentType.ORGANIZATION,
      stripeAccountId,
    });

    const proration_date = Math.floor(Date.now() / 1000);
    let subscriptionObj: Stripe.SubscriptionUpdateParams = {
      items: [{ id: get(oldSubscription, 'items.data[0].id'), ...subscriptionItem }],
      proration_date,
      proration_behavior: 'always_invoice',
      payment_behavior: 'error_if_incomplete',
      billing_cycle_anchor: 'now',
      cancel_at_period_end: false,
      expand: ['latest_invoice'],
    };
    subscriptionObj = await this.applyCouponCode(couponCode as string, subscriptionObj, stripeAccountId);
    let subscription = null;
    try {
      subscription = await this.stripe.subscriptions.update(oldSubscription.id, subscriptionObj, { stripeAccount: stripeAccountId });
    } catch (error) {
      throw GraphErrorException.BadRequest('Payment failed');
    }
    const isUpgradeQuantity = period === payment.period;
    const isSubscriptionActived = subscription?.status?.toUpperCase() === PaymentStatusEnums.ACTIVE;
    const updatePayment = {
      customerRemoteId: payment.customerRemoteId,
      subscriptionRemoteId: subscription?.id,
      planRemoteId: isUpgradeQuantity ? payment.planRemoteId : planRemoteId,
      type: plan,
      period,
      quantity,
      status: isSubscriptionActived ? PaymentStatusEnums.ACTIVE : PaymentStatusEnums.UPGRADING,
      currency,
      trialInfo: null,
      stripeAccountId,
    };
    if (couponCode === FREE_30_DAYS_BUSINESS_COUPON_ID) {
      this.updateStripeCustomer(
        payment.customerRemoteId,
        { metadata: { used_one_month_free: 'true' } },
        { stripeAccount: stripeAccountId },
      );
    }

    // turn off auto approve when upgrade org
    const organization = await this.organizationService.updateOrganizationProperty(
      target._id,
      {
        payment: updatePayment,
        'settings.domainVisibility': DomainVisibilitySetting.VISIBLE_NEED_APPROVE,
        'settings.inviteUsersSetting': InviteUsersSettingEnum.ADMIN_BILLING_CAN_INVITE,
      },
    );

    const receiverEmail = (await this.organizationService.getOrganizationMemberByRole(
      target._id,
      [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR],
    )).map((user) => user.email);
    this.sendEmailUpradeOrg({
      isSubscriptionActived,
      organization,
      oldPayment: payment,
      newPayment: updatePayment,
      receiverEmail,
      invoice: subscription?.latest_invoice,
    });
    return {
      message: 'Upgrade Plan Success!',
      statusCode: 200,
      data: updatePayment,
      organization,
    };
  }

  public async sendEmailUpradeOrg({
    isSubscriptionActived,
    isUpgradeMultiProducts = false,
    receiverEmail,
    organization,
    oldPayment,
    newPayment,
    invoice,
    isUpgradeSignProduct = false,
  }: {
    isSubscriptionActived: boolean,
    isUpgradeMultiProducts?: boolean,
    receiverEmail: string[],
    organization: IOrganization,
    newPayment: Pick<PaymentSchemaInterface, 'type' | 'quantity' | 'period' | 'subscriptionRemoteId' | 'stripeAccountId' | 'subscriptionItems'>,
    oldPayment: Partial<PaymentSchemaInterface>,
    invoice: Record<string, any>,
    isUpgradeSignProduct?: boolean,
  }): Promise<void> {
    if (isSubscriptionActived) {
      const { subscriptionItems: oldSubscriptionItems = [] } = oldPayment;
      const { subscriptionItems: newSubscriptionItems = [] } = newPayment;
      const isSameTier = newSubscriptionItems.every(
        (newItem) => oldSubscriptionItems.find(
          (oldItem) => oldItem.id === newItem.id && oldItem.paymentType === newItem.paymentType && oldItem.quantity === newItem.quantity,
        ),
      );
      const isUpgradeAnnual = newPayment.period === PaymentPeriodEnums.ANNUAL && newPayment.period !== oldPayment.period;
      const attachments = await this.getInvoiceEmailAttachment({ invoice: invoice as Stripe.Invoice });
      if (isSameTier && isUpgradeAnnual) {
        this.emailService.sendEmailHOF(
          EMAIL_TYPE.ORGANIZATION_UPGRADE_MONTHLY_TO_ANNUAL,
          receiverEmail,
          {
            subject: SUBJECT[EMAIL_TYPE.ORGANIZATION_UPGRADE_MONTHLY_TO_ANNUAL.description].replace('#{orgName}', organization.name),
            orgName: organization.name,
            domain: organization.url,
            orgId: organization._id,
          },
          attachments,
        );
        return;
      }

      if (isUpgradeMultiProducts) {
        const pdfItem = this.paymentUtilsService.filterSubItemByProduct(newSubscriptionItems, PaymentProductEnums.PDF)[0];
        const signItem = this.paymentUtilsService.filterSubItemByProduct(newSubscriptionItems, PaymentProductEnums.SIGN)[0];
        this.emailService.sendEmailHOF(
          EMAIL_TYPE.ORGANIZATION_UPGRADE_MULTI_PRODUCTS,
          receiverEmail,
          {
            subject: SUBJECT[EMAIL_TYPE.ORGANIZATION_UPGRADE_MULTI_PRODUCTS.description].replace('#{orgName}', organization.name),
            orgName: organization.name,
            domain: organization.url,
            orgId: organization._id,
            pdfPlan: PLAN_TEXT[pdfItem.paymentType],
            signPlan: SIGN_PLAN_TEXT[signItem.paymentType],
          },
          attachments,
        );
        return;
      }
      if (isUpgradeSignProduct) {
        const signSubItem = this.paymentUtilsService.filterSubItemByProduct(newSubscriptionItems, PaymentProductEnums.SIGN)[0];
        const oldSignSubItem = this.paymentUtilsService.filterSubItemByProduct(oldSubscriptionItems, PaymentProductEnums.SIGN)[0];
        if (!oldSignSubItem) {
          this.emailService.sendEmailHOF(
            EMAIL_TYPE.WELCOME_ORGANIZATION_SIGN_PRO,
            receiverEmail,
            {
              subject: SUBJECT[EMAIL_TYPE.WELCOME_ORGANIZATION_SIGN_PRO.description].replace('#{orgName}', organization.name),
              orgName: organization.name,
              domain: organization.url,
              orgId: organization._id,
              numberSeat: signSubItem.quantity,
            },
            attachments,
          );
          return;
        }
        this.emailService.sendEmailHOF(
          EMAIL_TYPE.SIGN_SUBSCRIPTION_PURCHASE_MORE_SEATS,
          receiverEmail,
          {
            subject: SUBJECT[EMAIL_TYPE.SIGN_SUBSCRIPTION_PURCHASE_MORE_SEATS.description].replace('#{orgName}', organization.name),
            orgName: organization.name,
            domain: organization.url,
            orgId: organization._id,
            oldPeriodLabel: capitalize(oldSignSubItem.period),
            oldSeats: oldSignSubItem.quantity,
            newPeriodLabel: capitalize(signSubItem.period),
            newSeats: signSubItem.quantity,
          },
        );
        return;
      }
      const oldPeriod = capitalize(oldPayment.period);
      const newPeriod = capitalize(newPayment.period);
      const isOldPlan = (plan: PaymentPlanEnums) => [PaymentPlanEnums.BUSINESS, PaymentPlanEnums.ENTERPRISE].includes(plan);

      const emailType = isOldPlan(newPayment.type as PaymentPlanEnums)
        ? EMAIL_TYPE.ORGANIZATION_UPGRADE_SUBSCRIPTION
        : EMAIL_TYPE.ORGANIZATION_UPGRADE_NEW_PRICING_SUBSCRIPTION;

      const getEmailData = () => {
        if (isOldPlan(newPayment.type as PaymentPlanEnums)) {
          return {
            subject: SUBJECT[EMAIL_TYPE.ORGANIZATION_UPGRADE_SUBSCRIPTION.description].replace('#{orgName}', organization.name),
            orgName: organization.name,
            domain: organization.url,
            orgId: organization._id,
            isOneMember: oldPayment.quantity === 1,
            oldSize: oldPayment.quantity,
            newSize: newPayment.quantity,
            oldPeriod,
            newPeriod,
          };
        }
        const oldDocstack = planPoliciesHandler
          .from({ plan: oldPayment.type, period: oldPayment.period })
          .getDocStack(oldPayment.quantity);
        const newDocstack = planPoliciesHandler
          .from({ plan: newPayment.type, period: newPayment.period })
          .getDocStack(newPayment.quantity);
        return {
          subject: SUBJECT[EMAIL_TYPE.ORGANIZATION_UPGRADE_NEW_PRICING_SUBSCRIPTION.description].replace('#{orgName}', organization.name),
          orgName: organization.name,
          orgId: organization._id,
          oldPeriod,
          newPeriod,
          oldDocstack: isOldPlan(oldPayment.type as PaymentPlanEnums) ? 0 : oldDocstack,
          newDocstack,
          oldPlan: PLAN_TEXT[oldPayment.type],
          newPlan: PLAN_TEXT[newPayment.type],
        };
      };

      this.emailService.sendEmailHOF(
        emailType as EmailType,
        receiverEmail,
        getEmailData(),
        attachments,
      );
    }
  }

  public getStripePlanRemoteId(params: Omit<GetStripePlanParam, 'stripeAccountName'> & { stripeAccountId: string }): string {
    const accountIdToNameMapping = {
      [this.stripeNZAccountId]: StripeAccountNameEnums.NZ_ACCOUNT,
      [this.stripeUSAccountId]: StripeAccountNameEnums.US_ACCOUNT,
    };
    return this.environmentService.getStripePlan({ ...params, stripeAccountName: accountIdToNameMapping[params.stripeAccountId] });
  }

  public getStripePlanWithOldTeam(plan, period, currency, currentPlanRemoteId, isDiscount: boolean = false) {
    let planRemoteId = this.getStripePlanRemoteId({
      plan, period, currency, stripeAccountId: this.stripeNZAccountId,
    });

    // check is team convert to organization
    const oldTeamPlans = this.getOldTeamPlans();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const isUsingOldTeamPlan = oldTeamPlans.includes(currentPlanRemoteId);
    if (isUsingOldTeamPlan) {
      planRemoteId = period === PaymentPeriod.ANNUAL
        ? this.getStripePlanRemoteId({
          plan: PaymentPlanConvertTeamToOrganizationEnums.TEAM_TO_ORGANIZATION_ANNUAL,
          period,
          currency,
          discount: isDiscount,
          stripeAccountId: this.stripeNZAccountId,
        })
        : this.getStripePlanRemoteId({
          plan: PaymentPlanConvertTeamToOrganizationEnums.TEAM_TO_ORGANIZATION_MONTHLY,
          period,
          currency,
          discount: isDiscount,
          stripeAccountId: this.stripeNZAccountId,
        });
    }
    return planRemoteId;
  }

  public getNextSubscriptionItemParams({
    currentPayment,
    nextPayment,
    // paymentType,
    isDiscount = false,
  } : {
    currentPayment: PaymentSchemaInterface | Partial<PaymentSchemaInterface>,
    nextPayment: {
      period: PaymentPeriod,
      quantity: number,
      plan: PaymentPlanSubscription,
      currency: Currency
    },
    stripeAccountId: string,
    paymentType: PaymentType,
    isDiscount?: boolean
  }): { quantity: number, price?: string } {
    const { period: currentPeriod, planRemoteId, stripeAccountId } = currentPayment;
    const {
      quantity: upcomingQuantity,
      period: upcomingPeriod,
      plan: upcomingPlan,
      currency,
    } = nextPayment;
    const oldTeamPlans = this.getOldTeamPlans();
    const isUsingOldTeamPlan = oldTeamPlans.includes(planRemoteId);
    if (currentPeriod === PaymentPeriod.ANNUAL && isUsingOldTeamPlan) {
      return {
        price: this.getStripePlanRemoteId({
          plan: PaymentPlanConvertTeamToOrganizationEnums.TEAM_TO_ORGANIZATION_ANNUAL,
          period: PaymentPeriod.ANNUAL,
          currency,
          stripeAccountId,
        }),
        quantity: upcomingQuantity,
      };
    }
    const isUpgradeQuantity = currentPeriod === upcomingPeriod;
    const upcomingPlanRemoteId = this.getStripePlanRemoteId({
      plan: upcomingPlan, period: upcomingPeriod, currency, discount: isDiscount, stripeAccountId,
    });

    return {
      ...((!isUpgradeQuantity) && { price: upcomingPlanRemoteId }),
      quantity: upcomingQuantity,
    };
  }

  public async isAllowUpgradeBusiness(
    organization: IOrganization,
    { period, quantity, plan }: { period: PaymentPeriod, quantity: number, plan: PaymentPlanSubscription },
  )
    : Promise<{ message: string, isAllow: boolean }> {
    const { payment } = organization;
    const totalOrgMember = await this.organizationService.getTotalMemberInOrg(organization._id);
    const isUpgradePlan = payment.period === PaymentPeriodEnums.MONTHLY && period === PaymentPeriod.ANNUAL;
    const isInvalidQuantity = quantity < MIN_ORGANIZATION_MEMBER
      || quantity > MAX_ORGANIZATION_MEMBER
      || quantity < totalOrgMember
      || (payment.quantity > quantity && !isUpgradePlan);
    if (isInvalidQuantity) {
      return {
        message: 'Invalid quantity',
        isAllow: false,
      };
    }
    if (!isInvalidQuantity && payment.type === PaymentPlanEnums.FREE) {
      return {
        message: 'Go premium now',
        isAllow: true,
      };
    }
    if (plan !== PaymentPlanSubscription.BUSINESS) {
      return {
        message: 'Incorrect plan',
        isAllow: false,
      };
    }
    if (payment.type === PaymentPlanEnums.ENTERPRISE) {
      return {
        message: 'You are using Enterprise plan',
        isAllow: false,
      };
    }
    if (payment.quantity === quantity && payment.period === period) {
      return {
        message: 'You are in current plan',
        isAllow: false,
      };
    }
    if (payment.period === PaymentPeriodEnums.ANNUAL && period === PaymentPeriod.MONTHLY) {
      return {
        message: 'You can\'t upgrade to monthly period',
        isAllow: false,
      };
    }

    return {
      message: 'Perfectly',
      isAllow: true,
    };
  }

  private async sendMailAfterUpgradeSubscription({ period, payment, updatePayment }) {
    const customerObj = await this.stripe.customers.retrieve(payment.customerRemoteId as string) as Stripe.Customer;
    const isUpgradeSameType = payment.type === updatePayment.type;
    const toAnnualPeriod = period === PaymentPeriodEnums.ANNUAL;
    const toMonthlyPeriod = period === PaymentPeriodEnums.MONTHLY;
    const isProfessionalType = updatePayment.type === PaymentPlanEnums.PROFESSIONAL;
    const fromMonthly = payment.period === PaymentPeriodEnums.MONTHLY;
    const fromAnnual = payment.period === PaymentPeriodEnums.ANNUAL;
    const fromMonthlyToAnnualPeriod = toAnnualPeriod && fromMonthly;
    const fromAnnualToAnnualPeriod = toAnnualPeriod && fromAnnual;

    if (isUpgradeSameType && isProfessionalType) {
      this.emailService.sendEmailHOF(
        EMAIL_TYPE.UPGRADE_ANNUAL_PLAN,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        [customerObj.email],
        {
          fromPlan: 'Professional Monthly',
          toPlan: 'Professional Annual',
          billedPlan: 'annually',
          subject: 'Your Professional Monthly subscription has been upgraded to the Professional Annual plan',
        },
      );
      return;
    }

    switch (true) {
      case fromMonthlyToAnnualPeriod:
        this.emailService.sendEmailHOF(
          EMAIL_TYPE.UPGRADE_ANNUAL_PLAN,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          [customerObj.email],
          {
            fromPlan: 'Personal Monthly',
            toPlan: 'Professional Annual',
            billedPlan: 'annually',
            subject: 'Your Personal Monthly subscription has been upgraded to the Professional Annual plan',
          },
        );
        break;
      case fromAnnualToAnnualPeriod:
        this.emailService.sendEmailHOF(
          EMAIL_TYPE.UPGRADE_ANNUAL_PLAN,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          [customerObj.email],
          {
            fromPlan: 'Personal Annual',
            toPlan: 'Professional Annual',
            billedPlan: 'annually',
            subject: 'Your Personal Annual subscription has been upgraded to the Professional Annual plan',
          },
        );
        break;
      case toMonthlyPeriod:
        this.emailService.sendEmailHOF(
          EMAIL_TYPE.UPGRADE_ANNUAL_PLAN,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          [customerObj.email],
          {
            fromPlan: 'Personal Monthly',
            toPlan: 'Professional Monthly',
            billedPlan: 'monthly',
            subject: 'Your Personal Monthly subscription has been upgraded to the Professional Monthly plan',
          },
        );
        break;

      default:
        break;
    }
  }

  private async applyCouponCode(couponCode: string, subscriptionObj, stripeAccount: string) {
    if (couponCode) {
      try {
        const coupon = await this.stripe.coupons.retrieve(couponCode, null, { stripeAccount });
        subscriptionObj.coupon = coupon.id;
      } catch (error) {
        this.loggerService.error({
          error,
          extraInfo: {
            couponCode,
            subscriptionObj,
          },
        });
      }
    }
    return subscriptionObj;
  }

  public async cancelFreeTrial(
    data: { targetId: string, subscriptionRemoteId: string },
  ): Promise<IOrganization> {
    const {
      targetId, subscriptionRemoteId,
    } = data;
    const { payment: oldPayment } = await this.organizationService.getOrgById(targetId, { payment: 1 });
    const canceledSubscription = await this.cancelStripeSubscription(subscriptionRemoteId, null, { stripeAccount: oldPayment.stripeAccountId });
    if (canceledSubscription.status !== 'canceled') {
      throw GraphErrorException.InternalServerError('Delete subscription fail');
    }
    const orgPayment = await this.organizationService.updateOrganizationProperty(targetId, {
      payment: {
        ...this.getFreePaymentPayload(oldPayment),
        trialInfo: oldPayment.trialInfo,
        // Need to keep subscriptionRemoteId to compare in subscription deleted hook
        subscriptionRemoteId: oldPayment.subscriptionRemoteId,
      },
      'settings.inviteUsersSetting': InviteUsersSettingEnum.ANYONE_CAN_INVITE,
    });

    await this.organizationService.updateSettingForCanceledBusinessPlan({
      paymentType: oldPayment.type as PaymentPlanEnums,
      paymentStatus: oldPayment.status as PaymentStatusEnums,
      organization: orgPayment,
    });
    this.postSmbNotification({
      organization: orgPayment,
      notificationType: SlackSMBNotificationType.CANCELED_TRIAL,
    });
    return orgPayment;
  }

  public getOldTeamPlans(): string[] {
    return OldTeamPlanName.map((planName) => this.environmentService.getByKey(planName)).filter(Boolean);
  }

  public getPriceVersion(planRemoteId: string): PriceVersion {
    if (!planRemoteId) {
      return null;
    }
    return ((Object.keys(PlanVersioning) as PriceVersion[])).filter((version) => {
      const remoteIds = PlanVersioning[version].map((planName) => this.environmentService.getByKey(planName)).filter(Boolean);
      return remoteIds.includes(planRemoteId);
    })[0];
  }

  public setupReminderSubscriptionEmail(orgId: string, timeSubscriptionWillExpired: string): void {
    this.redisService.setMailReminderSubscriptionExpired({ orgId, timeOffset: 3, timeSubscriptionWillExpired });
    this.redisService.setMailReminderSubscriptionExpired({ orgId, timeOffset: 1, timeSubscriptionWillExpired });
  }

  public async recoverSubscriptionId(target: User|IOrganization, type: PaymentType): Promise<string> {
    const targetId = target._id;
    const { payment } = target;
    const { customerRemoteId = '' } = payment;
    const customer = await this.stripe.customers.retrieve(customerRemoteId, {
      expand: ['subscriptions.data'],
    }, { stripeAccount: payment.stripeAccountId });
    const subscriptionId = get(customer, 'subscriptions.data[0].id', '');
    switch (type) {
      case PaymentType.INDIVIDUAL: {
        if (!subscriptionId) {
          await this.userService.updateUserPropertyById(targetId, {
            payment: {
              customerRemoteId,
              type: PaymentPlanEnums.FREE,
            },
          });
          return '';
        }
        await this.userService.updateUserPropertyById(targetId, {
          'payment.subscriptionRemoteId': subscriptionId,
        });
        break;
      }
      case PaymentType.ORGANIZATION: {
        if (!subscriptionId) {
          await this.organizationService.updateOrganizationProperty(targetId, {
            payment: {
              customerRemoteId,
              type: PaymentPlanEnums.FREE,
              trialInfo: payment.trialInfo,
            },
          });
          return '';
        }
        await this.organizationService.updateOrganizationProperty(targetId, {
          'payment.subscriptionRemoteId': subscriptionId,
        });
        break;
      }
      default: break;
    }
    return subscriptionId;
  }

  public async getFinishInvoices(payment: PaymentSchemaInterface, limit: number = 100) : Promise<any[]> {
    if (!payment?.customerRemoteId) return [];

    const invoices = await this.stripe.invoices.list({ customer: payment.customerRemoteId, limit }, { stripeAccount: payment.stripeAccountId });

    return (invoices.data || []).reduce((list: any[], invoice) => {
      const isInvoiceFinished = invoice.status === 'void' || invoice.status === 'paid';
      if (isInvoiceFinished) {
        list.push({ ...invoice, downloadLink: invoice.invoice_pdf, total: invoice.amount_due || invoice.total });
      }
      return list;
    }, []);
  }

  public async getFailedInvoicesFromLastPaid(payment: PaymentSchemaInterface, limit: number = 10): Promise<Stripe.Invoice[]> {
    if (!payment?.customerRemoteId || !payment?.subscriptionRemoteId) {
      return [];
    }

    try {
      // Get invoices until we find a paid one or no more pages
      const fetchInvoicesUntilPaid = async (startingAfter?: string): Promise<Stripe.Invoice[]> => {
        const invoices = await this.stripe.invoices.list(
          {
            customer: payment.customerRemoteId,
            subscription: payment.subscriptionRemoteId,
            limit,
            ...(startingAfter && { starting_after: startingAfter }),
          },
          { stripeAccount: payment.stripeAccountId },
        );

        if (!invoices.data?.length) {
          return [];
        }

        // Check if we found a paid invoice in this batch
        const paidInvoiceIndex = invoices.data.findIndex((invoice) => invoice.status === 'paid');
        if (paidInvoiceIndex !== -1 || !invoices.has_more) {
          return invoices.data;
        }

        const nextInvoices = await fetchInvoicesUntilPaid(invoices.data[invoices.data.length - 1].id);
        return [...invoices.data, ...nextInvoices];
      };

      const allInvoices = await fetchInvoicesUntilPaid();
      if (allInvoices.length === 0) {
        return [];
      }

      // sort invoices by created date (oldest first)
      allInvoices.sort((a, b) => a.created - b.created);

      // find the last paid invoice for this subscription
      const lastPaidInvoiceIndex = allInvoices.findIndex(
        (invoice) => invoice.subscription === payment.subscriptionRemoteId && invoice.status === 'paid',
      );

      const invoicesToCheck = lastPaidInvoiceIndex === -1
        ? allInvoices
        : allInvoices.slice(lastPaidInvoiceIndex);

      // return failed invoices (open status with amount due > 0)
      return invoicesToCheck.filter((invoice) => ['open', 'draft'].includes(invoice.status) && invoice.amount_due > 0);
    } catch (error) {
      this.loggerService.error({
        context: 'getFailedInvoicesFromLastPaid',
        error,
      });
      return [];
    }
  }

  public async cancelPlan(subscriptionRemoteId: string, strategy: string, stripeAccount: string): Promise<void> {
    if (strategy === CancelStrategy.IMMEDIATELY) {
      await this.cancelStripeSubscription(subscriptionRemoteId, null, { stripeAccount });
    } else {
      await this.stripe.subscriptions.update(subscriptionRemoteId, {
        cancel_at_period_end: true,
      }, { stripeAccount });
    }
  }

  public getInvoice(data: {
    invoiceId: string,
    params?: Stripe.InvoiceRetrieveParams,
    options: StripeRequestOptionsWithAccount
  }) : Promise<Stripe.Invoice> {
    const { invoiceId, params, options } = data;
    return this.stripe.invoices.retrieve(invoiceId, params, options);
  }

  public getInvoices(params: Stripe.InvoiceListParams, options: StripeRequestOptionsWithAccount) : Promise<any> {
    return this.stripe.invoices.list(params, options);
  }

  public isUpgradeEnterpriseOrganization(productId: string): boolean {
    const enterpriseProductId = this.environmentService.getByKey(EnvConstants.STRIPE_ENTERPRISE_PRODUCT);
    return enterpriseProductId === productId;
  }

  public getPeriodFromInterval(interval: PaymentIntervalEnums): PaymentPeriodEnums {
    const periodPlanMapping = {
      [PaymentIntervalEnums.MONTH]: PaymentPeriodEnums.MONTHLY,
      [PaymentIntervalEnums.YEAR]: PaymentPeriodEnums.ANNUAL,
    };

    return periodPlanMapping[interval];
  }

  public async updateOrgToEnterpriseOrDocStackPlan({ organization, invoice, paymentPlan } : {
    organization: IOrganization, invoice: Record<string, any>, paymentPlan?: DocStackPlanEnums }): Promise<IOrganization> {
    const {
      customer: customerId, customer_email: billingEmail, currency,
    } = invoice;
    const { subscription: subscriptionId, quantity, plan } = get(invoice, 'lines.data[0]', {});
    const planId = plan.id;
    const stripeAccountId = this.getStripeAccountId({ payment: organization.payment, isAdminCharge: true });
    await this.updateStripeSubscription(subscriptionId as string, {
      collection_method: CollectionMethod.CHARGE_AUTOMATICALLY,
    }, { stripeAccount: stripeAccountId });

    const inviteUsersSettingValue = paymentPlan
      ? this.organizationService.getDefaultValueInviteUsersSetting(paymentPlan as unknown as PaymentPlanEnums)
      : InviteUsersSettingEnum.ADMIN_BILLING_CAN_INVITE;

    return this.organizationService.updateOrganizationById(organization._id, {
      billingEmail,
      payment: {
        type: paymentPlan || PaymentPlanEnums.ENTERPRISE,
        customerRemoteId: customerId,
        subscriptionRemoteId: subscriptionId,
        planRemoteId: planId,
        period: this.getPeriodFromInterval(plan.interval as PaymentIntervalEnums),
        status: PaymentStatusEnums.ACTIVE,
        quantity,
        currency: currency.toUpperCase(),
        trialInfo: organization.payment.trialInfo,
        stripeAccountId,
      },
      'settings.inviteUsersSetting': inviteUsersSettingValue,
    });
  }

  public async upgradeNonFreeOrgToEnterprise(organization: IOrganization, invoiceData: Record<string, any>): Promise<IOrganization> {
    const newOrg = await this.updateOrgToEnterpriseOrDocStackPlan({ organization, invoice: invoiceData });

    // cancel previous Business plan
    const { payment: { subscriptionRemoteId, customerRemoteId, stripeAccountId } } = organization;
    await this.cancelStripeSubscription(subscriptionRemoteId, {
      prorate: true,
    }, { stripeAccount: stripeAccountId });
    // create invoice and finalize
    const refundInvoice = await this.createInvoice({ customer: customerRemoteId }, { stripeAccount: stripeAccountId });
    await this.finalizeInvoice({ invoiceId: refundInvoice.id as string, options: { stripeAccount: stripeAccountId } });

    // turn off auto approve when upgrade org
    return this.organizationService.updateOrganizationById(newOrg._id, {
      'settings.domainVisibility': DomainVisibilitySetting.VISIBLE_NEED_APPROVE,
      'settings.inviteUsersSetting': InviteUsersSettingEnum.ADMIN_BILLING_CAN_INVITE,
    });
  }

  public async handleOrgEnterpriseOrDocStackSubscriptionUpdate({
    subscription,
    enterpriseInvoice,
    stripeAccount,
  } : {
    subscription: Stripe.Subscription,
    enterpriseInvoice: IEnterpriseInvoice
    stripeAccount: string
  }): Promise<void> {
    const { latest_invoice: invoiceId, id: subscriptionId } = subscription;
    const subscriptionItemId = get(subscription, 'items.data[0].id');
    const { orgId } : { orgId: string } = enterpriseInvoice;

    if (subscription.status === SubscriptionStatus.PAST_DUE) {
      const updatedInvoice = await this.adminService.updateInvoiceStatusByOrgId(orgId, UpgradeEnterpriseStatus.EXPIRED);

      // this org has old premium plan or not
      if (updatedInvoice && ![
        UpgradeInvoicePlanEnums.ORG_STARTER,
        UpgradeInvoicePlanEnums.ORG_PRO,
        UpgradeInvoicePlanEnums.ORG_BUSINESS,
      ].includes(updatedInvoice.plan)) {
        this.organizationService.getOrgById(orgId)
          .then(async (organization) => {
            const { payment } = organization;
            // update to old billing email
            if (payment.type !== PaymentPlanEnums.FREE) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              const orgOwner = await this.userService.findUserById(organization.ownerId);
              this.updateStripeCustomer(payment.customerRemoteId, {
                email: orgOwner.email,
              }, { stripeAccount });
            }
            this.adminPaymentService.sendEmailAndCreateEventOnPaymentLinkExpired(organization);
          });
        this.cancelStripeSubscription(subscriptionId, null, { stripeAccount });
      } else { // has premium plan before, roll back this org to this plan
        await this.adminPaymentService.rollbackToOldPayment({
          orgId,
          subscriptionItemId,
          stripeAccount,
        });
      }
      this.voidStripeInvoice(invoiceId as string, null, { stripeAccount });
    }
  }

  public async verifyCouponCode(code: string, stripeAccountId: string): Promise<{data: Record<string, any>, error?: GraphqlException}> {
    try {
      const couponData = await this.stripe.coupons.retrieve(code, null, { stripeAccount: stripeAccountId });
      if (!couponData.valid) {
        return { data: null, error: GraphErrorException.NotFound('Coupon code is invalid', ErrorCode.Payment.INVALID_COUPON_CODE) };
      }
      return { data: couponData };
    } catch (error) {
      return { data: null, error: GraphErrorException.NotFound('Coupon code is invalid', ErrorCode.Payment.INVALID_COUPON_CODE) };
    }
  }

  public async previewUpcomingInvoice(input: PreviewUpcomingInvoiceInput): Promise<PreviewUpcomingInvoicePayload> {
    const {
      priceId, quantity, couponCode, stripeAccountId: accountIdInput,
    } = input;
    const stripeAccountId = accountIdInput || this.stripeNZAccountId;
    const subscriptionItem = {
      price: priceId,
      quantity,
    };
    const params = {
      subscription_items: [subscriptionItem],
      subscription_billing_cycle_anchor: 'now',
    };
    if (couponCode) {
      const couponData = await this.verifyCouponCode(couponCode, stripeAccountId);
      if (couponData.error) {
        throw couponData.error;
      }
      Object.assign(params, {
        discounts: [{ coupon: couponCode }],
      });
    }
    let invoiceData;
    try {
      invoiceData = await this.stripe.invoices.retrieveUpcoming(
        params as Stripe.InvoiceRetrieveUpcomingParams,
        { stripeAccount: stripeAccountId },
      );
    } catch (error) {
      throw GraphErrorException.BadRequest('Can not retrieve upcoming invoice', ErrorCode.Payment.INVALID_PRICE_ID);
    }
    const discount = get(invoiceData, 'total_discount_amounts[0].amount');
    const subtotal = get(invoiceData, 'subtotal');
    const total = get(invoiceData, 'total');
    const currency: string = get(invoiceData, 'currency');
    const nextBillingCycle = get(invoiceData, 'lines.data[0].period.end');
    const period: string = get(invoiceData, 'lines.data[0].price.recurring.interval');

    return {
      discount,
      subtotal,
      total,
      period: period === 'month' ? PaymentPeriod.MONTHLY : PaymentPeriod.ANNUAL,
      currency: Currency[currency.toUpperCase()],
      nextBillingCycle,
    };
  }

  public isFreePayment({ subscriptionItems, type }: PaymentSchemaInterface) {
    if (subscriptionItems?.length) {
      return false;
    }
    return type === PaymentPlanEnums.FREE;
  }

  public isFullyCanceledPayment({ subscriptionItems, status }: PaymentSchemaInterface) {
    if (subscriptionItems?.length) {
      return subscriptionItems.every((item) => item.paymentStatus === PaymentStatusEnums.CANCELED);
    }
    return status === PaymentStatusEnums.CANCELED;
  }

  public async getUpcommingInvoice(payment: PaymentSchemaInterface): Promise<SubscriptionResponse> {
    const {
      customerRemoteId, quantity, period, currency,
    } = payment;
    const isCanceledSubscription = this.isFullyCanceledPayment(payment);
    const isFreePlan = this.isFreePayment(payment);
    if (!customerRemoteId || isCanceledSubscription || isFreePlan) {
      this.loggerService.info({
        message: 'No upcoming invoice',
        extraInfo: { payment },
      });
      return null;
    }
    try {
      const upcomingInvoice = await this.stripe.invoices.retrieveUpcoming(
        { customer: customerRemoteId },
        { stripeAccount: this.getStripeAccountId({ payment }) },
      );
      if (!upcomingInvoice) {
        return null;
      }
      return {
        quantity,
        nextInvoice: upcomingInvoice.created,
        billingInterval: period,
        amount: upcomingInvoice.amount_due,
        currency,
        creditBalance: Math.abs(upcomingInvoice.starting_balance) || 0,
      };
    } catch (error) {
      if (error.code === INVOICE_UPCOMING_NONE) {
        this.loggerService.info({
          message: 'Can not get upcoming invoices',
          extraInfo: {
            payment,
            originalError: error,
          },
        });
        return null;
      }
      throw GraphErrorException.BadRequest('Can not get upcoming invoices');
    }
  }

  public getStatementDescriptor(customerId: string, isFirstRecurringPaymentInvoice?: boolean): string {
    const id = customerId.replace('cus_', '');
    if (isFirstRecurringPaymentInvoice) {
      return `LUMIN END TRIAL ${id}`.slice(0, 22);
    }
    return `LUMIN PDF ${id}`.slice(0, 22);
  }

  public async createCustomer(data: ICreateCustomer): Promise<Record<string, any>> {
    const { customer: customerCreation, customerInfo, stripeAccountId } = data;
    if (!customerCreation) {
      throw GraphErrorException.BadRequest('Missing customer creation payload.');
    }
    let customer = null;
    // validate token or paymentMethod
    switch (customerCreation.method) {
      case CustomerCreationMethod.SOURCE_TOKEN:
        await this.retrievePaymentToken({ tokenId: customerCreation.value, options: { stripeAccount: stripeAccountId } });
        break;
      case CustomerCreationMethod.PAYMENT_METHOD:
        await this.retrievePaymentMethod(customerCreation.value, { stripeAccount: stripeAccountId });
        break;
      default:
        break;
    }
    customer = await this.stripe.customers.create({
      email: customerInfo.email,
      name: customerInfo.name,
      metadata: {
        lumin_user_id: customerInfo._id,
        isBusinessDomain: customerInfo.isBusinessDomain,
        totalMembers: customerInfo.totalMembers,
        ...(customerInfo.openGoogleReferrer?.length && { openGoogleReferrer: customerInfo.openGoogleReferrer.join() }),
        ...(customerInfo.blockedPrepaidCardOnTrial && { blockedPrepaidCardOnTrial: customerInfo.blockedPrepaidCardOnTrial }),
        ...(customerInfo.geoLocation?.countryCode && { browserCountryCode: customerInfo.geoLocation.countryCode }),
        ...(customerInfo.geoLocation?.city && { browserCity: customerInfo.geoLocation.city }),
      },
    }, { stripeAccount: stripeAccountId });
    await this.attachCardToCustomer({
      tokenId: customerCreation.value,
      tokenMethod: customerCreation.method,
      customerRemoteId: customer.id,
      stripeAccountId,
    });

    return customer;
  }

  public async attachCardToCustomer(
    params: { tokenId: string, tokenMethod: CustomerCreationMethod, customerRemoteId: string, stripeAccountId: string },
  ): Promise<void> {
    const {
      tokenId, tokenMethod, customerRemoteId, stripeAccountId,
    } = params;
    switch (tokenMethod) {
      case CustomerCreationMethod.SOURCE_TOKEN: {
        await this.attachSource(customerRemoteId, tokenId, stripeAccountId);
        break;
      }
      case CustomerCreationMethod.PAYMENT_METHOD:
        await this.attachPaymentMethod(customerRemoteId, tokenId, stripeAccountId);
        break;
      default:
        break;
    }
  }

  public async attachPaymentMethod(customerRemoteId: string, tokenId: string, stripeAccountId: string): Promise<any> {
    await this.attachPaymentMethodToCustomer(
      tokenId,
      { customer: customerRemoteId },
      { stripeAccount: stripeAccountId },
    );
    return this.updateStripeCustomer(customerRemoteId, {
      invoice_settings: {
        default_payment_method: tokenId,
      },
    }, { stripeAccount: stripeAccountId });
  }

  public async attachSource(customerRemoteId: string, tokenId: string, stripeAccount: string): Promise<void> {
    const source = await this.createSource({
      type: 'card',
      token: tokenId,
      statement_descriptor: this.getStatementDescriptor(customerRemoteId),
    }, { stripeAccount });
    await this.attachSourceToCustomer(
      customerRemoteId,
      { source: source.id },
      { stripeAccount },
    );
  }

  public async handleCreateStripeSubscription(params: {
    actor: IUserContext,
    organization: IOrganization,
    paymentMethod: string,
    couponCode?: string,
    nextPayment: {
      type: PaymentPlanEnums,
      period: PaymentPeriod,
      currency: Currency
    },
    stripeAccountId: string,
    blockedPrepaidCardOnTrial: string,
  }): Promise<{ customer: Record<string, any>, subscription: Record<string, any> }> {
    const {
      actor, organization, paymentMethod, couponCode, nextPayment, stripeAccountId, blockedPrepaidCardOnTrial,
    } = params;
    const { payment: targetPayment } = organization;
    if (!paymentMethod && !targetPayment.customerRemoteId) {
      throw GraphErrorException.BadRequest('Missing payment method.');
    }
    try {
      const customer = await this.upsertStripeCustomer({
        organization,
        actor,
        paymentMethod,
        stripeAccountId,
        blockedPrepaidCardOnTrial,
      });

      const isRefundToCustomerBalance = [PaymentPlanEnums.PROFESSIONAL, PaymentPlanEnums.PERSONAL].includes(actor.payment.type as PaymentPlanEnums);
      if (isRefundToCustomerBalance) {
        const { subscriptionRemoteId } = actor.payment;
        await this.createCustomerBalance({
          customerRemoteId: customer.id, subscriptionRemoteId, currency: nextPayment.currency, stripeAccountId,
        });
      }
      const subscriptionParamsBuilder = new UpdateSubscriptionParamsBuilder(this)
        .from(Object.assign(targetPayment, { stripeAccountId }))
        .to(Object.assign(nextPayment, { stripeAccountId }));
      const subscriptionParams = (await subscriptionParamsBuilder
        .addCoupon(couponCode)
        .addCusId(customer.id as string)
        .calculate())
        .getCreateNewSubscriptionParams();
      const subscription = await this.createStripeSubscription(
        subscriptionParams as Stripe.SubscriptionCreateParams,
        { stripeAccount: stripeAccountId },
      );
      this.redisService.setSubscriptionActor(subscription.id as string, actor._id);
      return {
        customer,
        subscription,
      };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw GraphErrorException.BadRequest(error.message || error.raw?.message || error.code || error.rawType || JSON.stringify(error));
    }
  }

  async handleCreateUnifyStripeSubscription(params: {
    actor: IUserContext,
    organization: IOrganization,
    incomingPayment: {
      currency: Currency;
      period: PaymentPeriod;
      stripeAccountId: string,
      subscriptionItems: {
        productName: UnifySubscriptionProduct;
        paymentType: UnifySubscriptionPlan;
        quantity: number;
      }[],
    },
    paymentMethod: string,
    couponCode: string,
    blockedPrepaidCardOnTrial: string,
  }): Promise<{ customer: Stripe.Customer, subscription: Stripe.Subscription }> {
    const {
      actor, organization, paymentMethod, couponCode, incomingPayment, blockedPrepaidCardOnTrial,
    } = params;
    const { currency, subscriptionItems, stripeAccountId } = incomingPayment;
    const targetPayment = await this.getNewPaymentObject(organization.payment);
    if (!paymentMethod && !targetPayment.customerRemoteId) {
      throw GraphErrorException.BadRequest('Missing payment method.');
    }
    const customer = await this.upsertStripeCustomer({
      organization,
      actor,
      paymentMethod,
      stripeAccountId,
      blockedPrepaidCardOnTrial,
    });

    const isRefundToCustomerBalance = [PaymentPlanEnums.PROFESSIONAL, PaymentPlanEnums.PERSONAL].includes(actor.payment.type as PaymentPlanEnums);
    if (this.paymentUtilsService.isIncludePdfSubscription({ subscriptionItems }) && isRefundToCustomerBalance) {
      const { subscriptionRemoteId } = actor.payment;
      await this.createCustomerBalance({
        customerRemoteId: customer.id, subscriptionRemoteId, currency, stripeAccountId,
      });
    }

    const subscriptionParamsBuilder = new UpdateUnifySubscriptionParamsBuilder(this, this.paymentUtilsService)
      .from(Object.assign(targetPayment, { stripeAccountId }))
      .to(Object.assign(incomingPayment, { stripeAccountId }));
    const subscriptionParams = (await subscriptionParamsBuilder
      .addDiscount(couponCode)
      .addCusId(customer.id as string)
      .calculate())
      .getCreateNewSubscriptionParams();
    const subscription = await this.createStripeSubscription(
      subscriptionParams as Stripe.SubscriptionCreateParams,
      { stripeAccount: stripeAccountId },
    );
    this.redisService.setSubscriptionActor(subscription.id as string, actor._id);
    return { customer, subscription };
  }

  async upsertStripeCustomer(params: {
    organization: IOrganization,
    actor: IUserContext,
    paymentMethod: string,
    stripeAccountId: string,
    blockedPrepaidCardOnTrial?: string,
    upgradedWithSensitiveCoupon?: string,
  }) {
    const {
      organization, actor, paymentMethod, stripeAccountId, blockedPrepaidCardOnTrial, upgradedWithSensitiveCoupon,
    } = params;
    const { payment: targetPayment } = organization;
    if (targetPayment.customerRemoteId) {
      let customer;
      if (paymentMethod) {
        customer = await this.attachPaymentMethod(targetPayment.customerRemoteId, paymentMethod, stripeAccountId);
      } else {
        customer = await this.stripe.customers.retrieve(targetPayment.customerRemoteId, { stripeAccount: stripeAccountId });
      }
      const customerUpdateData = {
        metadata: {
          ...(blockedPrepaidCardOnTrial && { blockedPrepaidCardOnTrial }),
          ...(actor.metadata.openGoogleReferrer.length && { openGoogleReferrer: actor.metadata.openGoogleReferrer.join() }),
          ...(upgradedWithSensitiveCoupon && { upgradedWithSensitiveCoupon }),
          ...(actor.geoLocation?.countryCode && { browserCountryCode: actor.geoLocation.countryCode }),
          ...(actor.geoLocation?.city && { browserCity: actor.geoLocation.city }),
        },
      };
      if (Object.keys(customerUpdateData.metadata).length) {
        await this.updateStripeCustomer(targetPayment.customerRemoteId, customerUpdateData, { stripeAccount: stripeAccountId });
      }
      return customer;
    }
    const totalOrgMembers = await this.organizationService.countTotalActiveOrgMember({ orgId: organization._id });
    const customer = await this.createCustomer({
      targetId: organization._id,
      customerInfo: {
        _id: actor._id,
        totalMembers: totalOrgMembers,
        isBusinessDomain: Number(Utils.isBusinessDomain(actor.email)),
        blockedPrepaidCardOnTrial,
        openGoogleReferrer: actor.metadata.openGoogleReferrer,
        ...actor,
      },
      customer: {
        method: CustomerCreationMethod.PAYMENT_METHOD,
        value: paymentMethod,
      },
      stripeAccountId,
    });
    return customer;
  }

  async recoverPaymentData(target: IOrganization, type: PaymentType): Promise<PaymentSchemaInterface> {
    const { payment } = target;
    const { customerRemoteId, subscriptionRemoteId } = payment;
    const isMissingSubRemoteId = customerRemoteId && !subscriptionRemoteId;
    if (!isMissingSubRemoteId) {
      return payment;
    }
    const newSubscriptionId = await this.recoverSubscriptionId(target, type);
    if (!newSubscriptionId) {
      return payment;
    }
    return {
      ...payment,
      subscriptionRemoteId: newSubscriptionId,
    };
  }

  getFreePaymentPayload(oldPayment: PaymentSchemaInterface): Partial<PaymentSchemaInterface> {
    return {
      type: PaymentPlanEnums.FREE,
      stripeAccountId: oldPayment.stripeAccountId,
      customerRemoteId: oldPayment.customerRemoteId,
      subscriptionItems: [],
    };
  }

  async retryFailedInvoices({ orgId, payment } :{ orgId: string; payment: PaymentSchemaInterface }): Promise<Stripe.Invoice[]> {
    const invoices = await this.getFailedInvoicesFromLastPaid(payment);
    try {
      const paidInvoices = await Promise.all(invoices.map(async (invoice) => {
        if (invoice.status === InvoiceStatus.DRAFT) {
          await this.finalizeInvoice({ invoiceId: invoice.id, options: { stripeAccount: payment.stripeAccountId } });
        }
        return await this.payInvoice({ invoiceId: invoice.id, options: { stripeAccount: payment.stripeAccountId } });
      }));
      const hasFailedInvoice = paidInvoices.some((invoice) => invoice.status !== InvoiceStatus.PAID);
      if (hasFailedInvoice) {
        const failedInvoiceIds = paidInvoices.filter((invoice) => invoice.status !== InvoiceStatus.PAID).map((invoice) => invoice.id);
        this.loggerService.error({
          context: this.retryFailedSubscription.name,
          error: new Error("Can't charge invoice!"),
          extraInfo: {
            orgId,
            customerRemoteId: payment.customerRemoteId,
            stripeAccountId: payment.stripeAccountId,
            failedInvoiceIds,
          },
        });
        throw GraphErrorException.BadRequest("Can't charge invoice!");
      }
      return paidInvoices;
    } catch (err) {
      throw GraphErrorException.BadRequest("Can't charge invoice!");
    }
  }

  async retryFailedSubscription(target: IOrganization, resourceType: PaymentTypeEnums, userId: string): Promise<void> {
    const { _id } = target;
    const clientId: string = _id;
    const payment = await this.getNewPaymentObject(target.payment);
    const { subscriptionItems = [] } = payment;

    const isUnpaid = subscriptionItems.some((item) => item.paymentStatus === PaymentStatusEnums.UNPAID);
    const isPending = subscriptionItems.some((item) => item.paymentStatus === PaymentStatusEnums.PENDING);
    if (!isUnpaid && !isPending) {
      throw GraphErrorException.BadRequest('Payment status is not valid!');
    }

    if (!payment.stripeAccountId) {
      throw GraphErrorException.BadRequest('Stripe account id not found');
    }

    const attempt = await this.redisService.getRenewAttempt(clientId);
    if (!attempt?.nextPaymentAttempt && !isUnpaid) {
      throw GraphErrorException.BadRequest('Subscription is not in renew progress!');
    }

    const invoices = await this.retryFailedInvoices({ orgId: _id, payment });
    if (invoices.length === 0) {
      throw GraphErrorException.BadRequest('No failed invoices found!');
    }

    this.redisService.removeStripeRenewAttempt(target._id);
    this.sendRenewSuccessEmail(target, { email: target.billingEmail }, resourceType as PaymentTypeEnums, invoices[0]);
    this.organizationService.publishUpdateSignWorkspacePayment({
      organization: target,
      userIds: [userId],
      action: UpdateSignWsPaymentActions.RENEW_SUCCESS_SUBSCRIPTION,
    });
  }

  async getSubscriptionCancelBannerData(payment: PaymentSchemaInterface): Promise<{
    remainingDay: number,
    expireDate: string,
    isBanner30Days: boolean,
    isBanner7Days: boolean,
    isBanner2Days: boolean,
  }> {
    const subscriptionInfo = await this.getStripeSubscriptionInfo({
      subscriptionId: payment.subscriptionRemoteId,
      options: { stripeAccount: this.getStripeAccountId({ payment }) },
    });

    const isIncludeCanceledItem = payment.status === PaymentStatusEnums.CANCELED
      || payment.subscriptionItems?.some((item) => item.paymentStatus === PaymentStatusEnums.CANCELED);

    const calcDiff = (end: moment.MomentInput, start?: moment.MomentInput) => moment(end, 'X').diff(start ? moment(start, 'X') : moment(), 'days');

    let remainingDay = 0;

    if (isIncludeCanceledItem) {
      try {
        const { test_clock, livemode, current_period_end } = subscriptionInfo;

        if (!livemode && test_clock) {
          const testClock = await this.stripe.testHelpers.testClocks.retrieve(
            test_clock as string,
            { stripeAccount: this.getStripeAccountId({ payment }) },
          );
          remainingDay = calcDiff(current_period_end, testClock.frozen_time);
        } else {
          remainingDay = calcDiff(current_period_end);
        }
      } catch {
        remainingDay = calcDiff(subscriptionInfo.current_period_end);
      }
    }

    const expireDate = isIncludeCanceledItem
      && moment(subscriptionInfo.current_period_end as moment.MomentInput, 'X').format('MMM DD, YYYY');
    const isBanner30Days = remainingDay <= 30 && remainingDay > 7;
    const isBanner7Days = remainingDay <= 7 && remainingDay > 2;
    const isBanner2Days = remainingDay <= 2;
    return {
      remainingDay,
      expireDate,
      isBanner30Days,
      isBanner7Days,
      isBanner2Days,
    };
  }

  async sendRenewSuccessEmail(
    target: User | IOrganization,
    customer: Record<string, any>,
    paymentType: PaymentTypeEnums,
    invoice: Stripe.Invoice,
  ): Promise<void> {
    try {
      const period: string = capitalize(target.payment.period);
      switch (paymentType) {
        case PaymentTypeEnums.INDIVIDUAL:
          this.emailService.sendEmailHOF(EMAIL_TYPE.RENEW_PLAN_SUCCESS, [customer.email as string], { period });
          break;
        case PaymentTypeEnums.ORGANIZATION: {
          const isEnableBrazeRenewalEmailCampaign = await this.featureFlagService.getFeatureIsOn({
            featureFlagKey: FeatureFlagKeys.ENABLE_BRAZE_RENEWAL_EMAIL_CAMPAIGN,
            organization: target as IOrganization,
          });
          if (isEnableBrazeRenewalEmailCampaign) {
            this.triggerBrazeRenewalEmailCampaign({ paymentTarget: target, customer: customer as Stripe.Customer, invoice });
            break;
          }
          const activeSubscriptionItems = (
            target.payment.subscriptionItems || []
          ).filter(
            (subItem) => subItem.paymentStatus === PaymentStatusEnums.ACTIVE,
          );
          const receiverEmail = (await this.organizationService.getOrganizationMemberByRole(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            target._id,
            [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR],
          )).map((user) => user.email);
          const attachments = await this.getInvoiceEmailAttachment({ invoice });
          this.emailService.sendEmailHOF(
            EMAIL_TYPE.RENEW_PLAN_SUCCESS_ORGANIZATION,
            receiverEmail,
            {
              subject: `Your subscription for ${target.name}'s ${ORGANIZATION_TEXT} has been renewed`,
              orgName: target.name,
              paymentAnnualUrl: this.paymentUtilsService.buildUnifyPaymentPath({
                orgId: target._id,
                subscriptionItems: activeSubscriptionItems,
              }),
              orgId: target._id,
              period,
            },
            attachments,
          );
          break;
        }
        default: break;
      }
    } catch (error) {
      this.loggerService.error({
        context: 'sendRenewSuccessEmail',
        error,
        extraInfo: {
          target,
        },
      });
    }
  }

  async triggerBrazeRenewalEmailCampaign(params: {
    paymentTarget: User | IOrganization,
    customer: Stripe.Customer,
    invoice: Stripe.Invoice
  }): Promise<void> {
    const { paymentTarget, invoice, customer } = params;
    const organization = paymentTarget as IOrganization;
    const {
      _id: orgId, name, payment, url,
    } = organization;
    const paymentMethodId = customer.invoice_settings.default_payment_method as string;
    const planName = () => {
      const hasSignSub = payment.subscriptionItems
        && this.paymentUtilsService.isIncludeSignSubscription({ subscriptionItems: payment.subscriptionItems });
      if (hasSignSub) {
        return 'Lumin PDF + Lumin Sign Pro Monthly';
      }
      return 'Lumin Pro Monthly';
    };
    const subscribedItems = payment.subscriptionItems?.length ? [...payment.subscriptionItems.map((item) => item.paymentType)] : [payment.type];
    const [members, totalMembers] = await Promise.all([
      this.organizationService.getOrganizationMemberByRole(
        paymentTarget._id,
        [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR],
      ),
      this.organizationService.countTotalActiveOrgMember({ orgId }),
    ]);
    const paymentMethod = paymentMethodId && (await this.retrievePaymentMethod(paymentMethodId, { stripeAccount: payment.stripeAccountId }));
    const cardLast4 = paymentMethod?.card?.last4;
    const amountCharge = invoice.lines.data.reduce((acc, line) => acc + line.amount, 0);
    const renewalDate = moment(invoice.created * 1000).format('MMM DD, YYYY');
    const nextBillingDate = moment(invoice.created * 1000).add(1, 'month').format('MMM DD, YYYY');
    const hostedInvoiceUrl = invoice.hosted_invoice_url;
    const emailList = members.map((member) => member._id);
    const triggerProperties: IRenewalEmailCampaignTriggerProperties = {
      workspace_name: name,
      workspace_url: url,
      plan_name: planName(),
      amount_charge: Utils.formatPrice(amountCharge),
      currency_symbol: Utils.convertCurrencySymbol(payment.currency as PaymentCurrencyEnums),
      renewal_date: renewalDate,
      next_renewal_date: nextBillingDate,
      hosted_invoice_url: hostedInvoiceUrl,
      total_members: totalMembers,
      card_last_4: cardLast4,
      subscribed_items: subscribedItems as UnifySubscriptionPlan[],
    };

    await this.brazeService.triggerRenewalEmailCampaign(emailList, triggerProperties);
  }

  async closeSubscriptionRemainingDateBanner({ target, userId }) {
    const { payment } = target;
    let dayOffset = 0;
    const {
      isBanner30Days, isBanner7Days, isBanner2Days,
    } = await this.getSubscriptionCancelBannerData(payment as PaymentSchemaInterface);
    if (payment.period === PaymentPeriod.ANNUAL && isBanner30Days) {
      dayOffset = 30;
    }
    if (isBanner7Days) {
      dayOffset = 7;
    }
    if (isBanner2Days) {
      dayOffset = 2;
    }
    dayOffset && this.redisService.setDisableSubscriptionRemainingBanner({ targetId: target._id, userId, dayOffset });
  }

  async shouldShowBillingRemainingDateBanner(target, userId) {
    const { payment } = target;
    const {
      remainingDay, isBanner30Days, isBanner7Days,
    } = await this.getSubscriptionCancelBannerData(payment as PaymentSchemaInterface);
    const canDisplayWarningBanner = payment.period === PaymentPeriod.MONTHLY ? remainingDay <= 7 : remainingDay <= 30;
    let isUserCloseWarningBanner = false;
    const bannerDisabledDayOffset = Number(
      await this.redisService.getDisableSubscriptionRemainingBanner({ targetId: target._id, userId }),
    );
    switch (bannerDisabledDayOffset) {
      case 30: {
        if (isBanner30Days) {
          isUserCloseWarningBanner = true;
        }
        break;
      }
      case 7: {
        if (isBanner30Days || isBanner7Days) {
          isUserCloseWarningBanner = true;
        }
        break;
      }
      case 2:
        isUserCloseWarningBanner = true;
        break;
      default:
        break;
    }
    return canDisplayWarningBanner && !isUserCloseWarningBanner;
  }

  createSetupIntent(params: Stripe.SetupIntentCreateParams, options: StripeRequestOptionsWithAccount): Promise<Stripe.SetupIntent> {
    return this.stripe.setupIntents.create(params, options);
  }

  /** @deprecated deprecated with `createFreeTrialSubscription` api */
  async createFreeTrialPlan(inputData: {
    userId: string,
    organization: IOrganization,
    input: SubscriptionTrialInput,
    stripeAccountId: string
  }): Promise<IOrganization> {
    const {
      userId, organization, input, stripeAccountId,
    } = inputData;
    const {
      issuedId, issuer, period, currency, plan: trialPlan, isBlockedPrepaidCardOnTrial,
    } = input;
    const { _id: orgId } = organization;
    let customer;
    try {
      const [user, totalOrgMembers] = await Promise.all([
        this.userService.findUserById(userId),
        this.organizationService.countTotalActiveOrgMember({ orgId }),
      ]);
      const plan = this.getStripePlanRemoteId({
        plan: trialPlan,
        period,
        currency,
        stripeAccountId,
      });
      const freeTrialEndTime = moment()
        .add(
          this.FREE_TRIAL_TIME,
          this.FREE_TRIAL_TIME_UNIT as moment.unitOfTime.Base,
        )
        .unix();
      const billingEmail = user.email;
      const { subscription, customer: remoteCustomer } = await this.createCustomerAndSubscription({
        user,
        organization,
        issuer,
        issuedId,
        plan,
        freeTrialEndTime,
        stripeAccountId,
        totalOrgMembers,
        ...(isBoolean(isBlockedPrepaidCardOnTrial) && { blockedPrepaidCardOnTrial: 'false' }),
      });
      customer = remoteCustomer;
      const endTrialDate = new Date(freeTrialEndTime * 1000);
      const inviteUsersSettingValue = this.organizationService.getDefaultValueInviteUsersSetting(trialPlan as unknown as PaymentPlanEnums);
      const [updatedOrg] = await Promise.all([
        this.organizationService.updateOrganizationById(orgId, {
          payment: {
            currency,
            customerRemoteId: customer.id,
            period,
            planRemoteId: plan,
            quantity: INITIAL_DOC_STACK_QUANTITY,
            status: PaymentStatusEnums.TRIALING,
            subscriptionRemoteId: subscription.id,
            type: trialPlan,
            trialInfo: {
              highestTrial: trialPlan,
              endTrial: endTrialDate,
            },
            stripeAccountId,
          },
          'settings.inviteUsersSetting': inviteUsersSettingValue,
        }),
        this.organizationDocStackService.resetDocStack({
          orgId,
          docStackStartDate: new Date(),
        }),
        this.organizationService.handleMembersOfFreeCircleChangeSubscription({
          organization,
          actor: user,
          paymentMethodId: issuedId,
          isStartTrial: true,
        }),
      ]);
      await Promise.all([
        this.redisService.removeStripeRenewAttempt(orgId),
        this.redisService.removeCancelSubscriptionWarning(orgId),
        this.organizationService.clearPromotionsOffered(orgId),
        this.redisService.deleteTimeSensitiveCoupon(orgId),
      ]);
      this.userService.trackPlanAttributes(userId).then(() => {
        const { highestTrial } = organization?.payment?.trialInfo || {};
        if ((organization.payment.type as PaymentPlanEnums) === PaymentPlanEnums.FREE
         || ORG_PLAN_INDEX[trialPlan] > ORG_PLAN_INDEX[highestTrial]) {
          this.organizationService.promptToJoinTrialingOrg({ userId, organization: updatedOrg });
        }
      });
      this.postSmbNotification({
        organization: updatedOrg,
        notificationType: SlackSMBNotificationType.STARTED_TRIAL,
      });
      this.organizationService.trackEventStartFreeTrial(updatedOrg);
      this.organizationService.sendEmailWelcomeOrganizationFreeTrial([billingEmail], trialPlan);
      return updatedOrg;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw GraphErrorException.BadRequest(error.message || error.raw?.message || error.code || error.rawType || JSON.stringify(error));
    }
  }

  async createUnifySubscriptionFreeTrial(params: {
    actor: IUserContext,
    organization: IOrganization,
    incomingPayment: {
      currency: Currency;
      period: PaymentPeriod;
      stripeAccountId: string,
      subscriptionItems: {
        productName: UnifySubscriptionProduct;
        paymentType: UnifySubscriptionPlan,
        quantity: number;
      }[],
    },
    paymentMethod: string,
    blockedPrepaidCardOnTrial: string,
  }): Promise<IOrganization> {
    const {
      actor, organization, paymentMethod, incomingPayment, blockedPrepaidCardOnTrial,
    } = params;
    const currentPayment = await this.getNewPaymentObject(organization.payment);
    const {
      subscriptionItems: incomingSubscriptionItems, stripeAccountId,
    } = incomingPayment;
    const incomingPdfItem = incomingSubscriptionItems[0];
    const { subscriptionRemoteId } = currentPayment;

    const customer = await this.upsertStripeCustomer({
      organization,
      actor,
      paymentMethod,
      stripeAccountId,
      blockedPrepaidCardOnTrial,
    });

    const subscriptionParams = new UpdateUnifySubscriptionParamsBuilder(this, this.paymentUtilsService)
      .from(Object.assign(currentPayment, { stripeAccountId }))
      .addCusId(customer.id as string)
      .to(Object.assign(incomingPayment, { stripeAccountId }));

    const { _id: orgId } = organization;
    let subscription: Stripe.Subscription;
    if (subscriptionRemoteId) {
      const updateSubscriptionParams = await subscriptionParams.calculateUpdateFreeTrial();
      subscription = await this.updateStripeSubscription(
        subscriptionRemoteId,
        updateSubscriptionParams,
        { stripeAccount: stripeAccountId },
      );
    } else {
      const createSubscriptionParams = await subscriptionParams.calculateCreateFreeTrial();
      subscription = await this.createStripeSubscription(
        createSubscriptionParams,
        { stripeAccount: stripeAccountId },
      );
    }
    const inviteUsersSettingValue = this.organizationService.getDefaultValueInviteUsersSetting(
      incomingPdfItem.paymentType as unknown as PaymentPlanEnums,
    );
    const [updatedOrg] = await Promise.all([
      this.organizationService.updateOrganizationById(orgId, {
        payment: this.getIncomingPaymentObject({
          currentPayment,
          trialInfo: {
            highestTrial: incomingPdfItem.paymentType as any,
            endTrial: new Date(subscription.trial_end * 1000),
          },
          incomingPayment: { ...incomingPayment, status: PaymentStatusEnums.TRIALING },
          subscription,
        }),
        'settings.inviteUsersSetting': inviteUsersSettingValue,
      }),
      this.organizationDocStackService.resetDocStack({
        orgId,
        docStackStartDate: new Date(),
      }),
      this.organizationService.handleMembersOfFreeCircleChangeSubscription({
        organization,
        actor,
        paymentMethodId: paymentMethod,
        isStartTrial: true,
      }),
    ]);
    await Promise.all([
      this.redisService.removeStripeRenewAttempt(orgId),
      this.redisService.removeCancelSubscriptionWarning(orgId),
      // Clear on trial to allow the organization to be offered this promotion again if not claimed.
      this.organizationService.clearPromotionsOffered(orgId),
      this.redisService.deleteTimeSensitiveCoupon(orgId),
    ]);
    this.userService.trackPlanAttributes(actor._id).then(() => {
      const { highestTrial } = currentPayment?.trialInfo || {};
      if ((organization.payment.type as PaymentPlanEnums) === PaymentPlanEnums.FREE
       || ORG_PLAN_INDEX[incomingPdfItem.paymentType] > ORG_PLAN_INDEX[highestTrial]) {
        this.organizationService.promptToJoinTrialingOrg({ userId: actor._id, organization: updatedOrg });
      }
    });
    this.postSmbNotification({
      organization: updatedOrg,
      notificationType: SlackSMBNotificationType.STARTED_TRIAL,
    });
    this.organizationService.trackEventStartFreeTrial(updatedOrg);
    this.organizationService.sendEmailWelcomeOrganizationFreeTrial([actor.email], incomingPdfItem.paymentType);
    return updatedOrg;
  }

  async addExtraTrialDay({ orgId, user, browserLanguage }: { orgId: string; user: User; browserLanguage: string }) {
    const canExtraFreeTrialDay = await this.featureFlagService.getFeatureIsOn({
      user,
      featureFlagKey: FeatureFlagKeys.MODAL_EXTRA_FREE_TRIAL_DAYS,
      extraInfo: {
        browserLanguage,
      },
    });
    if (canExtraFreeTrialDay) {
      const key = `${RedisConstants.CAN_EXTRA_TRIAL}${user._id}-${orgId}`;
      this.redisService.setRedisDataWithExpireTime({ key, value: '1', expireTime: 60 * 60 * 24 * 7 });
    }
  }

  calculateNextBillingPrice(invoice: any): number {
    // caculate coupon amount
    const interval = get(invoice, 'lines.data[0].plan.interval');
    const periodMapping = {
      year: PaymentPeriod.ANNUAL,
      month: PaymentPeriod.MONTHLY,
    };
    const period = periodMapping[interval];
    const coupon = get(invoice, 'discounts[0].coupon');
    const couponDuration = get(coupon, 'duration');
    const isValidCoupon = get(coupon, 'valid');
    const durationMonths = get(coupon, 'duration_in_months');
    const lineDatas: any[] = get(invoice, 'lines.data');
    const chargeLineItems = lineDatas.filter((line) => !line.proration_details.credited_items);
    const totalPrice = sumBy(chargeLineItems, (line) => get(line, 'plan.amount', 0) * get(line, 'quantity', 1));

    const appliesTo = get(coupon, 'applies_to');
    const appliedLineItems = !appliesTo
      ? chargeLineItems
      : chargeLineItems.filter((line) => appliesTo.products.includes(get(line, 'plan.product') || get(line, 'price.product')));
    const nonAppliedLineItems = !appliesTo
      ? []
      : chargeLineItems.filter((line) => !appliesTo.products.includes(get(line, 'plan.product') || get(line, 'price.product')));

    const appliedPrice = sumBy(appliedLineItems, (line) => get(line, 'plan.amount', 0) * get(line, 'quantity', 1));
    const nonAppliedPrice = sumBy(nonAppliedLineItems, (line) => get(line, 'plan.amount', 0) * get(line, 'quantity', 1));

    let amountOff = 0;
    if (get(invoice, 'discount.coupon.amount_off')) {
      amountOff = get(invoice, 'discount.coupon.amount_off');
    } else if (get(invoice, 'discount.coupon.percent_off')) {
      const percentOff = get(invoice, 'discount.coupon.percent_off');
      amountOff = (percentOff / 100) * appliedPrice;
    }

    if (isValidCoupon) {
      switch (couponDuration) {
        case COUPON_DURATION_TYPE.REPEATING: {
          if (period === PaymentPeriod.ANNUAL && durationMonths < 12) {
            return totalPrice;
          }
          return Math.max(appliedPrice - amountOff, 0) + nonAppliedPrice;
        }
        case COUPON_DURATION_TYPE.FOREVER: {
          return Math.max(appliedPrice - amountOff, 0) + nonAppliedPrice;
        }
        case COUPON_DURATION_TYPE.ONCE: {
          return totalPrice;
        }
        default: break;
      }
    }
    return totalPrice;
  }

  calculateSubtotalOfInvoice(invoice: any): number {
    const lineDatas: any[] = get(invoice, 'lines.data');
    return lineDatas.reduce((total: number, lineItem: any) => total + Number(Math.max(lineItem.amount as number, 0)), 0);
  }

  getTrialInfoOfOrgPayment(trialInfo: TrialInfo): TrialInfo {
    const plans = {
      ORG_STARTER: 0,
      ORG_PRO: 1,
      ORG_BUSINESS: 2,
    };
    const canStartTrialInfo: TrialInfo = ['canUseStarterTrial', 'canUseProTrial', 'canUseBusinessTrial']
      .reduce((acc, value, index) => ({ ...acc, [value]: plans[trialInfo.highestTrial] < index }), {});

    return {
      ...trialInfo,
      ...canStartTrialInfo,
      canStartTrial: canStartTrialInfo.canUseBusinessTrial,
    };
  }

  /** @deprecated */
  async createCustomerAndSubscription(params: {
    user: User,
    organization: IOrganization,
    issuer: CustomerCreationMethod,
    issuedId: string,
    plan: string,
    freeTrialEndTime: number,
    stripeAccountId: string,
    totalOrgMembers: number,
    blockedPrepaidCardOnTrial: string,
  }): Promise<{ customer: any, subscription: any }> {
    const {
      user, organization, issuer, issuedId, plan, freeTrialEndTime, stripeAccountId, blockedPrepaidCardOnTrial, totalOrgMembers,
    } = params;
    let subscription;
    let customer;
    const createSubscriptionData = {
      cancel_at_period_end: false,
      trial_end: freeTrialEndTime,
    };
    const { customerRemoteId, subscriptionRemoteId } = organization.payment;
    if (!customerRemoteId) {
      try {
        if (!issuedId || !issuer) {
          throw GraphErrorException.NotAcceptable('Missing card token');
        }
        customer = await this.createCustomer({
          targetId: organization._id,
          customerInfo: {
            _id: user._id,
            name: user.name,
            email: user.email,
            isBusinessDomain: Number(Utils.isBusinessDomain(user.email)),
            totalMembers: totalOrgMembers,
            blockedPrepaidCardOnTrial,
            openGoogleReferrer: user.metadata.openGoogleReferrer,
          },
          customer: {
            method: issuer,
            value: issuedId,
          },
          stripeAccountId,
        });
        Object.assign(createSubscriptionData, { customer: customer.id, items: [{ plan }] });
        subscription = await this.stripe.subscriptions.create(
          createSubscriptionData as Stripe.SubscriptionCreateParams,
          { stripeAccount: stripeAccountId },
        );
        return { subscription, customer };
      } catch (error) {
        if (customer) {
          await this.stripe.customers.del(customer.id as string, { stripeAccount: stripeAccountId });
        }
        throw error;
      }
    }
    customer = await this.stripe.customers.retrieve(customerRemoteId, { stripeAccount: stripeAccountId });
    let customerUpdateData = {
      metadata: {
        ...(user.metadata.openGoogleReferrer.length && { openGoogleReferrer: user.metadata.openGoogleReferrer.join() }),
      },
    };
    if (issuedId && issuer) {
      await this.attachCardToCustomer({
        tokenId: issuedId,
        tokenMethod: issuer,
        customerRemoteId: customer.id,
        stripeAccountId,
      });
      customerUpdateData = {
        metadata: {
          ...customerUpdateData.metadata,
          ...(blockedPrepaidCardOnTrial && { blockedPrepaidCardOnTrial }),
        },
      };
    }
    if (Object.keys(customerUpdateData).length) {
      await this.updateStripeCustomer(customerRemoteId, customerUpdateData, { stripeAccount: stripeAccountId });
    }

    if (subscriptionRemoteId) {
      const oldSubscription = await this.stripe.subscriptions.retrieve(subscriptionRemoteId, { stripeAccount: stripeAccountId });
      const subscriptionItemId = get(oldSubscription, 'items.data[0].id');
      Object.assign(createSubscriptionData, { items: [{ id: subscriptionItemId, price: plan }] });
      subscription = await this.updateStripeSubscription(subscriptionRemoteId, createSubscriptionData, { stripeAccount: stripeAccountId });
    } else {
      Object.assign(createSubscriptionData, { customer: customer.id, items: [{ plan }] });
      subscription = await this.stripe.subscriptions.create(
        createSubscriptionData as Stripe.SubscriptionCreateParams,
        { stripeAccount: stripeAccountId },
      );
    }
    return { subscription, customer };
  }

  async validateFree30Coupon(params: {
    orgId: string,
    incomingPlan: PaymentPlanSubscription,
    incomingPeriod: PaymentPeriod,
    stripeAccountId: string
  }): Promise<boolean> {
    // FREE30 coupon only apply once time for Business Monthly plan
    const {
      orgId, incomingPlan, incomingPeriod, stripeAccountId,
    } = params;
    if (incomingPlan !== PaymentPlanSubscription.BUSINESS || incomingPeriod === PaymentPeriod.ANNUAL) {
      return false;
    }
    if (!orgId) {
      return true;
    }
    const org = await this.organizationService.getOrgById(orgId);
    if (!org) {
      return false;
    }
    const { payment: currentPayment } = org;
    let customer;
    if (currentPayment.customerRemoteId) {
      customer = await this.stripe.customers.retrieve(currentPayment.customerRemoteId, null, { stripeAccount: stripeAccountId });
    }
    return !get(customer, 'metadata.used_one_month_free', false);
  }

  getOriginalAmountOfProduct(params: {
    amount: number;
    percentOff: number;
    amountOff: number;
    discountedInvoiceProductCount: number;
    period?: string;
  }) {
    const {
      amount, percentOff, amountOff, discountedInvoiceProductCount, period,
    } = params;

    if (period === PaymentPeriodEnums.MONTHLY) {
      return amount;
    }

    if (percentOff > 0) {
      return Math.round(amount / (1 - percentOff / 100));
    }

    if (amountOff > 0) {
      return amount + amountOff / discountedInvoiceProductCount;
    }

    return amount;
  }

  getCurrentPlansAmount(params:
    { items: Stripe.InvoiceLineItem[],
      stripeAccountId: string,
      discountProducts: DiscountProducts[],
      percentOff: number,
      amountOff: number,
      period?: string })
  : CurrentPlansAmount[] {
    const {
      items, stripeAccountId, discountProducts, percentOff, amountOff, period,
    } = params;

    const pdfProducts = this.paymentUtilsService.getAllPdfProducts({ stripeAccountId });
    const signProducts = this.paymentUtilsService.getAllSignProducts({ stripeAccountId });

    const productMap: Record<UnifySubscriptionProduct, string[]> = {
      [UnifySubscriptionProduct.PDF]: pdfProducts,
      [UnifySubscriptionProduct.SIGN]: signProducts,
    };

    return items.map((item) => {
      const amount = Number(get(item, 'amount', 0));
      const productId = get(item, 'plan.product') as string;

      const productEntry = Object.entries(productMap).find(([, products]) => products.includes(productId));

      if (!productEntry) return null;

      const [productName] = productEntry as [UnifySubscriptionProduct, string[]];

      const discountProduct = discountProducts.find((discount) => discount.productName === productName);

      if (!discountProduct) {
        return { productName, amount };
      }

      const planName = this.paymentUtilsService.getPlanNameFromProduct(productId, stripeAccountId);

      const isPlanApplicable = discountProduct.planApplied.length === 0
        || discountProduct.planApplied.includes(planName);

      if (!isPlanApplicable) {
        return { productName, amount };
      }

      if (percentOff === 100) {
        const unitAmount = Math.abs(Number(get(item, 'price.unit_amount', 0)));
        const quantity = get(item, 'quantity', 1);
        return {
          productName,
          amount: unitAmount * quantity,
        };
      }

      return {
        productName,
        amount: this.getOriginalAmountOfProduct({
          amount, percentOff, amountOff, discountedInvoiceProductCount: Math.min(discountProducts.length, items.length), period,
        }),
      };
    }).filter(Boolean);
  }

  async interceptStripeInvoiceResponse(
    params: {
      actor?: User,
      invoice: Record<string, any>,
      stripeAccountId: string;
      recurringInvoice?: Record<string, any>,
      subscriptionInfo: UpdateUnifySubscriptionParamsBuilder | UpdateSubscriptionParamsBuilder | PaymentCustomizeParamsBuilder
      orgId?: string;
    },
  ): Promise<PreviewDocStackInvoicePayload> {
    const {
      invoice, recurringInvoice, subscriptionInfo, stripeAccountId, actor, orgId,
    } = params;
    const organization = orgId ? await this.organizationService.getOrgById(orgId) : null;
    const currency = get(invoice, 'lines.data[0].currency', '').toUpperCase();
    const lineDatas: any[] = get(invoice, 'lines.data');
    let nextBillingTimestamp = subscriptionInfo.isChargeAtEndPeriod() && !subscriptionInfo.isUpgradeFromUnpaid()
      ? get(invoice, 'next_payment_attempt')
      : get(lineDatas, `[${lineDatas.length - 1}].period.end`);
    const previousPlanData = this.paymentUtilsService.getUnusedTimeProrationItems({ items: lineDatas });
    let previousBillingTimestamp = previousPlanData?.find((item) => item?.period?.end)?.period?.end;
    const nextPlanData = differenceBy(lineDatas, previousPlanData, 'id');
    const remainingPlan = sumBy(previousPlanData, (line) => Math.abs(Number(get(line, 'amount', 0))));
    const startingBalance = Math.abs(Number(get(invoice, 'starting_balance', 0)));
    const endingBalance = subscriptionInfo.isChargeAtEndPeriod()
      ? Math.abs(Number(get(invoice, 'starting_balance')))
      : Math.abs(Number(get(invoice, 'ending_balance')));
    const planPrice = sumBy(nextPlanData, (line) => Math.abs(Number(get(line, 'amount', 0))));
    let discount = get(invoice, 'total_discount_amounts[0].amount', 0);

    const coupon = get(invoice, 'discounts[0].coupon');
    const discountProducts = this.getDiscountProducts({ coupon, stripeAccountId });
    let discountDuration = String(get(coupon, 'duration'));
    if (discountDuration === COUPON_DURATION_TYPE.REPEATING) {
      discountDuration = get(coupon, 'duration_in_months');
    }

    let total = planPrice;
    // Reverse calculate the discount amount in case Stripe baked discount amount to proration item amount
    const isDiscountInProrationItem = discount === 0;
    const percentOff = get(coupon, 'percent_off', 0);
    if (coupon && isDiscountInProrationItem && percentOff) {
      const separated = this.separateDiscountFromProrateAmount({
        coupon,
        nextPlanData,
        planPrice,
        stripeAccountId,
      });

      total = separated.total;
      discount = separated.discount;
    }
    const amountOff = get(coupon, 'amount_off', 0);
    if (amountOff && isDiscountInProrationItem) {
      total = planPrice + amountOff;
      discount = amountOff;
    }
    if (subscriptionInfo.isChargeAtEndPeriod()) {
      total = 0;
    }

    const percentOffDesc = percentOff > 0 ? `${percentOff}%` : '';
    const currencySymbol = Utils.convertCurrencySymbol(currency as PaymentCurrencyEnums);
    const amountOffDesc = amountOff > 0 ? `${currencySymbol}${amountOff / 100}` : '';
    let amountDue = subscriptionInfo.isChargeAtEndPeriod() ? 0 : get(invoice, 'amount_due', 0);
    const remaining = remainingPlan + startingBalance;
    let nextBillingPrice = subscriptionInfo.isChargeAtEndPeriod()
      ? get(invoice, 'amount_due', 0)
      : Math.max(this.calculateNextBillingPrice(recurringInvoice || invoice) - endingBalance, 0);

    let remainingOfProfessional: number = 0;
    if (actor && actor.payment.type === PaymentPlanEnums.PROFESSIONAL) {
      const professionalBilling = await this.getUnusedProrationInfo(actor.payment.subscriptionRemoteId, actor.payment.stripeAccountId);
      remainingOfProfessional = professionalBilling.amount;
      previousBillingTimestamp = Number(professionalBilling.billingTimeStamp);
    }

    const hasNewPurchaseAfterPendingOrUnpaid = subscriptionInfo instanceof UpdateUnifySubscriptionParamsBuilder
      && subscriptionInfo.hasNewPurchaseAfterPaymentStatuses([PaymentStatusEnums.PENDING, PaymentStatusEnums.UNPAID]);
    if (hasNewPurchaseAfterPendingOrUnpaid) {
      amountDue = get(invoice, 'amount_due', 0);
      nextBillingTimestamp = get(lineDatas, `[${lineDatas.length - 1}].period.end`);
      nextBillingPrice = Math.max(this.calculateNextBillingPrice(recurringInvoice || invoice) - endingBalance, 0);
    }

    return {
      total,
      remaining,
      currency,
      nextBillingCycle: String(nextBillingTimestamp * 1000),
      // previousBillingTimestamp may be undefined (no unused proration items, e.g. starter → trial upgrade), fallback to now
      previousBillingCycle: previousBillingTimestamp ? String(previousBillingTimestamp * 1000) : String(Date.now()),
      currentPlansAmount: this.getCurrentPlansAmount({
        items: nextPlanData, stripeAccountId, discountProducts, percentOff, amountOff, period: organization?.payment?.period,
      }),
      isUpgradeDocStackAnnual: subscriptionInfo.isUpgradeDocStackAnnual(),
      discount,
      discountCode: InvoiceUtils.getCustomerFacingDiscountCode(invoice as Stripe.Invoice),
      discountDuration,
      discountDescription: percentOffDesc || amountOffDesc,
      discountProducts,
      ...this.deductRemainingAmount({
        remaining, amountDue, creditBalance: endingBalance, nextBillingPrice,
      }, remainingOfProfessional),
    };
  }

  getDiscountProducts({ coupon, stripeAccountId }: { coupon: Stripe.Coupon; stripeAccountId: string }): DiscountProducts[] {
    if (!coupon) {
      return [];
    }
    const signProducts = this.paymentUtilsService.getAllSignProducts({ stripeAccountId });

    const appliesTo = coupon.applies_to;
    const appliesToProducts = appliesTo?.products || [];

    const appliesToSign = intersection(appliesToProducts, signProducts).length;
    const appliedProducts = [];
    const pdfProducts = this.paymentUtilsService.getAllPdfProducts({ stripeAccountId });
    const applicablePdfTiers = !appliesTo ? pdfProducts : intersection(appliesToProducts, pdfProducts);
    if (applicablePdfTiers.length > 0) {
      appliedProducts.push({
        productName: UnifySubscriptionProduct.PDF,
        planApplied: applicablePdfTiers.length >= pdfProducts.length - 1
          ? [] : applicablePdfTiers.map((product) => this.paymentUtilsService.getPlanNameFromProduct(product, stripeAccountId)),
      });
    }

    if (!appliesTo || appliesToSign) {
      appliedProducts.push({
        productName: UnifySubscriptionProduct.SIGN,
        planApplied: [],
      });
    }

    return appliedProducts;
  }

  separateDiscountFromProrateAmount({
    coupon,
    nextPlanData,
    planPrice,
  }: { coupon: Stripe.Coupon; nextPlanData: Stripe.Invoice['lines']['data']; planPrice: number; stripeAccountId: string }) {
    const appliesTo = coupon.applies_to;
    const appliedPlanData = !appliesTo ? nextPlanData : nextPlanData.filter((line) => appliesTo.products.includes(line.price.product as string));
    const nonAppliedPlanData = !appliesTo ? [] : nextPlanData.filter((line) => !appliesTo.products.includes(line.price.product as string));
    const percentOff = get(coupon, 'percent_off', 0);
    if (percentOff === 100) {
      const appliedPlanPrice = sumBy(appliedPlanData, (line) => Math.abs(Number(get(line, 'price.unit_amount', 0))) * get(line, 'quantity', 1));
      const nonAppliedPlanPrice = sumBy(nonAppliedPlanData, (line) => Math.abs(Number(get(line, 'price.unit_amount', 0))) * get(line, 'quantity', 1));
      const planPriceBeforeDiscount = appliedPlanPrice + nonAppliedPlanPrice;
      return { total: planPriceBeforeDiscount, discount: appliedPlanPrice };
    }

    const appliedPlanPrice = sumBy(appliedPlanData, (line) => Math.abs(Number(get(line, 'amount', 0))));
    const nonAppliedPlanPrice = sumBy(nonAppliedPlanData, (line) => Math.abs(Number(get(line, 'amount', 0))));
    // fallback to 1 so we don't get invalid expression if the mutiplier is 0
    const discountMultiplier = (1 - (percentOff / 100)) || 1;
    const planPriceBeforeDiscount = Math.round(appliedPlanPrice / discountMultiplier) + nonAppliedPlanPrice;
    return { total: planPriceBeforeDiscount, discount: planPriceBeforeDiscount - planPrice };
  }

  deductRemainingAmount(
    price: { remaining: number, amountDue: number, creditBalance: number, nextBillingPrice: number },
    deductionTotal: number,
  ): { remaining: number, amountDue: number, creditBalance: number, nextBillingPrice: number } {
    const {
      remaining, amountDue, creditBalance, nextBillingPrice,
    } = price;
    const returnRemaining = remaining + deductionTotal;
    const subtractedAmountDue = amountDue - deductionTotal;
    if (subtractedAmountDue < 0) {
      return {
        creditBalance: creditBalance - subtractedAmountDue,
        remaining: returnRemaining,
        nextBillingPrice: Math.round(Math.max(nextBillingPrice + subtractedAmountDue, 0)),
        amountDue: 0,
      };
    }
    return {
      remaining: returnRemaining,
      amountDue: subtractedAmountDue,
      creditBalance,
      nextBillingPrice: Math.round(nextBillingPrice),
    };
  }

  async previewUpgradeSubscriptionInvoice(params: {
    actor: User,
    orgId: string,
    currentPayment: PaymentSchemaInterface,
    nextPayment: {
      type: PaymentPlanSubscription,
      period: PaymentPeriod,
      currency: Currency,
      status: PaymentStatusEnums,
      couponCode?: string
    },
    stripeAccountId: string,
  }): Promise<PreviewDocStackInvoicePayload> {
    const {
      actor, currentPayment, nextPayment, orgId, stripeAccountId,
    } = params;
    const { couponCode } = nextPayment;
    if (!currentPayment.stripeAccountId) {
      currentPayment.stripeAccountId = stripeAccountId;
    }
    const subscriptionParamsBuilder = new UpdateSubscriptionParamsBuilder(this)
      .from(currentPayment)
      .to(nextPayment);

    const subscriptionParams = (await subscriptionParamsBuilder
      .addCoupon(couponCode)
      .addOrgId(orgId)
      .calculate())
      .getPreviewSubscriptionParams();
    const upcomingInvoice = await this.stripe.invoices.retrieveUpcoming(subscriptionParams, { stripeAccount: params.stripeAccountId });
    return {
      ...await this.interceptStripeInvoiceResponse({
        actor, invoice: upcomingInvoice, subscriptionInfo: subscriptionParamsBuilder, stripeAccountId, orgId,
      }),
      quantity: await subscriptionParamsBuilder.getUpcomingQuantity(),
    };
  }

  async previewUpcomingSubscriptionInvoice(params: {
    actor: User,
    orgId: string,
    currentPayment: PaymentSchemaInterface,
    nextPayment: {
      couponCode?: string
      currency: Currency,
      period: PaymentPeriod,
      status: PaymentStatusEnums,
      stripeAccountId: string,
      subscriptionItems: {
        productName: UnifySubscriptionProduct,
        paymentType: UnifySubscriptionPlan,
        quantity: number;
      }[],
    },
  }): Promise<PreviewUpcomingSubscriptionInvoicePayload> {
    const {
      orgId, actor, currentPayment, nextPayment,
    } = params;
    const { couponCode } = nextPayment;
    if (!currentPayment.stripeAccountId) {
      currentPayment.stripeAccountId = nextPayment.stripeAccountId;
    }
    const payment = await this.getNewPaymentObject(currentPayment);

    let discountCode = couponCode;
    if (couponCode) {
      const promotionCode = await this.getTimeSensitivePromotionCode({ orgId, couponCode, stripeAccountId: nextPayment.stripeAccountId });
      if (promotionCode) {
        discountCode = promotionCode.id;
      }
    }

    const subscriptionParamsBuilder = new UpdateUnifySubscriptionParamsBuilder(this, this.paymentUtilsService)
      .addDiscount(discountCode)
      .from(payment)
      .to(nextPayment);
    await subscriptionParamsBuilder.calculate();

    const subscriptionParams = subscriptionParamsBuilder.getPreviewSubscriptionParams();
    const recurringSubscriptionParams = await subscriptionParamsBuilder.calculatePreviewRecurring();
    const [upcomingInvoice, recurringInvoice, testClockFrozenTime] = await Promise.all([
      this.retrieveUpcomingInvoice(subscriptionParams, { stripeAccount: nextPayment.stripeAccountId }),
      this.retrieveUpcomingInvoice(recurringSubscriptionParams, { stripeAccount: nextPayment.stripeAccountId }),
      subscriptionParamsBuilder.getTestClockFrozenTime(),
    ]);

    const result = await this.interceptStripeInvoiceResponse({
      actor,
      invoice: upcomingInvoice,
      recurringInvoice,
      subscriptionInfo: subscriptionParamsBuilder,
      stripeAccountId: nextPayment.stripeAccountId,
      orgId,
    });
    return {
      ...result,
      isUpgradePlanAnnual: result.isUpgradeDocStackAnnual,
      testClockFrozenTime: testClockFrozenTime ? String(testClockFrozenTime * 1000) : null,
    };
  }

  async getUnusedProrationInfo(subscriptionRemoteId: string, stripeAccountId: string): Promise<{ amount: number, billingTimeStamp: string }> {
    const prorationInvoice = await this.retrieveUpcomingInvoice({
      subscription: subscriptionRemoteId,
      subscription_proration_date: Math.floor(Date.now() / 1000),
      subscription_billing_cycle_anchor: 'now',
      subscription_proration_behavior: 'always_invoice',
    }, { stripeAccount: stripeAccountId });
    return {
      amount: Math.abs(Number(get(prorationInvoice, 'lines.data[0].amount', 0))),
      billingTimeStamp: String(get(prorationInvoice, 'lines.data[0].period.end', 0)),
    };
  }

  async createCustomerBalance(
    params: { customerRemoteId: string, subscriptionRemoteId: string, currency: Currency, stripeAccountId: string },
  ): Promise<number> {
    const {
      customerRemoteId, subscriptionRemoteId, currency, stripeAccountId,
    } = params;
    try {
      const { amount: remainingUnusedAmount } = await this.getUnusedProrationInfo(subscriptionRemoteId, stripeAccountId);
      if (remainingUnusedAmount > 0) {
        await this.createBalanceTransaction(
          customerRemoteId,
          { amount: -remainingUnusedAmount, currency: currency.toLowerCase(), description: 'The unused time of professional/personal plan' },
        );
      }
      return remainingUnusedAmount;
    } catch (error) {
      this.loggerService.error({
        context: 'createCustomerBalance',
        error,
        extraInfo: params,
      });
      return 0;
    }
  }

  async getTotalDocStackUsed(orgId: string): Promise<number> {
    return this.organizationDocStackService.countFinishedDocs(orgId);
  }

  getFreeTrialTime(): number {
    return moment()
      .add(this.FREE_TRIAL_TIME, this.FREE_TRIAL_TIME_UNIT as moment.unitOfTime.Base)
      .unix();
  }

  async handleStripeEarlyFraudWarning(params: {
    data: Stripe.RadarEarlyFraudWarningCreatedEvent.Data,
    stripeAccount: string
  }): Promise<void> {
    const { data: { object: eventData }, stripeAccount } = params;

    const chargeInfo = await this.retrieveCharge({
      chargeId: eventData.charge as string,
      options: { stripeAccount },
      params: { expand: ['invoice'] },
    });
    if (!chargeInfo) {
      return;
    }
    const subscriptionId = (chargeInfo.invoice as Stripe.Invoice).subscription as string;
    const currency = chargeInfo.currency.toUpperCase();
    const { refundedAmount } = await this.refundFraudChargesOfCustomer({
      customerId: chargeInfo.customer as string,
      fraudPaymentMethod: chargeInfo.payment_method,
      stripeAccount,
    });
    if (refundedAmount > 0) {
      this.loggerService.info({
        context: 'handleStripeEarlyFraudWarning',
        extraInfo: {
          refundedAmount,
          customerRemoteId: chargeInfo.customer,
          earlyFraudWarningObject: eventData,
        },
      });
      if (subscriptionId) {
        this.redisService.setStripeRefundFraudWarning(
          chargeInfo.customer as string,
          `${Utils.convertCurrencySymbol(currency as PaymentCurrencyEnums)}${refundedAmount / 100} ${currency}`,
        );
        this.cancelStripeSubscription(subscriptionId, null, { stripeAccount });
      }
    }
  }

  async refundFraudChargesOfCustomer(params: {
    customerId: string, fraudPaymentMethod: string, stripeAccount: string
  }): Promise<{ refundedAmount: number }> {
    const { customerId, fraudPaymentMethod, stripeAccount } = params;
    const chargeListReponse = await this.retrieveChargeList(customerId, { stripeAccount });
    const chargeListData: any[] = get(chargeListReponse, 'data', []);
    const refundedAmount = await chargeListData.reduce(async (totalPromise: Promise<number>, chargeObject) => {
      const isChargeDisputed = get(chargeObject, 'disputed');
      const isChargeRefunded = get(chargeObject, 'refunded');
      const isChargeFail = !get(chargeObject, 'paid');
      const isChargeFromFraudSource = get(chargeObject, 'payment_method') === fraudPaymentMethod;
      const total = await totalPromise;
      if (chargeObject.amount > 0 && isChargeFromFraudSource && !isChargeDisputed && !isChargeRefunded && !isChargeFail) {
        const result = await this.createRefund({ charge: chargeObject.id, reason: 'fraudulent' }, { stripeAccount });
        if (result.amount) {
          return total + Number(result.amount);
        }
      }
      return total;
    }, Promise.resolve(0));

    return { refundedAmount };
  }

  async sendOrgSubscriptionCanceledEmail(params: {
    refundedFraudWarningAmount: string, targetEmails: string[], orgData: IOrganization, numberDaysUsePremium: number
  }): Promise<void> {
    const {
      refundedFraudWarningAmount, targetEmails, orgData, numberDaysUsePremium,
    } = params;
    const { name, _id: orgId, payment } = orgData;
    if (refundedFraudWarningAmount) {
      this.emailService.sendEmailHOF(
        EMAIL_TYPE.SUBSCRIPTION_CANCELED_AS_FRAUD_DETECTED,
        targetEmails,
        {
          refundedAmount: refundedFraudWarningAmount,
        },
      );
    } else {
      this.emailService.sendEmailHOF(
        EMAIL_TYPE.CANCEL_PLAN_ORGANIZATION,
        targetEmails,
        {
          subject: SUBJECT[EMAIL_TYPE.CANCEL_PLAN_ORGANIZATION.description].replace('#{orgName}', name),
          orgName: name,
          orgId,
          period: payment.period,
          numberDaysUsePremium,
          subscriptionItem: (await this.getNewPaymentObject(payment)).subscriptionItems,
        },
      );
    }
  }

  sendIndividualSubscriptionCanceledEmail(params: {
    refundedFraudWarningAmount: string, targetEmails: string[], userData: User, numberDaysUsePremium: number
  }): void {
    const {
      refundedFraudWarningAmount, targetEmails, userData, numberDaysUsePremium,
    } = params;
    if (refundedFraudWarningAmount) {
      this.emailService.sendEmailHOF(
        EMAIL_TYPE.SUBSCRIPTION_CANCELED_AS_FRAUD_DETECTED,
        targetEmails,
        {
          refundedAmount: refundedFraudWarningAmount,
        },
      );
    } else {
      this.emailService.sendEmailHOF(
        EMAIL_TYPE.CANCEL_PLAN,
        targetEmails,
        {
          period: userData.payment.period,
          numberDaysUsePremium,
        },
      );
    }
  }

  async createOldPlanSubscription(params: CreateOldPlanSubscriptionDto): Promise<void> {
    const {
      email, plan, period, currency, quantity, orgId, priceVersion,
    } = params;
    const cardInfo = JSON.parse(this.environmentService.getByKey(EnvConstants.OLD_PLAN_CARD_INFO));
    const couponCode = this.environmentService.getByKey(EnvConstants.OLD_PLAN_SUBSCRIPTION_COUPON);
    const user = await this.userService.findUserByEmail(email);
    if (!user) throw GrpcErrorException.NotFound('User not found', ErrorCode.User.USER_NOT_FOUND);
    const userId = user._id;
    const getStripePlanParams: GetStripePlanParam = {
      plan,
      period,
      currency,
      priceVersion,
    };
    const planRemoteId = priceVersion
      ? this.environmentService.getStripePlanWithVersion(getStripePlanParams)
      : this.getStripePlanRemoteId({ ...getStripePlanParams, stripeAccountId: this.stripeNZAccountId });
    const organization = plan === OldPlans.BUSINESS ? await this.organizationService.getOrgById(orgId) : null;
    if (plan === OldPlans.BUSINESS && !organization) {
      throw GrpcErrorException.NotFound('Organization not found', DefaultErrorCode.NOT_FOUND);
    }
    if (plan === OldPlans.BUSINESS && organization.payment.type !== PaymentPlanEnums.FREE) {
      throw GrpcErrorException.Unknown('Only accept free organization', DefaultErrorCode.BAD_REQUEST);
    }
    let customer;
    try {
      const createdCardToken = await this.stripe.tokens.create(
        {
          card: {
            number: cardInfo.number,
            exp_month: cardInfo.expireMonth,
            exp_year: cardInfo.expireYear,
            cvc: cardInfo.cvc,
          },
        },
        { stripeAccount: this.stripeNZAccountId },
      );
      customer = await this.createCustomer({
        customer: { method: CustomerCreationMethod.SOURCE_TOKEN, value: createdCardToken.id },
        customerInfo: user,
        targetId: orgId,
        stripeAccountId: this.stripeNZAccountId,
      });
      const subscription = await this.createStripeSubscription({
        customer: customer.id,
        items: [{
          plan: planRemoteId,
          quantity: plan !== OldPlans.BUSINESS ? 1 : quantity,
        }],
        payment_behavior: 'error_if_incomplete',
        coupon: couponCode,
      }, { stripeAccount: this.stripeNZAccountId });
      if (plan === OldPlans.BUSINESS) {
        this.redisService.setSubscriptionActor(customer.id as string, userId);
        await this.organizationService.updateOrganizationProperty(orgId, {
          payment: {
            customerRemoteId: customer.id,
            planRemoteId,
            type: plan,
            period,
            status: PaymentStatusEnums.ACTIVE,
            quantity,
            currency,
            subscriptionRemoteId: subscription.id,
            trialInfo: null,
            stripeAccountId: this.stripeNZAccountId,
          },
          'settings.inviteUsersSetting': InviteUsersSettingEnum.ADMIN_BILLING_CAN_INVITE,
        });
        return;
      }
      await this.userService.updateUserPropertyById(userId, {
        payment: {
          customerRemoteId: customer.id,
          planRemoteId,
          type: plan,
          period,
          status: PaymentStatusEnums.ACTIVE,
          quantity: 1,
          currency,
          subscriptionRemoteId: subscription.id,
          stripeAccountId: this.stripeNZAccountId,
        },
        'metadata.isMigratedPersonalDoc': false,
      });
    } catch (error) {
      if (customer) {
        await this.stripe.customers.del(customer.id as string);
      }
      this.loggerService.error({
        context: 'createOldPlanSubscription',
        error: error.message,
        errorCode: error.code,
        stack: error.stack,
      });
      throw GrpcErrorException.Unknown('Error when creating old plan subscription', DefaultErrorCode.INTERNAL_SERVER_ERROR);
    }
  }

  async retrieveSetupIntentSecret(params: { userId: string, stripeAccountId: string, score: number, openGoogleReferrer: string[] }): Promise<string> {
    const {
      userId,
      stripeAccountId,
      score,
      openGoogleReferrer,
    } = params;
    const setupIntentId = await this.redisService.getSetupIntent(userId, stripeAccountId);
    let setupIntent;
    if (setupIntentId) {
      setupIntent = await this.retrieveSetupIntent(setupIntentId, stripeAccountId);
    } else {
      setupIntent = await this.createSetupIntent({
        metadata: {
          lumin_user_id: userId,
          stripe_account_id: stripeAccountId,
          recaptchaScore: score,
          ...(openGoogleReferrer.length && { openGoogleReferrer: openGoogleReferrer.join() }),
        },
      }, { stripeAccount: stripeAccountId });
      this.redisService.setSetupIntent({
        userId,
        setupIntentId: setupIntent.id,
        status: IntentStatus.ACTIVE,
        stripeAccountId,
      });
    }

    return setupIntent.client_secret;
  }

  async deactivateSetupIntent(userId: string, stripeAccountId: string): Promise<void> {
    const setupIntentId = await this.redisService.getSetupIntent(userId, stripeAccountId);
    if (setupIntentId) {
      this.redisService.setSetupIntent({
        userId, setupIntentId, status: IntentStatus.INACTIVE, stripeAccountId,
      });
    }
  }

  async removePaymentMethodsFromCustomer(params: {customerRemoteId: string, stripeAccountId: string, except?: string}): Promise<void> {
    const { customerRemoteId, except, stripeAccountId } = params;
    try {
      const paymentMethods = await this.getAllCustomerPaymentMethods(customerRemoteId, null, { stripeAccount: stripeAccountId });
      const paymentMethodsData = paymentMethods?.data;
      if (!paymentMethodsData.length) {
        throw GraphErrorException.NotFound('Payment method not found', DefaultErrorCode.NOT_FOUND, {
          customerRemoteId,
          stripeAccountId,
        });
      }
      const paymentMethodsToRemove = paymentMethodsData.filter((paymentMethod) => paymentMethod.id !== except);
      await Promise.all(paymentMethodsToRemove.map((paymentMethod) => {
        if (this.paymentUtilsService.isSourceCard(paymentMethod.id)) {
          return this.detachPaymentSource(customerRemoteId, paymentMethod.id, null, { stripeAccount: stripeAccountId });
        }
        if (this.paymentUtilsService.isPaymentMethod(paymentMethod.id)) {
          return this.detachPaymentMethod(paymentMethod.id, null, { stripeAccount: stripeAccountId });
        }
        throw GraphErrorException.BadRequest('Payment method is invalid', DefaultErrorCode.BAD_REQUEST, {
          paymentMethodId: paymentMethod.id,
          customerRemoteId,
          stripeAccountId,
        });
      }));
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw GraphErrorException.BadRequest(error.message, error.extensions.code, {
        customerRemoteId,
        stripeAccountId,
      });
    }
  }

  getPlanText(orgPlan: PaymentPlanEnums, isTrial: boolean): string {
    return `${PLAN_TEXT_EVENT[orgPlan]}${isTrial ? ' Trial' : ''}`;
  }

  getPaymentPlan = ({
    planId,
    period,
    currency,
    stripeAccountId,
  }: { planId: string, period: PaymentPeriodEnums, currency: PaymentCurrencyEnums, stripeAccountId: string }): PaymentPlanEnums => [
    PaymentPlanEnums.PERSONAL,
    PaymentPlanEnums.PROFESSIONAL,
    PaymentPlanEnums.TEAM,
    PaymentPlanEnums.ENTERPRISE,
    PaymentPlanEnums.BUSINESS,
    PaymentPlanEnums.ORG_STARTER,
    PaymentPlanEnums.ORG_PRO,
    PaymentPlanEnums.ORG_BUSINESS,
  ].find((plan) => this.getStripePlanRemoteId({
    plan, period, currency, stripeAccountId,
  }) === planId);

  sendPurchaseGaEvent(data: { paymentTarget: Record<string, any>, invoice: Record<string, any> }): void {
    const { paymentTarget, invoice } = data;
    const { _id: ownerId, name, payment } = paymentTarget;
    const { type, period } = payment;
    const {
      id: invoiceId,
      currency,
      total: amountDue,
      subtotal: amountWithoutDiscount,
    } = invoice;

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        api_secret: this.gaApiSecret,
        measurement_id: this.gaMeasurementId,
      },
    };
    const planName = `${this.getPlanText(type as PaymentPlanEnums, false)} ${capitalize(period as string)} Plan`;
    const payload = {
      client_id: `server_${uuid()}`,
      user_id: ownerId,
      events: [{
        name: 'purchase',
        params: {
          transaction_id: `${invoiceId}_${snakeCase(planName)}`,
          value: Utils.formatPrice(amountDue as number),
          transaction_description: planName,
          currency: currency.toUpperCase(),
          items: [{
            item_id: snakeCase(planName),
            item_name: planName,
            price: Utils.formatPrice(amountWithoutDiscount as number),
            discount: Utils.formatPrice(amountWithoutDiscount - amountDue),
          }],
        },
      }],
    };

    this.loggerService.info({
      context: 'purchaseGaEventData',
      extraInfo: {
        paymentInfo: {
          _id: ownerId,
          name,
          payment,
        },
        eventPayload: payload,
      },
    });

    this.httpService.post(
      CommonConstants.GA_MEASUREMENT_PROTOCOL_ENDPOINT,
      payload,
      config,
    )
      .pipe(map((res) => res as { data: any }))
      .toPromise();
  }

  async previewPaymentLinkSubscriptionInvoice({
    currentPayment, upcomingPayment, orgId,
  } : {
    orgId: string,
    currentPayment: PaymentSchemaInterface,
    upcomingPayment: {
      type: DocStackPlan,
      period: PaymentPeriodEnums,
      couponCode: string,
      currency: PaymentCurrencyEnums,
      quantity: number,
      customerRemoteId: string,
    }
  }): Promise<PreviewPaymentLinkInvoicePayload> {
    const {
      type,
      period,
      couponCode,
      quantity,
    } = upcomingPayment;
    const stripeAccountId = currentPayment.stripeAccountId || this.stripeNZAccountId;
    const subscriptionParamsBuilder = new PaymentCustomizeParamsBuilder(this)
      .from(Object.assign(currentPayment, { stripeAccountId }))
      .to(upcomingPayment);
    const subscriptionParams = await subscriptionParamsBuilder
      .setCustomerRemoteId(currentPayment.customerRemoteId)
      .addCoupon(couponCode)
      .getParams();
    const upcomingInvoice = await this.stripe.invoices.retrieveUpcoming(subscriptionParams.preview, { stripeAccount: stripeAccountId });
    return {
      ...await this.interceptStripeInvoiceResponse({
        invoice: upcomingInvoice, subscriptionInfo: subscriptionParamsBuilder, stripeAccountId, orgId,
      }),
      docstack: planPoliciesHandler.from({ plan: type, period }).getDocStack(quantity),
      period: period as unknown as PaymentPeriod,
      plan: type,
    };
  }

  async getStripeAccountIdForGetCouponValue({
    orgId, stripeAccountIdInput, isAdminCharge, countryCode,
  }: {
      orgId: string,
      stripeAccountIdInput: string,
      isAdminCharge: boolean,
      countryCode?: CountryCode,
    }) {
    if (!orgId) {
      return stripeAccountIdInput || this.getStripeAccountFromCountryCode(countryCode);
    }
    const org = await this.organizationService.getOrgById(orgId);
    if (!org) {
      return stripeAccountIdInput || this.getStripeAccountFromCountryCode(countryCode);
    }
    return this.getStripeAccountId({
      payment: org.payment, stripeAccountIdInput, isAdminCharge,
    });
  }

  async validateAndGetCouponValue({
    plan, period, currency, couponCode, orgId, stripeAccountId: stripeAccountIdInput, isAdminCharge, countryCode,
  } : {
    plan: PaymentPlanSubscription,
    period: PaymentPeriod,
    currency: Currency,
    couponCode: string,
    orgId: string,
    stripeAccountId?: string,
    isAdminCharge?: boolean,
    countryCode?: CountryCode,
  }): Promise<{ coupon?: CouponValueResponse, error?: GraphErrorException }> {
    let couponValue = null;

    const stripeAccountId = await this.getStripeAccountIdForGetCouponValue({
      orgId, stripeAccountIdInput, isAdminCharge, countryCode,
    });

    const planRemoteId = this.getStripePlanRemoteId({
      plan, period, currency, stripeAccountId,
    });

    try {
      couponValue = await this.stripe.coupons.retrieve(couponCode, { expand: ['applies_to'] }, { stripeAccount: stripeAccountId });
    } catch (error) {
      return { error: GraphErrorException.BadRequest(ErrorMessage.COUPON.INVALID, ErrorCode.Payment.INVALID_COUPON_CODE) };
    }

    if (!couponValue.valid) {
      throw GraphErrorException.BadRequest(ErrorMessage.COUPON.INVALID, ErrorCode.Payment.INVALID_COUPON_CODE);
    }
    if (couponValue.id === FREE_30_DAYS_BUSINESS_COUPON_ID) {
      const isValidCoupon = await this.validateFree30Coupon({
        orgId, incomingPlan: plan, incomingPeriod: period, stripeAccountId,
      });
      if (!isValidCoupon) {
        return { error: GraphErrorException.BadRequest(ErrorMessage.COUPON.INVALID, ErrorCode.Payment.INVALID_COUPON_CODE) };
      }
    }

    // check if coupon only apply for specific products
    // eslint-disable-next-line camelcase
    const products = couponValue?.applies_to?.products;
    if (products && products.length) {
      const priceInfo = await this.stripe.prices.retrieve(planRemoteId, null, { stripeAccount: stripeAccountId });
      const isValidPriceToUseCoupon = products.includes(priceInfo.product);
      if (!isValidPriceToUseCoupon) {
        return { error: GraphErrorException.BadRequest(ErrorMessage.COUPON.INVALID, ErrorCode.Payment.INVALID_COUPON_CODE) };
      }
    }

    if (couponValue.percent_off) {
      return {
        coupon: {
          type: 'percent_off',
          value: couponValue.percent_off,
        },
      };
    }

    return {
      coupon: {
        type: 'amount_off',
        value: couponValue.amount_off,
      },
    };
  }

  async validateAndGetSubscriptionCoupon({
    couponCode, orgId, stripeAccountId: stripeAccountIdInput, isAdminCharge, countryCode, subscriptionItems, currency, period,
  } : {
    couponCode: string,
    orgId: string,
    stripeAccountId?: string,
    isAdminCharge?: boolean,
    countryCode?: CountryCode,
    subscriptionItems: Pick<SubscriptionItem, 'paymentType'>[];
    currency: Currency;
    period: PaymentPeriod;
  }) {
    const currentTime = Math.floor(Date.now() / 1000);
    const stripeAccountId = await this.getStripeAccountIdForGetCouponValue({
      orgId, stripeAccountIdInput, isAdminCharge, countryCode,
    });

    let couponValue: Stripe.Coupon;
    const promotionCode = await this.getTimeSensitivePromotionCode({ orgId, couponCode, stripeAccountId });
    if (promotionCode) {
      couponValue = promotionCode.coupon;
      this.validatePromotionCode({ promotionCode, stripeAccountId, period });
    } else {
      couponValue = await this.retrieveStripeCoupon(
        couponCode,
        { expand: ['applies_to', 'currency_options'] },
        { stripeAccount: stripeAccountId },
      ).catch(() => {
        throw GraphErrorException.BadRequest(ErrorMessage.COUPON.INVALID, ErrorCode.Payment.COUPON_NOT_FOUND);
      });
    }

    if (!couponValue.valid) {
      if (couponValue.redeem_by && couponValue.redeem_by < currentTime) {
        throw GraphErrorException.BadRequest(ErrorMessage.COUPON.EXPIRED, ErrorCode.Payment.EXPIRED_COUPON_CODE);
      }
      if (couponValue?.max_redemptions && couponValue.times_redeemed >= couponValue.max_redemptions) {
        throw GraphErrorException.BadRequest(ErrorMessage.COUPON.LIMIT_REACHED, ErrorCode.Payment.COUPON_LIMIT_REACHED);
      }
      throw GraphErrorException.BadRequest(ErrorMessage.COUPON.INVALID, ErrorCode.Payment.INVALID_COUPON_CODE);
    }
    if (couponValue.currency_options && !couponValue.currency_options[currency.toLowerCase()]) {
      throw GraphErrorException.BadRequest(ErrorMessage.COUPON.INVALID_CURRENCY, ErrorCode.Payment.INVALID_CURRENCY);
    }

    const products = couponValue?.applies_to?.products;
    if (products && products.length) {
      const isInvalidPriceToUseCoupon = subscriptionItems.every((sub) => {
        const stripeAccountName = this.paymentUtilsService.getStripeAccountName({ stripeAccountId });

        const product = this.environmentService.getStripeProduct({
          plan: sub.paymentType as PaymentPlanEnums,
          stripeAccountName,
        });
        return !products.includes(product);
      });
      if (isInvalidPriceToUseCoupon) {
        throw GraphErrorException.BadRequest(ErrorMessage.COUPON.INVALID, ErrorCode.Payment.NOT_APPLICABLE);
      }
    }

    if (couponValue.percent_off) {
      return {
        type: 'percent_off',
        value: couponValue.percent_off,
      };
    }

    return {
      type: 'amount_off',
      value: couponValue.amount_off,
    };
  }

  async sendUpgradeDocstackEmail({
    organization, currentPayment, upcomingPayment, invoice,
  } : {
    organization: IOrganization, currentPayment: PaymentSchemaInterface, upcomingPayment: PaymentSchemaInterface, invoice: Stripe.Invoice
  }): Promise<void> {
    const receiverEmail = (await this.organizationService.getOrganizationMemberByRole(
      organization._id,
      [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR],
    )).map((user) => user.email);
    const isOldPlan = (plan: PaymentPlanEnums) => [PaymentPlanEnums.BUSINESS, PaymentPlanEnums.ENTERPRISE].includes(plan);
    const getEmailData = () => {
      const oldDocstack = planPoliciesHandler
        .from({ plan: currentPayment.type, period: currentPayment.period })
        .getDocStack(currentPayment.quantity);
      const newDocstack = planPoliciesHandler
        .from({ plan: upcomingPayment.type, period: upcomingPayment.period })
        .getDocStack(upcomingPayment.quantity);
      return {
        subject: SUBJECT[EMAIL_TYPE.ORGANIZATION_UPGRADE_NEW_PRICING_SUBSCRIPTION.description].replace('#{orgName}', organization.name),
        orgName: organization.name,
        orgId: organization._id,
        oldPeriod: capitalize(currentPayment.period),
        newPeriod: capitalize(upcomingPayment.period),
        oldDocstack: isOldPlan(currentPayment.type as PaymentPlanEnums) ? 0 : oldDocstack,
        newDocstack,
        oldPlan: PLAN_TEXT[currentPayment.type],
        newPlan: PLAN_TEXT[upcomingPayment.type],
      };
    };
    const attachments = await this.getInvoiceEmailAttachment({ invoice });
    this.emailService.sendEmailHOF(
      EMAIL_TYPE.ORGANIZATION_UPGRADE_NEW_PRICING_SUBSCRIPTION,
      receiverEmail,
      getEmailData(),
      attachments,
    );
  }

  async trackPurchaseEventToBraze({
    paymentTarget, invoiceData, paymentType,
  }:{ paymentTarget: any, invoiceData: any, paymentType: PaymentTypeEnums }): Promise<void> {
    if (!invoiceData) {
      return;
    }
    const { amount_paid: amountPaid, currency, customer_email: customerEmail } = invoiceData;
    const { plan } = get(invoiceData, 'lines.data[0]', {});
    if (!amountPaid) {
      return;
    }
    if (!customerEmail) {
      return;
    }
    let externalId;
    let properties;
    if (paymentType === PaymentTypeEnums.ORGANIZATION) {
      const user = await this.userService.findUserByEmail(customerEmail as string);
      externalId = user._id;
      properties = {
        circle_id: paymentTarget._id,
      };
    } else {
      externalId = paymentTarget._id;
    }
    const period = this.getPeriodFromInterval(plan.interval as PaymentIntervalEnums);
    const purchaseEvents: IPurchaseEvent[] = [{
      external_id: externalId,
      currency: currency.toUpperCase(),
      price: amountPaid / 100,
      product_id: `Lumin PDF ${this.getPlanText(paymentTarget.payment.type as PaymentPlanEnums, false)} ${capitalize(period)}`,
      time: new Date(),
      ...properties && { properties },
    }];
    this.brazeService.trackPurchaseEvent(purchaseEvents);
  }

  getOrgWithHighestPlan(orgsWithRole: IOrganizationWithRole[]): IOrganizationWithRole {
    const paymentTypePriority = {
      [PaymentPlanEnums.ORG_BUSINESS]: 1,
      [PaymentPlanEnums.ORG_PRO]: 2,
      [PaymentPlanEnums.ORG_STARTER]: 3,
      [PaymentPlanEnums.ENTERPRISE]: 4,
      [PaymentPlanEnums.BUSINESS]: 5,
      [PaymentPlanEnums.FREE]: 6,
    };
    const paymentPeriodPriority = {
      [PaymentPeriodEnums.ANNUAL]: 1,
      [PaymentPeriodEnums.MONTHLY]: 2,
    };
    const rolePriority = {
      [OrganizationRoleEnums.ORGANIZATION_ADMIN]: 1,
      [OrganizationRoleEnums.BILLING_MODERATOR]: 2,
      [OrganizationRoleEnums.MEMBER]: 3,
    };
    const statusPriority = {
      [PaymentStatusEnums.ACTIVE]: 1,
      [PaymentStatusEnums.UNPAID]: 2,
      [PaymentStatusEnums.CANCELED]: 3,
      [PaymentStatusEnums.TRIALING]: 4,
    };
    const sortedByPlan = (currentOrg, nextOrg) => {
      const paymentTypePriorityCurrentOrg = paymentTypePriority[currentOrg.organization.payment.type];
      const paymentTypePriorityNextOrg = paymentTypePriority[nextOrg.organization.payment.type];
      const periodPriorityCurrentOrg = paymentPeriodPriority[currentOrg.organization.payment.period] || 0;
      const periodPriorityNextOrg = paymentPeriodPriority[nextOrg.organization.payment.period] || 0;
      const rolePriorityCurrentOrg = rolePriority[currentOrg.role] || 0;
      const rolePriorityNextOrg = rolePriority[nextOrg.role] || 0;
      const planStatusPriorityCurrentOrg = statusPriority[currentOrg.organization.payment.status] || 0;
      const planStatusPriorityNextOrg = statusPriority[nextOrg.organization.payment.status] || 0;
      if ((paymentTypePriorityCurrentOrg - paymentTypePriorityNextOrg) !== 0) {
        return paymentTypePriorityCurrentOrg - paymentTypePriorityNextOrg;
      }
      if ((periodPriorityCurrentOrg - periodPriorityNextOrg) !== 0) {
        return periodPriorityCurrentOrg - periodPriorityNextOrg;
      }
      if ((rolePriorityCurrentOrg - rolePriorityNextOrg) !== 0) {
        return rolePriorityCurrentOrg - rolePriorityNextOrg;
      }
      return planStatusPriorityCurrentOrg - planStatusPriorityNextOrg;
    };
    return orgsWithRole.sort(sortedByPlan)[0];
  }

  async getHighestCirclePlan(
    orgsWithRole: IOrganizationWithRole[],
    userId: string,
  ): Promise<{ type: PaymentPlanEnums, status: PaymentStatusEnums, role: string, targetId: string }> {
    const user = await this.userService.findUserById(userId);
    if (!orgsWithRole.length) {
      return {
        type: user.payment.type as PaymentPlanEnums,
        status: user.payment.status as PaymentStatusEnums,
        role: OrganizationRoleEnums.ORGANIZATION_ADMIN,
        targetId: user._id,
      };
    }
    const highestOrg = this.getOrgWithHighestPlan(orgsWithRole);
    if (
      user.payment.type !== PaymentPlanEnums.FREE
        && highestOrg.organization.payment.type === PaymentPlanEnums.FREE) {
      return {
        type: user.payment.type as PaymentPlanEnums,
        status: user.payment.status as PaymentStatusEnums,
        role: OrganizationRoleEnums.ORGANIZATION_ADMIN,
        targetId: user._id,
      };
    }
    return {
      type: highestOrg.organization.payment.type as PaymentPlanEnums,
      status: highestOrg.organization.payment.status as PaymentStatusEnums,
      role: highestOrg.role,
      targetId: highestOrg.organization._id,
    };
  }

  public getStripeAccountId(
    {
      payment, userCountrycode, isAdminCharge, stripeAccountIdInput,
    }
    : {
      payment: PaymentSchemaInterface | Partial<PaymentSchemaInterface>,
      stripeAccountIdInput?: string,
      userCountrycode?: CountryCode,
      isAdminCharge?: boolean
     },
  ): string {
    if (payment.stripeAccountId) {
      return payment.stripeAccountId;
    }

    if (stripeAccountIdInput) {
      return stripeAccountIdInput;
    }

    if (isAdminCharge) {
      return this.stripeNZAccountId;
    }

    return this.getStripeAccountFromCountryCode(userCountrycode);
  }

  public getStripeAccountFromCountryCode(countryCode: CountryCode): string {
    if (this.isDisabledStripeUS) {
      return this.stripeNZAccountId;
    }
    const accountMapping = {
      [CountryCodeEnums.US]: this.stripeUSAccountId,
    };
    return accountMapping[countryCode] || this.stripeNZAccountId;
  }

  async getCustomerInfo(target: IOrganization, type: PaymentType): Promise<CustomerInfoResponse> {
    const { payment } = target;
    if (type === PaymentType.ORGANIZATION && payment?.currency) {
      return {
        email: target.billingEmail,
        currency: payment.currency as Currency,
      };
    }
    const customer = await this.retrieveCustomer(
      payment.customerRemoteId,
      null,
      { stripeAccount: payment.stripeAccountId },
    ) as Stripe.Customer;
    if (!customer) {
      return null;
    }

    return {
      email: customer.email,
      currency: customer.currency?.toUpperCase() as Currency,
    };
  }

  isStripeUS = (stripeAccountId: string): boolean => stripeAccountId === this.stripeUSAccountId;

  async addTrialDays(params: { payment: Payment, days: number }): Promise<void> {
    const { payment, days } = params;
    const { subscriptionRemoteId: subscriptionId, stripeAccountId } = payment;
    const subscription = await this.getStripeSubscriptionInfo({
      subscriptionId,
      options: { stripeAccount: stripeAccountId },
    });
    await this.updateStripeSubscription(
      subscriptionId,
      { trial_end: moment(subscription.trial_end * 1000).add(days, 'days').unix() },
      { stripeAccount: stripeAccountId },
    );
  }

  async getLastSubscriptionEndedAt({
    orgId,
    customerId,
    stripeAccountId,
  }: {
    orgId: string,
    customerId: string,
    stripeAccountId: string,
  }) {
    const subscriptionCanceledDate = await this.redisService.getSubscriptionCanceledDate({ orgId });
    if (subscriptionCanceledDate) {
      return subscriptionCanceledDate;
    }

    const { data } = await this.getListSubscriptions(
      {
        customer: customerId,
        status: SubscriptionStatus.CANCELED,
      },
      { stripeAccount: stripeAccountId },
    );
    const subscription = maxBy(data, 'ended_at');
    if (!subscription) {
      return null;
    }

    this.redisService.setSubscriptionCanceledDate({ orgId, value: subscription.ended_at });
    return subscription.ended_at;
  }

  async updateStripeCustomerEmail(user: User, newEmail: string, isAdminAction?: boolean): Promise<void> {
    if (user.payment.customerRemoteId) {
      await this.updateStripeCustomer(
        user.payment.customerRemoteId,
        { email: newEmail },
        { stripeAccount: this.getStripeAccountId({ payment: user.payment, isAdminCharge: isAdminAction }) },
      );
    }

    const organizations = await this.organizationService.getOrgListByUser(user._id, { filterQuery: { billingEmail: user.email } });
    if (!organizations.length) {
      return;
    }

    await this.organizationService.updateManyOrganizations(
      { _id: { $in: organizations.map((org) => org._id) } },
      { billingEmail: newEmail },
    );

    await Promise.all(
      organizations
        .filter((org) => org.payment.customerRemoteId)
        .map((org) => this.updateStripeCustomer(
          org.payment.customerRemoteId,
          { email: newEmail },
          { stripeAccount: this.getStripeAccountId({ payment: org.payment, isAdminCharge: isAdminAction }) },
        )),
    );
  }

  async getLatestInvoice(payment: Payment): Promise<Stripe.Invoice> {
    const { subscriptionRemoteId, stripeAccountId } = payment;
    const subscription = await this.getStripeSubscriptionInfo({
      subscriptionId: subscriptionRemoteId,
      params: { expand: ['latest_invoice'] },
      options: { stripeAccount: stripeAccountId },
    });
    return subscription.latest_invoice as Stripe.Invoice;
  }

  async getInvoiceEmailAttachment({ invoice }: { invoice: Stripe.Invoice }): Promise<[{filename: string, data: Buffer}]> {
    try {
      if (!invoice?.invoice_pdf) {
        return null;
      }

      const response = await fetch(invoice.invoice_pdf);
      if (!response.ok) {
        throw new Error(`Failed to download PDF: HTTP ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return [{ filename: `Invoice-${invoice.number}.pdf`, data: Utils.ConvertArrayBufferToBuffer(arrayBuffer) }];
    } catch (error) {
      this.loggerService.warn({
        context: 'downloadInvoicePdf',
        error: error instanceof Error ? error.message : String(error),
        extraInfo: { invoice },
      });
      return null;
    }
  }

  public async updateInvoiceStatementDescriptor({
    customerId,
    invoiceId,
    stripeAccount,
    isFirstRecurringPaymentInvoice,
  }: {
    customerId: string,
    invoiceId: string,
    stripeAccount: string,
    isFirstRecurringPaymentInvoice?: boolean,
  }) {
    try {
      await this.updateInvoice(
        invoiceId,
        {
          statement_descriptor: this.getStatementDescriptor(customerId, isFirstRecurringPaymentInvoice),
        },
        { stripeAccount },
      );
    } catch (error) {
      this.loggerService.error({
        context: 'updateInvoiceStatementDescriptor',
        error,
      });
    }
  }

  public async updateTotalMembersCustomerMetadata(params: {
    orgId: string, customerRemoteId?: string, stripeAccountId?: string
  }) {
    let { customerRemoteId, stripeAccountId } = params;
    const { orgId } = params;
    try {
      if (!customerRemoteId) {
        const org = await this.organizationService.getOrgById(orgId, { payment: 1 });
        if (!org || !org.payment.customerRemoteId) {
          return;
        }
        customerRemoteId = org.payment.customerRemoteId;
        stripeAccountId = org.payment.stripeAccountId;
      }
      const totalMembers = await this.organizationService.countTotalActiveOrgMember({ orgId });
      await this.updateStripeCustomer(customerRemoteId, { metadata: { totalMembers } }, { stripeAccount: stripeAccountId });
    } catch (error) {
      this.loggerService.error({
        context: 'updateTotalMembersCustomerMetadata',
        extraInfo: {
          orgId,
          customerRemoteId,
          stripeAccountId,
        },
        error,
      });
    }
  }

  private async getSmbOrganizationIds(): Promise<string[]> {
    if (this.smbOrganizationIdsCache.length) {
      return this.smbOrganizationIdsCache;
    }

    const csvPath = this.environmentService.getByKey(EnvConstants.SMB_ORGANIZATION_IDS_CSV_PATH);
    if (!csvPath) {
      return [];
    }

    // read the CSV file from S3
    const stream = (await this.awsService.getFileFromTemporaryBucket(csvPath)).Body as Readable;
    const organizationIds: string[] = [];
    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', (row: Record<string, string>) => {
          const orgId = Object.values(row)[0];
          if (orgId && orgId.trim().length > 0) {
            organizationIds.push(orgId.trim());
          }
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
          this.loggerService.error({
            context: 'Read SMB notificationCSV file error',
            error,
          });
        });
    });

    this.smbOrganizationIdsCache = organizationIds;
    return organizationIds;
  }

  public async postSmbNotification({
    organization,
    notificationType,
  }: {
    organization: IOrganization,
    notificationType: SlackSMBNotificationType,
  }): Promise<void> {
    try {
      const smbOrganizationIds = await this.getSmbOrganizationIds();
      if (!smbOrganizationIds.includes(organization._id)) {
        return;
      }

      await this.slackService.postSmbNotification({ organization, notificationType });
    } catch (error) {
      this.loggerService.error({
        context: 'postSmbNotification',
        error,
        extraInfo: { organizationId: organization._id, notificationType },
      });
    }
  }

  async getUnifySubscriptionInfo({
    payment,
  }: { payment: PaymentSchemaInterface; }): Promise<GetUnifySubscriptionPayloadSubInfo> {
    const currentPayment = await this.getNewPaymentObject(payment);
    const { subscriptionRemoteId, subscriptionItems, stripeAccountId } = currentPayment;
    const upcomingInvoice: Stripe.Invoice = await this.retrieveUpcomingInvoice(
      { subscription: subscriptionRemoteId, expand: ['discounts.coupon.applies_to'] },
      { stripeAccount: stripeAccountId },
    ).catch(() => null);

    const subscription = subscriptionRemoteId ? await this.getStripeSubscriptionInfo({
      subscriptionId: subscriptionRemoteId,
      params: { expand: ['latest_invoice'] },
      options: { stripeAccount: stripeAccountId },
    }) : null;
    const totalDiscount = InvoiceUtils.getDiscountAmount(upcomingInvoice);
    const totalBeforeDiscount = InvoiceUtils.calculateTotalBeforeDiscount(upcomingInvoice);
    const coupon = get(upcomingInvoice, 'discounts[0].coupon');
    const discountProducts = this.getDiscountProducts({ coupon, stripeAccountId });

    const items = ([PaymentProductEnums.PDF, PaymentProductEnums.SIGN].map((productName) => {
      const sub = subscriptionItems.find((item) => item.productName === productName) || {} as SubScriptionItemSchemaInterface;
      const stripeLine = InvoiceUtils.findLineByPriceId(upcomingInvoice, sub.planRemoteId);
      let amount = 0;

      if (stripeLine) {
        const price = get(stripeLine, 'price.unit_amount', 0);
        const quantity = get(stripeLine, 'quantity', 0);
        const lineTotal = price * quantity;
        const lineDiscount = get(stripeLine, 'discount_amounts[0].amount', 0);
        const isDiscountApplicable = discountProducts.some((discount) => discount.productName === productName as unknown as UnifySubscriptionProduct);

        if (!isDiscountApplicable) {
          return { ...sub, amount: lineTotal };
        }

        if (lineDiscount > 0) {
          amount = lineTotal - lineDiscount;
        } else if (totalDiscount > 0 && totalBeforeDiscount > 0) {
          const proportion = lineTotal / totalBeforeDiscount;
          const proratedDiscount = totalDiscount * proportion;
          amount = lineTotal - proratedDiscount;
        } else {
          amount = lineTotal;
        }
      }

      return {
        paymentType: PaymentPlanEnums.FREE,
        quantity: INITIAL_DOC_STACK_QUANTITY,
        productName,
        amount: Math.round(amount),
        ...sub,
      };
    }));

    return {
      payment: {
        ...currentPayment,
        subscriptionItems: sortBy(items, (item) => item.paymentType === PaymentPlanEnums.FREE),
      },
      amount: get(upcomingInvoice, 'total', 0),
      nextInvoice: get(subscription, 'current_period_end'),
      creditBalance: Math.abs(get(subscription, 'latest_invoice.starting_balance', 0)),
      currency: currentPayment.currency,
    };
  }

  async deleteCanceledSubscriptionItem({ orgId, payment }: { orgId: string; payment: PaymentSchemaInterface }): Promise<IOrganization> {
    const { subscriptionItems } = payment;
    let updateSettings = {};
    let updatePayment: Partial<PaymentSchemaInterface> = payment;
    if (subscriptionItems.some((item) => item.productName === PaymentProductEnums.PDF && item.paymentStatus === PaymentStatusEnums.CANCELED)) {
      updateSettings = {
        'settings.autoUpgrade': false,
        'settings.googleSignIn': false,
        'settings.inviteUsersSetting': InviteUsersSettingEnum.ANYONE_CAN_INVITE,
      };
      updatePayment = {
        type: PaymentPlanEnums.FREE,
        stripeAccountId: payment.stripeAccountId,
        customerRemoteId: payment.customerRemoteId,
        subscriptionRemoteId: payment.subscriptionRemoteId,
        period: payment.period,
        currency: payment.currency,
      };
    }

    const activeItems = payment.subscriptionItems.filter((item) => item.paymentStatus !== PaymentStatusEnums.CANCELED);
    if (!this.paymentUtilsService.isIncludePdfSubscription({ subscriptionItems: activeItems })) {
      this.redisService.deleteMainSubscriptionItemId(payment.subscriptionRemoteId);
    }

    return await this.organizationService.updateOrganizationProperty(orgId, {
      ...updateSettings,
      payment: {
        ...updatePayment,
        trialInfo: payment.trialInfo,
        subscriptionItems: activeItems,
      },
    });
  }

  getIncomingPaymentObject({
    currentPayment,
    incomingPayment,
    subscription,
    trialInfo,
  }: {
    currentPayment: PaymentSchemaInterface;
    incomingPayment: { currency: Currency; period: PaymentPeriod; status: PaymentStatusEnums; stripeAccountId: string; };
    subscription: Stripe.Subscription;
    trialInfo: ITrialInfo;
  }): PaymentSchemaInterface {
    const { subscriptionItems } = currentPayment;
    const newSubItems = differenceWith(subscription.items.data, subscriptionItems, (a, b) => a.metadata.productName === b.productName)
      .map((item) => ({
        id: item.id,
        planRemoteId: item.plan.id,
        paymentType: item.metadata.paymentType,
        paymentStatus: incomingPayment.status,
        quantity: item.quantity,
        productName: item.metadata.productName,
        period: incomingPayment.period,
        currency: incomingPayment.currency,
        deleted: false,
      }));
    const updateSubItems = subscriptionItems.map((oldItem, _) => {
      const updateItem = subscription.items.data.find((sub) => sub.metadata.productName === oldItem.productName);
      if (!updateItem) {
        return { ...oldItem, deleted: true };
      }
      return {
        id: updateItem.id,
        planRemoteId: updateItem.plan.id,
        paymentType: updateItem.metadata.paymentType,
        quantity: updateItem.quantity,
        period: incomingPayment.period,
        currency: incomingPayment.currency,
        paymentStatus: incomingPayment.status,
        productName: updateItem.metadata.productName,
        deleted: false,
      };
    }).filter(Boolean);
    const finalSubscriptionItems = [...updateSubItems, ...newSubItems];
    const pdfItem = this.paymentUtilsService.filterSubItemByProduct(finalSubscriptionItems, PaymentProductEnums.PDF)[0];
    return {
      planRemoteId: pdfItem?.planRemoteId,
      type: pdfItem?.paymentType ?? PaymentPlanEnums.FREE,
      quantity: pdfItem?.quantity,
      status: pdfItem?.paymentStatus,
      customerRemoteId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
      period: incomingPayment.period,
      currency: incomingPayment.currency,
      subscriptionRemoteId: subscription.id,
      trialInfo,
      stripeAccountId: incomingPayment.stripeAccountId,
      subscriptionItems: finalSubscriptionItems,
    };
  }

  // TODO: Remove this after migrate legacy fields to subscriptionItems
  async getNewPaymentObject(payment: PaymentSchemaInterface): Promise<PaymentSchemaInterface> {
    if (!payment.type || payment.type === PaymentPlanEnums.FREE) {
      return payment;
    }
    const currentSubscriptionItems = payment.subscriptionItems || [];
    if (this.paymentUtilsService.isIncludePdfSubscription({ subscriptionItems: currentSubscriptionItems })) {
      return payment;
    }

    let mainSubscriptionItemId = await this.redisService.getMainSubscriptionItemId(payment.subscriptionRemoteId);
    if (!mainSubscriptionItemId) {
      const subscriptionInfo = await this.getStripeSubscriptionInfo({
        subscriptionId: payment.subscriptionRemoteId,
        options: { stripeAccount: payment.stripeAccountId },
      });
      const mainSubscriptionItem = this.getMainSubscriptionItem(subscriptionInfo, payment.planRemoteId);
      if (mainSubscriptionItem) {
        mainSubscriptionItemId = mainSubscriptionItem.id;
        this.redisService.setMainSubscriptionItemId(payment.subscriptionRemoteId, mainSubscriptionItemId);
      }
    }
    const pdfItem: SubScriptionItemSchemaInterface = {
      id: mainSubscriptionItemId,
      productName: PaymentProductEnums.PDF,
      paymentType: payment.type,
      quantity: payment.quantity,
      paymentStatus: payment.status,
      period: payment.period,
      currency: payment.currency,
      planRemoteId: payment.planRemoteId,
    };
    const signItem = this.paymentUtilsService.filterSubItemByProduct(currentSubscriptionItems, PaymentProductEnums.SIGN)[0];
    if (signItem) {
      return {
        ...payment,
        subscriptionItems: [pdfItem, signItem],
      };
    }

    return { ...payment, subscriptionItems: [pdfItem] };
  }

  async sendCancelSubscriptionEmail({ type, target }: { type: PaymentType, target: User | IOrganization }) {
    const { payment } = target;
    const currentSub = await this.getStripeSubscriptionInfo({
      subscriptionId: payment.subscriptionRemoteId,
      options: { stripeAccount: this.getStripeAccountId({ payment }) },
    });

    const dateEnd = moment.unix(currentSub.current_period_end).format('MMM DD, YYYY');
    if (type !== PaymentType.ORGANIZATION) {
      const user = target as User;
      this.emailService.sendEmailHOF(
        EMAIL_TYPE.CONFIRM_CANCEL_PLAN,
        [user.email],
        {
          subject: 'Your Lumin Professional subscription is set to end soon',
          dateEnd,
        },
      );
    } else {
      const receiverEmail = (await this.organizationService.getOrganizationMemberByRole(
        target._id,
        [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR],
      )).map((user) => user.email);
      const orgMembers = await this.organizationService.getMembersByOrgId(target._id);
      const organization = await this.organizationService.getOrgById(target._id);
      const { subscriptionItems } = organization.payment;
      const cancelSubItems = subscriptionItems?.filter((subItem) => subItem.paymentStatus === PaymentStatusEnums.CANCELED);
      const isOnlySignSub = cancelSubItems?.length === 1 && cancelSubItems[0].productName === PaymentProductEnums.SIGN;
      const canceledProducts = payment.subscriptionItems
        .filter((item) => (item.paymentStatus as PaymentStatusEnums) === PaymentStatusEnums.CANCELED)
        .map((item) => ({ productName: item.productName }));
      this.emailService.sendEmailHOF(
        EMAIL_TYPE.CONFIRM_CANCEL_PLAN_ORGANIZATION,
        receiverEmail,
        {
          subject: SUBJECT[EMAIL_TYPE.CONFIRM_CANCEL_PLAN_ORGANIZATION.description].replace('#{orgName}', target.name),
          dateEnd,
          totalMembers: isOnlySignSub ? organization.premiumSeats.length : orgMembers.length,
          orgName: target.name,
          orgId: organization._id,
          products: canceledProducts,
        },
      );
      this.setupReminderSubscriptionEmail(target._id, dateEnd);
    }
  }

  // Handle unpaid/pending subscriptions - immediate cancellation
  public async cancelFailedSubscription({
    payment,
    itemsToCancel,
    clientId,
    target,
  }: {
    payment: PaymentSchemaInterface;
    itemsToCancel: SubScriptionItemSchemaInterface[];
    clientId: string;
    target: IOrganization;
  }): Promise<IOrganization> {
    const remainingItems = differenceBy(payment.subscriptionItems || [], itemsToCancel, 'productName');
    if (remainingItems.length === 0) {
      const stripeAccountId = this.getStripeAccountId({ payment });
      await this.cancelStripeSubscription(payment.subscriptionRemoteId, null, { stripeAccount: stripeAccountId });
    } else {
      await this.updateStripeSubscription(
        payment.subscriptionRemoteId,
        {
          proration_behavior: 'none',
          items: itemsToCancel.map(({ id }) => ({ id, deleted: true })),
        },
        { stripeAccount: payment.stripeAccountId },
      );
    }

    const renewAttempt = await this.redisService.getRenewAttempt(clientId);
    if (renewAttempt) {
      await this.redisService.removeStripeRenewAttempt(clientId);
    }
    const freePaymentPayload = this.getFreePaymentPayload(payment);

    let updatePayment: Partial<PaymentSchemaInterface> = payment;
    const [pdfItem] = this.paymentUtilsService.filterSubItemByProduct(remainingItems, PaymentProductEnums.PDF);
    if (!remainingItems.length || !pdfItem) {
      updatePayment = freePaymentPayload;
    }
    const updatedClient = await this.organizationService.updateOrganizationProperty(
      target._id,
      {
        payment: {
          ...updatePayment,
          trialInfo: payment.trialInfo,
          subscriptionRemoteId: payment.subscriptionRemoteId,
          subscriptionItems: remainingItems,
        },
        'settings.inviteUsersSetting':
          InviteUsersSettingEnum.ANYONE_CAN_INVITE,
      },
    );
    await this.organizationService.updateSettingForCanceledBusinessPlan({
      paymentType: payment.type as PaymentPlanEnums,
      paymentStatus: payment.status as PaymentStatusEnums,
      organization: target,
    });

    return updatedClient;
  }

  // Handle active subscriptions - scheduled cancellation
  public async cancelActiveSubscription({
    payment,
    itemsToCancel,
    subscriptionItemsInput,
    clientId,
    userContext,
  }: {
    payment: PaymentSchemaInterface;
    itemsToCancel: SubScriptionItemSchemaInterface[];
    subscriptionItemsInput: CancelUnifySubscriptionInputItem[];
    clientId: string;
    userContext: IUser;
  }): Promise<IOrganization> {
    let updatedItems = payment.subscriptionItems.map((item) => {
      const shouldCancel = subscriptionItemsInput.some(
        (input) => input.productName === item.productName,
      );
      return shouldCancel
        ? { ...item, paymentStatus: PaymentStatusEnums.CANCELED }
        : item;
    });

    const isCancelAllItems = updatedItems.every(
      (item) => item.paymentStatus === PaymentStatusEnums.CANCELED,
    );

    if (isCancelAllItems) {
      await this.updateStripeSubscription(
        payment.subscriptionRemoteId,
        { cancel_at_period_end: true },
        { stripeAccount: payment.stripeAccountId },
      );
    } else {
      await this.updateStripeSubscription(
        payment.subscriptionRemoteId,
        {
          proration_behavior: 'none',
          items: itemsToCancel.map(({ id }) => ({ id, deleted: true })),
        },
        { stripeAccount: payment.stripeAccountId },
      );
      updatedItems = updatedItems.map((item) => {
        const shouldMarkDeleted = subscriptionItemsInput.some(
          (input) => input.productName === item.productName,
        );
        return shouldMarkDeleted ? { ...item, deleted: true } : item;
      });
    }

    const pdfItem = this.paymentUtilsService.filterSubItemByProduct(updatedItems, PaymentProductEnums.PDF)[0];

    const updatedClient = await this.organizationService.updateOrganizationProperty(
      clientId,
      {
        payment: {
          ...payment,
          status: pdfItem?.paymentStatus,
          subscriptionItems: updatedItems,
          trialInfo: payment.trialInfo,
        },
      },
    );
    this.userService.trackPlanAttributes(userContext._id);
    this.postSmbNotification({
      organization: updatedClient,
      notificationType: SlackSMBNotificationType.SCHEDULED_CANCELLATION,
    });

    // [Hubspot] send HubSpot event for ORG_PRO plan cancellation (set to cancel at period end)
    if (pdfItem?.paymentType as PaymentPlanEnums === PaymentPlanEnums.ORG_PRO) {
      this.hubspotWorkspaceService.sendWorkspaceEvent({
        orgId: clientId,
        eventName: HubspotWorkspaceEventName.WORKSPACE_SUBSCRIPTION_CHANGED,
        properties: {
          status: WorkspaceSubscriptionChangedStatus.SET_TO_CANCEL,
        },
      });
    }

    this.redisService.setSubscriptionActor(
      payment.subscriptionRemoteId,
      userContext._id,
    );
    this.sendCancelSubscriptionEmail({ type: PaymentType.ORGANIZATION, target: updatedClient });

    return updatedClient;
  }

  public async retrieveTestClock(testClockId: string, stripeAccountId: string): Promise<Stripe.TestHelpers.TestClock> {
    return this.stripe.testHelpers.testClocks.retrieve(testClockId, { stripeAccount: stripeAccountId });
  }

  private getTimeSensitiveCouponId(stripeAccountId: string): string {
    if (stripeAccountId === this.stripeUSAccountId) {
      return this.environmentService.getByKey(EnvConstants.STRIPE_TIME_SENSITIVE_COUPON_US);
    }
    return this.environmentService.getByKey(EnvConstants.STRIPE_TIME_SENSITIVE_COUPON_NZ);
  }

  public isTimeSensitiveCoupon(couponId: string, stripeAccountId: string): boolean {
    const timeSensitiveCouponId = this.getTimeSensitiveCouponId(stripeAccountId);
    return couponId === timeSensitiveCouponId;
  }

  async getTimeSensitivePromotionCode(params: {
    orgId: string;
    couponCode: string;
    stripeAccountId: string;
  }): Promise<Stripe.PromotionCode | null> {
    const { orgId, couponCode, stripeAccountId } = params;
    const timeSensitiveCoupon = await this.redisService.getTimeSensitiveCoupon(orgId);
    if (timeSensitiveCoupon?.promotionCode === couponCode) {
      return this.retrieveStripePromotionCode({ code: couponCode, stripeAccountId });
    }
    return null;
  }

  public validatePromotionCode(params: {
    promotionCode: Stripe.PromotionCode,
    stripeAccountId: string;
    period: PaymentPeriod;
  }): void {
    const { promotionCode, stripeAccountId, period } = params;
    const { coupon } = promotionCode;
    const couponId = typeof coupon === 'string' ? coupon : coupon.id;

    if (this.isTimeSensitiveCoupon(couponId, stripeAccountId) && period !== PaymentPeriod.ANNUAL) {
      throw GraphErrorException.BadRequest(ErrorMessage.COUPON.INVALID, ErrorCode.Payment.NOT_APPLICABLE);
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (!promotionCode.active) {
      throw GraphErrorException.BadRequest(ErrorMessage.COUPON.INVALID, ErrorCode.Payment.INVALID_COUPON_CODE);
    }
    if (promotionCode.times_redeemed >= promotionCode.max_redemptions) {
      throw GraphErrorException.BadRequest(ErrorMessage.COUPON.INVALID, ErrorCode.Payment.COUPON_LIMIT_REACHED);
    }

    if (promotionCode.expires_at < currentTime) {
      throw GraphErrorException.BadRequest(ErrorMessage.COUPON.INVALID, ErrorCode.Payment.EXPIRED_COUPON_CODE);
    }
  }

  public async createTimeSensitivePromotionCode(params: {
    stripeAccountId: string;
    customerRemoteId: string;
  }): Promise<{ code: string; id: string } | null> {
    const { stripeAccountId, customerRemoteId } = params;
    try {
      const couponId = this.getTimeSensitiveCouponId(stripeAccountId);
      if (!couponId) {
        this.loggerService.error({
          context: this.createTimeSensitivePromotionCode.name,
          error: new Error('Time-sensitive coupon ID not configured'),
          extraInfo: { stripeAccountId, customerRemoteId },
        });
        return null;
      }

      const expireTime = Number(this.environmentService.getByKey(EnvConstants.TIME_SENSITIVE_COUPON_EXPIRE_TIME));
      const expireTimeUnit = this.environmentService.getByKey(EnvConstants.TIME_SENSITIVE_COUPON_EXPIRE_TIME_UNIT);
      const expiresAt = moment().add(expireTime, expireTimeUnit as moment.unitOfTime.Base).unix();
      const promotionCode = await this.stripe.promotionCodes.create(
        {
          coupon: couponId, max_redemptions: 1, expires_at: expiresAt, customer: customerRemoteId,
        },
        { stripeAccount: stripeAccountId },
      );

      return { code: promotionCode.code, id: promotionCode.id };
    } catch (error) {
      this.loggerService.error({
        context: this.createTimeSensitivePromotionCode.name,
        error,
        extraInfo: { stripeAccountId, customerRemoteId },
      });
      return null;
    }
  }
}
