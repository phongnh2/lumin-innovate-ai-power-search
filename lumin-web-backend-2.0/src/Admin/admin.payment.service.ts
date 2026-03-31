/* eslint-disable global-require */

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { get } from 'lodash';
import Stripe from 'stripe';

import { PaymentCustomizeParamsBuilder } from 'Common/builder/PaymentParamsBuilder/payment.customize.params.builder';

import { UpgradeEnterpriseStatus } from 'Admin/admin.enum';
import { AdminService } from 'Admin/admin.service';
import { DocStackPlan, PaymentPeriod } from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { OrganizationService } from 'Organization/organization.service';
import { PaymentSchemaInterface, ReservePaymentSchemaInterface } from 'Payment/interfaces/payment.interface';
import {
  InvoiceStatus, PaymentCurrencyEnums, CollectionMethod, PaymentPlanEnums, PaymentStatusEnums, UpgradeInvoicePlanEnums,
} from 'Payment/payment.enum';
import { PaymentService } from 'Payment/payment.service';

import { IEnterpriseInvoice } from './interfaces/admin.interface';

interface ISubscriptionPlanByPaymentLink {
  organization: IOrganization,
  paymentLinkInfo: {
    orgId: string,
    plan: DocStackPlan,
    period: PaymentPeriod,
    currency: PaymentCurrencyEnums,
    quantity: number,
    billingEmail:string,
    expireDays: number,
    couponCode?: string,
  }
}
@Injectable()
export class AdminPaymentService {
  constructor(
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
    @Inject(forwardRef(() => AdminService))
    private readonly adminService: AdminService,
    private readonly loggerService: LoggerService,
    private readonly redisService: RedisService,
  ) {}

  async updateSubscriptionPlanByPaymentLink(params: ISubscriptionPlanByPaymentLink): Promise<void> {
    const { organization, paymentLinkInfo } = params;
    const isTrialing = organization.payment.status === PaymentStatusEnums.TRIALING;
    const stripeAccountId = this.paymentService.getStripeAccountId({
      payment: organization.payment,
      isAdminCharge: true,
    });
    if (isTrialing) {
      const updatedPayment = await this.cancelFreeTrialOnPaymentLinkCreated(organization);
      delete updatedPayment.subscriptionRemoteId;
      organization.payment = updatedPayment;
      await this.createDocStackPaymentLinkForFreeOrg({ ...params, organization });
      return;
    }
    const { _id: orgId, payment: currentPayment } = organization;
    const {
      plan, period, quantity, expireDays, billingEmail, currency, couponCode,
    } = paymentLinkInfo;
    const paramsBuilder = new PaymentCustomizeParamsBuilder(this.paymentService).from(organization.payment).to({ type: plan, period, quantity });
    const isChargeAtEndPeriod = paramsBuilder.isChargeAtEndPeriod();
    let paymentParams;
    if (isChargeAtEndPeriod) {
      paymentParams = await paramsBuilder.setCustomerRemoteId(currentPayment.customerRemoteId).getParams();
    } else {
      paymentParams = await paramsBuilder
        .setCustomerRemoteId(currentPayment.customerRemoteId)
        .setCollectionMethod(CollectionMethod.SEND_INVOICE)
        .setExpirePaymentLink(expireDays)
        .addCoupon(couponCode)
        .getParams();
    }
    const currentStripeSubscription = await this.paymentService.getStripeSubscriptionInfo({
      subscriptionId: currentPayment.subscriptionRemoteId,
      options: { stripeAccount: stripeAccountId },
    });
    const updatedSubscription = await this.paymentService.updateStripeSubscription(
      paymentParams.upgrade.subscriptionRemoteId as string,
      paymentParams.upgrade.properties as Stripe.SubscriptionUpdateParams,
      { stripeAccount: stripeAccountId },
    );
    const latestInvoice = updatedSubscription.latest_invoice as string;
    const upcomingPlanRemoteId = paramsBuilder.getUpcomingPlanRemoteId();
    const newPaymentData: PaymentSchemaInterface = {
      subscriptionRemoteId: currentPayment.subscriptionRemoteId,
      customerRemoteId: currentPayment.customerRemoteId,
      planRemoteId: upcomingPlanRemoteId,
      type: plan,
      period,
      currency,
      status: PaymentStatusEnums.ACTIVE,
      quantity,
      stripeAccountId,
      trialInfo: this.organizationService.getTrialInfoObject(plan, currentPayment.trialInfo),
    };
    const invoice = await this.paymentService.getInvoice({
      invoiceId: latestInvoice,
      options: { stripeAccount: stripeAccountId },
    });
    if (invoice.status === InvoiceStatus.DRAFT) {
      // handle pending invoice
      await this.paymentService.updateInvoice(
        latestInvoice,
        { statement_descriptor: this.paymentService.getStatementDescriptor(currentPayment.customerRemoteId) },
        { stripeAccount: stripeAccountId },
      );
      await this.paymentService.finalizeInvoice(
        { invoiceId: latestInvoice, options: { stripeAccount: stripeAccountId } },
      );
      await this.paymentService.updateStripeCustomer(currentPayment.customerRemoteId, { email: billingEmail }, { stripeAccount: stripeAccountId });
      await this.updateUpgradingInvoiceStatusToPending(orgId, plan as unknown as UpgradeInvoicePlanEnums, invoice);

      const oldPaymentData: ReservePaymentSchemaInterface = {
        ...organization.payment,
        billingCycleAnchor: String(currentStripeSubscription.current_period_end),
      };

      await this.organizationService.updateOrganizationById(orgId, {
        payment: newPaymentData, reservePayment: oldPaymentData, 'settings.autoUpgrade': false,
      });
      if (isChargeAtEndPeriod) {
        this.redisService.setOrgRecentlyUpgradedByAdmin(orgId);
      }
      if (invoice.amount_due === 0) {
        await this.handleUpgradeDocStackPlanInvoiceSuccess({ invoiceData: invoice, stripeAccount: stripeAccountId });
      }
      return;
    }
    this.paymentService.sendUpgradeDocstackEmail({
      organization, currentPayment, upcomingPayment: newPaymentData, invoice,
    });
    this.organizationService.updateOrganizationById(orgId, { payment: newPaymentData });
    if (isChargeAtEndPeriod) {
      this.redisService.setOrgRecentlyUpgradedByAdmin(orgId);
    }
  }

