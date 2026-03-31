import {
  Controller,
  Post,
  Request,
  Body,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  ApiOperation, ApiResponse, ApiBody, ApiHeader,
} from '@nestjs/swagger';
import { get } from 'lodash';
import * as moment from 'moment';
import { Types } from 'mongoose';
import Stripe from 'stripe';

import { RedisConstants } from 'Common/callbacks/RedisConstants';
import { EMAIL_TYPE } from 'Common/constants/EmailConstant';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { ORGANIZATION_TEXT } from 'Common/constants/OrganizationConstants';
import {
  SUBSCRIPTION_PAYMENT_UPDATE,
  SUBSCRIPTION_UPDATE_ORG,
  SUBSCRIPTION_MIGRATING_USER_SUCCESS,
} from 'Common/constants/SubscriptionConstants';
import { ElasticsearchUtil } from 'Common/elasticSearch/Utils';
import { Utils } from 'Common/utils/Utils';

import { AdminPaymentService } from 'Admin/admin.payment.service';
import { AdminService } from 'Admin/admin.service';
import { EmailService } from 'Email/email.service';
import { EnvironmentService } from 'Environment/environment.service';
import { OrganizationEventBuilder } from 'Event/builders/OrgEventBuilder/organization.event.builder';
import {
  EventNameType, EventScopes, NonDocumentEventNames, PlanActionEvent,
} from 'Event/enums/event.enum';
import { ICreateEventInput, IEventActorModification, IEventOrgPlanModification } from 'Event/interfaces/event.interface';
import { AdminEventService } from 'Event/services/admin.event.service';
import { EventServiceFactory } from 'Event/services/event.service.factory';
import { FreeTrialIssuer, UnifySubscriptionProduct } from 'graphql.schema';
import { HubspotWorkspaceService } from 'Hubspot/hubspot-workspace.service';
import { HubspotWorkspaceEventName, WorkspaceSubscriptionChangedStatus } from 'Hubspot/hubspot.interface';
import { LoggerService } from 'Logger/Logger.service';
import { IStripeRenewAttempt } from 'Microservices/redis/redis.interface';
import { RedisService } from 'Microservices/redis/redis.service';
import { DocumentMigrationResult, IOrganization } from 'Organization/interfaces/organization.interface';
import { OrganizationDocStackService } from 'Organization/organization.docStack.service';
import { OrganizationDocStackQuotaService } from 'Organization/organization.docStackQuota.service';
import { InviteUsersSettingEnum, OrganizationRoleEnums } from 'Organization/organization.enum';
import { OrganizationService } from 'Organization/organization.service';
import { DocStackUtils } from 'Organization/utils/docStackUtils';
import { PaymentSchemaInterface } from 'Payment/interfaces/payment.interface';
import {
  PaymentStatusEnums,
  PaymentPlanEnums,
  SubscriptionStatus,
  PaymentTypeEnums,
  PlanCancelReason,
  PaymentIntervalEnums,
  PaymentPeriodEnums,
  CollectionMethod,
  StripeDeclineCodeEnums,
  StripePaymentHook,
  BillingReason,
  PaymentIntentStatusEnums,
  PaymentCurrencyEnums,
  StripePaymentMethodTypeEnums,
  UpdateSignWsPaymentActions,
} from 'Payment/payment.enum';
import { PaymentService } from 'Payment/payment.service';
import { SlackSMBNotificationType } from 'Slack/interfaces/slack.interface';
import { WebhookResponseDto } from 'swagger/schemas';
import { TeamService } from 'Team/team.service';
import { IUser, User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';
import { UserTrackingService } from 'UserTracking/tracking.service';

import { PaymentScriptService } from './paymentScript.service';
import { STRIPE_CLIENT } from '../Stripe/constants';
import { PaymentUtilsService } from './utils/payment.utils';

const LUMINPDF_DOMAIN = 'luminpdf.com';
const DGROUP_DOMAIN = 'dgroup.co';
@Controller('payment')
export class PaymentController {
  private enabledStripeTestingWebhook = false;

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly userService: UserService,
    private readonly teamService: TeamService,
    private readonly emailService: EmailService,
    private readonly loggerService: LoggerService,
    private readonly userTrackingService: UserTrackingService,
    private readonly eventService: EventServiceFactory,
    private readonly adminEventService: AdminEventService,
    private readonly redisService: RedisService,
    private readonly organizationService: OrganizationService,
    @Inject(forwardRef(() => AdminService))
    private readonly adminService: AdminService,
    private readonly paymentService: PaymentService,
    private readonly organizationDocStackService: OrganizationDocStackService,
    private readonly organizationDocStackQuotaService: OrganizationDocStackQuotaService,
    private readonly adminPaymentService: AdminPaymentService,
    private readonly paymentScriptService: PaymentScriptService,
    private readonly paymentUtilsService: PaymentUtilsService,
    @Inject(STRIPE_CLIENT) private stripePlatform: Stripe,
    private readonly hubspotWorkspaceService: HubspotWorkspaceService,
  ) {
    this.enabledStripeTestingWebhook = this.environmentService.getByKey(EnvConstants.ENABLED_STRIPE_TESTING_WEBHOOK) === 'true';
  }

  @ApiOperation({
    summary: 'Stripe Platform Webhook',
    description: 'Endpoint for receiving Stripe webhook events. This endpoint is called by Stripe when events occur in your Stripe account.',
  })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Signature header from Stripe to verify webhook authenticity',
    required: true,
  })
  @ApiBody({
    description: 'Raw Stripe event payload',
    schema: {
      type: 'object',
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
    type: WebhookResponseDto,
  })
  @Post('/webhook/platform')
  async webhookEvents(@Body() body, @Request() request) {
    const { headers } = request;
    const sig = headers['stripe-signature'];
    // eslint-disable-next-line
    const event: Stripe.Event = this.stripePlatform.webhooks.constructEvent(body, sig, this.environmentService.getByKey(EnvConstants.STRIPE_PLATFORM_WEBHOOK_SECRET));

    const { type: hookType, data: { object: data }, account: stripeAccount } = event;
    const {
      paymentTarget, paymentType, customerId, extraInfo,
    } = await this.getPaymentData(data, stripeAccount);
    const loggingContext = `payment_hook_${hookType}`;

    const canProcess = this.canProcessHook({
      event,
      paymentTarget,
      paymentType,
    });
    if (!canProcess) {
      return null;
    }

    const whitelistDomain = [LUMINPDF_DOMAIN, DGROUP_DOMAIN];
    const billingEmail: string = extraInfo?.paymentTargetEmail;
    if (this.enabledStripeTestingWebhook && billingEmail && !whitelistDomain.includes(Utils.getEmailDomain(billingEmail))) {
      const loggerMessage = 'Testing users should be routed into testing webhook';
      this.loggerService.debug(loggerMessage, { extraInfo: data });
      return { message: loggerMessage, status: 200 };
    }

    const customerData = await this.paymentService.retrieveCustomer(customerId, null, { stripeAccount }) as Stripe.Customer;
    switch (hookType) {
      // this hoook is using for tracking data
      // done
      case StripePaymentHook.CHARGE_SUCCEEDED: {
        this.withErrorLogging({
          context: loggingContext,
          handler: () => this.handleChargeSucceededHook({
            paymentTarget,
            paymentType,
            data: event.data,
            customer: customerData,
            stripeAccount,
          }),
          extraInfo,
        });
        break;
      }

      // done
      case StripePaymentHook.CUSTOMER_SUBSCRIPTION_UPDATED: {
        this.withErrorLogging({
          context: loggingContext,
          handler: () => this.handleSubscriptionUpdatedHook({
            paymentTarget,
            paymentType,
            data: event.data,
            customer: customerData,
            stripeAccount,
          }),
          extraInfo,
        });
        break;
      }

      // done
      case StripePaymentHook.CUSTOMER_SUBSCRIPTION_DELETED: {
        this.withErrorLogging({
          context: loggingContext,
          handler: () => this.handleSubscriptionDeleted({
            paymentTarget,
            paymentType,
            data: event.data,
            stripeAccountId: stripeAccount,
          }),
          extraInfo,
        });
        break;
      }

      // done
      case StripePaymentHook.INVOICE_PAYMENT_SUCCEEDED: {
        this.withErrorLogging({
          context: loggingContext,
          handler: () => this.handlePaymentInvoiceSucceeded({
            paymentTarget,
            paymentType,
            data: event.data,
            customer: customerData,
            stripeAccount,
          }),
          extraInfo,
        });
        break;
      }

      // done
      case StripePaymentHook.INVOICE_PAYMENT_FAILED: {
        this.withErrorLogging({
          context: loggingContext,
          handler: () => this.handleInvoicePaymentFailed({
            paymentTarget,
            paymentType,
            data: event.data,
            stripeAccount,
          }),
          extraInfo,
        });
        break;
      }

      // done
      case StripePaymentHook.RADAR_EARLY_FRAUD_WARNING_CREATED: {
        this.loggerService.info({
          context: loggingContext,
          extraInfo: {
            ...data,
          },
        });
        this.withErrorLogging({
          context: loggingContext,
          handler: () => this.paymentService.handleStripeEarlyFraudWarning({
            data: event.data,
            stripeAccount,
          }),
          extraInfo,
        });
        break;
      }

      // done
      case StripePaymentHook.INVOICE_CREATED: {
        this.withErrorLogging({
          context: loggingContext,
          handler: () => this.handleInvoiceCreated({
            data: event.data,
            stripeAccount,
          }),
          extraInfo,
        });
        break;
      }

      case StripePaymentHook.INVOICE_FINALIZED: {
        this.withErrorLogging({
          context: loggingContext,
          handler: () => this.handleInvoiceFinalized({
            data: event.data,
            paymentType,
            paymentTarget,
          }),
          extraInfo,
        });
        break;
      }
      default: {
        throw new Error('Received hook but event is not registered.');
      }
    }
    /* eslint-disable consistent-return */
    return {
      message: 'Received hook successfully',
      status: 200,
    };
  }

  private canProcessHook({
    event,
    paymentTarget,
    paymentType,
  }: {
    event: Stripe.Event,
    paymentTarget: IOrganization | User;
    paymentType: PaymentTypeEnums
  }): boolean {
    const {
      id: eventId, type: hookType, data: { object: data }, account: stripeAccount,
    } = event;
    const eventData = data as Record<string, any>;
    const { collection_method: collectionMethod, object: objectType } = eventData;
    let productId: string = null;
    let planId: string = '';
    let interval: PaymentIntervalEnums = null;
    let currency: PaymentCurrencyEnums = null;

    if (paymentTarget && stripeAccount !== paymentTarget.payment.stripeAccountId) {
      this.loggerService.error({
        context: 'paymentContoller:canProcessHook',
        error: 'Stripe Account Id not match',
        extraInfo: {
          eventId,
          ...(paymentType === PaymentTypeEnums.INDIVIDUAL && { userId: paymentTarget._id }),
          ...(paymentType === PaymentTypeEnums.ORGANIZATION && { orgId: paymentTarget._id }),
        },
      });
      return false;
    }

    if (hookType === StripePaymentHook.RADAR_EARLY_FRAUD_WARNING_CREATED) {
      return true;
    }

    switch (objectType) {
      case 'invoice': {
        [productId, planId, interval, currency] = [
          get(eventData, 'lines.data[0].plan.product'),
          get(eventData, 'lines.data[0].plan.id'),
          get(eventData, 'lines.data[0].plan.interval'),
          get(eventData, 'lines.data[0].plan.currency').toUpperCase(),
        ];
        break;
      }
      case 'subscription': {
        [productId, planId, interval, currency] = [
          get(eventData, 'items.data[0].plan.product'),
          get(eventData, 'items.data[0].plan.id'),
          get(eventData, 'items.data[0].plan.interval'),
          get(eventData, 'items.data[0].plan.currency').toUpperCase(),
        ];
        break;
      }
      case 'charge': {
        // handle refund money for user who charge free trial using payment intent (stripe payment element)
        if (hookType === StripePaymentHook.CHARGE_FAILED && eventData.metadata.free_trial_issuer === FreeTrialIssuer.PAYMENT_METHOD) {
          return true;
        }
        break;
      }
      default:
        break;
    }
    const isEnterpriseProduct = this.paymentService.isUpgradeEnterpriseOrganization(productId);
    const isUpgradeDocStackFromInvoice = this.paymentService.getPaymentPlan(
      {
        planId, period: this.paymentService.getPeriodFromInterval(interval), currency, stripeAccountId: stripeAccount,
      },
    );
    const upgradeEnterpriseOrDocStackHooks = [
      StripePaymentHook.INVOICE_PAYMENT_SUCCEEDED,
      StripePaymentHook.CUSTOMER_SUBSCRIPTION_UPDATED,
    ];

    const isSendInvoice = collectionMethod === CollectionMethod.SEND_INVOICE;

    const isUpgradingEnterpriseOrDocStack = isSendInvoice
      && (isEnterpriseProduct || isUpgradeDocStackFromInvoice) && upgradeEnterpriseOrDocStackHooks.includes(hookType as StripePaymentHook);

    return Boolean(paymentTarget && !isSendInvoice || isUpgradingEnterpriseOrDocStack);
  }

  private async getCustomerIdFromHookData(data: Stripe.Event.Data.Object, stripeAccount: string): Promise<string> {
    const eventData = data as Record<string, any>;
    if (eventData.object === 'radar.early_fraud_warning') {
      const charge = await this.paymentService.retrieveCharge({
        chargeId: eventData.charge as string,
        options: { stripeAccount },
      });
      return charge?.customer as string;
    }
    return eventData.object === 'customer' ? eventData.id : eventData.customer;
  }

  private async getPaymentData(data: Stripe.Event.Data.Object, stripeAccount: string): Promise<{
    paymentType: PaymentTypeEnums,
    customerId: string,
    paymentTarget: IOrganization | User,
    extraInfo: Record<string, any>
  }> {
    try {
      const customerId = await this.getCustomerIdFromHookData(data, stripeAccount);
      if (!customerId) {
        return {
          paymentTarget: null,
          paymentType: null,
          customerId: null,
          extraInfo: null,
        };
      }

      const { id: hookDataId } = data as Record<string, any>;
      let paymentTarget: IOrganization | User = null;
      let paymentType: PaymentTypeEnums;
      paymentTarget = await this.organizationService.findOrgByCustomerId(customerId);
      if (paymentTarget) {
        const { _id, payment, billingEmail } = paymentTarget || {};
        paymentType = PaymentTypeEnums.ORGANIZATION;
        return {
          paymentTarget: {
            ...paymentTarget,
            payment: await this.paymentService.getNewPaymentObject(paymentTarget.payment),
          },
          paymentType,
          customerId,
          extraInfo: {
            paymentTargetId: _id,
            paymentTargetEmail: billingEmail,
            paymentTargetPayment: payment,
            paymentTargetCustomerId: payment?.customerRemoteId,
            hookDataId,
          },
        };
      }
      paymentTarget = await this.userService.findUserByCustomerId(customerId);
      if (paymentTarget) {
        const { _id, payment, email } = paymentTarget || {};
        paymentType = PaymentTypeEnums.INDIVIDUAL;
        return {
          paymentTarget: {
            ...paymentTarget,
            payment: await this.paymentService.getNewPaymentObject(paymentTarget.payment),
          },
          paymentType,
          customerId,
          extraInfo: {
            paymentTargetId: _id,
            paymentTargetEmail: email,
            paymentTargetPayment: payment,
            paymentTargetCustomerId: payment?.customerRemoteId,
            hookDataId,
          },
        };
      }

      return {
        paymentTarget: null,
        paymentType: null,
        extraInfo: null,
        customerId,
      };
    } catch (error) {
      this.loggerService.error({
        context: 'getPaymentData',
        error: error.message,
        errorCode: error.code,
        stack: error.stack,
      });
      throw new Error('Recieved hook but error when extract event data');
    }
  }

  private async withErrorLogging({ context, handler, extraInfo }: { context: string, handler: any, extraInfo?: Record<string, any> }) {
    try {
      await handler();
    } catch (error) {
      this.loggerService.error({
        context,
        error: error.message,
        errorCode: error.code,
        stack: error.stack,
        extraInfo,
      });
    }
  }

  // this Hook use tracking events on ElasticSearch
  // dont use for update user/organization payment data
  private async handleChargeSucceededHook({
    paymentTarget,
    paymentType,
    data,
    customer,
    stripeAccount,
  } : {
    paymentTarget: IOrganization | User,
    paymentType: PaymentTypeEnums,
    data: Record<string, any>,
    customer: Stripe.Customer
    stripeAccount: string
  }): Promise<void> {
    if (!customer) {
      throw new Error('Customer not found');
    }
    const { payment } = paymentTarget;
    /** Collect data to create events on ElasticSearch */
    const { data: invoiceData } = await this.paymentService.getInvoices({
      subscription: payment.subscriptionRemoteId,
      status: 'paid',
      limit: 2,
    }, { stripeAccount });
    let isRenewSubscription = false;
    let orgPrevPlan: Record<string, unknown> = {
      prevPlan: PaymentPlanEnums.FREE,
      prevCharge: 0,
    };
    if (invoiceData.length === 2) {
      const currentInvoice = invoiceData[0];
      const prevInvoice = invoiceData[1];
      const currentInvoiceLineItems = this.paymentUtilsService.filterStripePdfInvoiceLineItem({
        lines: currentInvoice.lines.data,
        stripeAccountId: stripeAccount,
      });
      const prevInvoiceLineItems = this.paymentUtilsService.filterStripePdfInvoiceLineItem({
        lines: prevInvoice.lines.data,
        stripeAccountId: stripeAccount,
      });
      if (currentInvoiceLineItems.length && prevInvoiceLineItems.length) {
        const currentPlan = payment.planRemoteId;
        const prevPlan = prevInvoiceLineItems[prevInvoiceLineItems.length - 1]?.plan.id;
        const currentQuantity = currentInvoiceLineItems[currentInvoiceLineItems.length - 1].quantity;
        const prevQuantity = prevInvoiceLineItems[prevInvoiceLineItems.length - 1].quantity;
        const [currentPeriodEnd, prevPeriodEnd] = [
          get(currentInvoice, 'period_end'),
          get(prevInvoice, 'period_end'),
        ];
        const isPlanChanged = prevPlan !== currentPlan;
        const isEndDateChanged = currentPeriodEnd !== prevPeriodEnd;
        const isChargeChanged = currentInvoice.total !== prevInvoice.total;
        const isQuantityChanged = currentQuantity !== prevQuantity;
        isRenewSubscription = !isPlanChanged && isEndDateChanged && !isChargeChanged && !isQuantityChanged;
        if (!isRenewSubscription) {
          const prevPlanInfo = await this.paymentService.getPlan(prevPlan, stripeAccount);
          const { interval: prevPlanInterval } = prevPlanInfo;
          const periodPlanMapping = {
            [PaymentIntervalEnums.MONTH]: PaymentPeriodEnums.MONTHLY,
            [PaymentIntervalEnums.YEAR]: PaymentPeriodEnums.ANNUAL,
          };
          const prevPeriod = periodPlanMapping[prevPlanInterval];
          orgPrevPlan = {
            prevPlan: `${PaymentPlanEnums.BUSINESS} ${prevPeriod}`,
            prevCharge: prevInvoice.total,
            period: prevPeriod,
            type: PaymentPlanEnums.BUSINESS,
          };
        }
      }
    }
    if (paymentType === PaymentTypeEnums.ORGANIZATION) {
      this.createChangeOrgPlanEvent({
        data,
        paymentTarget,
        orgPrevPlan,
        isRenewSubscription,
      });
    } else {
      this.createChangePlanEvent({
        data,
        paymentTarget,
        paymentType,
        isRenewSubscription,
      });
    }
  }

  private async handleSubscriptionUpdatedHook({
    paymentTarget,
    paymentType,
    data,
    customer,
    stripeAccount,
  }: {
    paymentTarget: IOrganization | User,
    paymentType: PaymentTypeEnums,
    data: Record<string, any>,
    customer: Stripe.Customer,
    stripeAccount: string,
  }): Promise<void> {
    const {
      object: {
        id, collection_method: collectionMethod, status, latest_invoice: latestInvoice, trial_start: trialStart,
      }, previous_attributes: previousAttributes,
    } = data;
    const subscription = await this.paymentService.getStripeSubscriptionInfo({
      subscriptionId: id as string,
      options: { stripeAccount },
    });
    if (!subscription) {
      return;
    }
    // enterprise: Flow payment link expire, where is flow payment success ?
    const invoiceId = subscription.latest_invoice;
    const enterpriseInvoice = await this.adminService.findUpgradingInvoiceById(invoiceId as string);
    const isUpgradeEnterprise = collectionMethod === CollectionMethod.SEND_INVOICE
      && Boolean(enterpriseInvoice);
    if (isUpgradeEnterprise) {
      await this.paymentService.handleOrgEnterpriseOrDocStackSubscriptionUpdate({
        subscription,
        enterpriseInvoice,
        stripeAccount,
      });
      return;
    }

    if (!paymentTarget) {
      this.loggerService.error({
        context: StripePaymentHook.CUSTOMER_SUBSCRIPTION_UPDATED,
        error: 'PaymentTarget not found',
        extraInfo: {
          customerId: customer.id,
          subscriptionId: id,
          stripeAccount,
        },
      });
      return;
    }
    const { payment } = paymentTarget;
    const paymentTargetId = paymentTarget._id;
    const cancelAtPeriodEnd = get(subscription, 'cancel_at_period_end');
    const prevCanceledAt = get(previousAttributes, 'canceled_at');
    const isUsingFreeTrial = payment.status === PaymentStatusEnums.TRIALING;
    const isCanceling = (prevCanceledAt !== undefined && cancelAtPeriodEnd)
      || payment.subscriptionItems.some((item) => item.paymentStatus === PaymentStatusEnums.CANCELED);

    if (paymentType === PaymentTypeEnums.ORGANIZATION) {
      await this.organizationService.updatePromotionTracking({ org: paymentTarget as IOrganization, subscription });
    }

    switch (status) {
      case SubscriptionStatus.ACTIVE: {
        // cancel subscription
        if (isCanceling) {
          break;
        }
        /// status: trailing => active
        if (isUsingFreeTrial) {
          this.handleRecurringFromFreeTrial(paymentTarget as IOrganization);
          if (previousAttributes.status === SubscriptionStatus.TRIALING) {
            await this.paymentService.updateInvoiceStatementDescriptor({
              customerId: customer.id,
              invoiceId: latestInvoice,
              stripeAccount,
              isFirstRecurringPaymentInvoice: true,
            });
          }
          break;
        }
        // status: past due => active: charge succeeded after retry, remove attempt key
        // Important: including individual subscription
        this.redisService.removeStripeRenewAttempt(paymentTargetId);
        this.redisService.removeCancelSubscriptionWarning(paymentTargetId);
        await this.updatePaymentStatus(paymentTarget, paymentType, PaymentStatusEnums.ACTIVE);
        break;
      }

      // previous status: active (from free trial) => 1st invoice failed => pending => w8 for attempts charge
      // previous status: active (from old active subscription) => nth invoice failed => pending => w8 for attempts charge
      case SubscriptionStatus.PAST_DUE: {
        await this.updatePaymentStatus(paymentTarget, paymentType, PaymentStatusEnums.PENDING);
        switch (paymentType) {
          case PaymentTypeEnums.INDIVIDUAL:
            this.emailService.sendEmailHOF(EMAIL_TYPE.RENEW_PLAN_FAILED, [customer.email]);
            break;
          case PaymentTypeEnums.ORGANIZATION: {
            const receiverEmail = (await this.organizationService.getOrganizationMemberByRole(
              paymentTargetId,
              [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR],
            )).map((user) => user.email);
            const [membersInOrg, newPaymentObject] = await Promise.all([
              this.organizationService.getMembersByOrgId(paymentTargetId),
              this.paymentService.getNewPaymentObject(payment),
            ]);
            this.emailService.sendEmailHOF(
              EMAIL_TYPE.RENEW_PLAN_FAILED_ORGANIZATION,
              receiverEmail,
              {
                subject: `Your subscription for ${paymentTarget.name}'s ${ORGANIZATION_TEXT} could not be renewed`,
                orgName: paymentTarget.name,
                orgId: paymentTargetId,
                totalMember: membersInOrg.length,
                products: newPaymentObject.subscriptionItems.map((item) => ({ productName: item.productName })),
              },
            );
            break;
          }
          default: break;
        }
        break;
      }
      case SubscriptionStatus.UNPAID: {
        // cancel subscription if there're no paid invoice since trial start until now
        if (!!trialStart) {
          const { data: paidInvoices } = await this.paymentService.getInvoices({
            subscription: id, status: 'paid', limit: 1, created: { gt: trialStart },
          }, { stripeAccount });
          if (!paidInvoices.length) {
            await this.paymentService.cancelStripeSubscription(id as string, null, { stripeAccount });
            return;
          }
        }
        await this.updatePaymentStatus(paymentTarget, paymentType, PaymentStatusEnums.UNPAID);
        break;
      }
      default: {
        break;
      }
    }
  }

  private async handleSubscriptionDeleted({
    data, paymentType, paymentTarget, stripeAccountId,
  }: {
    paymentTarget: IOrganization | User,
    paymentType: PaymentTypeEnums,
    data: Record<string, any>,
    stripeAccountId: string,
  }): Promise<void> {
    const {
      // eslint-disable-next-line camelcase
      id, created = new Date(), ended_at: endedAt,
    } = data.object;
    const numberDaysUsePremium = Math.abs(moment(new Date()).diff(new Date(created * 1000), 'days')) + 1;

    const { payment } = paymentTarget;
    const paymentTargetId = paymentTarget._id;
    const refundedFraudWarning = await this.redisService.refundedFraudWarningAmount(payment.customerRemoteId);
    if (id === payment.subscriptionRemoteId) {
      const subCancelBannerUsers: string[] = [];
      switch (paymentType) {
        case PaymentTypeEnums.INDIVIDUAL: {
          const userData = paymentTarget as User;
          const { email: paymentTargetEmail } = userData;
          const userId: string = userData._id;
          subCancelBannerUsers.push(userId);

          /** Update user contact in Hubspot */
          this.userTrackingService.updateUserContact(paymentTargetEmail, {
            stripeplan: UserTrackingService.STRIPE_PLAN.FREE_USER,
            stripeid: payment.customerRemoteId,
          });
          /* End update user contact in Hubspot */

          const updatedUser = await this.userService.updateUserPropertyById(userId, {
            payment: this.paymentService.getFreePaymentPayload(payment),
          }, true, { returnDocument: 'after' });

          // migrate documents
          let error: Error = null;
          let result: DocumentMigrationResult = { totalOrg: 0, totalDocument: 0, totalFolder: 0 };
          let destinationOrg: IOrganization = null;
          let migrateOrg: IOrganization = null;

          const key = `${RedisConstants.MIGRATE_USER_DOCUMENTS_TO_ORG_PREFIX}${userId}`;
          const migrateOrgId = await this.redisService.getRedisValueWithKey(key);

          /**
           * If user create new org subscription,
           * We cancel individual payment and move all user documents to that org.
           */
          if (migrateOrgId) {
            migrateOrg = await this.organizationService.getOrgById(migrateOrgId);
          }

          this.organizationService.migrateDocumentsForFreeUser(updatedUser, migrateOrg)
            .then(({ destinationOrg: org, ...rest }) => {
              result = rest;
              destinationOrg = org;
            })
            .catch((e: Error) => {
              error = e;
              // Log high-risk function.
              this.loggerService.error({
                context: 'migratePersonalWorkspace',
                stack: e.stack,
                userId,
                error: e,
                extraInfo: {
                  reason: 'cancel_plan',
                },
              });
            })
            .finally(() => {
              this.redisService.appendUserPricingMigration({
                userId,
                orgId: destinationOrg?._id && new Types.ObjectId(destinationOrg._id).toHexString(),
                result,
                error,
              });

              if (migrateOrgId) {
                this.redisService.deleteRedisByKey(key);
              }

              // Publish subscriptions
              if (destinationOrg) {
                this.userService.publishUpdateUser({
                  type: SUBSCRIPTION_MIGRATING_USER_SUCCESS,
                  user: updatedUser,
                  metadata: {
                    migratedOrg: destinationOrg,
                  },
                });
              }
            });
          this.paymentService.sendIndividualSubscriptionCanceledEmail({
            refundedFraudWarningAmount: refundedFraudWarning, targetEmails: [paymentTargetEmail], userData, numberDaysUsePremium,
          });
          break;
        }
        case PaymentTypeEnums.ORGANIZATION: {
          const orgData = paymentTarget as IOrganization;
          const { _id: orgId } = orgData;
          const [updatedOrganization, managers, users] = await Promise.all([
            this.organizationService.updateOrganizationProperty(orgId, {
              'settings.autoUpgrade': false,
              'settings.googleSignIn': false,
              'settings.inviteUsersSetting': InviteUsersSettingEnum.ANYONE_CAN_INVITE,
              payment: {
                ...this.paymentService.getFreePaymentPayload(payment),
                trialInfo: payment.trialInfo,
              },
              premiumSeats: [],
            }),
            this.organizationService.getOrganizationMemberByRole(
              orgId,
              [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR],
            ),
            this.organizationService.getMembersByOrgId(orgId, { userId: 1 }),
          ]);

          await this.handleCancelPdfSubscription({
            organization: updatedOrganization,
            subscription: data.object,
            managers,
            refundedFraudWarning,
            numberDaysUsePremium,
          });

          const memberIds: string[] = users.map(({ userId }) => userId);
          this.organizationService.publishUpdateOrganization(
            memberIds,
            {
              orgId,
              organization: updatedOrganization,
              type: SUBSCRIPTION_PAYMENT_UPDATE,
            },
            SUBSCRIPTION_UPDATE_ORG,
          );

          const managerIds = managers.map(({ _id: userId }: { email: string, _id?: string}) => userId);
          subCancelBannerUsers.push(...managerIds);
          this.redisService.setSubscriptionCanceledDate({ orgId, value: endedAt });
          const assignedSeatUserIds = orgData.premiumSeats.map((userId) => userId.toString());
          this.organizationService.publishUpdateSignWorkspacePayment({
            organization: updatedOrganization,
            userIds: assignedSeatUserIds,
            action: UpdateSignWsPaymentActions.CANCELED_SUBSCRIPTION,
          });

          await this.organizationService.updatePromotionTracking({
            org: orgData,
            subscription: null,
          });
          break;
        }
        default: break;
      }

      await this.redisService.getRenewAttempt(paymentTargetId).then(async (renewAttempt) => {
        if (renewAttempt) {
          await this.redisService.removeStripeRenewAttempt(paymentTargetId);
          this.redisService.setCanceledSubWarning(paymentTargetId, subCancelBannerUsers);
        }
      });

      this.createCancelPlanEvent({
        subscription: data.object,
        paymentTarget,
        paymentType,
        cancelPlanReason: PlanCancelReason.USER_CANCELED,
        stripeAccountId,
      });
      this.redisService.deleteMainSubscriptionItemId(id as string);
    }
  }

  private async handleRecurringFromFreeTrial(target: IOrganization) {
    const { _id, payment } = target;
    const { period } = payment;
    const [updatedOrg] = await Promise.all([
      this.organizationService.updateOrganizationById(
        _id,
        [
          {
            $set: {
              ...(period === PaymentPeriodEnums.MONTHLY && { 'settings.autoUpgrade': true }),
              'payment.status': PaymentStatusEnums.ACTIVE,
              'payment.subscriptionItems': {
                $cond: {
                  if: { $isArray: '$payment.subscriptionItems' },
                  then: {
                    $map: {
                      input: '$payment.subscriptionItems',
                      as: 'item',
                      in: { $mergeObjects: ['$$item', { paymentStatus: PaymentStatusEnums.ACTIVE }] },
                    },
                  },
                  else: '$payment.subscriptionItems',
                },
              },
            },
          },
        ],
      ),
      this.organizationDocStackService.resetDocStack({ orgId: _id, docStackStartDate: new Date() }),
    ]);

    const managers = await this.organizationService.findMemberWithRoleInOrg(
      _id,
      [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR],
      { userId: 1 },
    );
    const managerIds: string[] = managers.map(({ userId }) => userId.toHexString());
    this.organizationService.publishUpdateOrganization(
      managerIds,
      {
        orgId: _id,
        organization: updatedOrg,
        type: SUBSCRIPTION_PAYMENT_UPDATE,
      },
      SUBSCRIPTION_UPDATE_ORG,
    );
  }

  /**
   * Atomically update payment status fields using $set to avoid race conditions
   * with concurrent updates (e.g., quantity changes from the upgrade API)
   *
   * This function assume org is subscribing and all items in `subscriptionItems` will has the same status
   */
  private async updatePaymentStatus(paymentTarget: IOrganization | IUser, paymentType: PaymentTypeEnums, status: PaymentStatusEnums) {
    const { _id: targetId } = paymentTarget;

    const isIncludePDF = {
      $gt: [
        {
          $size: {
            $filter: {
              input: '$payment.subscriptionItems',
              cond: { $eq: ['$$this.productName', UnifySubscriptionProduct.PDF] },
            },
          },
        },
        0,
      ],
    };
    const updatePipeline = [
      {
        $set: {
          'payment.subscriptionItems': {
            $cond: {
              if: { $isArray: '$payment.subscriptionItems' },
              then: {
                // iterate through `subscriptionItems` and update `status`
                $map: {
                  input: '$payment.subscriptionItems',
                  as: 'item',
                  in: { $mergeObjects: ['$$item', { paymentStatus: status }] },
                },
              },
              else: '$payment.subscriptionItems',
            },
          },
          'payment.status': {
            $cond: {
              // Using nested $cond instead of $or or $and because $or and $and doesn't guarantee short-circuit evaluation
              // See: https://www.mongodb.com/docs/manual/reference/operator/aggregation/or/#error-handling
              if: { $isArray: '$payment.subscriptionItems' },
              then: {
                // if subscriptionItems.length > 0 -> org may only subscribe to SIGN -> check for PDF before update `status`
                $cond: {
                  if: { $eq: [{ $size: '$payment.subscriptionItems' }, 0] },
                  then: status, // subscriptionItems=[] -> org only subscribed to PDF -> update `status`
                  else: {
                    // non-empty array → check if contains PDF
                    $cond: {
                      if: isIncludePDF,
                      then: status, // contains PDF → update
                      else: '$payment.status', // SIGN-only → keep existing
                    },
                  },
                },
              },
              else: status, // subscriptionItems=null -> org only subscribed to PDF -> update `status`
            },
          },
        },
      },
    ];

    switch (paymentType) {
      case PaymentTypeEnums.ORGANIZATION:
        return this.organizationService.updateOrganizationById(targetId, updatePipeline);
      case PaymentTypeEnums.INDIVIDUAL:
        return this.userService.findOneAndUpdate({ _id: targetId }, updatePipeline, { new: true });
      default:
        break;
    }
  }

  private async createCancelPlanEvent({
    subscription, paymentTarget, paymentType, cancelPlanReason, stripeAccountId,
  }): Promise<void> {
    const pdfItem = this.paymentUtilsService.getStripePdfSubscriptionItem({
      subscriptionItems: subscription.items.data,
    });
    if (!pdfItem) {
      return;
    }
    const {
      amount, currency, id: planId, interval,
    } = pdfItem.plan;
    const period = this.paymentService.getPeriodFromInterval(interval as PaymentIntervalEnums);
    const { quantity } = pdfItem || {};
    const { payment } : { payment: PaymentSchemaInterface } = paymentTarget;
    const plan = this.paymentService.getPaymentPlan({
      planId, period, currency: currency.toUpperCase() as PaymentCurrencyEnums, stripeAccountId,
    });
    let eventData: ICreateEventInput;
    const eventScope = ElasticsearchUtil.mapPaymentTypeToScope(paymentType as PaymentTypeEnums);
    const planText = `${this.paymentService.getPlanText(plan, Boolean(subscription.trial_start))} ${period}`;
    const planModification = {
      plan: planText,
      planCharge: amount,
      currency: currency.toUpperCase() as PaymentCurrencyEnums,
    };
    switch (paymentType) {
      case PaymentTypeEnums.INDIVIDUAL:
        eventData = {
          eventName: NonDocumentEventNames.PERSONAL_PLAN_CANCELED,
          eventScope,
          actorModification: {
            ...planModification,
            cancelPlanReason,
          },
        };
        break;
      case PaymentTypeEnums.TEAM:
        eventData = {
          eventName: NonDocumentEventNames.TEAM_PLAN_CANCELED,
          eventScope,
          team: paymentTarget,
        };
        break;
      case PaymentTypeEnums.ORGANIZATION:
        eventData = {
          eventName: NonDocumentEventNames.ORG_PLAN_CANCELED,
          eventScope,
          organization: paymentTarget,
          orgModification: {
            ...planModification,
            docStack: DocStackUtils.getEventDocStack({ plan, period, quantity }),
            cancelPlanReason,
          },
        };
        break;
      default:
        break;
    }

    let actor: User;
    if (paymentType !== PaymentTypeEnums.INDIVIDUAL) {
      actor = await this.getSubscriptionActorFromRedis(payment);
    } else {
      actor = paymentTarget;
    }
    eventData.actor = actor;
    this.eventService.createEvent(eventData);
  }

  private async createChangePlanEvent({
    data, paymentTarget, paymentType, isRenewSubscription,
  }): Promise<void> {
    const { amount } = data.object;
    const { payment }: { payment: PaymentSchemaInterface } = paymentTarget;
    const eventScope = ElasticsearchUtil.mapPaymentTypeToScope(paymentType as PaymentTypeEnums);
    const planModification: IEventActorModification = {
      plan: `${payment.type} ${payment.period}`,
      planCharge: amount,
    };
    let eventName: EventNameType;
    if (isRenewSubscription) {
      const renewSubEventMapping = {
        [PaymentTypeEnums.INDIVIDUAL]: NonDocumentEventNames.PERSONAL_PLAN_RENEWED,
        [PaymentTypeEnums.TEAM]: NonDocumentEventNames.TEAM_PLAN_RENEWED,
      };
      eventName = renewSubEventMapping[paymentType];
    } else {
      const changeSubEventMapping = {
        [PaymentTypeEnums.INDIVIDUAL]: NonDocumentEventNames.PERSONAL_PLAN_CHANGED,
        [PaymentTypeEnums.TEAM]: NonDocumentEventNames.TEAM_PLAN_CHANGED,
      };
      eventName = changeSubEventMapping[paymentType];
    }
    const eventData: ICreateEventInput = {
      eventName,
      eventScope,
    };
    switch (paymentType) {
      case PaymentTypeEnums.INDIVIDUAL:
        eventData.actorModification = planModification;
        break;
      case PaymentTypeEnums.TEAM:
        eventData.team = paymentTarget;
        eventData.teamModification = planModification;
        break;
      default:
        break;
    }

    let actor: User;
    if (paymentType !== PaymentTypeEnums.INDIVIDUAL) {
      actor = await this.getSubscriptionActorFromRedis(payment);
    } else {
      actor = paymentTarget;
    }
    eventData.actor = actor;
    this.eventService.createEvent(eventData);
  }

  private async createChangeOrgPlanEvent({
    data, paymentTarget, orgPrevPlan, isRenewSubscription,
  }): Promise<void> {
    const { amount } = data.object;
    const { payment }: { payment: PaymentSchemaInterface } = paymentTarget;
    const actor = await this.getSubscriptionActorFromRedis(payment);
    const PlanText = this.paymentService.getPlanText(payment.type as PaymentPlanEnums, payment.status === PaymentStatusEnums.TRIALING);
    const planModification: IEventOrgPlanModification = {
      plan: `${PlanText} ${payment.period}`,
      planCharge: amount,
      currency: payment.currency as PaymentCurrencyEnums,
    };
    let eventName: EventNameType;

    if (isRenewSubscription) {
      eventName = NonDocumentEventNames.ORG_PLAN_RENEWED;
      planModification.docStack = DocStackUtils.getEventDocStack({
        plan: payment.type, period: payment.period as PaymentPeriodEnums, quantity: payment.quantity,
      });
      const orgId = paymentTarget._id as string;
      const isRenewSuccessFromPaymentLink = await this.redisService.isOrgRecentlyUpgradedByAdmin(orgId);
      if (isRenewSuccessFromPaymentLink) {
        const organization = await this.organizationService.getOrgById(orgId);
        this.adminService.createEventForOrgUpgradedByAdmin(organization, PlanActionEvent.DOCSTACK_PLAN_PAID);
      }
    } else {
      eventName = NonDocumentEventNames.ORG_PLAN_UPGRADED;
      planModification.previousPlan = orgPrevPlan.prevPlan;
      planModification.previousCharge = orgPrevPlan.prevCharge;
      planModification.docStack = DocStackUtils.getEventDocStack({
        plan: payment.type, period: payment.period as PaymentPeriodEnums, quantity: payment.quantity,
      });
    }
    const eventData: ICreateEventInput = {
      eventName,
      eventScope: EventScopes.ORGANIZATION,
      actor,
      organization: paymentTarget,
      orgModification: planModification,
    };

    this.eventService.createEvent(eventData);
  }

  private async getSubscriptionActorFromRedis(payment: PaymentSchemaInterface): Promise<User> {
    const { subscriptionRemoteId } = payment;
    // Get the member who has upgraded plan
    const subscriptionActorRedisKey = `${RedisConstants.SUBSCRIPTION_ACTOR_REDIS_PREFIX}${subscriptionRemoteId}`;
    const actorId = await this.redisService.getRedisValueWithKey(subscriptionActorRedisKey);
    const actor = await this.userService.findUserById(actorId);
    this.redisService.deleteRedisByKey(subscriptionActorRedisKey);
    return actor;
  }

  private async handleUpgradeToEnterprise(invoiceData: Stripe.Invoice, stripeAccount: string): Promise<IOrganization> {
    const { id: invoiceId } = invoiceData as { id: string };
    const invoiceLineItems = this.paymentUtilsService.filterStripePdfInvoiceLineItem({
      lines: invoiceData.lines.data,
      stripeAccountId: stripeAccount,
    });
    const product = get(invoiceLineItems[0], 'plan.product');
    const productId = typeof product === 'string' ? product : get(product, 'id');
    if (!this.paymentService.isUpgradeEnterpriseOrganization(productId)) {
      return;
    }
    const enterpriseInvoice = await this.adminService.findUpgradingInvoiceById(invoiceId);
    if (!enterpriseInvoice) {
      return;
    }
    const orgId: string = enterpriseInvoice.orgId.toHexString();
    const organization = await this.organizationService.getOrgById(orgId);
    if (!organization) {
      return;
    }
    const { payment } = organization;
    const totalMembers = await this.organizationService.getTotalMemberInOrg(orgId);
    const invoiceQuantity = get(invoiceLineItems[0], 'quantity');

    if (totalMembers > invoiceQuantity) {
      return;
    }
    // update org payment to enterprise
    let updatedOrganization: IOrganization;
    switch (payment.type) {
      case PaymentPlanEnums.FREE:
        updatedOrganization = await this.paymentService.updateOrgToEnterpriseOrDocStackPlan({ organization, invoice: invoiceData });
        break;
      case PaymentPlanEnums.BUSINESS:
      case PaymentPlanEnums.ENTERPRISE:
        updatedOrganization = await this.paymentService.upgradeNonFreeOrgToEnterprise(organization, invoiceData);
        break;
      default:
        break;
    }

    if (updatedOrganization) {
      this.adminService.sendEmailAfterCharge(organization, updatedOrganization, invoiceData);
    }
    this.adminService.removeAllOrganizationInvoices(orgId);
    this.createEnterpriseUpgradeSuccessEvent(organization);
    return updatedOrganization;
  }

  // set invoice attemp to redis to show banner announce user
  private async handleInvoicePaymentFailed({
    data,
    paymentType,
    paymentTarget,
    stripeAccount,
  } : {
    paymentTarget: IOrganization | User,
    paymentType: PaymentTypeEnums,
    data: Record<string, any>,
    stripeAccount: string,
  }) {
    const { payment } = paymentTarget;
    const { object: { attempt_count: attemptCount, next_payment_attempt: nextPaymentAttempt, payment_intent: paymentIntentId } } = data;
    // retrieve payment intent to check the reason charge failed
    const [paymentIntent, paymentMethods] = await Promise.all([
      this.paymentService.retrievePaymentIntent({ paymentIntentId, options: { stripeAccount } }),
      this.paymentService.listPaymentMethods({
        customer: payment.customerRemoteId,
      }, { stripeAccount }),
    ]);

    const paymentIntentStatus = get(paymentIntent, 'status');
    try {
      if (paymentIntentStatus === PaymentIntentStatusEnums.REQUIRE_PAYMENT_METHOD && !paymentMethods.data.length) {
        this.redisService.setStripeRenewAttempt({
          attemptCount,
          nextPaymentAttempt,
          clientId: paymentTarget._id,
          paymentType,
          declineCode: StripeDeclineCodeEnums.PAYMENT_METHOD_NOT_FOUND,
        } as IStripeRenewAttempt);
        if (paymentType === PaymentTypeEnums.ORGANIZATION) {
          this.paymentService.postSmbNotification({
            organization: paymentTarget as IOrganization,
            notificationType: SlackSMBNotificationType.EXPERIENCES_RENEWAL_ISSUES,
          });

          // [Hubspot] send HubSpot event for ORG_PRO plan renewal failure
          const pdfPaymentType = this.paymentUtilsService.getPdfPaymentType(payment);
          if (pdfPaymentType as PaymentPlanEnums === PaymentPlanEnums.ORG_PRO) {
            this.hubspotWorkspaceService.sendWorkspaceEvent({
              orgId: String(paymentTarget._id),
              eventName: HubspotWorkspaceEventName.WORKSPACE_SUBSCRIPTION_CHANGED,
              properties: {
                status: WorkspaceSubscriptionChangedStatus.RENEWAL_FAILED,
                renewal_failed_reason: StripeDeclineCodeEnums.PAYMENT_METHOD_NOT_FOUND,
              },
            });
          }
        }
        return;
      }
      // for 3d secure card, the charge will not be created until customer need re-author to make the payment
      if (!paymentIntent.latest_charge) {
        return;
      }

      const chargeData = await this.paymentService.retrieveCharge({
        chargeId: paymentIntent.latest_charge as string,
        options: { stripeAccount },
      });
      const declineCode = get(chargeData, 'outcome.reason', null);

      const paymentMethodData = paymentMethods?.data[0];
      let cardLast4: string;
      if (paymentMethodData && (paymentMethodData.type as StripePaymentMethodTypeEnums) === StripePaymentMethodTypeEnums.CARD) {
        cardLast4 = paymentMethodData.card.last4;
      }

      const attemptObj: IStripeRenewAttempt = {
        attemptCount,
        nextPaymentAttempt,
        clientId: paymentTarget._id,
        paymentType,
        declineCode,
        ...(Boolean(cardLast4) && { cardLast4 }),
      };
      this.redisService.setStripeRenewAttempt(attemptObj);
      if (paymentType === PaymentTypeEnums.ORGANIZATION) {
        this.paymentService.postSmbNotification({
          organization: paymentTarget as IOrganization,
          notificationType: SlackSMBNotificationType.EXPERIENCES_RENEWAL_ISSUES,
        });

        // [Hubspot] send HubSpot event for ORG_PRO plan renewal failure
        const pdfPaymentType = this.paymentUtilsService.getPdfPaymentType(payment);
        if (pdfPaymentType as PaymentPlanEnums === PaymentPlanEnums.ORG_PRO) {
          this.hubspotWorkspaceService.sendWorkspaceEvent({
            orgId: String(paymentTarget._id),
            eventName: HubspotWorkspaceEventName.WORKSPACE_SUBSCRIPTION_CHANGED,
            properties: {
              status: WorkspaceSubscriptionChangedStatus.RENEWAL_FAILED,
              renewal_failed_reason: declineCode || '',
            },
          });
        }
      }
    } catch (error) {
      this.loggerService.error({
        context: 'handleInvoicePaymentFailed',
        error,
      });
    }
  }

  private createEnterpriseUpgradeSuccessEvent(organization: IOrganization): void {
    const { _id, name, domain } = organization;
    const eventData = new OrganizationEventBuilder()
      .setName(PlanActionEvent.ENTERPRISE_UPGRADE_PAID)
      .setOrganization({
        _id,
        name,
        domain,
      })
      .setOrgPlan({ plan: PaymentPlanEnums.ENTERPRISE })
      .setScope([EventScopes.SYSTEM])
      .build();
    this.adminEventService.createEvent(eventData);
  }

  private handlePaymentInvoiceSucceeded({
    data, paymentTarget, customer, paymentType, stripeAccount,
  } : {
    data: Record<string, any>,
    paymentTarget: User | IOrganization,
    customer: Record<string, any>,
    paymentType: PaymentTypeEnums, stripeAccount: string
  }): void {
    const invoiceData = data.object as Stripe.Invoice;
    const invoiceLineItems = this.paymentUtilsService.filterStripePdfInvoiceLineItem({
      lines: invoiceData.lines.data,
      stripeAccountId: stripeAccount,
    });
    const product = get(invoiceLineItems[0], 'plan.product');
    const productId = typeof product === 'string' ? product : get(product, 'id');
    const isUpgradeEnterprise = this.paymentService.isUpgradeEnterpriseOrganization(productId);
    if (isUpgradeEnterprise) {
      this.handleUpgradeToEnterprise(invoiceData, stripeAccount).then((enterpriseOrgData) => {
        this.paymentService.sendPurchaseGaEvent({
          invoice: invoiceData,
          paymentTarget: enterpriseOrgData || paymentTarget,
        });
        this.paymentService.trackPurchaseEventToBraze({
          paymentTarget: paymentTarget || enterpriseOrgData, invoiceData, paymentType: paymentType || PaymentTypeEnums.ORGANIZATION,
        });
      });
    } else {
      // Zero amount invoice is already handled before the hook is fired
      if (invoiceData.amount_due !== 0) {
        this.adminPaymentService.handleUpgradeDocStackPlanInvoiceSuccess({ invoiceData, stripeAccount });
      }
      this.paymentService.trackPurchaseEventToBraze({
        paymentTarget, invoiceData, paymentType: paymentType || PaymentTypeEnums.ORGANIZATION,
      });
    }
    if (invoiceData.billing_reason === BillingReason.SUBSCRIPTION_CYCLE) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.paymentService.sendRenewSuccessEmail(paymentTarget, customer, paymentType, invoiceData);
    }
  }

  private async handleInvoiceCreated({
    data,
    stripeAccount,
  }: {
    data: Record<string, any>,
    stripeAccount: string
  }) {
    const { object: { id: invoiceId, customer: customerId } } = data;
    await this.paymentService.updateInvoiceStatementDescriptor({
      customerId,
      invoiceId,
      stripeAccount,
    });
  }

  private async handleInvoiceFinalized({
    paymentTarget,
    paymentType,
    data,
  }: {
    paymentTarget: IOrganization | User,
    paymentType: string,
    data: Record<string, any>,
  }) {
    const invoice = data.object as Stripe.Invoice;
    const { billing_reason: billingReason } = invoice;
    if (![BillingReason.SUBSCRIPTION_CYCLE].includes(billingReason as BillingReason)) {
      return;
    }
    if (paymentType === PaymentTypeEnums.INDIVIDUAL) {
      return;
    }

    const { _id: orgId, payment } = paymentTarget;
    const { subscriptionRemoteId, stripeAccountId, subscriptionItems = [] } = payment;
    if (!subscriptionItems.some((item) => item.paymentStatus === PaymentStatusEnums.CANCELED)) {
      return;
    }
    const subscription = await this.paymentService.getStripeSubscriptionInfo({
      subscriptionId: subscriptionRemoteId,
      options: { stripeAccount: stripeAccountId },
    });
    const { created } = subscription;

    const refundedFraudWarning = await this.redisService.refundedFraudWarningAmount(payment.customerRemoteId);
    const numberDaysUsePremium = Math.abs(moment(new Date()).diff(new Date(created * 1000), 'days')) + 1;

    const [updatedOrganization, managers, users] = await Promise.all([
      this.paymentService.deleteCanceledSubscriptionItem({ orgId, payment }),
      this.organizationService.getOrganizationMemberByRole(
        orgId,
        [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR],
      ),
      this.organizationService.getMembersByOrgId(orgId, { userId: 1 }),
    ]);
    const { payment: updatedPayment } = updatedOrganization;
    const { subscriptionItems: updatedSubscriptionItems } = updatedPayment;
    if (!this.paymentUtilsService.isIncludePdfSubscription({ subscriptionItems: updatedSubscriptionItems })) {
      await this.handleCancelPdfSubscription({
        organization: updatedOrganization,
        subscription,
        managers,
        refundedFraudWarning,
        numberDaysUsePremium,
      });
    }

    if (!this.paymentUtilsService.isIncludeSignSubscription({ subscriptionItems: updatedSubscriptionItems })) {
      await this.organizationService.handleCancelSignSubscription({
        organization: updatedOrganization,
        managers,
        refundedFraudWarning,
        numberDaysUsePremium,
      });
    }

    const memberIds: string[] = users.map(({ userId }) => userId);
    this.organizationService.publishUpdateOrganization(
      memberIds,
      {
        orgId,
        organization: updatedOrganization,
        type: SUBSCRIPTION_PAYMENT_UPDATE,
      },
      SUBSCRIPTION_UPDATE_ORG,
    );

    this.createCancelPlanEvent({
      subscription,
      paymentTarget,
      paymentType,
      cancelPlanReason: PlanCancelReason.USER_CANCELED,
      stripeAccountId,
    });
  }

  async handleCancelPdfSubscription({
    organization,
    subscription,
    managers,
    refundedFraudWarning,
    numberDaysUsePremium,
  }: {
    organization: IOrganization,
    subscription: Stripe.Subscription,
    managers: User[],
    refundedFraudWarning: string,
    numberDaysUsePremium: number,
  }) {
    const { _id: orgId, payment, createdAt } = organization;
    const {
      current_period_end: periodEnd, cancel_at: canceledAt, trial_end: trialEnd,
    } = subscription;
    await this.organizationService.updateSettingForCanceledBusinessPlan({
      paymentType: payment.type as PaymentPlanEnums,
      paymentStatus: payment.status as PaymentStatusEnums,
      organization,
    });

    const havePendingPaymentLink = Boolean(await this.organizationService.isOrganizationUpgradeEnterprise(orgId));
    if (periodEnd !== canceledAt && !havePendingPaymentLink) {
      await this.organizationDocStackService.resetDocStack({ orgId, docStackStartDate: createdAt });
    }

    const emails = managers.map(({ email }: { email: string, _id?: string}) => email);
    const isCancelFreeTrial = trialEnd && trialEnd >= moment().unix();
    if (!isCancelFreeTrial) {
      this.paymentService.sendOrgSubscriptionCanceledEmail({
        refundedFraudWarningAmount: refundedFraudWarning, targetEmails: emails, orgData: organization, numberDaysUsePremium,
      });
    }

    const hasRestoreOriginalPermission = [
      PaymentPlanEnums.ORG_PRO,
      PaymentPlanEnums.ORG_BUSINESS,
      PaymentPlanEnums.ENTERPRISE,
    ].includes(payment.type as PaymentPlanEnums);
    if (hasRestoreOriginalPermission && !organization.deletedAt) {
      this.redisService.setDeleteBackupFileExpired(orgId);
    }
  }

  @GrpcMethod('WorkerService', 'CreateOldPlanSubscription')
  CreateOldPlanSubscription(data): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.paymentService.createOldPlanSubscription(data);
  }

  @GrpcMethod('WorkerService', 'UpdateCustomerMetadata')
  UpdateCustomerMetadata(data: { limit: number, chunkSize: number }): void {
    const { limit, chunkSize = 5 } = data as { limit: number, chunkSize: number };
    this.paymentScriptService.updateAllCustomersMetadata(limit, chunkSize);
  }
}
