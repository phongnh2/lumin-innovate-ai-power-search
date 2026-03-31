import {
  UseGuards, HttpStatus, UseInterceptors,
} from '@nestjs/common';
import {
  Resolver, Mutation, Args, Query, Context, ResolveField, Parent,
} from '@nestjs/graphql';
import { differenceBy, get, intersectionBy } from 'lodash';
import Stripe from 'stripe';

import { DefaultErrorCode, ErrorCode } from 'Common/constants/ErrorCode';
import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import { USER_TYPE } from 'Common/constants/UserConstants';
import { AcceptancePermissions } from 'Common/decorators/permission.decorator';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { RejectDeletingUserGuard } from 'Common/guards/reject.deleting.user.guard';
import { UpgradingInvoicePayment } from 'Common/guards/upgrading-invoice-payment.guard';
import { PaymentLoggingInterceptor } from 'Common/interceptors/payment-logging.interceptor';
import { SanitizeInputInterceptor } from 'Common/interceptors/sanitize.input.interceptor';
import { Utils } from 'Common/utils/Utils';

import { AuthService } from 'Auth/auth.service';
import { CountryCode } from 'Auth/countryCode.enum';
import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';
import { EmailService } from 'Email/email.service';
import {
  SubscriptionResponse,
  Invoice,
  CancelSubscriptionInput,
  PaymentResponse,
  RemainingPlan,
  GetRemainingInput,
  GetBillingEmailInput,
  PaymentType,
  PaymentPeriod,
  BillingWarningPayload,
  BillingWarningType,
  BasicResponse,
  CloseBillingBannerType,
  Payment,
  GetNextPaymentInfoInput,
  GetNextPaymentInfoPayload,
  GetNextSubscriptionInfoInput,
  GetNextSubscriptionInfoPayload,
  GetCouponValueInput,
  GetBillingCycleOfPlanInput,
  PriceVersion,
  ChargeData,
  CouponValueResponse,
  TrialInfo,
  PreviewDocStackInvoicePayload,
  CustomerInfoResponse,
  CommonPaymentInput,
  Currency,
  PaymentMethodResponse,
  UpdatePaymentMethodInput,
  UpdatePaymentMethodResponse,
  GetSubscriptionBillingCycleInput,
  GetSubscriptionCouponInput,
  GetUnifySubscriptionPayload,
  SubscriptionItem,
  CancelUnifySubscriptionInput,
  RetrieveSetupIntentV3Input,
  RetrieveSetupIntentResponse,
} from 'graphql.schema';
import { HubspotWorkspaceService } from 'Hubspot/hubspot-workspace.service';
import { HubspotWorkspaceEventName, WorkspaceSubscriptionChangedStatus } from 'Hubspot/hubspot.interface';
import { LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { OrganizationRoleEnums } from 'Organization/organization.enum';
import { OrganizationService } from 'Organization/organization.service';
import { GqlPaymentGuard, RestrictBillingActionsOrgGuard } from 'Payment/guards';
import {
  PaymentPlanEnums,
  PaymentProductEnums,
  PaymentStatusEnums,
  StripePaymentMethodTypeEnums,
  SUPPORTED_PAYMENT_METHOD_TYPES,
} from 'Payment/payment.enum';
import { PaymentService } from 'Payment/payment.service';
import { UpdateSubscriptionParamsBuilder } from 'Payment/Policy/updateSubscriptionParamsBuilder';
import { PaymentUtilsService } from 'Payment/utils/payment.utils';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { SlackSMBNotificationType } from 'Slack/interfaces/slack.interface';
import { UserService } from 'User/user.service';
import { UserTrackingService } from 'UserTracking/tracking.service';

import { PaymentSchemaInterface } from './interfaces/payment.interface';
import { UpdateUnifySubscriptionParamsBuilder } from './Policy/updateUnifySubscriptionParamsBuilder';

@UseGuards(GqlAuthGuard)
@Resolver('Payment')
export class PaymentResolver {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly userTrackingService: UserTrackingService,
    private readonly redisService: RedisService,
    private readonly organizationService: OrganizationService,
    private readonly authService: AuthService,
    private readonly loggerService: LoggerService,
    private readonly paymentUtilsService: PaymentUtilsService,
    private readonly hubspotWorkspaceService: HubspotWorkspaceService,
  ) { }

  /** @deprecated use `getUnifySubscription` instead */
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlPaymentGuard)
  @AcceptancePermissions(
    OrganizationRoleEnums.BILLING_MODERATOR,
    OrganizationRoleEnums.ORGANIZATION_ADMIN,
  )
  @Query('subscription')
  async getSubscription(@Context() context): Promise<SubscriptionResponse> {
    const { payment } = context.req.data;
    const { subscriptionRemoteId } = payment;
    if (!subscriptionRemoteId) {
      return null;
    }
    const subscription = await this.paymentService.getStripeSubscriptionInfo({
      subscriptionId: subscriptionRemoteId,
      params: { expand: ['latest_invoice'] },
      options: { stripeAccount: this.paymentService.getStripeAccountId({ payment }) },
    });
    if (!subscription) {
      return null;
    }
    const endingBalance = Math.abs(get(subscription, 'latest_invoice.starting_balance')) || 0;
    const { data } = subscription.items;
    return {
      quantity: data[0].quantity,
      nextInvoice: subscription.current_period_end,
      billingInterval: data[0].plan.interval,
      amount: data[0].plan.amount,
      currency: data[0].plan.currency,
      creditBalance: endingBalance,
      payment,
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlPaymentGuard)
  @AcceptancePermissions(
    OrganizationRoleEnums.BILLING_MODERATOR,
    OrganizationRoleEnums.ORGANIZATION_ADMIN,
  )
  @Query()
  async getUnifySubscription(@Context() context): Promise<GetUnifySubscriptionPayload> {
    const target = context.req.data;
    const { payment } = target;
    const [subscription, upcomingInvoice] = await Promise.all([
      this.paymentService.getUnifySubscriptionInfo({ payment }),
      this.paymentService.getUpcommingInvoice(payment as PaymentSchemaInterface),
    ]);

    return {
      subscription,
      upcomingInvoice,
    };
  }

  // deprecated
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlPaymentGuard)
  @AcceptancePermissions(
    OrganizationRoleEnums.ORGANIZATION_ADMIN,
    OrganizationRoleEnums.BILLING_MODERATOR,
  )
  @Query('upcomingInvoice')
  async upcomingInvoice(@Context() context): Promise<SubscriptionResponse> {
    const target = context.req.data;
    const { payment } = target;
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ...await this.paymentService.getUpcommingInvoice(payment),
      payment,
    };
  }

  @UseGuards(RateLimiterGuard, GqlPaymentGuard)
  @AcceptancePermissions(
    OrganizationRoleEnums.ORGANIZATION_ADMIN,
    OrganizationRoleEnums.BILLING_MODERATOR,
  )
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query('getPaymentMethod')
  async getPaymentMethod(@Context() context): Promise<PaymentMethodResponse> {
    const target = context.req.data;
    const { _id: userId } = context.req.user;
    const { payment, billingEmail } = target;
    if (!payment?.customerRemoteId) {
      return null;
    }
    const customer = await this.paymentService.retrieveCustomer(
      payment.customerRemoteId as string,
      { expand: ['default_source', 'invoice_settings.default_payment_method'] },
      { stripeAccount: payment.stripeAccountId },
    )
      .then((res) => res as Stripe.Customer)
      .catch((error) => {
        throw GraphErrorException.BadRequest(error.message as string, DefaultErrorCode.BAD_REQUEST, {
          userId,
          customerRemoteId: payment.customerRemoteId,
          stripeAccountId: payment.stripeAccountId,
        });
      });

    const sourceCard = get(customer, 'default_source');
    if (sourceCard) {
      return this.paymentUtilsService.formatStripePaymentMethodToApiResponse(sourceCard as Stripe.Source, billingEmail as string);
    }

    const defaultPaymentMethod = customer.invoice_settings.default_payment_method as Stripe.PaymentMethod;

    if (!defaultPaymentMethod) {
      this.loggerService.info({
        message: 'No default payment method',
        extraInfo: {
          clientId: target._id,
          customerRemoteId: payment.customerRemoteId,
          userId,
        },
      });
      return null;
    }
    if (!SUPPORTED_PAYMENT_METHOD_TYPES.includes(defaultPaymentMethod.type as StripePaymentMethodTypeEnums)) {
      this.loggerService.info({
        message: 'Unsupported payment method type',
        extraInfo: {
          type: defaultPaymentMethod.type,
          clientId: target._id,
          customerRemoteId: payment.customerRemoteId,
          userId,
        },
      });
      return null;
    }
    return this.paymentUtilsService.formatStripePaymentMethodToApiResponse(defaultPaymentMethod, billingEmail as string);
  }

  @UseGuards(RateLimiterGuard, GqlPaymentGuard)
  @AcceptancePermissions(
    OrganizationRoleEnums.ORGANIZATION_ADMIN,
    OrganizationRoleEnums.BILLING_MODERATOR,
  )
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query('customerInfo')
  async customerInfo(@Context() context, @Args('input') input: CommonPaymentInput): Promise<CustomerInfoResponse> {
    const { data: target } = context.req;
    const { type } = input;
    const { payment } = target;
    if (!payment?.customerRemoteId) {
      return null;
    }
    return this.paymentService.getCustomerInfo(target as IOrganization, type);
  }

  @UseInterceptors(PaymentLoggingInterceptor)
  @UseGuards(RateLimiterGuard, GqlPaymentGuard, RejectDeletingUserGuard, RestrictBillingActionsOrgGuard)
  @UseInterceptors(SanitizeInputInterceptor)
  @AcceptancePermissions(
    OrganizationRoleEnums.BILLING_MODERATOR,
    OrganizationRoleEnums.ORGANIZATION_ADMIN,
  )
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation('updatePaymentMethod')
  async updatePaymentMethod(@Args('input') input: UpdatePaymentMethodInput, @Context() context): Promise<UpdatePaymentMethodResponse> {
    const target = context.req.data;
    const { _id: userId } = context.req.user;
    const { payment } : { payment: PaymentSchemaInterface } = target;
    const {
      paymentMethodId,
      email,
      type,
      clientId,
    } = input;
    let customer;
    if (!payment) {
      throw GraphErrorException.NotFound('Payment not found');
    }
    const { stripeAccountId } = payment;
    try {
      if (paymentMethodId) {
        await this.paymentService.attachPaymentMethodToCustomer(
          paymentMethodId,
          { customer: payment.customerRemoteId },
          { stripeAccount: stripeAccountId },
        );
        customer = await this.paymentService.updateStripeCustomer(
          payment.customerRemoteId,
          {
            invoice_settings: {
              default_payment_method: paymentMethodId,
            },
            expand: ['invoice_settings.default_payment_method'],
          },
          { stripeAccount: stripeAccountId },
        );
        this.paymentService.removePaymentMethodsFromCustomer({
          customerRemoteId: payment.customerRemoteId,
          except: paymentMethodId,
          stripeAccountId,
        });
      } else {
        customer = await this.paymentService.updateStripeCustomer(
          payment.customerRemoteId,
          {
            email,
            metadata: {
              isBusinessDomain: Number(Utils.isBusinessDomain(email)),
            },
            expand: ['default_source', 'invoice_settings.default_payment_method'],
          },
          { stripeAccount: stripeAccountId },
        );
      }
      if (type === PaymentType.INDIVIDUAL) {
        this.userTrackingService.updateUserContact(target.email as string, { billingemail: email });
      }
      if (type === PaymentType.ORGANIZATION) {
        await this.organizationService.updateOrganizationById(clientId, { billingEmail: email });
      }
    } catch (error) {
      throw GraphErrorException.BadRequest(error.message as string, DefaultErrorCode.BAD_REQUEST, {
        paymentMethodId,
        userId,
        clientId,
        type,
        stripeAccountId,
      });
    }

    const paymentMethod = get(customer, 'invoice_settings.default_payment_method');
    const sourceCard = get(customer, 'default_source');

    const paymentMethodData = paymentMethod || sourceCard;
    if (!paymentMethodData) {
      return {
        billingEmail: customer.email,
        statusCode: HttpStatus.OK,
        message: 'Update payment method successfully',
      };
    }
    return {
      billingEmail: customer.email,
      paymentMethod: this.paymentUtilsService.formatStripePaymentMethodToApiResponse(paymentMethodData as Stripe.PaymentMethod, email),
      statusCode: HttpStatus.OK,
      message: 'Update payment method successfully',
    };
  }

  @UseGuards(RateLimiterGuard, GqlPaymentGuard, RestrictBillingActionsOrgGuard)
  @AcceptancePermissions(
    OrganizationRoleEnums.ORGANIZATION_ADMIN,
    OrganizationRoleEnums.BILLING_MODERATOR,
  )
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query('invoices')
  async invoices(
    @Context() context,
  ): Promise<Invoice[]> {
    const target = context.req.data;
    const { payment } = target;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.paymentService.getFinishInvoices(payment, 100);
  }

  @UseGuards(UpgradingInvoicePayment, RateLimiterGuard, GqlPaymentGuard, RestrictBillingActionsOrgGuard)
  @UseInterceptors(SanitizeInputInterceptor)
  @AcceptancePermissions(
    OrganizationRoleEnums.BILLING_MODERATOR,
    OrganizationRoleEnums.ORGANIZATION_ADMIN,
  )
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation('cancelSubscription')
  async cancelSubscription(@Args('input') input: CancelSubscriptionInput, @Context() context): Promise<PaymentResponse> {
    const { data: target, user: userContext } = context.req;
    const { clientId, type } = input;
    const { payment } = target;
    if (payment?.status === PaymentStatusEnums.CANCELED) {
      throw GraphErrorException.BadRequest('You canceled subscription');
    }
    let updatedClient;
    const stripeAccountId = this.paymentService.getStripeAccountId({ payment });
    if (!payment) {
      throw GraphErrorException.BadRequest('You don\'t have subscription to cancel');
    }

    if (!payment.subscriptionRemoteId) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const newSubscriptionId = await this.paymentService.recoverSubscriptionId(target, type);
        payment.subscriptionRemoteId = newSubscriptionId;
      } catch (error) {
        throw GraphErrorException.BadRequest('There is an unexpected error. Contact us to solve it.');
      }
    }

    const isRetrying = payment.status === PaymentStatusEnums.PENDING;

    if (isRetrying) {
      await this.paymentService.cancelStripeSubscription(payment.subscriptionRemoteId as string, null, { stripeAccount: stripeAccountId });
      return {
        message: 'Your subscription is canceled',
        statusCode: 200,
        data: {
          type: PaymentPlanEnums.FREE,
          customerRemoteId: payment.customerRemoteId,
        },
      };
    }
    await this.paymentService.updateStripeSubscription(
      payment.subscriptionRemoteId as string,
      { cancel_at_period_end: true },
      { stripeAccount: payment.stripeAccountId },
    );
    const updateProperty = { 'payment.status': PaymentStatusEnums.CANCELED };
    switch (type) {
      case PaymentType.INDIVIDUAL:
        updatedClient = await this.userService.updateUserPropertyById(clientId, updateProperty);
        this.userService.trackPlanAttributes(userContext._id as string);
        break;
      case PaymentType.ORGANIZATION:
        updatedClient = await this.organizationService.updateOrganizationProperty(clientId, updateProperty);
        this.userService.trackPlanAttributes(userContext._id as string);
        this.paymentService.postSmbNotification({
          organization: updatedClient,
          notificationType: SlackSMBNotificationType.SCHEDULED_CANCELLATION,
        });
        // [Hubspot] send HubSpot event for ORG_PRO plan cancellation
        if (payment.type === PaymentPlanEnums.ORG_PRO) {
          this.hubspotWorkspaceService.sendWorkspaceEvent({
            orgId: clientId,
            eventName: HubspotWorkspaceEventName.WORKSPACE_SUBSCRIPTION_CHANGED,
            properties: {
              status: WorkspaceSubscriptionChangedStatus.SET_TO_CANCEL,
            },
          });
        }
        break;
      default:
        break;
    }
    if (type !== PaymentType.INDIVIDUAL) {
      this.redisService.setSubscriptionActor(payment.subscriptionRemoteId as string, userContext._id as string);
    }
    this.paymentService.sendCancelSubscriptionEmail({ type, target });

    return {
      message: 'Your subscription is canceled',
      statusCode: 200,
      data: updatedClient.payment,
    };
  }

  @UseGuards(UpgradingInvoicePayment, RateLimiterGuard, GqlPaymentGuard, RestrictBillingActionsOrgGuard)
  @UseInterceptors(SanitizeInputInterceptor)
  @AcceptancePermissions(
    OrganizationRoleEnums.BILLING_MODERATOR,
    OrganizationRoleEnums.ORGANIZATION_ADMIN,
  )
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation('cancelUnifySubscription')
  async cancelUnifySubscription(
    @Args('input') input: CancelUnifySubscriptionInput,
    @Context() context,
  ): Promise<PaymentResponse> {
    const { data: target, user: userContext } = context.req;
    const { clientId, subscriptionItems: subscriptionItemsInput } = input;

    if (!target.payment) {
      throw GraphErrorException.BadRequest(
        "You don't have subscription to cancel",
      );
    }

    const payment = await this.paymentService.getNewPaymentObject(
      target.payment as PaymentSchemaInterface,
    );
    const { subscriptionItems } = payment;

    const isCancelNonSubscribedItems = differenceBy(
      subscriptionItemsInput,
      subscriptionItems,
      'productName',
    ).length;
    if (isCancelNonSubscribedItems) {
      throw GraphErrorException.BadRequest(
        'Invalid subscription items',
        ErrorCode.Payment.INVALID_SUBSCRIPTION_ITEMS,
      );
    }

    const itemsToCancel = intersectionBy(
      subscriptionItems,
      subscriptionItemsInput,
      'productName',
    );

    if (
      itemsToCancel.some(
        (item) => item.paymentStatus === PaymentStatusEnums.CANCELED,
      )
    ) {
      throw GraphErrorException.BadRequest('You canceled subscription item');
    }

    const hasFailedItems = subscriptionItems.some((item) => [PaymentStatusEnums.PENDING, PaymentStatusEnums.UNPAID].includes(
        item.paymentStatus as PaymentStatusEnums,
    ));

    // Handle unpaid/pending subscriptions - immediate cancellation
    const updatedOrg = await (hasFailedItems
      ? this.paymentService.cancelFailedSubscription({
        payment,
        itemsToCancel,
        clientId,
        target,
      })
      : this.paymentService.cancelActiveSubscription({
        payment,
        itemsToCancel,
        subscriptionItemsInput,
        clientId,
        userContext,
      }));
    return {
      message: 'Your subscription is canceled',
      statusCode: 200,
      data: updatedOrg.payment,
      organization: updatedOrg,
    };
  }

  @UseGuards(RateLimiterGuard, GqlPaymentGuard, RejectDeletingUserGuard, RestrictBillingActionsOrgGuard)
  @UseInterceptors(SanitizeInputInterceptor)
  @AcceptancePermissions(
    OrganizationRoleEnums.BILLING_MODERATOR,
    OrganizationRoleEnums.ORGANIZATION_ADMIN,
  )
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation('reactiveSubscription')
  async reactiveSubscription(@Context() context): Promise<PaymentResponse> {
    const { data: { payment }, user } = context.req;
    if (payment.type === PaymentPlanEnums.FREE) {
      throw GraphErrorException.BadRequest('You can\'t reactive free plan');
    }
    const currentSubscription = await this.paymentService.getStripeSubscriptionInfo({
      subscriptionId: payment.subscriptionRemoteId,
      options: { stripeAccount: this.paymentService.getStripeAccountId({ payment }) },
    });
    if (!currentSubscription.cancel_at_period_end) {
      throw GraphErrorException.BadRequest('Your subscription still active');
    }
    await this.paymentService.updateStripeSubscription(
      payment.subscriptionRemoteId as string,
      { cancel_at_period_end: false },
      { stripeAccount: this.paymentService.getStripeAccountId({ payment }) },
    );
    const updatedClient = await this.userService.updateUserPropertyById(user._id as string, {
      'payment.status': PaymentStatusEnums.ACTIVE,
    });
    const productId = get(currentSubscription, 'items[0].price.product');
    return {
      message: 'Reactive subscription success',
      statusCode: 200,
      data: {
        ...updatedClient.payment,
        productId,
      },
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query('couponValue')
  async getCouponValue(
    @Args('input') input: GetCouponValueInput,
    @Context() context,
  ): Promise<CouponValueResponse> {
    const { countryCode } = context.req.user;

    const {
      plan, period, currency, couponCode, orgId, stripeAccountId,
    } = input;
    const { error, coupon } = await this.paymentService.validateAndGetCouponValue({
      plan, period, currency, couponCode, orgId, stripeAccountId, countryCode,
    });
    if (error) {
      throw error;
    }
    return coupon;
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getSubscriptionCoupon(
    @Args('input') input: GetSubscriptionCouponInput,
    @Context() context,
  ) {
    const { countryCode } = context.req.user;
    const {
      subscriptionItems, couponCode, orgId, stripeAccountId, currency, period,
    } = input;
    return this.paymentService.validateAndGetSubscriptionCoupon({
      countryCode,
      orgId,
      stripeAccountId,
      couponCode,
      currency,
      period,
      subscriptionItems: subscriptionItems.map((sub) => ({
        paymentType: sub.planName,
      })),
    });
  }

  @UseInterceptors(SanitizeInputInterceptor)
  @UseGuards(RateLimiterGuard, GqlPaymentGuard)
  @AcceptancePermissions(
    OrganizationRoleEnums.BILLING_MODERATOR,
    OrganizationRoleEnums.ORGANIZATION_ADMIN,
  )
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getBillingEmail(@Context() context, @Args('input') input: GetBillingEmailInput): Promise<string> {
    const { data: target } = context.req;
    const { type } = input;
    const customer = target?.payment?.customerRemoteId
      && await this.paymentService.retrieveCustomer(
        target.payment.customerRemoteId as string,
        null,
        { stripeAccount: target.payment.stripeAccountId },
      ) as Stripe.Customer;
    if (customer) return customer.email;
    switch (type) {
      case PaymentType.TEAM:
      case PaymentType.ORGANIZATION: {
        const { ownerId } = target;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const owner = await this.userService.findUserById(ownerId);
        return owner?.email;
      }
      case PaymentType.INDIVIDUAL: {
        return target.email;
      }
      default: break;
    }
    return '';
  }

  @UseInterceptors(SanitizeInputInterceptor)
  @UseGuards(RateLimiterGuard, GqlPaymentGuard)
  @AcceptancePermissions(
    OrganizationRoleEnums.BILLING_MODERATOR,
    OrganizationRoleEnums.ORGANIZATION_ADMIN,
  )
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getRemainingPlan(
    @Context() context,
    @Args('input') input: GetRemainingInput,
  ): Promise<RemainingPlan> {
    const { user, data: target } = context.req;
    const {
      plan, period, currency, quantity, type, couponCode,
    } = input;
    const {
      customerRemoteId, subscriptionRemoteId, planRemoteId, type: paymentType, period: currentPeriod,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    } = await this.paymentService.recoverPaymentData(target, type);
    const stripeAccountId = this.paymentService.getStripeAccountId({ payment: target.payment, userCountrycode: user.countryCode });
    const isDiscount = user.type === USER_TYPE.EDUCATION;

    const subscriptionItem = this.paymentService.getNextSubscriptionItemParams({
      currentPayment: {
        period: currentPeriod,
        planRemoteId,
        type: paymentType,
      },
      nextPayment: {
        period, quantity, plan, currency,
      },
      paymentType: type,
      stripeAccountId,
      isDiscount,
    });

    const param: any = {
      subscription_items: [subscriptionItem],
      subscription_billing_cycle_anchor: 'now',
    };
    if (couponCode) {
      param.coupon = couponCode;
    }
    let currentSubscription;
    let isUsingFreeTrial = false;
    let cusId;
    if (customerRemoteId && subscriptionRemoteId) {
      currentSubscription = await this.paymentService.getStripeSubscriptionInfo({
        subscriptionId: subscriptionRemoteId,
        options: { stripeAccount: stripeAccountId },
      });
      isUsingFreeTrial = get(currentSubscription, 'trial_end') === get(currentSubscription, 'current_period_end');
      cusId = customerRemoteId;
    }

    if (!customerRemoteId || !subscriptionRemoteId || paymentType === PaymentPlanEnums.FREE || isUsingFreeTrial) {
      try {
        const newInvoice = await this.paymentService.retrieveUpcomingInvoice(
          { customer: cusId, ...param } as Stripe.InvoiceRetrieveUpcomingParams,
          { stripeAccount: stripeAccountId },
        );
        if (newInvoice) {
          const discount = get(newInvoice, 'total_discount_amounts[0].amount', 0);
          const creditBalance = Math.abs(Number(get(newInvoice, 'ending_balance')));
          return {
            remaining: 0,
            total: get(newInvoice, 'total'),
            currency,
            nextBillingCycle: String(get(newInvoice, 'lines.data[0].period.end') * 1000),
            nextBillingPrice: Math.max(this.paymentService.calculateNextBillingPrice(newInvoice) - creditBalance, 0),
            amountDue: this.paymentService.calculateSubtotalOfInvoice(newInvoice),
            discount,
            quantity,
            creditBalance,

          };
        }
        return {};
      } catch (error) {
        throw GraphErrorException.BadRequest('There is an unexpected error. Contact us to solve it.');
      }
    }
    const prorationDate = Math.floor(Date.now() / 1000);
    Object.assign(subscriptionItem, {
      id: currentSubscription.items.data[0].id,
    });
    Object.assign(param, {
      subscription_proration_date: prorationDate,
      subscription: subscriptionRemoteId,
    });
    const invoice = await this.paymentService.retrieveUpcomingInvoice(
      { customer: customerRemoteId, ...param } as Stripe.InvoiceRetrieveUpcomingParams,
      { stripeAccount: stripeAccountId },
    );
    if (!invoice) {
      return {
        remaining: 0,
        total: 0,
        currency,
        nextBillingCycle: '0',
        nextBillingPrice: 0,
        amountDue: 0,
        quantity,
        discount: 0,
        creditBalance: 0,
      };
    }
    const lineDatas = get(invoice, 'lines.data');
    const nextBillingTimestamp = get(lineDatas, `[${lineDatas.length - 1}].period.end`) || 0;
    const amount: number = get(invoice, 'lines.data[0].amount', 0);
    const amountDue: number = get(invoice, 'amount_due');
    const discount = get(invoice, 'total_discount_amounts[0].amount', 0);
    const creditBalance = Math.abs(Number(get(invoice, 'ending_balance')));
    const startingBalance = Math.abs(Number(get(invoice, 'starting_balance', 0))) || 0;

    return {
      currency,
      remaining: Math.abs(amount) + startingBalance,
      amountDue: Math.max(amountDue, 0),
      nextBillingCycle: String(nextBillingTimestamp * 1000),
      nextBillingPrice: Math.max(this.paymentService.calculateNextBillingPrice(invoice) - creditBalance, 0),
      total: this.paymentService.calculateSubtotalOfInvoice(invoice),
      quantity,
      discount,
      creditBalance,
    };
  }

  @UseGuards(RateLimiterGuard, GqlPaymentGuard)
  @AcceptancePermissions(
    OrganizationRoleEnums.BILLING_MODERATOR,
    OrganizationRoleEnums.ORGANIZATION_ADMIN,
    OrganizationRoleEnums.MEMBER,
  )
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getBillingWarning(
    @Context() context,
  ): Promise<BillingWarningPayload> {
    const target = context.req.data;
    const { _id: userId } = context.req.user;
    const { payment, resourceType, _id: clientId } = target;
    const [organization, attempt] = await Promise.all([
      resourceType === PaymentType.ORGANIZATION && this.organizationService.getOrgById(clientId as string),
      this.redisService.getRenewAttempt(clientId as string),
    ]);
    const isExistedUser = await this.redisService.checkUserInCanceledSubWarning(clientId as string, userId as string);

    const hasUnpaidSubscription = organization?.payment
      ? this.paymentUtilsService.isUnifyPaymentStatusMatch({
        payment: organization.payment,
        statusToCheck: PaymentStatusEnums.UNPAID,
      })
      : false;

    const warnings = [];

    const hasPendingSubscription = organization?.payment
      ? this.paymentUtilsService.isUnifyPaymentStatusMatch({
        payment: organization.payment,
        statusToCheck: PaymentStatusEnums.PENDING,
      })
      : false;
    if (attempt || hasPendingSubscription) {
      warnings.push(BillingWarningType.RENEW_ATTEMPT);
    }

    if (isExistedUser) {
      warnings.push(BillingWarningType.CANCELED_SUBSCRIPTION);
    }

    if (hasUnpaidSubscription) {
      warnings.push(BillingWarningType.UNPAID_SUBSCRIPTION);
    }

    const renewPayload = {
      attempt,
      metadata: {
        organization,
      },
    };

    // get subscription cancel remaining day
    let subCancelPayload = {
      remainingDay: null,
      expireDate: null,
      lastSubscriptionEndedAt: null,
      metadata: null,
    };
    const hasCanceledSubscription = this.paymentUtilsService.isUnifyPaymentStatusMatch({ payment, statusToCheck: PaymentStatusEnums.CANCELED });
    if (hasCanceledSubscription) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const { remainingDay, expireDate } = await this.paymentService.getSubscriptionCancelBannerData(payment);
      const shouldShowBanner = await this.paymentService.shouldShowBillingRemainingDateBanner(target, userId);
      if (shouldShowBanner) {
        warnings.push(BillingWarningType.SUBSCRIPTION_REMAINING_DATE);
      }
      subCancelPayload = {
        ...subCancelPayload,
        remainingDay,
        expireDate,
        metadata: {
          organization,
        },
      };
    }

    if (payment.customerRemoteId && payment.type === PaymentPlanEnums.FREE) {
      const lastSubscriptionEndedAt = await this.paymentService.getLastSubscriptionEndedAt({
        orgId: clientId,
        customerId: payment.customerRemoteId,
        stripeAccountId: payment.stripeAccountId,
      });
      subCancelPayload = {
        ...subCancelPayload,
        lastSubscriptionEndedAt,
      };
    }

    // Time-sensitive coupon logic
    let timeSensitiveCouponPayload = null;
    const isTrialing = this.paymentUtilsService.isUnifyPaymentStatusMatch({
      payment,
      statusToCheck: PaymentStatusEnums.TRIALING,
    });
    if (isTrialing) {
      const couponData = await this.redisService.getTimeSensitiveCoupon(clientId as string);
      if (couponData) {
        const { promotionCode, createdAt } = couponData;
        warnings.push(BillingWarningType.TIME_SENSITIVE_COUPON);
        timeSensitiveCouponPayload = {
          promotionCode,
          createdAt: new Date(createdAt),
        };
      }
    }

    return {
      renewPayload,
      subCancelPayload,
      timeSensitiveCouponPayload,
      warnings,
    };
  }

  @UseInterceptors(PaymentLoggingInterceptor)
  @UseGuards(RateLimiterGuard, GqlPaymentGuard)
  @AcceptancePermissions(
    OrganizationRoleEnums.BILLING_MODERATOR,
    OrganizationRoleEnums.ORGANIZATION_ADMIN,
  )
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async retryFailedSubscription(
    @Context() context,
  ): Promise<BasicResponse> {
    const { data, user } = context.req;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await this.paymentService.retryFailedSubscription(data, data.resourceType, user._id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Retry subscription successfully!',
    };
  }

  @UseGuards(RateLimiterGuard, GqlPaymentGuard)
  @AcceptancePermissions(
    OrganizationRoleEnums.BILLING_MODERATOR,
    OrganizationRoleEnums.ORGANIZATION_ADMIN,
  )
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async closeBillingBanner(
    @Context() context,
    @Args('bannerType') bannerType: CloseBillingBannerType,
  ): Promise<BasicResponse> {
    const { user, data: target } = context.req;
    switch (bannerType) {
      case CloseBillingBannerType.CANCELED_SUBSCRIPTION:
        await this.redisService.removeUserInCanceledSubWarning(target._id as string, user._id as string);
        break;
      case CloseBillingBannerType.SUBSCRIPTION_REMAINING_DATE: {
        await this.paymentService.closeSubscriptionRemainingDateBanner({ target, userId: user._id });
        break;
      }
      default:
        break;
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Banner was closed!',
    };
  }

  @ResolveField('stripeSubscriptionStatus')
  async getSubscriptionStatus(@Parent() payment: Payment): Promise<string> {
    if (!payment.subscriptionRemoteId) {
      return '';
    }
    try {
      const { status } = await this.paymentService.getStripeSubscriptionInfo({
        subscriptionId: payment.subscriptionRemoteId,
        options: { stripeAccount: this.paymentService.getStripeAccountId({ payment } as { payment: PaymentSchemaInterface }) },
      });
      return status;
    } catch {
      return '';
    }
  }

  @ResolveField('productId')
  async getProductId(@Parent() payment: Payment): Promise<string> {
    const { planRemoteId, productId, stripeAccountId } = payment;
    if (!planRemoteId) {
      return '';
    }
    if (productId) {
      return productId;
    }
    const { product } = await this.paymentService.getPlan(planRemoteId, stripeAccountId);
    return product as string;
  }

  @ResolveField('priceVersion')
  getPriceVersion(@Parent() payment: Payment): PriceVersion {
    return this.paymentService.getPriceVersion(payment.planRemoteId);
  }

  @ResolveField('priceVersion')
  @Resolver('ChargeData')
  getPriceVersionOfChargeData(@Parent() payment: ChargeData): PriceVersion {
    return this.paymentService.getPriceVersion(payment.planRemoteId);
  }

  @ResolveField('trialInfo')
  async getTrialInfoOfOrgPayment(
    @Parent() payment: Payment & { orgId: string },
    @Context() context,
  ): Promise<TrialInfo> {
    const { _id: userId } = context.req.user;
    const memberShip = await this.organizationService.getMembershipByOrgAndUser(payment.orgId, userId as string, { role: 1 });
    const cannotStartAllTrial = {
      canStartTrial: false,
      canUseStarterTrial: false,
      canUseProTrial: false,
      canUseBusinessTrial: false,
    };
    if ([PaymentPlanEnums.BUSINESS, PaymentPlanEnums.ENTERPRISE].includes(payment.type as PaymentPlanEnums)) {
      return cannotStartAllTrial;
    }
    const user = await this.userService.findUserById(userId as string, { payment: 1 });
    if (user.payment.type !== PaymentPlanEnums.FREE && memberShip?.role !== OrganizationRoleEnums.MEMBER) {
      return cannotStartAllTrial;
    }
    const { subscriptionItems = [] } = payment;
    if (this.paymentUtilsService.isIncludeSignSubscription({ subscriptionItems })) {
      return cannotStartAllTrial;
    }
    if (!payment.trialInfo || !payment.trialInfo.highestTrial) {
      return {
        canStartTrial: true,
        canUseStarterTrial: true,
        canUseProTrial: true,
        canUseBusinessTrial: true,
      };
    }
    return this.paymentService.getTrialInfoOfOrgPayment(payment.trialInfo);
  }

  @ResolveField('subscriptionItems')
  async getSubscriptionItems(@Parent() payment: Payment): Promise<SubscriptionItem[]> {
    const defaultItems = [PaymentProductEnums.PDF, PaymentProductEnums.SIGN].map((productName) => ({
      paymentType: PaymentPlanEnums.FREE,
      quantity: 0,
      productName,
      paymentStatus: null,
    }));
    const { subscriptionItems } = await this.paymentService.getNewPaymentObject(payment as PaymentSchemaInterface);
    if (!subscriptionItems?.length) {
      return defaultItems;
    }
    return defaultItems.map((defaultItem) => {
      const { productName } = defaultItem;
      const item = this.paymentUtilsService.filterSubItemByProduct(subscriptionItems, productName)[0];
      if (!item) {
        return defaultItem;
      }
      return item;
    });
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlPaymentGuard)
  @AcceptancePermissions(
    OrganizationRoleEnums.BILLING_MODERATOR,
    OrganizationRoleEnums.ORGANIZATION_ADMIN,
    OrganizationRoleEnums.MEMBER,
  )
  @Query()
  async getNextPaymentInfo(@Args('input') input: GetNextPaymentInfoInput, @Context() context): Promise<GetNextPaymentInfoPayload> {
    const {
      period, plan,
    } = input;
    const { type: userType, user: { countryCode } } = context.req;
    let { stripeAccountId, currency } = input;
    try {
      stripeAccountId = this.paymentService.getStripeAccountId({
        payment: context.req.data.payment, userCountrycode: countryCode, stripeAccountIdInput: stripeAccountId,
      });
      const isStripeUS = this.paymentService.isStripeUS(stripeAccountId);
      currency = isStripeUS ? Currency.USD : input.currency;
      const isDiscount = period === PaymentPeriod.ANNUAL && userType === USER_TYPE.EDUCATION;
      const params = {
        plan, period, currency, discount: isDiscount, stripeAccountId,
      };
      const nextPlanRemoteId = this.paymentService.getStripePlanRemoteId(params);
      const { product } = await this.paymentService.getPlan(nextPlanRemoteId, stripeAccountId);
      return {
        nextPlanRemoteId,
        nextProductId: product as string,
      };
    } catch (error) {
      throw GraphErrorException.InternalServerError(
        error.message as string,
        DefaultErrorCode.INTERNAL_SERVER_ERROR,
        {
          userId: context.req.user._id,
          plan,
          currency,
          period,
          countryCode,
          stripeAccountId,
          originError: error,
          scope: 'Payment',
        },
      );
    }
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @UseGuards(GqlPaymentGuard)
  @AcceptancePermissions(
    OrganizationRoleEnums.BILLING_MODERATOR,
    OrganizationRoleEnums.ORGANIZATION_ADMIN,
    OrganizationRoleEnums.MEMBER,
  )
  @Query()
  async getNextSubscriptionInfo(@Args('input') input: GetNextSubscriptionInfoInput, @Context() context): Promise<GetNextSubscriptionInfoPayload[]> {
    const {
      period, subscriptionItems,
    } = input;
    const { type: userType, user: { countryCode } } = context.req;
    let { stripeAccountId, currency } = input;

    if (!this.paymentUtilsService.isValidSubscriptionItemsInput({ subscriptionItems })) {
      throw GraphErrorException.BadRequest('Invalid subscription items', ErrorCode.Payment.INVALID_SUBSCRIPTION_ITEMS);
    }

    try {
      stripeAccountId = this.paymentService.getStripeAccountId({
        payment: context.req.data.payment, userCountrycode: countryCode, stripeAccountIdInput: stripeAccountId,
      });
      const isStripeUS = this.paymentService.isStripeUS(stripeAccountId);
      currency = isStripeUS ? Currency.USD : input.currency;
      const isDiscount = period === PaymentPeriod.ANNUAL && userType === USER_TYPE.EDUCATION;

      const nextPaymentInfo = await Promise.all(subscriptionItems.map(async ({ planName }) => {
        const params = {
          plan: planName, period, currency, discount: isDiscount, stripeAccountId,
        };
        const nextPlanRemoteId = this.paymentService.getStripePlanRemoteId(params);
        const { product } = await this.paymentService.getPlan(nextPlanRemoteId, stripeAccountId);
        return {
          nextPlanRemoteId,
          nextProductId: product as string,
        };
      }));

      return nextPaymentInfo;
    } catch (error) {
      throw GraphErrorException.InternalServerError(
        error.message as string,
        DefaultErrorCode.INTERNAL_SERVER_ERROR,
        {
          userId: context.req.user._id,
          subscriptionItems,
          currency,
          period,
          countryCode,
          stripeAccountId,
          originError: error,
          scope: 'Payment',
        },
      );
    }
  }

  @UseInterceptors(SanitizeInputInterceptor, PaymentLoggingInterceptor)
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async retrieveSetupIntentV2(
    @Context() context,
    @Args('reCaptchaTokenV3') reCaptchaTokenV3: string,
  ): Promise<RetrieveSetupIntentResponse> {
    const {
      user: {
        _id, email, countryCode, payment, metadata,
      },
    } = context.req;
    const stripeAccountId: string = payment.stripeAccountId || this.paymentService.getStripeAccountFromCountryCode(countryCode as CountryCode);
    try {
      const score = await this.authService.validateRecaptcha({
        reCaptchaTokenV3,
        context,
        email,
      });
      const clientSecret = await this.paymentService.retrieveSetupIntentSecret({
        userId: _id as string,
        stripeAccountId,
        score,
        openGoogleReferrer: metadata?.openGoogleReferrer,
      });
      return {
        clientSecret,
        accountId: stripeAccountId,
      };
    } catch (error) {
      throw GraphErrorException.InternalServerError(
        error.message as string,
        DefaultErrorCode.INTERNAL_SERVER_ERROR,
        {
          userId: _id,
          countryCode,
          stripeAccountId,
          originError: error,
          scope: 'Payment',
        },
      );
    }
  }

  @UseInterceptors(SanitizeInputInterceptor)
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async deactivateSetupIntent(
    @Context() context,
    @Args('stripeAccountId') stripeAccountId: string,
  ): Promise<BasicResponse> {
    const { user } = context.req;
    await this.paymentService.deactivateSetupIntent(user._id as string, stripeAccountId);
    return {
      statusCode: 200,
      message: 'Deactivated setup intent!',
    };
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getBillingCycleOfPlan(
    @Args('input') input: GetBillingCycleOfPlanInput,
    @Context() context,
  ): Promise<PreviewDocStackInvoicePayload> {
    const { _id: userId, countryCode } = context.req.user;
    const {
      plan, period, currency, quantity, couponCode, stripeAccountId: stripeAccountIdInput,
    } = input;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const userInfo = await this.userService.findUserById(userId);
    let stripeAccountId = stripeAccountIdInput;
    try {
      stripeAccountId = this.paymentService.getStripeAccountId({ payment: userInfo.payment, userCountrycode: countryCode, stripeAccountIdInput });
      const stripePlan = this.paymentService.getStripePlanRemoteId({
        plan, period, currency, stripeAccountId,
      });
      const items = {
        price: stripePlan,
        quantity,
      };
      const param: any = {
        subscription_items: [items],
        subscription_billing_cycle_anchor: 'now',
        ...(couponCode && { coupon: couponCode }),
      };
      const newInvoice = await this.paymentService.retrieveUpcomingInvoice(
        param as Stripe.InvoiceRetrieveUpcomingParams,
        { stripeAccount: stripeAccountId },
      );
      const subscriptionInfo = new UpdateSubscriptionParamsBuilder(this.paymentService)
        .from({ type: PaymentPlanEnums.FREE, stripeAccountId })
        .to({
          type: plan, period, currency,
        });
      const previewDocStackInvoicePayload = await this.paymentService.interceptStripeInvoiceResponse({
        actor: userInfo, invoice: newInvoice, subscriptionInfo, stripeAccountId,
      });
      return previewDocStackInvoicePayload;
    } catch (error) {
      throw GraphErrorException.InternalServerError(
        error.message as string,
        DefaultErrorCode.INTERNAL_SERVER_ERROR,
        {
          userId,
          currency,
          plan,
          quantity,
          countryCode,
          stripeAccountId,
          originError: error,
          scope: 'Payment',
        },
      );
    }
  }

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Query()
  async getSubscriptionBillingCycle(@Args('input') input: GetSubscriptionBillingCycleInput, @Context() context) {
    const { _id: userId, countryCode } = context.req.user;
    const {
      period, currency, couponCode, stripeAccountId: stripeAccountIdInput, subscriptionItems,
    } = input;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const userInfo = await this.userService.findUserById(userId);
    let stripeAccountId = stripeAccountIdInput;
    if (!this.paymentUtilsService.isValidSubscriptionItemsInput({ subscriptionItems })) {
      throw GraphErrorException.BadRequest('Invalid subscription items', ErrorCode.Payment.INVALID_SUBSCRIPTION_ITEMS);
    }

    try {
      stripeAccountId = this.paymentService.getStripeAccountId({ payment: userInfo.payment, userCountrycode: countryCode, stripeAccountIdInput });
      const subscriptionInfo = new UpdateUnifySubscriptionParamsBuilder(this.paymentService, this.paymentUtilsService)
        .from({ type: PaymentPlanEnums.FREE, stripeAccountId } as PaymentSchemaInterface)
        .addCoupon(couponCode)
        .to({
          period,
          currency,
          subscriptionItems: subscriptionItems.map((sub) => ({
            quantity: sub.quantity,
            paymentType: sub.planName,
            productName: sub.productName,
          })),
        });
      const params = (await (subscriptionInfo.calculate())).getPreviewSubscriptionParams();
      const newInvoice = await this.paymentService.retrieveUpcomingInvoice(
        params as Stripe.InvoiceRetrieveUpcomingParams,
        { stripeAccount: stripeAccountId },
      );
      const payload = await this.paymentService.interceptStripeInvoiceResponse({
        actor: userInfo, invoice: newInvoice, subscriptionInfo, stripeAccountId,
      });
      return payload;
    } catch (error) {
      throw GraphErrorException.InternalServerError(
        error.message as string,
        DefaultErrorCode.INTERNAL_SERVER_ERROR,
        {
          userId,
          currency,
          countryCode,
          stripeAccountId,
          originError: error,
          scope: 'Payment',
        },
      );
    }
  }

  @UseGuards(RateLimiterGuard, GqlAuthGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async removePersonalPaymentMethod(
    @Context() context,
  ): Promise<BasicResponse> {
    const { _id: userId } = context.req.user;
    const user = await this.userService.findUserById(userId as string);
    const { customerRemoteId, stripeAccountId } = user.payment;
    if (!customerRemoteId) {
      throw GraphErrorException.NotFound('Customer not found');
    }
    if (!stripeAccountId) {
      throw GraphErrorException.NotFound('Stripe account not found');
    }
    await this.paymentService.removePaymentMethodsFromCustomer({ customerRemoteId, stripeAccountId });
    return {
      message: 'remove payment method successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @UseInterceptors(SanitizeInputInterceptor, PaymentLoggingInterceptor)
  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.USER_ID)
  @Mutation()
  async retrieveSetupIntentV3(
    @Context() context,
    @Args('input') input: RetrieveSetupIntentV3Input,
  ): Promise<RetrieveSetupIntentResponse> {
    const {
      user: {
        _id, email, countryCode, payment, metadata,
      },
    } = context.req;
    const { reCaptchaTokenV3, reCaptchaAction } = input;
    const stripeAccountId: string = payment.stripeAccountId || this.paymentService.getStripeAccountFromCountryCode(countryCode as CountryCode);
    try {
      const score = await this.authService.validateRecaptchaEnterprise({
        reCaptchaTokenV3,
        email,
        expectedAction: reCaptchaAction,
      });
      const clientSecret = await this.paymentService.retrieveSetupIntentSecret({
        userId: _id as string,
        stripeAccountId,
        score,
        openGoogleReferrer: metadata?.openGoogleReferrer,
      });
      return {
        clientSecret,
        accountId: stripeAccountId,
      };
    } catch (error) {
      throw GraphErrorException.InternalServerError(
        error.message as string,
        DefaultErrorCode.INTERNAL_SERVER_ERROR,
        {
          userId: _id,
          countryCode,
          stripeAccountId,
          originError: error,
          scope: 'Payment',
        },
      );
    }
  }
}