  async createDocStackPaymentLinkForFreeOrg(input: ISubscriptionPlanByPaymentLink): Promise<void> {
    const { organization, paymentLinkInfo } = input;
    const {
      orgId, plan, period, quantity, expireDays, billingEmail, currency, couponCode,
    } = paymentLinkInfo;
    const stripeAccountId = this.paymentService.getStripeAccountId({
      payment: organization.payment,
      isAdminCharge: true,
    });
    const paramsBuilder = new PaymentCustomizeParamsBuilder(this.paymentService);
    let customerId: string;
    if (!organization.payment.customerRemoteId) {
      const customer = await this.paymentService.createNewCustomer(billingEmail, orgId, stripeAccountId);
      customerId = customer.id;
    } else {
      customerId = organization.payment.customerRemoteId;
    }
    const params = await paramsBuilder
      .from(organization.payment)
      .to({
        type: plan, period, quantity, currency,
      })
      .setCustomerRemoteId(customerId)
      .setCollectionMethod(CollectionMethod.SEND_INVOICE)
      .setExpirePaymentLink(expireDays)
      .addCoupon(couponCode)
      .getParams();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const subscription: { latest_invoice: string, id: string } = await this.paymentService.createStripeSubscription({
      customer: params.upgrade.customerRemoteId,
      ...params.upgrade.properties,
    }, {
      stripeAccount: stripeAccountId,
    });
    const invoice = await this.paymentService.getInvoice({
      invoiceId: subscription.latest_invoice,
      options: { stripeAccount: stripeAccountId },
    });
    const newPaymentData: PaymentSchemaInterface = {
      subscriptionRemoteId: subscription.id,
      customerRemoteId: customerId,
      planRemoteId: paramsBuilder.getUpcomingPlanRemoteId(),
      type: plan,
      period,
      currency,
      status: PaymentStatusEnums.ACTIVE,
      quantity,
      trialInfo: this.organizationService.getTrialInfoObject(plan, organization.payment?.trialInfo),
      stripeAccountId,
    };
    if (invoice.status === InvoiceStatus.DRAFT) {
      // handle pending invoice
      await this.paymentService.updateInvoice(
        subscription.latest_invoice,
        { statement_descriptor: this.paymentService.getStatementDescriptor(customerId) },
        { stripeAccount: stripeAccountId },
      );
      await this.paymentService.finalizeInvoice({ invoiceId: subscription.latest_invoice, options: { stripeAccount: stripeAccountId } });
      await this.paymentService.updateStripeCustomer(customerId, { email: billingEmail }, { stripeAccount: stripeAccountId });
      await this.updateUpgradingInvoiceStatusToPending(orgId, plan as unknown as UpgradeInvoicePlanEnums, invoice);
    }
    if (organization.payment.customerRemoteId) {
      await this.organizationService.updateOrganizationById(orgId, {
        payment: newPaymentData, reservePayment: organization.payment, 'settings.autoUpgrade': false,
      });
    } else {
      await this.organizationService.updateOrganizationById(orgId, { payment: newPaymentData, 'settings.autoUpgrade': false });
    }

    if (invoice.amount_due === 0) {
      await this.handleUpgradeDocStackPlanInvoiceSuccess({ invoiceData: invoice, stripeAccount: stripeAccountId });
    }
  }

