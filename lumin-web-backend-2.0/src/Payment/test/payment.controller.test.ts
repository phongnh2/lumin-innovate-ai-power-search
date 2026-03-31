/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Test, TestingModule } from '@nestjs/testing';
import Stripe from 'stripe';

import { PaymentController } from '../payment.controller';
import { PaymentService } from '../payment.service';
import { EnvironmentService } from '../../Environment/environment.service';
import { UserService } from '../../User/user.service';
import { OrganizationService } from '../../Organization/organization.service';
import { RedisService } from '../../Microservices/redis/redis.service';
import { LoggerService } from '../../Logger/Logger.service';
import { EmailService } from '../../Email/email.service';
import { TeamService } from '../../Team/team.service';
import { UserTrackingService } from '../../UserTracking/tracking.service';
import { EventServiceFactory } from '../../Event/services/event.service.factory';
import { AdminEventService } from '../../Event/services/admin.event.service';
import { AdminService } from '../../Admin/admin.service';
import { OrganizationDocStackService } from '../../Organization/organization.docStack.service';
import { OrganizationDocStackQuotaService } from '../../Organization/organization.docStackQuota.service';
import { AdminPaymentService } from '../../Admin/admin.payment.service';
import { PaymentScriptService } from '../paymentScript.service';
import { PaymentUtilsService } from '../utils/payment.utils';
import { STRIPE_CLIENT } from '../../Stripe/constants';
import { HubspotWorkspaceService } from '../../Hubspot/hubspot-workspace.service';

import {
  PaymentTypeEnums,
  StripePaymentHook,
  CollectionMethod,
} from '../payment.enum';