  async rollbackToOldPayment({
    orgId,
    subscriptionItemId,
    stripeAccount,
  }: {
      orgId: string,
      subscriptionItemId: string
      stripeAccount: string
    }): Promise<void> {
    const organization = await this.organizationService.findOneOrganization({ _id: orgId });
    if (!organization) {
      return;
    }
    // When free circle create payment link, reserve payment will not exist
    const isRevertFreeOrg = !organization.reservePayment;
    if (isRevertFreeOrg) {
      await this.paymentService.cancelStripeSubscription(organization.payment.subscriptionRemoteId, null, { stripeAccount });
      await this.organizationService.updateOrganizationById(orgId, {
        payment: { type: PaymentPlanEnums.FREE, trialInfo: {} },
      });
      this.sendEmailAndCreateEventOnPaymentLinkExpired(organization);
      return;
    }
    // When circle has trial plan and create payment link, reserve payment will exist but not has subscriptionRemoteId
    const isRevertTrialOrg = organization.reservePayment && !organization.reservePayment.subscriptionRemoteId;
    if (isRevertTrialOrg) {
      await this.paymentService.cancelStripeSubscription(organization.payment.subscriptionRemoteId, null, { stripeAccount });
      await this.organizationService.updateOrganizationById(orgId, {
        payment: organization.reservePayment, $unset: { reservePayment: 1 },
      });
      this.sendEmailAndCreateEventOnPaymentLinkExpired(organization);
      return;
    }
    // Revert subscription on Stripe.
    const replacementPayment = await this.revertSubscriptionOnStripe({
      organization,
      subscriptionItemId,
      stripeAccount,
    });
    await this.organizationService.updateOrganizationById(orgId, {
      payment: replacementPayment, $unset: { reservePayment: 1 },
    });
    this.sendEmailAndCreateEventOnPaymentLinkExpired(organization);
  }

  async revertSubscriptionOnStripe({
    organization,
    subscriptionItemId,
    stripeAccount,
  }: {
    organization: IOrganization,
    subscriptionItemId: string
    stripeAccount: string
  }): Promise<PaymentSchemaInterface> {
    const { payment, reservePayment } = organization;
    const isKeepBillingCycle = payment.period === reservePayment.period;
    // monthly -> monthly, annual -> annual (keep billing cycle)
    if (isKeepBillingCycle) {
      // update planRemoteId, quantity
      await this.paymentService.updateStripeSubscription(reservePayment.subscriptionRemoteId, {
        collection_method: CollectionMethod.CHARGE_AUTOMATICALLY,
        proration_behavior: 'none',
        items: [{
          id: subscriptionItemId,
          plan: reservePayment.planRemoteId,
          quantity: reservePayment.quantity,
        }],
      }, { stripeAccount });
      delete reservePayment.billingCycleAnchor;
      return reservePayment;
    }
    // monthly -> annual (reset billing cycle)
    // create new subscription set billing cycle anchor === reservePayment.billingCycleAncor
    // with planRemoteId, quantity of reservePayment
    try {
      // Create new subscription without any charge
      // TODO: update docStackStartDate and reset doc stack
      const newSubscription = await this.paymentService.createStripeSubscription({
        days_until_due: 30,
        collection_method: CollectionMethod.SEND_INVOICE,
        customer: reservePayment.customerRemoteId,
        items: [{
          plan: reservePayment.planRemoteId,
          quantity: reservePayment.quantity,
        }],
        billing_cycle_anchor: Number(reservePayment.billingCycleAnchor),
        description: 'Subscription replacement for payment link has expired.',
      }, { stripeAccount });
      const latestInvoice = newSubscription.latest_invoice as string;
      try {
        await this.paymentService.finalizeInvoice({ invoiceId: latestInvoice, options: { stripeAccount } });
        await this.paymentService.voidStripeInvoice(latestInvoice, null, { stripeAccount });
      } catch (error) {
        this.loggerService.error({
          context: 'voidStripeInvoice',
          extraInfo: {
            stripeAccount,
            organizationId: organization._id,
          },
          error,
        });
      }
      await Promise.all([
        this.paymentService.updateStripeSubscription(
          newSubscription.id as string,
          { collection_method: CollectionMethod.CHARGE_AUTOMATICALLY },
          { stripeAccount },
        ),
        this.paymentService.cancelStripeSubscription(payment.subscriptionRemoteId, null, { stripeAccount }),
      ]);
      return {
        ...reservePayment,
        subscriptionRemoteId: newSubscription.id,
      };
    } catch (error) {
      this.loggerService.error({
        error,
        context: 'revertSubscriptionOnStripe',
      });
      delete reservePayment.billingCycleAnchor;
      return reservePayment;
    }
  }

  async handleUpgradeDocStackPlanInvoiceSuccess({
    invoiceData, stripeAccount,
  } : {
    invoiceData: Stripe.Invoice, stripeAccount: string
  }): Promise<void> {
    const {
      customer: customerId, charge: chargeId,
    } = invoiceData as { customer: string, charge: string };
    const enterpriseInvoice = await this.adminService.findUpgradingInvoiceById(invoiceData.id);
    if (!enterpriseInvoice) {
      return;
    }
    const orgId: string = enterpriseInvoice.orgId.toHexString();
    const { subscription: subscriptionId } = get(invoiceData, 'lines.data[0]', {}) as { subscription: string };
    // update payment method
    if (chargeId) {
      const charge = await this.paymentService.retrieveCharge({ chargeId, options: { stripeAccount } });
      const { payment_method: paymentMethod } = charge as { payment_method: string };
      await this.paymentService.attachPaymentMethod(customerId, paymentMethod, stripeAccount);
    }
    // update subscription collection method
    await this.paymentService.updateStripeSubscription(subscriptionId, {
      collection_method: CollectionMethod.CHARGE_AUTOMATICALLY,
    }, { stripeAccount });
    // remove pending upgrade enterprise status
    await this.adminService.removeAllOrganizationInvoices(orgId);
    // send email after charge success and record upgrade doc stack event
    await this.adminService.createUpgradeDocstackEventAndSendMail(orgId, invoiceData);
    // remove reserve payment object
    await this.organizationService.updateOrganizationById(orgId, { $unset: { reservePayment: 1 } });
  }

  async cancelFreeTrialOnPaymentLinkCreated(organization: IOrganization): Promise<PaymentSchemaInterface> {
    const orgId = organization._id;
    try {
      // Temporary create enteprise record to process in hook, value will be update later in the flow
      await this.adminService.upsertEnterpriseInvoice({
        orgId,
        status: UpgradeEnterpriseStatus.PENDING,
        invoiceId: null,
        plan: null,
      });
      const updatedOrg = await this.paymentService.cancelFreeTrial({
        targetId: organization._id, subscriptionRemoteId: organization.payment.subscriptionRemoteId,
      });

      return updatedOrg.payment;
    } catch (err) {
      await this.adminService.removeAllOrganizationInvoices(orgId);
      throw err;
    }
  }

  sendEmailAndCreateEventOnPaymentLinkExpired(organization: IOrganization) {
    this.adminService.mailToSaleWhenPaymentLinkExpired(organization);
    this.adminService.createExpiredDocStackUpgradeEvent(organization);
  }

  async updateUpgradingInvoiceStatusToPending(orgId: string, plan: UpgradeInvoicePlanEnums, invoice: any): Promise<IEnterpriseInvoice> {
    return this.adminService.upsertEnterpriseInvoice({
      orgId,
      invoiceId: invoice.id,
      status: UpgradeEnterpriseStatus.PENDING,
      plan,
    });
  }
}