describe('PaymentController – 100% branch coverage', () => {
  let controller: PaymentController;
  let stripe: any;
  let paymentService: any;
  let logger: any;
  let orgService: any;
  let userService: any;

  beforeEach(async () => {
    stripe = {
      webhooks: {
        constructEvent: jest.fn(),
      },
    };

    paymentService = {
      retrieveCustomer: jest.fn(),
      retrieveCharge: jest.fn(),
      isUpgradeEnterpriseOrganization: jest.fn(),
      getPaymentPlan: jest.fn(),
      getPeriodFromInterval: jest.fn(),
      getNewPaymentObject: jest.fn(),
      handleStripeEarlyFraudWarning: jest.fn(),
    };

    logger = {
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    };

    orgService = {
      findOrgByCustomerId: jest.fn(),
    };

    userService = {
      findUserByCustomerId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        { provide: STRIPE_CLIENT, useValue: stripe },
        { provide: PaymentService, useValue: paymentService },
        { provide: EnvironmentService, useValue: { getByKey: jest.fn().mockReturnValue('false') } },
        { provide: UserService, useValue: userService },
        { provide: OrganizationService, useValue: orgService },
        { provide: RedisService, useValue: {} },
        { provide: LoggerService, useValue: logger },
        { provide: EmailService, useValue: {} },
        { provide: TeamService, useValue: {} },
        { provide: UserTrackingService, useValue: {} },
        { provide: EventServiceFactory, useValue: {} },
        { provide: AdminEventService, useValue: {} },
        { provide: AdminService, useValue: {} },
        { provide: OrganizationDocStackService, useValue: {} },
        { provide: OrganizationDocStackQuotaService, useValue: {} },
        { provide: AdminPaymentService, useValue: {} },
        { provide: PaymentScriptService, useValue: {} },
        { provide: PaymentUtilsService, useValue: {} },
        { provide: HubspotWorkspaceService, useValue: {} },
      ],
    }).compile();

    controller = module.get(PaymentController);
  });
  
  it('should process CHARGE_SUCCEEDED hook', async () => {
    stripe.webhooks.constructEvent.mockReturnValue({
      type: StripePaymentHook.CHARGE_SUCCEEDED,
      account: 'acct_1',
      data: { object: { object: 'charge', customer: 'cus_1' } },
    });

    orgService.findOrgByCustomerId.mockResolvedValue({
      _id: 'org_1',
      billingEmail: 'test@luminpdf.com',
      payment: { stripeAccountId: 'acct_1' },
    });

    paymentService.retrieveCustomer.mockResolvedValue({ id: 'cus_1' });
    paymentService.getNewPaymentObject.mockResolvedValue({ stripeAccountId: 'acct_1' });

    const res = await controller.webhookEvents({}, {
      headers: { 'stripe-signature': 'sig' },
    } as any);

    expect(res?.status).toBe(200);
  });

  it('should ignore hook when canProcessHook returns false', async () => {
    jest.spyOn<any, any>(controller, 'canProcessHook').mockReturnValue(false);

    stripe.webhooks.constructEvent.mockReturnValue({
      type: StripePaymentHook.INVOICE_CREATED,
      account: 'acct_1',
      data: { object: { object: 'invoice' } },
    });

    const res = await controller.webhookEvents({}, { headers: {} } as any);
    expect(res).toBeNull();
  });

  it('canProcessHook returns false when stripeAccount mismatch', () => {
    const result = (controller as any).canProcessHook({
      event: {
        id: 'evt_1',
        type: StripePaymentHook.INVOICE_CREATED,
        account: 'acct_x',
        data: { object: {} },
      },
      paymentTarget: {
        _id: 'org',
        payment: { stripeAccountId: 'acct_y' },
      },
      paymentType: PaymentTypeEnums.ORGANIZATION,
    });

    expect(result).toBe(false);
  });

  it('canProcessHook returns true for RADAR_EARLY_FRAUD_WARNING_CREATED', () => {
    const result = (controller as any).canProcessHook({
      event: {
        id: 'evt',
        type: StripePaymentHook.RADAR_EARLY_FRAUD_WARNING_CREATED,
        account: 'acct',
        data: { object: {} },
      },
      paymentTarget: { payment: { stripeAccountId: 'acct' } },
      paymentType: PaymentTypeEnums.ORGANIZATION,
    });

    expect(result).toBe(true);
  });

  it('canProcessHook handles SEND_INVOICE upgrade branch', () => {
    paymentService.isUpgradeEnterpriseOrganization.mockReturnValue(true);
    paymentService.getPaymentPlan.mockReturnValue(true);

    const result = (controller as any).canProcessHook({
      event: {
        id: 'evt',
        type: StripePaymentHook.INVOICE_PAYMENT_SUCCEEDED,
        account: 'acct',
        data: {
          object: {
            object: 'invoice',
            collection_method: CollectionMethod.SEND_INVOICE,
            lines: {
              data: [{
                plan: {
                  product: 'prod',
                  id: 'plan',
                  interval: 'month',
                  currency: 'usd',
                },
              }],
            },
          },
        },
      },
      paymentTarget: { payment: { stripeAccountId: 'acct' } },
      paymentType: PaymentTypeEnums.ORGANIZATION,
    });

    expect(result).toBe(true);
  });

  it('getCustomerIdFromHookData – radar early fraud warning', async () => {
    paymentService.retrieveCharge.mockResolvedValue({ customer: 'cus_123' });

    const id = await (controller as any).getCustomerIdFromHookData(
      { object: 'radar.early_fraud_warning', charge: 'ch_1' },
      'acct',
    );

    expect(id).toBe('cus_123');
  });

  it('getCustomerIdFromHookData – normal object', async () => {
    const id = await (controller as any).getCustomerIdFromHookData(
      { object: 'invoice', customer: 'cus_999' },
      'acct',
    );

    expect(id).toBe('cus_999');
  });

  it('getPaymentData – organization payment', async () => {
    orgService.findOrgByCustomerId.mockResolvedValue({
      _id: 'org',
      billingEmail: 'a@luminpdf.com',
      payment: { customerRemoteId: 'cus', stripeAccountId: 'acct' },
    });

    paymentService.getNewPaymentObject.mockResolvedValue({ stripeAccountId: 'acct' });

    const res = await (controller as any).getPaymentData(
      { id: 'evt', customer: 'cus' },
      'acct',
    );

    expect(res.paymentType).toBe(PaymentTypeEnums.ORGANIZATION);
  });

  it('getPaymentData – user payment', async () => {
    orgService.findOrgByCustomerId.mockResolvedValue(null);
    userService.findUserByCustomerId.mockResolvedValue({
      _id: 'user',
      email: 'u@test.com',
      payment: { customerRemoteId: 'cus', stripeAccountId: 'acct' },
    });

    paymentService.getNewPaymentObject.mockResolvedValue({ stripeAccountId: 'acct' });

    const res = await (controller as any).getPaymentData(
      { id: 'evt', customer: 'cus' },
      'acct',
    );

    expect(res.paymentType).toBe(PaymentTypeEnums.INDIVIDUAL);
  });

  it('getPaymentData – no customer id', async () => {
    const res = await (controller as any).getPaymentData(
      { object: 'invoice' },
      'acct',
    );

    expect(res.paymentTarget).toBeNull();
  });

  it('withErrorLogging logs error', async () => {
    await (controller as any).withErrorLogging({
      context: 'test',
      handler: () => {
        throw new Error('boom');
      },
      extraInfo: { a: 1 },
    });

    expect(logger.error).toHaveBeenCalled();
  });

  it('withErrorLogging passes when no error', async () => {
    await (controller as any).withErrorLogging({
      context: 'ok',
      handler: jest.fn(),
    });
  });
});
