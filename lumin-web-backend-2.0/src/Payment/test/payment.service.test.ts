import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import Stripe from 'stripe';
import { of } from 'rxjs';
import { EMAIL_TYPE } from '../../Common/constants/EmailConstant';
import { FREE_30_DAYS_BUSINESS_COUPON_ID, SIGN_PLAN_TEXT } from '../../Common/constants/PaymentConstant';
import { PaymentService } from '../payment.service';
import { EnvironmentService } from '../../Environment/environment.service';
import { RedisService } from '../../Microservices/redis/redis.service';
import { UserService } from '../../User/user.service';
import { EmailService } from '../../Email/email.service';
import { OrganizationService } from '../../Organization/organization.service';
import { AdminService } from '../../Admin/admin.service';
import { AdminPaymentService } from '../../Admin/admin.payment.service';
import { OrganizationDocStackService } from '../../Organization/organization.docStack.service';
import { LoggerService } from '../../Logger/Logger.service';
import { BrazeService } from '../../Braze/braze.service';
import { SlackService } from '../../Slack/slack.service';
import { AwsService } from '../../Aws/aws.service';
import { FeatureFlagService } from '../../FeatureFlag/FeatureFlag.service';
import { PaymentUtilsService } from '../utils/payment.utils';
import { HubspotWorkspaceService } from '../../Hubspot/hubspot-workspace.service';
import { STRIPE_CLIENT } from '../../Stripe/constants';
import { EnvConstants } from '../../Common/constants/EnvConstants';
import { UpgradeEnterpriseStatus } from '../../Admin/admin.enum';
import {
  PaymentPlanEnums,
  PaymentPeriodEnums,
  PaymentStatusEnums,
  PaymentTypeEnums,
  PaymentIntervalEnums,
  PaymentCurrencyEnums,
  CollectionMethod,
  InvoiceStatus,
  PaymentProductEnums,
  StripeAccountNameEnums,
  UpgradeInvoicePlanEnums,
  SubscriptionStatus,
  UpdateSignWsPaymentActions,
} from '../payment.enum';
import { PaymentType, PaymentPeriod, Currency } from '../../graphql.schema';
import { GraphErrorException } from '../../Common/errors/GraphqlErrorException';
import { INVOICE_UPCOMING_NONE } from '../../Common/constants/PaymentConstant';
import { UpdateUnifySubscriptionParamsBuilder } from '../Policy/updateUnifySubscriptionParamsBuilder';

describe('PaymentService', () => {
  let service: PaymentService;
  let stripe: Stripe;
  let environmentService: EnvironmentService;
  let redisService: RedisService;
  let userService: UserService;
  let emailService: EmailService;
  let organizationService: OrganizationService;
  let adminService: AdminService;
  let adminPaymentService: AdminPaymentService;
  let organizationDocStackService: OrganizationDocStackService;
  let loggerService: LoggerService;
  let httpService: HttpService;
  let brazeService: BrazeService;
  let slackService: SlackService;
  let awsService: AwsService;
  let featureFlagService: FeatureFlagService;
  let paymentUtilsService: PaymentUtilsService;

  const mockStripe = {
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      list: jest.fn(),
      createSource: jest.fn(),
      deleteSource: jest.fn(),
      listPaymentMethods: jest.fn(),
      createBalanceTransaction: jest.fn(),
    },
    paymentMethods: {
      attach: jest.fn(),
      detach: jest.fn(),
      list: jest.fn(),
      retrieve: jest.fn(),
    },
    sources: {
      create: jest.fn(),
    },
    invoices: {
      retrieveUpcoming: jest.fn(),
      retrieve: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      finalizeInvoice: jest.fn(),
      sendInvoice: jest.fn(),
      pay: jest.fn(),
      voidInvoice: jest.fn(),
    },
    subscriptions: {
      retrieve: jest.fn(),
      update: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
      cancel: jest.fn(),
    },
    subscriptionItems: {
      update: jest.fn(),
      create: jest.fn(),
    },
    coupons: {
      retrieve: jest.fn(),
    },
    charges: {
      retrieve: jest.fn(),
      list: jest.fn(),
    },
    plans: {
      retrieve: jest.fn(),
    },
    tokens: {
      retrieve: jest.fn(),
      create: jest.fn(),
    },
    setupIntents: {
      retrieve: jest.fn(),
      create: jest.fn(),
    },
    paymentIntents: {
      retrieve: jest.fn(),
    },
    refunds: {
      create: jest.fn(),
    },
    prices: {
      retrieve: jest.fn(),
    },
    testHelpers: {
      testClocks: {
        retrieve: jest.fn(),
      },
    },
  };

  const mockEnvironmentService = {
    getByKey: jest.fn((key: string) => {
      const map: Record<string, any> = {
        [EnvConstants.STRIPE_NZ_CONNECTED_ACCOUNT]: 'acct_nz',
        [EnvConstants.STRIPE_US_CONNECTED_ACCOUNT]: 'acct_us',
        [EnvConstants.STRIPE_PLATFORM_ACCOUNT]: 'acct_platform',
        [EnvConstants.STRIPE_US_ACCOUNT_TOGGLE]: 'ENABLED',
        [EnvConstants.FREE_TRIAL_TIME]: '14',
        [EnvConstants.FREE_TRIAL_TIME_UNIT]: 'days',
        [EnvConstants.GA4_MEASUREMENT_ID]: 'ga_id',
        [EnvConstants.GA4_API_SECRET]: 'ga_secret',
        [EnvConstants.SMB_ORGANIZATION_IDS_CSV_PATH]: 'path/to/file.csv',
        [EnvConstants.OLD_PLAN_CARD_INFO]: JSON.stringify({ number: '4242', expireMonth: 12, expireYear: 2025, cvc: '123' }),
        [EnvConstants.OLD_PLAN_SUBSCRIPTION_COUPON]: 'coupon_code',
        [EnvConstants.STRIPE_ENTERPRISE_PRODUCT]: 'prod_enterprise',
      };
      return map[key] || '';
    }),
    getStripePlan: jest.fn(() => 'plan_123'),
    getStripePlanWithVersion: jest.fn(() => 'plan_123'),
    getStripeProduct: jest.fn(() => 'prod_123'),
  };

  const mockRedisService = {
    setMailReminderSubscriptionExpired: jest.fn(),
    getRenewAttempt: jest.fn(),
    removeStripeRenewAttempt: jest.fn(),
    setSubscriptionActor: jest.fn(),
    getSetupIntent: jest.fn(),
    setSetupIntent: jest.fn(),
    setStripeRefundFraudWarning: jest.fn(),
    getDisableSubscriptionRemainingBanner: jest.fn(),
    setDisableSubscriptionRemainingBanner: jest.fn(),
    getSubscriptionCanceledDate: jest.fn(),
    setSubscriptionCanceledDate: jest.fn(),
    removeCancelSubscriptionWarning: jest.fn(),
    setRedisDataWithExpireTime: jest.fn(),
    getMainSubscriptionItemId: jest.fn(),
    setMainSubscriptionItemId: jest.fn(),
    deleteMainSubscriptionItemId: jest.fn(),
  };

  const mockUserService = {
    findUserByEmail: jest.fn(),
    findUserById: jest.fn(),
    updateUserPropertyById: jest.fn(),
    trackPlanAttributes: jest.fn(),
  };

  const mockEmailService = {
    sendEmailHOF: jest.fn(),
  };

  const mockOrganizationService = {
    getOrgById: jest.fn(),
    updateOrganizationProperty: jest.fn(),
    updateOrganizationById: jest.fn(),
    updateManyOrganizations: jest.fn(),
    getTotalMemberInOrg: jest.fn(),
    getOrganizationMemberByRole: jest.fn(),
    countTotalActiveOrgMember: jest.fn(),
    getOrgListByUser: jest.fn(),
    getMembersByOrgId: jest.fn(),
    updateSettingForCanceledBusinessPlan: jest.fn(),
    getDefaultValueInviteUsersSetting: jest.fn(),
    handleMembersOfFreeCircleChangeSubscription: jest.fn(),
    promptToJoinTrialingOrg: jest.fn(),
    trackEventStartFreeTrial: jest.fn(),
    sendEmailWelcomeOrganizationFreeTrial: jest.fn(),
    publishUpdateSignWorkspacePayment: jest.fn(),
  };

  const mockAdminService = {
    updateInvoiceStatusByOrgId: jest.fn(),
  };

  const mockAdminPaymentService = {
    sendEmailAndCreateEventOnPaymentLinkExpired: jest.fn(),
    rollbackToOldPayment: jest.fn(),
  };

  const mockOrganizationDocStackService = {
    resetDocStack: jest.fn(),
    countFinishedDocs: jest.fn(),
  };

  const mockLoggerService = {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  };

  const mockHttpService = {
    post: jest.fn(() => of({ data: {} })),
  };

  const mockBrazeService = {
    trackPurchaseEvent: jest.fn(),
    triggerRenewalEmailCampaign: jest.fn(),
  };

  const mockSlackService = {
    postSmbNotification: jest.fn(),
  };

  const mockAwsService = {
    getFileFromTemporaryBucket: jest.fn(),
  };

  const mockFeatureFlagService = {
    getFeatureIsOn: jest.fn(),
  };

  const mockPaymentUtilsService = {
    filterSubItemByProduct: jest.fn(),
    isIncludePdfSubscription: jest.fn(),
    isIncludeSignSubscription: jest.fn(),
    isSourceCard: jest.fn(),
    isPaymentMethod: jest.fn(),
    getAllPdfProducts: jest.fn(() => ['prod_pdf']),
    getAllSignProducts: jest.fn(() => ['prod_sign']),
    getStripeAccountName: jest.fn(() => StripeAccountNameEnums.NZ_ACCOUNT),
    buildUnifyPaymentPath: jest.fn(() => '/payment'),
    getPdfTierProducts: jest.fn(() => ({
      [PaymentPlanEnums.ORG_STARTER]: 'prod_starter',
      [PaymentPlanEnums.ORG_PRO]: 'prod_pro',
      [PaymentPlanEnums.ORG_BUSINESS]: 'prod_business',
    })),
    getPlanNameFromProduct: jest.fn((productId: string) => {
      const productMapping: Record<string, string> = {
        'prod_starter': 'Starter',
        'prod_pro': 'Pro',
        'prod_business': 'Business',
        'prod_sign_pro': 'Sign Pro',
      };
      return productMapping[productId] || null;
    }),
    getUnusedTimeProrationItems: jest.fn(({ items }) => {
      return items.filter((item: any) => (item.proration && item.amount < 0) || item.description?.toLowerCase().includes('unused time'));
    }),
  };

  const mockHubspotWorkspaceService = {
    trackWorkspaceEvent: jest.fn(),
  };

  beforeEach(async () => {
    mockEnvironmentService.getByKey.mockImplementation((key: string) => {
      const map: Record<string, any> = {
        [EnvConstants.STRIPE_NZ_CONNECTED_ACCOUNT]: 'acct_nz',
        [EnvConstants.STRIPE_US_CONNECTED_ACCOUNT]: 'acct_us',
        [EnvConstants.STRIPE_PLATFORM_ACCOUNT]: 'acct_platform',
        [EnvConstants.STRIPE_US_ACCOUNT_TOGGLE]: 'ENABLED',
        [EnvConstants.FREE_TRIAL_TIME]: '14',
        [EnvConstants.FREE_TRIAL_TIME_UNIT]: 'days',
        [EnvConstants.GA4_MEASUREMENT_ID]: 'ga_id',
        [EnvConstants.GA4_API_SECRET]: 'ga_secret',
        [EnvConstants.SMB_ORGANIZATION_IDS_CSV_PATH]: 'path/to/file.csv',
        [EnvConstants.OLD_PLAN_CARD_INFO]: JSON.stringify({ number: '4242', expireMonth: 12, expireYear: 2025, cvc: '123' }),
        [EnvConstants.OLD_PLAN_SUBSCRIPTION_COUPON]: 'coupon_code',
        [EnvConstants.STRIPE_ENTERPRISE_PRODUCT]: 'prod_enterprise',
      };
      return map[key] || '';
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: EnvironmentService, useValue: mockEnvironmentService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: UserService, useValue: mockUserService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: OrganizationService, useValue: mockOrganizationService },
        { provide: AdminService, useValue: mockAdminService },
        { provide: AdminPaymentService, useValue: mockAdminPaymentService },
        { provide: OrganizationDocStackService, useValue: mockOrganizationDocStackService },
        { provide: LoggerService, useValue: mockLoggerService },
        { provide: HttpService, useValue: mockHttpService },
        { provide: BrazeService, useValue: mockBrazeService },
        { provide: STRIPE_CLIENT, useValue: mockStripe },
        { provide: SlackService, useValue: mockSlackService },
        { provide: AwsService, useValue: mockAwsService },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService },
        { provide: PaymentUtilsService, useValue: mockPaymentUtilsService },
        { provide: HubspotWorkspaceService, useValue: mockHubspotWorkspaceService },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    stripe = module.get<Stripe>(STRIPE_CLIENT);
    environmentService = module.get<EnvironmentService>(EnvironmentService);
    redisService = module.get<RedisService>(RedisService);
    userService = module.get<UserService>(UserService);
    emailService = module.get<EmailService>(EmailService);
    organizationService = module.get<OrganizationService>(OrganizationService);
    adminService = module.get<AdminService>(AdminService);
    adminPaymentService = module.get<AdminPaymentService>(AdminPaymentService);
    organizationDocStackService = module.get<OrganizationDocStackService>(OrganizationDocStackService);
    loggerService = module.get<LoggerService>(LoggerService);
    httpService = module.get<HttpService>(HttpService);
    brazeService = module.get<BrazeService>(BrazeService);
    slackService = module.get<SlackService>(SlackService);
    awsService = module.get<AwsService>(AwsService);
    featureFlagService = module.get<FeatureFlagService>(FeatureFlagService);
    paymentUtilsService = module.get<PaymentUtilsService>(PaymentUtilsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('interceptStripeInvoiceResponse', () => {
    const baseInvoice = {
      amount_due: 5000,
      total: 5000,
      starting_balance: 0,
      ending_balance: 0,
      next_payment_attempt: 1710000000,
      discount: null,
      lines: {
        data: [
          {
            amount: 3000,
            currency: 'usd',
            period: { end: 1710000000 },
            proration_details: { credited_items: null },
          },
        ],
      },
    };

    const recurringInvoice = {
      ...baseInvoice,
      amount_due: 8000,
    };

    beforeEach(() => {
      jest.spyOn(service as any, 'calculateNextBillingPrice').mockReturnValue(8000);
      jest.spyOn(service as any, 'deductRemainingAmount').mockImplementation((v) => v);
    });

    it('NORMAL – no charge at end period', async () => {
      const subscriptionInfo = {
        isChargeAtEndPeriod: jest.fn().mockReturnValue(false),
        isUpgradeFromUnpaid: jest.fn().mockReturnValue(false),
        isUpgradeDocStackAnnual: jest.fn().mockReturnValue(false),
      } as any;

      const result = await service.interceptStripeInvoiceResponse({
        invoice: baseInvoice,
        recurringInvoice,
        subscriptionInfo,
        stripeAccountId: 'acct_nz',
      } as any);

      expect(result.total).toBe(3000);
      expect(result.currency).toBe('USD');
      expect(result.remaining).toBe(0);
      expect(result.nextBillingCycle).toBe(String(1710000000 * 1000));
    });

    it('CHARGE AT END PERIOD', async () => {
      const subscriptionInfo = {
        isChargeAtEndPeriod: jest.fn().mockReturnValue(true),
        isUpgradeFromUnpaid: jest.fn().mockReturnValue(false),
        isUpgradeDocStackAnnual: jest.fn().mockReturnValue(true),
      } as any;

      const result = await service.interceptStripeInvoiceResponse({
        invoice: baseInvoice,
        subscriptionInfo,
        stripeAccountId: 'acct_nz',
      } as any);

      expect(result.total).toBe(0);
      expect(result.remaining).toBe(0);
      expect(result.isUpgradeDocStackAnnual).toBe(true);
    });

    it('PERCENT_OFF coupon baked into proration', async () => {
      jest.spyOn(service as any, 'retrieveStripeCoupon').mockResolvedValue({
        percent_off: 50,
      });

      jest.spyOn(service as any, 'separateDiscountFromProrateAmount').mockReturnValue({
        total: 1500,
        discount: 1500,
      });

      const subscriptionInfo = {
        isChargeAtEndPeriod: jest.fn().mockReturnValue(false),
        isUpgradeFromUnpaid: jest.fn().mockReturnValue(false),
        isUpgradeDocStackAnnual: jest.fn().mockReturnValue(false),
      } as any;

      const invoice = {
        ...baseInvoice,
        discounts: [
          {
            coupon: { id: 'coupon_1', percent_off: 50 },
          },
        ],
        total_discount_amounts: [],
      };

      const result = await service.interceptStripeInvoiceResponse({
        invoice,
        subscriptionInfo,
        stripeAccountId: 'acct_nz',
      });

      expect(result.discount).toBe(1500);
      expect(result.total).toBe(1500);
      expect(result.discountDescription).toBe('50%');
    });

    it('NEW PURCHASE after CANCELED', async () => {
      const subscriptionInfo = Object.create(UpdateUnifySubscriptionParamsBuilder.prototype);
      subscriptionInfo.isChargeAtEndPeriod = jest.fn().mockReturnValue(false);
      subscriptionInfo.isUpgradeDocStackAnnual = jest.fn().mockReturnValue(false);
      subscriptionInfo.hasNewPurchaseAfterPaymentStatuses = jest.fn().mockReturnValue(true);

      const invoice = {
        ...baseInvoice,
        total: -2000,
      };

      const result = await service.interceptStripeInvoiceResponse({
        invoice,
        subscriptionInfo,
        stripeAccountId: 'acct_nz',
      } as any);

      expect(result.remaining).toBeGreaterThanOrEqual(0);
    });

    it('NEW PURCHASE after PENDING/UNPAID', async () => {
      const subscriptionInfo = Object.create(UpdateUnifySubscriptionParamsBuilder.prototype);
      subscriptionInfo.isChargeAtEndPeriod = jest.fn().mockReturnValue(false);
      subscriptionInfo.isUpgradeDocStackAnnual = jest.fn().mockReturnValue(false);
      subscriptionInfo.hasNewPurchaseAfterPaymentStatuses = jest.fn()
        .mockImplementation((statuses) =>
          statuses.includes(PaymentStatusEnums.PENDING),
        );

      const result = await service.interceptStripeInvoiceResponse({
        invoice: baseInvoice,
        recurringInvoice,
        subscriptionInfo,
        stripeAccountId: 'acct_nz',
      } as any);

      expect(result.nextBillingCycle).toBe(String(1710000000 * 1000));
    });
  });

  describe('createCustomerAndSubscription', () => {
    const user: any = {
      _id: 'user_1',
      name: 'Test User',
      email: 'test@company.com',
      metadata: {
        openGoogleReferrer: ['google'],
      },
    };

    const org: any = {
      _id: 'org_1',
      payment: {},
    };

    const baseParams = {
      user,
      organization: org,
      issuer: 'card',
      issuedId: 'tok_123',
      plan: 'price_123',
      freeTrialEndTime: 999,
      stripeAccountId: 'acct_123',
      totalOrgMembers: 10,
      blockedPrepaidCardOnTrial: 'true',
    };

    beforeEach(() => {
      jest.spyOn(service as any, 'createCustomer').mockResolvedValue({ id: 'cus_1' });
      jest.spyOn(service as any, 'attachCardToCustomer').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'updateStripeCustomer').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'updateStripeSubscription').mockResolvedValue({ id: 'sub_updated' });

      stripe.subscriptions.create = jest.fn().mockResolvedValue({ id: 'sub_1' });
      stripe.subscriptions.retrieve = jest.fn().mockResolvedValue({
        items: { data: [{ id: 'item_1' }] },
      });
      stripe.customers.retrieve = jest.fn().mockResolvedValue({ id: 'cus_1' });
      stripe.customers.del = jest.fn().mockResolvedValue(undefined);
    });

    it('should throw error when missing issuedId or issuer', async () => {
      await expect(
        service.createCustomerAndSubscription({
          ...baseParams,
          issuedId: null,
        } as any),
      ).rejects.toThrow('Missing card token');
    });

    it('should create customer and subscription when customerRemoteId not exists', async () => {
      const result = await service.createCustomerAndSubscription(baseParams as any);

      expect(service['createCustomer']).toHaveBeenCalled();
      expect(stripe.subscriptions.create).toHaveBeenCalled();

      expect(result).toEqual({
        customer: { id: 'cus_1' },
        subscription: { id: 'sub_1' },
      });
    });

    it('should rollback customer when subscription creation fails', async () => {
      stripe.subscriptions.create = jest.fn().mockRejectedValue(new Error('Stripe error'));

      await expect(
        service.createCustomerAndSubscription(baseParams as any),
      ).rejects.toThrow('Stripe error');

      expect(stripe.customers.del).toHaveBeenCalledWith('cus_1', {
        stripeAccount: 'acct_123',
      });
    });

    it('should attach card and update customer when customerRemoteId exists', async () => {
      org.payment.customerRemoteId = 'cus_1';

      await service.createCustomerAndSubscription(baseParams as any);

      expect(service['attachCardToCustomer']).toHaveBeenCalledWith({
        tokenId: 'tok_123',
        tokenMethod: 'card',
        customerRemoteId: 'cus_1',
        stripeAccountId: 'acct_123',
      });

      expect(service['updateStripeCustomer']).toHaveBeenCalled();
    });

    it('should update existing subscription when subscriptionRemoteId exists', async () => {
      org.payment.customerRemoteId = 'cus_1';
      org.payment.subscriptionRemoteId = 'sub_old';

      const result = await service.createCustomerAndSubscription(baseParams as any);

      expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith('sub_old', {
        stripeAccount: 'acct_123',
      });

      expect(service['updateStripeSubscription']).toHaveBeenCalled();

      expect(result.subscription.id).toBe('sub_updated');
    });

    it('should create new subscription when subscriptionRemoteId does not exist', async () => {
      org.payment.customerRemoteId = 'cus_1';
      org.payment.subscriptionRemoteId = null;

      const result = await service.createCustomerAndSubscription(baseParams as any);

      expect(stripe.subscriptions.create).toHaveBeenCalled();
      expect(result.subscription.id).toBe('sub_1');
    });

    it('should update customer metadata without attaching card when no issuedId', async () => {
      org.payment.customerRemoteId = 'cus_1';

      await service.createCustomerAndSubscription({
        ...baseParams,
        issuedId: null,
        issuer: null,
      } as any);

      expect(service['attachCardToCustomer']).not.toHaveBeenCalled();
      expect(service['updateStripeCustomer']).toHaveBeenCalled();
    });
  });

  describe('retryFailedSubscription', () => {
    const org: any = {
      _id: 'org_123',
      billingEmail: 'billing@test.com',
      payment: {},
    };

    const userId = 'user_1';
    const resourceType = PaymentTypeEnums.ORGANIZATION;

    beforeEach(() => {
      jest.spyOn(service as any, 'sendRenewSuccessEmail').mockImplementation(jest.fn());
    });

    it('should throw error when payment status is not UNPAID or PENDING', async () => {
      jest.spyOn(service as any, 'getNewPaymentObject').mockResolvedValue({
        stripeAccountId: 'acct_123',
        subscriptionItems: [
          { paymentStatus: PaymentStatusEnums.ACTIVE },
        ],
      });

      await expect(
        service.retryFailedSubscription(org, resourceType, userId),
      ).rejects.toThrow('Payment status is not valid!');
    });

    it('should throw error when stripeAccountId is missing', async () => {
      jest.spyOn(service as any, 'getNewPaymentObject').mockResolvedValue({
        stripeAccountId: null,
        subscriptionItems: [
          { paymentStatus: PaymentStatusEnums.UNPAID },
        ],
      });

      await expect(
        service.retryFailedSubscription(org, resourceType, userId),
      ).rejects.toThrow('Stripe account id not found');
    });

    it('should throw error when subscription is not in renew progress', async () => {
      jest.spyOn(service as any, 'getNewPaymentObject').mockResolvedValue({
        stripeAccountId: 'acct_123',
        subscriptionItems: [
          { paymentStatus: PaymentStatusEnums.PENDING },
        ],
      });

      jest.spyOn(redisService, 'getRenewAttempt').mockResolvedValue({
        nextPaymentAttempt: null,
      } as any);

      await expect(
        service.retryFailedSubscription(org, resourceType, userId),
      ).rejects.toThrow('Subscription is not in renew progress!');
    });

    it('should throw error when no failed invoices found', async () => {
      jest.spyOn(service as any, 'getNewPaymentObject').mockResolvedValue({
        stripeAccountId: 'acct_123',
        subscriptionItems: [
          { paymentStatus: PaymentStatusEnums.UNPAID },
        ],
      });

      jest.spyOn(redisService, 'getRenewAttempt').mockResolvedValue({
        nextPaymentAttempt: 123,
      } as any);

      jest.spyOn(service as any, 'retryFailedInvoices').mockResolvedValue([]);

      await expect(
        service.retryFailedSubscription(org, resourceType, userId),
      ).rejects.toThrow('No failed invoices found!');
    });

    it('should retry failed subscription successfully', async () => {
      jest.spyOn(service as any, 'getNewPaymentObject').mockResolvedValue({
        stripeAccountId: 'acct_123',
        subscriptionItems: [
          { paymentStatus: PaymentStatusEnums.UNPAID },
        ],
      });

      jest.spyOn(redisService, 'getRenewAttempt').mockResolvedValue({
        nextPaymentAttempt: 123,
      } as any);

      jest.spyOn(service as any, 'retryFailedInvoices').mockResolvedValue([
        { id: 'inv_1' },
      ]);

      const removeSpy = jest.spyOn(redisService, 'removeStripeRenewAttempt');
      const publishSpy = jest.spyOn(
        organizationService,
        'publishUpdateSignWorkspacePayment',
      );

      await service.retryFailedSubscription(org, resourceType, userId);

      expect(removeSpy).toHaveBeenCalledWith(org._id);

      expect(service['sendRenewSuccessEmail']).toHaveBeenCalledWith(
        org,
        { email: org.billingEmail },
        resourceType,
        { id: 'inv_1' },
      );

      expect(publishSpy).toHaveBeenCalledWith({
        organization: org,
        userIds: [userId],
        action: UpdateSignWsPaymentActions.RENEW_SUCCESS_SUBSCRIPTION,
      });
    });
  });


  describe('recoverPaymentData', () => {
    const baseOrg: any = {
      _id: 'org_1',
      payment: {
        customerRemoteId: 'cus_123',
        subscriptionRemoteId: 'sub_123',
      },
    };

    const paymentType = PaymentType.ORGANIZATION;

    it('should return original payment when customerRemoteId is missing', async () => {
      const org = {
        ...baseOrg,
        payment: {
          customerRemoteId: null,
          subscriptionRemoteId: null,
        },
      };

      const spy = jest
        .spyOn(service as any, 'recoverSubscriptionId')
        .mockResolvedValue('sub_new');

      const result = await service.recoverPaymentData(org, paymentType);

      expect(result).toBe(org.payment);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should return original payment when subscriptionRemoteId already exists', async () => {
      const org = {
        ...baseOrg,
        payment: {
          customerRemoteId: 'cus_123',
          subscriptionRemoteId: 'sub_123',
        },
      };

      const spy = jest
        .spyOn(service as any, 'recoverSubscriptionId')
        .mockResolvedValue('sub_new');

      const result = await service.recoverPaymentData(org, paymentType);

      expect(result).toBe(org.payment);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should return original payment when recoverSubscriptionId returns null', async () => {
      const org = {
        ...baseOrg,
        payment: {
          customerRemoteId: 'cus_123',
          subscriptionRemoteId: null,
        },
      };

      const spy = jest
        .spyOn(service as any, 'recoverSubscriptionId')
        .mockResolvedValue(null);

      const result = await service.recoverPaymentData(org, paymentType);

      expect(spy).toHaveBeenCalledWith(org, paymentType);
      expect(result).toBe(org.payment);
    });

    it('should return updated payment when recoverSubscriptionId returns new subscription id', async () => {
      const org = {
        ...baseOrg,
        payment: {
          customerRemoteId: 'cus_123',
          subscriptionRemoteId: null,
        },
      };

      const spy = jest
        .spyOn(service as any, 'recoverSubscriptionId')
        .mockResolvedValue('sub_new');

      const result = await service.recoverPaymentData(org, paymentType);

      expect(spy).toHaveBeenCalledWith(org, paymentType);
      expect(result).toEqual({
        customerRemoteId: 'cus_123',
        subscriptionRemoteId: 'sub_new',
      });
    });
  });

  describe('upsertStripeCustomer', () => {
    const stripeAccountId = 'acct_test';

    const actor: any = {
      _id: 'user_1',
      email: 'test@company.com',
      metadata: {
        openGoogleReferrer: ['google'],
      },
    };

    const baseOrganization: any = {
      _id: 'org_1',
      payment: {},
    };

    beforeEach(() => {
      jest
        .spyOn(service as any, 'attachPaymentMethod')
        .mockResolvedValue({ id: 'cus_attached' });

      jest
        .spyOn(service as any, 'updateStripeCustomer')
        .mockResolvedValue(undefined);

      jest
        .spyOn(service as any, 'createCustomer')
        .mockResolvedValue({ id: 'cus_created' });

      jest
        .spyOn(service['organizationService'], 'countTotalActiveOrgMember')
        .mockResolvedValue(5);

      jest
        .spyOn(service['stripe'].customers, 'retrieve')
        .mockResolvedValue({ id: 'cus_retrieved' } as any);
    });

    it('should attach payment method when customerRemoteId & paymentMethod exist', async () => {
      const organization = {
        ...baseOrganization,
        payment: {
          customerRemoteId: 'cus_old',
        },
      };

      const result = await service.upsertStripeCustomer({
        organization,
        actor,
        paymentMethod: 'pm_123',
        stripeAccountId,
        blockedPrepaidCardOnTrial: 'true',
      });

      expect(service['attachPaymentMethod']).toHaveBeenCalledWith(
        'cus_old',
        'pm_123',
        stripeAccountId,
      );

      expect(service['updateStripeCustomer']).toHaveBeenCalledWith(
        'cus_old',
        expect.objectContaining({
          metadata: {
            blockedPrepaidCardOnTrial: 'true',
            openGoogleReferrer: 'google',
          },
        }),
        { stripeAccount: stripeAccountId },
      );

      expect(result).toEqual({ id: 'cus_attached' });
    });

    it('should retrieve customer when customerRemoteId exists but no paymentMethod', async () => {
      const organization = {
        ...baseOrganization,
        payment: {
          customerRemoteId: 'cus_old',
        },
      };

      const result = await service.upsertStripeCustomer({
        organization,
        actor,
        paymentMethod: '',
        stripeAccountId,
      });

      expect(service['stripe'].customers.retrieve).toHaveBeenCalledWith(
        'cus_old',
        { stripeAccount: stripeAccountId },
      );

      expect(service['updateStripeCustomer']).toHaveBeenCalled();

      expect(result).toEqual({ id: 'cus_retrieved' });
    });

    it('should NOT call updateStripeCustomer when metadata is empty', async () => {
      const organization = {
        ...baseOrganization,
        payment: {
          customerRemoteId: 'cus_old',
        },
      };

      const actorWithoutMetadata = {
        ...actor,
        metadata: {
          openGoogleReferrer: [],
        },
      };

      await service.upsertStripeCustomer({
        organization,
        actor: actorWithoutMetadata,
        paymentMethod: '',
        stripeAccountId,
      });

      expect(service['updateStripeCustomer']).not.toHaveBeenCalled();
    });

    it('should create new customer when customerRemoteId does not exist', async () => {
      const organization = {
        ...baseOrganization,
        payment: {},
      };

      const result = await service.upsertStripeCustomer({
        organization,
        actor,
        paymentMethod: 'pm_123',
        stripeAccountId,
        blockedPrepaidCardOnTrial: 'true',
      });

      expect(service['organizationService'].countTotalActiveOrgMember)
        .toHaveBeenCalledWith({ orgId: 'org_1' });

      expect(service['createCustomer']).toHaveBeenCalledWith(
        expect.objectContaining({
          targetId: 'org_1',
          stripeAccountId,
        }),
      );

      expect(result).toEqual({ id: 'cus_created' });
    });
  });

  describe('handleCreateStripeSubscription', () => {
    const stripeAccountId = 'acct_test';

    const baseActor: any = {
      _id: 'user_1',
      payment: {
        type: PaymentPlanEnums.PROFESSIONAL,
        subscriptionRemoteId: 'sub_old',
      },
    };

    const organization: any = {
      payment: {
        customerRemoteId: 'cus_old',
      },
    };

    const nextPayment = {
      type: PaymentPlanEnums.PROFESSIONAL,
      period: PaymentPeriodEnums.MONTHLY,
      currency: PaymentCurrencyEnums.USD,
    };

    beforeEach(() => {
      jest.clearAllMocks();

      jest
        .spyOn(service as any, 'upsertStripeCustomer')
        .mockResolvedValue({ id: 'cus_new' });

      jest
        .spyOn(service as any, 'createCustomerBalance')
        .mockResolvedValue(undefined);

      jest
        .spyOn(service as any, 'createStripeSubscription')
        .mockResolvedValue({ id: 'sub_new' });

      jest
        .spyOn(mockRedisService, 'setSubscriptionActor')
        .mockResolvedValue(undefined);
    });

    it('should throw BadRequest when missing payment method and customerRemoteId', async () => {
      await expect(
        service.handleCreateStripeSubscription({
          actor: baseActor,
          organization: { payment: {} } as any,
          paymentMethod: '',
          nextPayment,
          stripeAccountId,
          blockedPrepaidCardOnTrial: 'true',
        } as any),
      ).rejects.toThrow('Missing payment method.');
    });

    it('should throw BadRequest when error occurs in try block', async () => {
      (service as any).upsertStripeCustomer.mockRejectedValue(
        new Error('stripe failed'),
      );

      await expect(
        service.handleCreateStripeSubscription({
          actor: baseActor,
          organization,
          paymentMethod: 'pm_123',
          nextPayment,
          stripeAccountId,
          blockedPrepaidCardOnTrial: 'true',
        } as any),
      ).rejects.toThrow('stripe failed');
    });
  });

  describe('handleOrgEnterpriseOrDocStackSubscriptionUpdate', () => {
    const stripeAccount = 'acct_test';
    const subscriptionId = 'sub_123';
    const invoiceId = 'inv_123';
    const subscriptionItemId = 'si_123';
    const orgId = 'org_123';

    const baseSubscription: any = {
      id: subscriptionId,
      latest_invoice: invoiceId,
      status: SubscriptionStatus.PAST_DUE,
      items: {
        data: [{ id: subscriptionItemId }],
      },
    };

    const enterpriseInvoice = {
      orgId,
    } as any;

    beforeEach(() => {
      jest
        .spyOn(service as any, 'cancelStripeSubscription')
        .mockResolvedValue(undefined);

      jest
        .spyOn(service as any, 'voidStripeInvoice')
        .mockResolvedValue(undefined);

      jest
        .spyOn(service as any, 'updateStripeCustomer')
        .mockResolvedValue(undefined);

      mockAdminService.updateInvoiceStatusByOrgId.mockResolvedValue({
        plan: 'NON_PREMIUM_PLAN',
      });

      mockOrganizationService.getOrgById.mockResolvedValue({
        ownerId: 'user_1',
        payment: {
          type: PaymentPlanEnums.PROFESSIONAL,
          customerRemoteId: 'cus_123',
        },
      });

      mockUserService.findUserById.mockResolvedValue({
        email: 'owner@email.com',
      });

      mockAdminPaymentService.sendEmailAndCreateEventOnPaymentLinkExpired.mockResolvedValue(
        undefined,
      );

      mockAdminPaymentService.rollbackToOldPayment.mockResolvedValue(undefined);
    });

    it('should do nothing when subscription status is not PAST_DUE', async () => {
      await service.handleOrgEnterpriseOrDocStackSubscriptionUpdate({
        subscription: {
          ...baseSubscription,
          status: 'active',
        } as any,
        enterpriseInvoice,
        stripeAccount,
      });

      expect(mockAdminService.updateInvoiceStatusByOrgId).not.toHaveBeenCalled();
      expect(mockAdminPaymentService.rollbackToOldPayment).not.toHaveBeenCalled();
    });

    it('should cancel subscription and notify when org has no old premium plan', async () => {
      await service.handleOrgEnterpriseOrDocStackSubscriptionUpdate({
        subscription: baseSubscription,
        enterpriseInvoice,
        stripeAccount,
      });

      await new Promise(process.nextTick);

      expect(mockAdminService.updateInvoiceStatusByOrgId).toHaveBeenCalledWith(
        orgId,
        UpgradeEnterpriseStatus.EXPIRED,
      );

      expect(service['updateStripeCustomer']).toHaveBeenCalledWith(
        'cus_123',
        { email: 'owner@email.com' },
        { stripeAccount },
      );

      expect(
        mockAdminPaymentService.sendEmailAndCreateEventOnPaymentLinkExpired,
      ).toHaveBeenCalled();

      expect(service['cancelStripeSubscription']).toHaveBeenCalledWith(
        subscriptionId,
        null,
        { stripeAccount },
      );

      expect(service['voidStripeInvoice']).toHaveBeenCalledWith(
        invoiceId,
        null,
        { stripeAccount },
      );
    });

    it('should rollback to old payment when org has premium plan before', async () => {
      mockAdminService.updateInvoiceStatusByOrgId.mockResolvedValue({
        plan: UpgradeInvoicePlanEnums.ORG_PRO,
      });

      await service.handleOrgEnterpriseOrDocStackSubscriptionUpdate({
        subscription: baseSubscription,
        enterpriseInvoice,
        stripeAccount,
      });

      expect(mockAdminPaymentService.rollbackToOldPayment).toHaveBeenCalledWith({
        orgId,
        subscriptionItemId,
        stripeAccount,
      });

      expect(service['cancelStripeSubscription']).not.toHaveBeenCalled();

      expect(service['voidStripeInvoice']).toHaveBeenCalledWith(
        invoiceId,
        null,
        { stripeAccount },
      );
    });
  });

  describe('applyCouponCode', () => {
    const stripeAccount = 'acct_test';

    it('should return subscriptionObj unchanged when couponCode is empty', async () => {
      const subscriptionObj = {};

      const result = await (service as any).applyCouponCode(
        '',
        subscriptionObj,
        stripeAccount,
      );

      expect(mockStripe.coupons.retrieve).not.toHaveBeenCalled();
      expect(result).toBe(subscriptionObj);
    });

    it('should apply coupon when stripe retrieve success', async () => {
      mockStripe.coupons.retrieve.mockResolvedValue({
        id: 'coupon_123',
      });

      const subscriptionObj: any = {};

      const result = await (service as any).applyCouponCode(
        'COUPON_CODE',
        subscriptionObj,
        stripeAccount,
      );

      expect(mockStripe.coupons.retrieve).toHaveBeenCalledWith(
        'COUPON_CODE',
        null,
        { stripeAccount },
      );
      expect(result.coupon).toBe('coupon_123');
    });

    it('should log error when stripe retrieve coupon fails', async () => {
      const error = new Error('stripe error');
      mockStripe.coupons.retrieve.mockRejectedValue(error);

      const subscriptionObj: any = {};

      const result = await (service as any).applyCouponCode(
        'INVALID_COUPON',
        subscriptionObj,
        stripeAccount,
      );

      expect(mockLoggerService.error).toHaveBeenCalledWith({
        error,
        extraInfo: {
          couponCode: 'INVALID_COUPON',
          subscriptionObj,
        },
      });
      expect(result).toBe(subscriptionObj);
      expect(result.coupon).toBeUndefined();
    });
  });

  describe('cancelFreeTrial', () => {
    const targetId = 'org_123';
    const subscriptionRemoteId = 'sub_123';

    const oldPayment = {
      stripeAccountId: 'acct_test',
      type: PaymentPlanEnums.PROFESSIONAL,
      status: PaymentStatusEnums.ACTIVE,
      subscriptionRemoteId,
      trialInfo: { days: 14 },
    };

    beforeEach(() => {
      jest
        .spyOn(service as any, 'cancelStripeSubscription')
        .mockResolvedValue({ status: 'canceled' });

      jest
        .spyOn(service as any, 'getFreePaymentPayload')
        .mockReturnValue({ type: PaymentPlanEnums.FREE });

      jest
        .spyOn(service as any, 'postSmbNotification')
        .mockImplementation(jest.fn());

      mockOrganizationService.getOrgById.mockResolvedValue({
        payment: oldPayment,
      });

      mockOrganizationService.updateOrganizationProperty.mockResolvedValue({
        id: targetId,
        payment: { type: PaymentPlanEnums.FREE },
      });

      mockOrganizationService.updateSettingForCanceledBusinessPlan.mockResolvedValue(
        undefined,
      );
    });

    it('should cancel free trial successfully', async () => {
      const result = await service.cancelFreeTrial({
        targetId,
        subscriptionRemoteId,
      });

      expect(service['cancelStripeSubscription']).toHaveBeenCalledWith(
        subscriptionRemoteId,
        null,
        { stripeAccount: oldPayment.stripeAccountId },
      );

      expect(mockOrganizationService.updateOrganizationProperty).toHaveBeenCalledWith(
        targetId,
        expect.objectContaining({
          payment: expect.objectContaining({
            subscriptionRemoteId,
            trialInfo: oldPayment.trialInfo,
          }),
        }),
      );

      expect(
        mockOrganizationService.updateSettingForCanceledBusinessPlan,
      ).toHaveBeenCalled();

      expect(service['postSmbNotification']).toHaveBeenCalledWith(
        expect.objectContaining({
          notificationType: expect.anything(),
        }),
      );

      expect(result).toEqual({
        id: targetId,
        payment: { type: PaymentPlanEnums.FREE },
      });
    });

    it('should throw error when stripe subscription is not canceled', async () => {
      (service as any).cancelStripeSubscription.mockResolvedValue({
        status: 'active',
      });

      await expect(
        service.cancelFreeTrial({
          targetId,
          subscriptionRemoteId,
        }),
      ).rejects.toThrow(
        'Delete subscription fail',
      );
    });
  });

  describe('sendMailAfterUpgradeSubscription', () => {
    const basePayment = {
      customerRemoteId: 'cus_123',
      type: PaymentPlanEnums.PERSONAL,
      period: PaymentPeriodEnums.MONTHLY,
    };

    const baseUpdatePayment = {
      type: PaymentPlanEnums.PROFESSIONAL,
    };

    beforeEach(() => {
      mockStripe.customers.retrieve.mockResolvedValue({
        email: 'test@email.com',
      } as any);
    });

    it('should send email for upgrading Professional Monthly to Professional Annual (same type)', async () => {
      await (service as any).sendMailAfterUpgradeSubscription({
        period: PaymentPeriodEnums.ANNUAL,
        payment: {
          ...basePayment,
          type: PaymentPlanEnums.PROFESSIONAL,
          period: PaymentPeriodEnums.MONTHLY,
        },
        updatePayment: {
          type: PaymentPlanEnums.PROFESSIONAL,
        },
      });

      expect(mockStripe.customers.retrieve).toHaveBeenCalledWith('cus_123');

      expect(mockEmailService.sendEmailHOF).toHaveBeenCalledWith(
        EMAIL_TYPE.UPGRADE_ANNUAL_PLAN,
        ['test@email.com'],
        {
          fromPlan: 'Professional Monthly',
          toPlan: 'Professional Annual',
          billedPlan: 'annually',
          subject:
            'Your Professional Monthly subscription has been upgraded to the Professional Annual plan',
        },
      );
    });

    it('should send email for upgrading Personal Monthly to Professional Annual', async () => {
      await (service as any).sendMailAfterUpgradeSubscription({
        period: PaymentPeriodEnums.ANNUAL,
        payment: {
          ...basePayment,
          type: PaymentPlanEnums.PERSONAL,
          period: PaymentPeriodEnums.MONTHLY,
        },
        updatePayment: {
          type: PaymentPlanEnums.PROFESSIONAL,
        },
      });

      expect(mockEmailService.sendEmailHOF).toHaveBeenCalledWith(
        EMAIL_TYPE.UPGRADE_ANNUAL_PLAN,
        ['test@email.com'],
        {
          fromPlan: 'Personal Monthly',
          toPlan: 'Professional Annual',
          billedPlan: 'annually',
          subject:
            'Your Personal Monthly subscription has been upgraded to the Professional Annual plan',
        },
      );
    });

    it('should send email for upgrading Personal Annual to Professional Annual', async () => {
      await (service as any).sendMailAfterUpgradeSubscription({
        period: PaymentPeriodEnums.ANNUAL,
        payment: {
          ...basePayment,
          type: PaymentPlanEnums.PERSONAL,
          period: PaymentPeriodEnums.ANNUAL,
        },
        updatePayment: {
          type: PaymentPlanEnums.PROFESSIONAL,
        },
      });

      expect(mockEmailService.sendEmailHOF).toHaveBeenCalledWith(
        EMAIL_TYPE.UPGRADE_ANNUAL_PLAN,
        ['test@email.com'],
        {
          fromPlan: 'Personal Annual',
          toPlan: 'Professional Annual',
          billedPlan: 'annually',
          subject:
            'Your Personal Annual subscription has been upgraded to the Professional Annual plan',
        },
      );
    });

    it('should send email for upgrading Personal Monthly to Professional Monthly', async () => {
      await (service as any).sendMailAfterUpgradeSubscription({
        period: PaymentPeriodEnums.MONTHLY,
        payment: {
          ...basePayment,
          type: PaymentPlanEnums.PERSONAL,
          period: PaymentPeriodEnums.MONTHLY,
        },
        updatePayment: {
          type: PaymentPlanEnums.PROFESSIONAL,
        },
      });

      expect(mockEmailService.sendEmailHOF).toHaveBeenCalledWith(
        EMAIL_TYPE.UPGRADE_ANNUAL_PLAN,
        ['test@email.com'],
        {
          fromPlan: 'Personal Monthly',
          toPlan: 'Professional Monthly',
          billedPlan: 'monthly',
          subject:
            'Your Personal Monthly subscription has been upgraded to the Professional Monthly plan',
        },
      );
    });

    it('should not send email when no upgrade condition matches (default case)', async () => {
      await (service as any).sendMailAfterUpgradeSubscription({
        period: 'UNKNOWN_PERIOD',
        payment: {
          customerRemoteId: 'cus_123',
          type: PaymentPlanEnums.PERSONAL,
          period: 'UNKNOWN_PERIOD',
        },
        updatePayment: {
          type: PaymentPlanEnums.PROFESSIONAL,
        },
      });

      expect(mockStripe.customers.retrieve).toHaveBeenCalledWith('cus_123');

      expect(mockEmailService.sendEmailHOF).not.toHaveBeenCalled();
    });

  });

  describe('sendEmailUpradeOrg', () => {
    beforeEach(() => {
      jest.restoreAllMocks();

      jest.spyOn(service, 'getInvoiceEmailAttachment')
        .mockResolvedValue([{ filename: 'invoice.pdf' }] as any);

      jest.spyOn((service as any).emailService, 'sendEmailHOF')
        .mockImplementation();

      jest.spyOn((service as any).paymentUtilsService, 'filterSubItemByProduct')
        .mockImplementation((items: any, product: any) =>
          items.filter(i => i.product === product),
        );
    });

    const baseOrg = {
      _id: 'org_1',
      name: 'Test Org',
      url: 'test.org',
    } as any;

    const baseOldPayment = {
      type: PaymentPlanEnums.BUSINESS,
      period: PaymentPeriodEnums.MONTHLY,
      quantity: 1,
      subscriptionItems: [],
    };

    const baseNewPayment = {
      type: PaymentPlanEnums.BUSINESS,
      period: PaymentPeriodEnums.MONTHLY,
      quantity: 2,
      subscriptionItems: [],
    };

    it('should do nothing when subscription is not active', async () => {
      await service.sendEmailUpradeOrg({
        isSubscriptionActived: false,
        receiverEmail: ['a@test.com'],
        organization: baseOrg,
        oldPayment: baseOldPayment,
        newPayment: baseNewPayment as any,
        invoice: {},
      });

      expect((service as any).emailService.sendEmailHOF).not.toHaveBeenCalled();
    });

    it('should send monthly to annual email', async () => {
      await service.sendEmailUpradeOrg({
        isSubscriptionActived: true,
        receiverEmail: ['a@test.com'],
        organization: baseOrg,
        oldPayment: {
          ...baseOldPayment,
          subscriptionItems: [{ id: '1', paymentType: 'BUSINESS', quantity: 1 }],
        } as any,
        newPayment: {
          ...baseNewPayment,
          period: PaymentPeriodEnums.ANNUAL,
          subscriptionItems: [{ id: '1', paymentType: 'BUSINESS', quantity: 1 }],
        } as any,
        invoice: {},
      });

      expect((service as any).emailService.sendEmailHOF).toHaveBeenCalledWith(
        EMAIL_TYPE.ORGANIZATION_UPGRADE_MONTHLY_TO_ANNUAL,
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    });

    it('should send upgrade multi products email', async () => {
      await service.sendEmailUpradeOrg({
        isSubscriptionActived: true,
        isUpgradeMultiProducts: true,
        receiverEmail: ['a@test.com'],
        organization: baseOrg,
        oldPayment: baseOldPayment,
        newPayment: {
          ...baseNewPayment,
          subscriptionItems: [
            { product: PaymentProductEnums.PDF, paymentType: 'BUSINESS' },
            { product: PaymentProductEnums.SIGN, paymentType: 'PRO' },
          ],
        } as any,
        invoice: {},
      });

      expect((service as any).emailService.sendEmailHOF).toHaveBeenCalledWith(
        EMAIL_TYPE.ORGANIZATION_UPGRADE_MULTI_PRODUCTS,
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    });

    it('should send welcome sign pro email', async () => {
      await service.sendEmailUpradeOrg({
        isSubscriptionActived: true,
        isUpgradeSignProduct: true,
        receiverEmail: ['a@test.com'],
        organization: baseOrg,
        oldPayment: {
          ...baseOldPayment,
          subscriptionItems: [],
        },
        newPayment: {
          ...baseNewPayment,
          subscriptionItems: [
            { product: PaymentProductEnums.SIGN, quantity: 5, period: 'monthly' },
          ],
        } as any,
        invoice: {},
      });

      expect((service as any).emailService.sendEmailHOF).toHaveBeenCalledWith(
        EMAIL_TYPE.WELCOME_ORGANIZATION_SIGN_PRO,
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    });

    it('should send purchase more sign seats email', async () => {
      await service.sendEmailUpradeOrg({
        isSubscriptionActived: true,
        isUpgradeSignProduct: true,
        receiverEmail: ['a@test.com'],
        organization: baseOrg,
        oldPayment: {
          ...baseOldPayment,
          subscriptionItems: [
            { product: PaymentProductEnums.SIGN, quantity: 1, period: 'monthly' },
          ] as any,
        },
        newPayment: {
          ...baseNewPayment,
          subscriptionItems: [
            { product: PaymentProductEnums.SIGN, quantity: 5, period: 'monthly' },
          ],
        } as any,
        invoice: {},
      });

      expect((service as any).emailService.sendEmailHOF).toHaveBeenCalledWith(
        EMAIL_TYPE.SIGN_SUBSCRIPTION_PURCHASE_MORE_SEATS,
        expect.anything(),
        expect.anything(),
      );
    });

    it('should send organization upgrade subscription email (old pricing)', async () => {
      await service.sendEmailUpradeOrg({
        isSubscriptionActived: true,
        receiverEmail: ['a@test.com'],
        organization: baseOrg,
        oldPayment: baseOldPayment,
        newPayment: baseNewPayment as any,
        invoice: {},
      });

      expect((service as any).emailService.sendEmailHOF).toHaveBeenCalledWith(
        EMAIL_TYPE.ORGANIZATION_UPGRADE_SUBSCRIPTION,
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    });

    it('should send upgrade new pricing subscription email', async () => {
      await service.sendEmailUpradeOrg({
        isSubscriptionActived: true,
        receiverEmail: ['a@test.com'],
        organization: baseOrg,
        oldPayment: {
          ...baseOldPayment,
          type: PaymentPlanEnums.ORG_STARTER,
        },
        newPayment: {
          ...baseNewPayment,
          type: PaymentPlanEnums.ORG_PRO,
        } as any,
        invoice: {},
      });

      expect((service as any).emailService.sendEmailHOF).toHaveBeenCalledWith(
        EMAIL_TYPE.ORGANIZATION_UPGRADE_NEW_PRICING_SUBSCRIPTION,
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    });
  });

  describe('upgradeBusinessSubscription', () => {
    const basePayment = {
      currency: 'usd',
      customerRemoteId: 'cus_123',
      subscriptionRemoteId: 'sub_old',
      planRemoteId: 'price_old',
      period: 'month',
      quantity: 1,
      stripeAccountId: 'acct_123',
    };

    const baseTarget = {
      _id: 'org_123',
      payment: basePayment,
    } as any;

    const baseInput = {
      plan: 'business',
      period: 'month',
      quantity: 2,
    } as any;

    beforeEach(() => {
      jest.restoreAllMocks();

      jest.spyOn(service, 'getStripeAccountId').mockReturnValue('acct_123');

      jest.spyOn(service, 'getStripeSubscriptionInfo').mockResolvedValue({
        id: 'sub_old',
        items: { data: [{ id: 'item_123' }] },
      } as any);

      jest.spyOn(service, 'getStripePlanWithOldTeam').mockReturnValue('price_new');

      jest.spyOn(service, 'getNextSubscriptionItemParams').mockReturnValue({
        price: 'price_new',
        quantity: 2,
      } as any);

      jest.spyOn((service as any), 'applyCouponCode').mockImplementation(async (_, o) => o);

      jest.spyOn((service as any).organizationService, 'updateOrganizationProperty')
        .mockResolvedValue({ id: 'org_123' } as any);

      jest.spyOn((service as any).organizationService, 'getOrganizationMemberByRole')
        .mockResolvedValue([{ email: 'admin@test.com' }] as any);

      jest.spyOn(service, 'sendEmailUpradeOrg').mockImplementation();
    });

    it('should throw when upgrade is not allowed', async () => {
      jest.spyOn(service, 'isAllowUpgradeBusiness').mockResolvedValue({
        isAllow: false,
        message: 'Not allowed',
      } as any);

      await expect(
        service.upgradeBusinessSubscription(baseInput, baseTarget),
      ).rejects.toThrow('Not allowed');
    });

    it('should recover subscriptionRemoteId if missing', async () => {
      jest.spyOn(service, 'isAllowUpgradeBusiness').mockResolvedValue({ isAllow: true } as any);
      jest.spyOn(service, 'recoverSubscriptionId').mockResolvedValue('sub_recovered');

      jest.spyOn((service as any).stripe.subscriptions, 'update').mockResolvedValue({
        id: 'sub_123',
        status: 'active',
      } as any);

      const target = {
        ...baseTarget,
        payment: { ...basePayment, subscriptionRemoteId: null },
      };

      const result = await service.upgradeBusinessSubscription(baseInput, target as any);
      expect(result.data.subscriptionRemoteId).toBe('sub_123');
    });

    it('should throw when recover subscription fails', async () => {
      jest.spyOn(service, 'isAllowUpgradeBusiness').mockResolvedValue({ isAllow: true } as any);
      jest.spyOn(service, 'recoverSubscriptionId').mockRejectedValue(new Error());

      const target = {
        ...baseTarget,
        payment: { ...basePayment, subscriptionRemoteId: null },
      };

      await expect(
        service.upgradeBusinessSubscription(baseInput, target as any),
      ).rejects.toThrow('unexpected error');
    });

    it('should attach payment method and block prepaid card', async () => {
      jest.spyOn(service, 'isAllowUpgradeBusiness').mockResolvedValue({ isAllow: true } as any);
      jest.spyOn(service, 'attachPaymentMethod').mockResolvedValue(undefined);
      const updateSpy = jest.spyOn(service, 'updateStripeCustomer').mockResolvedValue(undefined as any);

      jest.spyOn((service as any).stripe.subscriptions, 'update').mockResolvedValue({
        id: 'sub_123',
        status: 'active',
      } as any);

      await service.upgradeBusinessSubscription(
        {
          ...baseInput,
          sourceId: 'pm_123',
          blockedPrepaidCardOnTrial: true,
        } as any,
        baseTarget,
      );

      expect(updateSpy).toHaveBeenCalled();
    });

    it('should throw when stripe update fails', async () => {
      jest.spyOn(service, 'isAllowUpgradeBusiness').mockResolvedValue({ isAllow: true } as any);

      jest.spyOn((service as any).stripe.subscriptions, 'update')
        .mockRejectedValue(new Error('stripe error'));

      await expect(
        service.upgradeBusinessSubscription(baseInput, baseTarget),
      ).rejects.toThrow('Payment failed');
    });

    it('should change planRemoteId when period changes', async () => {
      jest.spyOn(service, 'isAllowUpgradeBusiness').mockResolvedValue({ isAllow: true } as any);

      jest.spyOn((service as any).stripe.subscriptions, 'update').mockResolvedValue({
        id: 'sub_123',
        status: 'active',
      } as any);

      const result = await service.upgradeBusinessSubscription(
        { ...baseInput, period: 'year' } as any,
        baseTarget,
      );

      expect(result.data.planRemoteId).toBe('price_new');
    });

    it('should set status UPGRADING when subscription is not active', async () => {
      jest.spyOn(service, 'isAllowUpgradeBusiness').mockResolvedValue({ isAllow: true } as any);

      jest.spyOn((service as any).stripe.subscriptions, 'update').mockResolvedValue({
        id: 'sub_123',
        status: 'incomplete',
      } as any);

      const result = await service.upgradeBusinessSubscription(baseInput, baseTarget);
      expect(result.data.status).toBe('UPGRADING');
    });

    it('should mark used_one_month_free when free coupon applied', async () => {
      jest.spyOn(service, 'isAllowUpgradeBusiness').mockResolvedValue({ isAllow: true } as any);
      jest.spyOn(service, 'validateFree30Coupon').mockResolvedValue(true);

      const spy = jest
        .spyOn(service, 'updateStripeCustomer')
        .mockResolvedValue(undefined as any);

      jest.spyOn((service as any).stripe.subscriptions, 'update').mockResolvedValue({
        id: 'sub_123',
        status: 'active',
        latest_invoice: {},
      } as any);

      await service.upgradeBusinessSubscription(
        {
          ...baseInput,
          couponCode: FREE_30_DAYS_BUSINESS_COUPON_ID,
        } as any,
        baseTarget,
      );

      expect(spy).toHaveBeenCalledWith(
        basePayment.customerRemoteId,
        { metadata: { used_one_month_free: 'true' } },
        { stripeAccount: 'acct_123' },
      );
    });

    it('should upgrade business subscription', async () => {
      jest.spyOn(service, 'getStripeAccountId').mockReturnValue('acct_123');
      jest.spyOn(service, 'isAllowUpgradeBusiness').mockResolvedValue({
        isAllow: true,
      } as any);

      jest.spyOn(service, 'getStripeSubscriptionInfo').mockResolvedValue({
        id: 'sub_old',
        items: { data: [{ id: 'item_123' }] },
      } as any);

      jest.spyOn(service, 'getStripePlanWithOldTeam').mockReturnValue('price_new');

      jest.spyOn(service, 'getNextSubscriptionItemParams').mockReturnValue({
        price: 'price_new',
        quantity: 2,
      } as any);

      jest.spyOn((service as any), 'applyCouponCode').mockImplementation(
        async (_, obj) => obj,
      );

      jest.spyOn((service as any).stripe.subscriptions, 'update').mockResolvedValue({
        id: 'sub_123',
        status: 'active',
        latest_invoice: {},
      } as any);

      jest
        .spyOn((service as any).organizationService, 'updateOrganizationProperty')
        .mockResolvedValue({ id: 'org_123' } as any);

      jest
        .spyOn((service as any).organizationService, 'getOrganizationMemberByRole')
        .mockResolvedValue([{ email: 'admin@test.com' }] as any);

      jest.spyOn(service, 'sendEmailUpradeOrg').mockImplementation();

      const result = await service.upgradeBusinessSubscription(
        {
          plan: 'business',
          period: 'month',
          quantity: 2,
        } as any,
        {
          _id: 'org_123',
          payment: {
            currency: 'usd',
            customerRemoteId: 'cus_123',
            subscriptionRemoteId: 'sub_old',
            planRemoteId: 'price_old',
            period: 'month',
            quantity: 1,
            stripeAccountId: 'acct_123',
          },
        } as any,
      );

      expect(result).toEqual({
        message: 'Upgrade Plan Success!',
        statusCode: 200,
        data: expect.objectContaining({
          subscriptionRemoteId: 'sub_123',
          quantity: 2,
        }),
        organization: { id: 'org_123' },
      });
    });
  });

  describe('handleStripeError', () => {
    it('should handle error with code', () => {
      const error = { code: 'error_code', stack: 'stack' } as any;
      expect(() => service.handleStripeError(error)).toThrow();
      expect(mockLoggerService.error).toHaveBeenCalled();
    });

    it('should handle error with message', () => {
      const error = { message: 'error_message', stack: 'stack' } as any;
      expect(() => service.handleStripeError(error)).toThrow();
    });

    it('should handle error without code or message', () => {
      const error = { stack: 'stack' } as any;
      expect(() => service.handleStripeError(error)).toThrow();
    });
  });

  describe('attachSourceToCustomer', () => {
    it('should attach source to customer', async () => {
      mockStripe.customers.createSource.mockResolvedValue({ id: 'src_123' } as any);
      const result = await service.attachSourceToCustomer('cus_123', {} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ id: 'src_123' });
    });
  });

  describe('attachPaymentMethodToCustomer', () => {
    it('should attach payment method to customer', async () => {
      mockStripe.paymentMethods.attach.mockResolvedValue({ id: 'pm_123' } as any);
      const result = await service.attachPaymentMethodToCustomer('pm_123', {} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ id: 'pm_123' });
    });
  });

  describe('createSource', () => {
    it('should create source', async () => {
      mockStripe.sources.create.mockResolvedValue({ id: 'src_123' } as any);
      const result = await service.createSource({} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ id: 'src_123' });
    });
  });

  describe('retrieveUpcomingInvoice', () => {
    it('should retrieve upcoming invoice', async () => {
      mockStripe.invoices.retrieveUpcoming.mockResolvedValue({ id: 'inv_123' } as any);
      const result = await service.retrieveUpcomingInvoice({} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ id: 'inv_123' });
    });

    it('should handle error when retrieving upcoming invoice', async () => {
      mockStripe.invoices.retrieveUpcoming.mockRejectedValue(new Error('error'));
      await expect(service.retrieveUpcomingInvoice({} as any, { stripeAccount: 'acct_123' })).rejects.toThrow();
    });
  });

  describe('retrievePaymentToken', () => {
    it('should retrieve payment token', async () => {
      mockStripe.tokens.retrieve.mockResolvedValue({ id: 'tok_123' } as any);
      const result = await service.retrievePaymentToken({ tokenId: 'tok_123', options: { stripeAccount: 'acct_123' } });
      expect(result).toEqual({ id: 'tok_123' });
    });
  });

  describe('retrieveSetupIntent', () => {
    it('should retrieve setup intent', async () => {
      mockStripe.setupIntents.retrieve.mockResolvedValue({ id: 'seti_123' } as any);
      const result = await service.retrieveSetupIntent('seti_123', 'acct_123');
      expect(result).toEqual({ id: 'seti_123' });
    });
  });

  describe('retrievePaymentIntent', () => {
    it('should retrieve payment intent', async () => {
      mockStripe.paymentIntents.retrieve.mockResolvedValue({ id: 'pi_123' } as any);
      const result = await service.retrievePaymentIntent({ paymentIntentId: 'pi_123', options: { stripeAccount: 'acct_123' } });
      expect(result).toEqual({ id: 'pi_123' });
    });
  });

  describe('getStripeSubscriptionInfo', () => {
    it('should get stripe subscription info', async () => {
      mockStripe.subscriptions.retrieve.mockResolvedValue({ id: 'sub_123' } as any);
      const result = await service.getStripeSubscriptionInfo({ subscriptionId: 'sub_123', options: { stripeAccount: 'acct_123' } });
      expect(result).toEqual({ id: 'sub_123' });
    });
  });

  describe('updateStripeSubscription', () => {
    it('should update stripe subscription', async () => {
      mockStripe.subscriptions.update.mockResolvedValue({ id: 'sub_123' } as any);
      const result = await service.updateStripeSubscription('sub_123', {} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ id: 'sub_123' });
    });

    it('should handle error when updating subscription', async () => {
      mockStripe.subscriptions.update.mockRejectedValue(new Error('error'));
      await expect(service.updateStripeSubscription('sub_123', {} as any, { stripeAccount: 'acct_123' })).rejects.toThrow();
    });
  });

  describe('getListSubscriptions', () => {
    it('should get list subscriptions', async () => {
      mockStripe.subscriptions.list.mockResolvedValue({ data: [] } as any);
      const result = await service.getListSubscriptions({} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ data: [] });
    });
  });

  describe('voidStripeInvoice', () => {
    it('should void stripe invoice', async () => {
      mockStripe.invoices.voidInvoice.mockResolvedValue({ id: 'inv_123' } as any);
      const result = await service.voidStripeInvoice('inv_123', {} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ id: 'inv_123' });
    });
  });

  describe('updateStripeCustomer', () => {
    it('should update stripe customer', async () => {
      mockStripe.customers.update.mockResolvedValue({ id: 'cus_123' } as any);
      const result = await service.updateStripeCustomer('cus_123', {} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ id: 'cus_123' });
    });
  });

  describe('createBalanceTransaction', () => {
    it('should create balance transaction', async () => {
      mockStripe.customers.createBalanceTransaction.mockResolvedValue({ id: 'txn_123' } as any);
      const result = await service.createBalanceTransaction('cus_123', {} as any);
      expect(result).toEqual({ id: 'txn_123' });
    });
  });

  describe('listAllCustomers', () => {
    it('should list all customers', async () => {
      mockStripe.customers.list.mockResolvedValue({ data: [] } as any);
      const result = await service.listAllCustomers({} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ data: [] });
    });
  });

  describe('createStripeCustomer', () => {
    it('should create stripe customer', async () => {
      mockStripe.customers.create.mockResolvedValue({ id: 'cus_123' } as any);
      const result = await service.createStripeCustomer({} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ id: 'cus_123' });
    });
  });

  describe('createCardToken', () => {
    it('should create card token', async () => {
      mockStripe.tokens.create.mockResolvedValue({ id: 'tok_123' } as any);
      const result = await service.createCardToken({} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ id: 'tok_123' });
    });
  });

  describe('listPaymentMethods', () => {
    it('should list payment methods', async () => {
      mockStripe.paymentMethods.list.mockResolvedValue({ data: [] } as any);
      const result = await service.listPaymentMethods({} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ data: [] });
    });
  });

  describe('getAllCustomerPaymentMethods', () => {
    it('should get all customer payment methods', async () => {
      mockStripe.customers.listPaymentMethods.mockResolvedValue({ data: [] } as any);
      const result = await service.getAllCustomerPaymentMethods('cus_123', {} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ data: [] });
    });
  });

  describe('detachPaymentSource', () => {
    it('should detach payment source', async () => {
      mockStripe.customers.deleteSource.mockResolvedValue({ id: 'src_123' } as any);
      const result = await service.detachPaymentSource('cus_123', 'src_123', {} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ id: 'src_123' });
    });
  });

  describe('detachPaymentMethod', () => {
    it('should detach payment method', async () => {
      mockStripe.paymentMethods.detach.mockResolvedValue({ id: 'pm_123' } as any);
      const result = await service.detachPaymentMethod('pm_123', {} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ id: 'pm_123' });
    });
  });

  describe('retrieveCustomer', () => {
    it('should retrieve customer', async () => {
      mockStripe.customers.retrieve.mockResolvedValue({ id: 'cus_123' } as any);
      const result = await service.retrieveCustomer('cus_123', {} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ id: 'cus_123' });
    });
  });

  describe('retrieveStripeCoupon', () => {
    it('should retrieve stripe coupon', async () => {
      mockStripe.coupons.retrieve.mockResolvedValue({ id: 'coupon_123' } as any);
      const result = await service.retrieveStripeCoupon('coupon_123');
      expect(result).toEqual({ id: 'coupon_123' });
    });

    it('should handle error when retrieving coupon', async () => {
      mockStripe.coupons.retrieve.mockRejectedValue(new Error('error'));
      await expect(service.retrieveStripeCoupon('coupon_123')).rejects.toThrow();
    });
  });

  describe('createRefund', () => {
    it('should create refund', async () => {
      mockStripe.refunds.create.mockResolvedValue({ id: 'refund_123' } as any);
      const result = await service.createRefund({} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ id: 'refund_123' });
    });

    it('should handle error when creating refund', async () => {
      mockStripe.refunds.create.mockRejectedValue(new Error('error'));
      const result = await service.createRefund({} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({});
      expect(mockLoggerService.error).toHaveBeenCalled();
    });
  });

  describe('createNewCustomer', () => {
    it('should create new customer with user', async () => {
      mockUserService.findUserByEmail.mockResolvedValue({ _id: 'user_123', name: 'Test User' });
      mockStripe.customers.create.mockResolvedValue({ id: 'cus_123' } as any);
      const result = await service.createNewCustomer('test@test.com', 'org_123', 'acct_123');
      expect(result).toEqual({ id: 'cus_123' });
    });

    it('should create new customer without user but with owner', async () => {
      mockUserService.findUserByEmail.mockResolvedValue(null);
      mockOrganizationService.getOrgById.mockResolvedValue({ ownerId: 'owner_123' });
      mockUserService.findUserById.mockResolvedValue({ _id: 'owner_123', name: 'Owner' });
      mockStripe.customers.create.mockResolvedValue({ id: 'cus_123' } as any);
      const result = await service.createNewCustomer('test@test.com', 'org_123', 'acct_123');
      expect(result).toEqual({ id: 'cus_123' });
    });

    it('should create new customer without user and owner', async () => {
      mockUserService.findUserByEmail.mockResolvedValue(null);
      mockOrganizationService.getOrgById.mockResolvedValue({ ownerId: 'owner_123' });
      mockUserService.findUserById.mockResolvedValue(null);
      mockStripe.customers.create.mockResolvedValue({ id: 'cus_123' } as any);
      const result = await service.createNewCustomer('test@test.com', 'org_123', 'acct_123');
      expect(result).toEqual({ id: 'cus_123' });
    });
  });

  describe('retrieveCharge', () => {
    it('should retrieve charge', async () => {
      mockStripe.charges.retrieve.mockResolvedValue({ id: 'ch_123' } as any);
      const result = await service.retrieveCharge({ chargeId: 'ch_123', options: { stripeAccount: 'acct_123' } });
      expect(result).toEqual({ id: 'ch_123' });
    });
  });

  describe('retrieveChargeList', () => {
    it('should retrieve charge list', async () => {
      mockStripe.charges.list.mockResolvedValue({ data: [] } as any);
      const result = await service.retrieveChargeList('cus_123', { stripeAccount: 'acct_123' });
      expect(result).toEqual({ data: [] });
    });
  });

  describe('getPlan', () => {
    it('should get plan', async () => {
      mockStripe.plans.retrieve.mockResolvedValue({ id: 'plan_123' } as any);
      const result = await service.getPlan('plan_123', 'acct_123');
      expect(result).toEqual({ id: 'plan_123' });
    });
  });

  describe('createStripeSubscription', () => {
    it('should create stripe subscription', async () => {
      mockStripe.subscriptions.create.mockResolvedValue({ id: 'sub_123' } as any);
      const result = await service.createStripeSubscription({} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ id: 'sub_123' });
    });

    it('should handle error when creating subscription', async () => {
      mockStripe.subscriptions.create.mockRejectedValue(new Error('error'));
      await expect(service.createStripeSubscription({} as any, { stripeAccount: 'acct_123' })).rejects.toThrow();
    });
  });

  describe('createInvoice', () => {
    it('should create invoice', async () => {
      mockStripe.invoices.create.mockResolvedValue({ id: 'inv_123' } as any);
      const result = await service.createInvoice({} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ id: 'inv_123' });
    });
  });

  describe('getInvoicesFromStripe', () => {
    it('should get invoices from stripe', async () => {
      mockStripe.invoices.list.mockResolvedValue({ data: [] } as any);
      const result = await service.getInvoicesFromStripe();
      expect(result).toEqual({ data: [] });
    });
  });

  describe('updateInvoice', () => {
    it('should update invoice', async () => {
      mockStripe.invoices.update.mockResolvedValue({ id: 'inv_123' } as any);
      const result = await service.updateInvoice('inv_123', {} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ id: 'inv_123' });
    });
  });

  describe('finalizeInvoice', () => {
    it('should finalize invoice', async () => {
      mockStripe.invoices.finalizeInvoice.mockResolvedValue({ id: 'inv_123' } as any);
      const result = await service.finalizeInvoice({ invoiceId: 'inv_123', options: { stripeAccount: 'acct_123' } });
      expect(result).toEqual({ id: 'inv_123' });
    });
  });

  describe('sendInvoice', () => {
    it('should send invoice', async () => {
      mockStripe.invoices.sendInvoice.mockResolvedValue({ id: 'inv_123' } as any);
      const result = await service.sendInvoice('inv_123', {} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ id: 'inv_123' });
    });
  });

  describe('payInvoice', () => {
    it('should pay invoice', async () => {
      mockStripe.invoices.pay.mockResolvedValue({ id: 'inv_123' } as any);
      const result = await service.payInvoice({ invoiceId: 'inv_123', options: { stripeAccount: 'acct_123' } });
      expect(result).toEqual({ id: 'inv_123' });
    });
  });

  describe('cancelStripeSubscription', () => {
    it('should cancel stripe subscription', async () => {
      mockStripe.subscriptions.cancel.mockResolvedValue({ id: 'sub_123' } as any);
      const result = await service.cancelStripeSubscription('sub_123', {} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ id: 'sub_123' });
    });
  });

  describe('updateSubscriptionItem', () => {
    it('should update subscription item', async () => {
      mockStripe.subscriptionItems.update.mockResolvedValue({ id: 'si_123' } as any);
      const result = await service.updateSubscriptionItem('si_123', {} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ id: 'si_123' });
    });
  });

  describe('createSubscriptionItem', () => {
    it('should create subscription item', async () => {
      mockStripe.subscriptionItems.create.mockResolvedValue({ id: 'si_123' } as any);
      const result = await service.createSubscriptionItem({} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ id: 'si_123' });
    });
  });

  describe('retrievePaymentMethod', () => {
    it('should retrieve payment method', async () => {
      mockStripe.paymentMethods.retrieve.mockResolvedValue({ id: 'pm_123' } as any);
      const result = await service.retrievePaymentMethod('pm_123', { stripeAccount: 'acct_123' });
      expect(result).toEqual({ id: 'pm_123' });
    });
  });

  describe('getMainSubscriptionItem', () => {
    it('should get main subscription item', () => {
      const subscription = {
        items: {
          data: [
            { id: 'si_1', price: { id: 'plan_123' } },
            { id: 'si_2', price: { id: 'plan_456' } },
          ],
        },
        id: 'sub_123',
      };
      const result = service.getMainSubscriptionItem(subscription as any, 'plan_123');
      expect(result).toEqual({ id: 'si_1', price: { id: 'plan_123' } });
    });

    it('should return undefined if main item not found', () => {
      const subscription = {
        items: {
          data: [
            { id: 'si_1', price: { id: 'plan_456' } },
          ],
        },
        id: 'sub_123',
      };
      const result = service.getMainSubscriptionItem(subscription as any, 'plan_123');
      expect(result).toBeUndefined();
      expect(mockLoggerService.warn).toHaveBeenCalled();
    });
  });

  describe('getStripePlanRemoteId', () => {
    it('should get stripe plan remote id', () => {
      const result = service.getStripePlanRemoteId({
        plan: PaymentPlanEnums.BUSINESS,
        period: PaymentPeriodEnums.MONTHLY,
        currency: PaymentCurrencyEnums.USD,
        stripeAccountId: 'acct_nz',
      });
      expect(mockEnvironmentService.getStripePlan).toHaveBeenCalled();
    });
  });

  describe('getOldTeamPlans', () => {
    it('should get old team plans', () => {
      mockEnvironmentService.getByKey.mockImplementation((key: string) => {
        if (key.startsWith('STRIPE_TEAM')) return `plan_${key}`;
        return '';
      });
      const result = service.getOldTeamPlans();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getPriceVersion', () => {
    it('should return null if planRemoteId is empty', () => {
      const result = service.getPriceVersion('');
      expect(result).toBeNull();
    });

    it('should return price version', () => {
      mockEnvironmentService.getByKey.mockImplementation((key: string) => {
        if (key.includes('_v1')) return 'plan_123_v1';
        return '';
      });
      const result = service.getPriceVersion('plan_123_v1');
      expect(result).toBeDefined();
    });
  });

  describe('setupReminderSubscriptionEmail', () => {
    it('should setup reminder subscription email', () => {
      service.setupReminderSubscriptionEmail('org_123', '2024-01-01');
      expect(mockRedisService.setMailReminderSubscriptionExpired).toHaveBeenCalledTimes(2);
    });
  });

  describe('recoverSubscriptionId', () => {
    it('should recover subscription id for individual', async () => {
      const target = {
        _id: 'user_123',
        payment: {
          customerRemoteId: 'cus_123',
          stripeAccountId: 'acct_123',
        },
      };
      mockStripe.customers.retrieve.mockResolvedValue({
        subscriptions: { data: [{ id: 'sub_123' }] },
      } as any);
      mockUserService.updateUserPropertyById.mockResolvedValue({} as any);
      const result = await service.recoverSubscriptionId(target as any, PaymentType.INDIVIDUAL);
      expect(result).toBe('sub_123');
    });

    it('should return empty string if no subscription for individual', async () => {
      const target = {
        _id: 'user_123',
        payment: {
          customerRemoteId: 'cus_123',
          stripeAccountId: 'acct_123',
        },
      };
      mockStripe.customers.retrieve.mockResolvedValue({
        subscriptions: { data: [] },
      } as any);
      mockUserService.updateUserPropertyById.mockResolvedValue({} as any);
      const result = await service.recoverSubscriptionId(target as any, PaymentType.INDIVIDUAL);
      expect(result).toBe('');
    });

    it('should recover subscription id for organization', async () => {
      const target = {
        _id: 'org_123',
        payment: {
          customerRemoteId: 'cus_123',
          stripeAccountId: 'acct_123',
          trialInfo: {},
        },
      };
      mockStripe.customers.retrieve.mockResolvedValue({
        subscriptions: { data: [{ id: 'sub_123' }] },
      } as any);
      mockOrganizationService.updateOrganizationProperty.mockResolvedValue({} as any);
      const result = await service.recoverSubscriptionId(target as any, PaymentType.ORGANIZATION);
      expect(result).toBe('sub_123');
    });

    it('should return empty string if no subscription for organization', async () => {
      const target = {
        _id: 'org_123',
        payment: {
          customerRemoteId: 'cus_123',
          stripeAccountId: 'acct_123',
          trialInfo: {},
        },
      };
      mockStripe.customers.retrieve.mockResolvedValue({
        subscriptions: { data: [] },
      } as any);
      mockOrganizationService.updateOrganizationProperty.mockResolvedValue({} as any);
      const result = await service.recoverSubscriptionId(target as any, PaymentType.ORGANIZATION);
      expect(result).toBe('');
    });
  });

  describe('getFinishInvoices', () => {
    it('should return empty array if no customerRemoteId', async () => {
      const result = await service.getFinishInvoices({} as any);
      expect(result).toEqual([]);
    });

    it('should get finished invoices', async () => {
      mockStripe.invoices.list.mockResolvedValue({
        data: [
          { id: 'inv_1', status: 'paid', invoice_pdf: 'pdf1', amount_due: 1000, total: 1000 },
          { id: 'inv_2', status: 'void', invoice_pdf: 'pdf2', amount_due: 2000, total: 2000 },
          { id: 'inv_3', status: 'open', invoice_pdf: 'pdf3', amount_due: 3000, total: 3000 },
        ],
      } as any);
      const payment = {
        customerRemoteId: 'cus_123',
        stripeAccountId: 'acct_123',
      };
      const result = await service.getFinishInvoices(payment as any);
      expect(result).toHaveLength(2);
    });
  });

  describe('getFailedInvoicesFromLastPaid', () => {
    it('should return empty array if no customerRemoteId or subscriptionRemoteId', async () => {
      const result = await service.getFailedInvoicesFromLastPaid({} as any);
      expect(result).toEqual([]);
    });

    it('should get failed invoices from last paid', async () => {
      mockStripe.invoices.list.mockResolvedValue({
        data: [
          { id: 'inv_1', status: 'paid', amount_due: 0, created: 1000 },
          { id: 'inv_2', status: 'open', amount_due: 1000, created: 2000 },
          { id: 'inv_3', status: 'draft', amount_due: 2000, created: 3000 },
        ],
        has_more: false,
      } as any);
      const payment = {
        customerRemoteId: 'cus_123',
        subscriptionRemoteId: 'sub_123',
        stripeAccountId: 'acct_123',
      };
      const result = await service.getFailedInvoicesFromLastPaid(payment as any);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle error', async () => {
      mockStripe.invoices.list.mockRejectedValue(new Error('error'));
      const payment = {
        customerRemoteId: 'cus_123',
        subscriptionRemoteId: 'sub_123',
        stripeAccountId: 'acct_123',
      };
      const result = await service.getFailedInvoicesFromLastPaid(payment as any);
      expect(result).toEqual([]);
    });
  });

  describe('cancelPlan', () => {
    it('should cancel plan immediately', async () => {
      mockStripe.subscriptions.cancel.mockResolvedValue({} as any);
      await service.cancelPlan('sub_123', 'IMMEDIATELY', 'acct_123');
      expect(mockStripe.subscriptions.cancel).toHaveBeenCalled();
    });

    it('should cancel plan at period end', async () => {
      mockStripe.subscriptions.update.mockResolvedValue({} as any);
      await service.cancelPlan('sub_123', 'AT_PERIOD_END', 'acct_123');
      expect(mockStripe.subscriptions.update).toHaveBeenCalled();
    });
  });

  describe('getInvoice', () => {
    it('should get invoice', async () => {
      mockStripe.invoices.retrieve.mockResolvedValue({ id: 'inv_123' } as any);
      const result = await service.getInvoice({ invoiceId: 'inv_123', options: { stripeAccount: 'acct_123' } });
      expect(result).toEqual({ id: 'inv_123' });
    });
  });

  describe('getInvoices', () => {
    it('should get invoices', async () => {
      mockStripe.invoices.list.mockResolvedValue({ data: [] } as any);
      const result = await service.getInvoices({} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ data: [] });
    });
  });

  describe('isUpgradeEnterpriseOrganization', () => {
    it('should return true if product id matches', () => {
      mockEnvironmentService.getByKey.mockReturnValue('prod_enterprise');
      const result = service.isUpgradeEnterpriseOrganization('prod_enterprise');
      expect(result).toBe(true);
    });

    it('should return false if product id does not match', () => {
      mockEnvironmentService.getByKey.mockReturnValue('prod_enterprise');
      const result = service.isUpgradeEnterpriseOrganization('prod_other');
      expect(result).toBe(false);
    });
  });

  describe('getPeriodFromInterval', () => {
    it('should return monthly for month interval', () => {
      const result = service.getPeriodFromInterval(PaymentIntervalEnums.MONTH);
      expect(result).toBe(PaymentPeriodEnums.MONTHLY);
    });

    it('should return annual for year interval', () => {
      const result = service.getPeriodFromInterval(PaymentIntervalEnums.YEAR);
      expect(result).toBe(PaymentPeriodEnums.ANNUAL);
    });
  });

  describe('verifyCouponCode', () => {
    it('should verify valid coupon code', async () => {
      mockStripe.coupons.retrieve.mockResolvedValue({ valid: true } as any);
      const result = await service.verifyCouponCode('coupon_123', 'acct_123');
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should return error for invalid coupon code', async () => {
      mockStripe.coupons.retrieve.mockResolvedValue({ valid: false } as any);
      const result = await service.verifyCouponCode('coupon_123', 'acct_123');
      expect(result.error).toBeDefined();
    });

    it('should return error when coupon retrieval fails', async () => {
      mockStripe.coupons.retrieve.mockRejectedValue(new Error('error'));
      const result = await service.verifyCouponCode('coupon_123', 'acct_123');
      expect(result.error).toBeDefined();
    });
  });

  describe('previewUpcomingInvoice', () => {
    it('should preview upcoming invoice', async () => {
      mockStripe.invoices.retrieveUpcoming.mockResolvedValue({
        currency: 'usd',
        subtotal: 1000,
        total: 1000,
        lines: {
          data: [{
            period: { end: 1000000 },
            price: { recurring: { interval: 'month' } },
          }],
        },
        total_discount_amounts: [{ amount: 0 }],
      } as any);
      const result = await service.previewUpcomingInvoice({
        priceId: 'price_123',
        quantity: 1,
        stripeAccountId: 'acct_123',
      });
      expect(result).toBeDefined();
    });

    it('should handle error when retrieving upcoming invoice', async () => {
      mockStripe.invoices.retrieveUpcoming.mockRejectedValue(new Error('error'));
      await expect(service.previewUpcomingInvoice({
        priceId: 'price_123',
        quantity: 1,
      })).rejects.toThrow();
    });
  });

  describe('isFreePayment', () => {
    it('should return false if has subscription items', () => {
      const result = service.isFreePayment({
        subscriptionItems: [{ id: 'si_1' }],
        type: PaymentPlanEnums.FREE,
      } as any);
      expect(result).toBe(false);
    });

    it('should return true if free plan and no subscription items', () => {
      const result = service.isFreePayment({
        subscriptionItems: [],
        type: PaymentPlanEnums.FREE,
      } as any);
      expect(result).toBe(true);
    });

    it('should return false if not free plan', () => {
      const result = service.isFreePayment({
        subscriptionItems: [],
        type: PaymentPlanEnums.BUSINESS,
      } as any);
      expect(result).toBe(false);
    });
  });

  describe('isFullyCanceledPayment', () => {
    it('should return true if all items canceled', () => {
      const result = service.isFullyCanceledPayment({
        subscriptionItems: [
          { paymentStatus: PaymentStatusEnums.CANCELED },
          { paymentStatus: PaymentStatusEnums.CANCELED },
        ],
        status: PaymentStatusEnums.ACTIVE,
      } as any);
      expect(result).toBe(true);
    });

    it('should return false if some items not canceled', () => {
      const result = service.isFullyCanceledPayment({
        subscriptionItems: [
          { paymentStatus: PaymentStatusEnums.CANCELED },
          { paymentStatus: PaymentStatusEnums.ACTIVE },
        ],
        status: PaymentStatusEnums.ACTIVE,
      } as any);
      expect(result).toBe(false);
    });

    it('should return true if status is canceled and no items', () => {
      const result = service.isFullyCanceledPayment({
        subscriptionItems: [],
        status: PaymentStatusEnums.CANCELED,
      } as any);
      expect(result).toBe(true);
    });
  });

  describe('getUpcommingInvoice', () => {
    it('should return null if no customerRemoteId', async () => {
      const result = await service.getUpcommingInvoice({
        customerRemoteId: null,
        stripeAccountId: 'acct_123',
        subscriptionItems: [],
      } as any);
      expect(result).toBeNull();
    });

    it('should return null if canceled subscription', async () => {
      const result = await service.getUpcommingInvoice({
        customerRemoteId: 'cus_123',
        subscriptionItems: [{ paymentStatus: PaymentStatusEnums.CANCELED }],
      } as any);
      expect(result).toBeNull();
    });

    it('should return null if free plan', async () => {
      const result = await service.getUpcommingInvoice({
        customerRemoteId: 'cus_123',
        subscriptionItems: [],
        type: PaymentPlanEnums.FREE,
      } as any);
      expect(result).toBeNull();
    });

    it('should get upcoming invoice', async () => {
      mockStripe.invoices.retrieveUpcoming.mockResolvedValue({
        created: 1000,
        amount_due: 1000,
        starting_balance: -500,
      } as any);
      const payment = {
        customerRemoteId: 'cus_123',
        quantity: 1,
        period: PaymentPeriodEnums.MONTHLY,
        currency: PaymentCurrencyEnums.USD,
        stripeAccountId: 'acct_123',
        type: PaymentPlanEnums.BUSINESS,
        subscriptionItems: [{ paymentStatus: PaymentStatusEnums.ACTIVE }],
      };
      const result = await service.getUpcommingInvoice(payment as any);
      expect(result).toBeDefined();
    });

    it('should handle INVOICE_UPCOMING_NONE error', async () => {
      const error: any = new Error('error');
      error.code = INVOICE_UPCOMING_NONE;
      mockStripe.invoices.retrieveUpcoming.mockRejectedValue(error);
      const payment = {
        customerRemoteId: 'cus_123',
        quantity: 1,
        period: PaymentPeriodEnums.MONTHLY,
        currency: PaymentCurrencyEnums.USD,
        stripeAccountId: 'acct_123',
        type: PaymentPlanEnums.BUSINESS,
        subscriptionItems: [{ paymentStatus: PaymentStatusEnums.ACTIVE }],
      };
      const result = await service.getUpcommingInvoice(payment as any);
      expect(result).toBeNull();
    });

    it('should throw error for other errors', async () => {
      mockStripe.invoices.retrieveUpcoming.mockRejectedValue(new Error('error'));
      const payment = {
        customerRemoteId: 'cus_123',
        quantity: 1,
        period: PaymentPeriodEnums.MONTHLY,
        currency: PaymentCurrencyEnums.USD,
        stripeAccountId: 'acct_123',
      };
      await expect(service.getUpcommingInvoice(payment as any)).rejects.toThrow();
    });
  });

  describe('getStatementDescriptor', () => {
    it('should return descriptor for first recurring payment', () => {
      const result = service.getStatementDescriptor('cus_123', true);
      expect(result).toContain('END TRIAL');
    });

    it('should return default descriptor', () => {
      const result = service.getStatementDescriptor('cus_123', false);
      expect(result).toContain('LUMIN PDF');
    });
  });

  describe('createCustomer', () => {
    it('should throw error if customer creation payload missing', async () => {
      await expect(service.createCustomer({
        customer: null,
        customerInfo: {} as any,
        stripeAccountId: 'acct_123',
      } as any)).rejects.toThrow();
    });

    it('should create customer with source token', async () => {
      mockStripe.tokens.retrieve.mockResolvedValue({ id: 'tok_123' } as any);
      mockStripe.customers.create.mockResolvedValue({ id: 'cus_123' } as any);
      mockStripe.customers.createSource.mockResolvedValue({ id: 'src_123' } as any);
      mockStripe.customers.update.mockResolvedValue({} as any);
      const result = await service.createCustomer({
        customer: { method: 'SOURCE_TOKEN', value: 'tok_123' },
        customerInfo: { email: 'test@test.com', _id: 'user_123' },
        stripeAccountId: 'acct_123',
      } as any);
      expect(result).toBeDefined();
    });

    it('should create customer with payment method', async () => {
      mockStripe.paymentMethods.retrieve.mockResolvedValue({ id: 'pm_123' } as any);
      mockStripe.customers.create.mockResolvedValue({ id: 'cus_123' } as any);
      mockStripe.paymentMethods.attach.mockResolvedValue({ id: 'pm_123' } as any);
      mockStripe.customers.update.mockResolvedValue({} as any);
      const result = await service.createCustomer({
        customer: { method: 'PAYMENT_METHOD', value: 'pm_123' },
        customerInfo: { email: 'test@test.com', _id: 'user_123' },
        stripeAccountId: 'acct_123',
      } as any);
      expect(result).toBeDefined();
    });
  });

  describe('attachCardToCustomer', () => {
    it('should attach card with source token', async () => {
      mockStripe.sources.create.mockResolvedValue({ id: 'src_123' } as any);
      mockStripe.customers.createSource.mockResolvedValue({} as any);
      await service.attachCardToCustomer({
        tokenId: 'tok_123',
        tokenMethod: 'SOURCE_TOKEN' as any,
        customerRemoteId: 'cus_123',
        stripeAccountId: 'acct_123',
      });
      expect(mockStripe.sources.create).toHaveBeenCalled();
    });

    it('should attach card with payment method', async () => {
      mockStripe.paymentMethods.attach.mockResolvedValue({ id: 'pm_123' } as any);
      mockStripe.customers.update.mockResolvedValue({} as any);
      await service.attachCardToCustomer({
        tokenId: 'pm_123',
        tokenMethod: 'PAYMENT_METHOD' as any,
        customerRemoteId: 'cus_123',
        stripeAccountId: 'acct_123',
      });
      expect(mockStripe.paymentMethods.attach).toHaveBeenCalled();
    });
  });

  describe('attachPaymentMethod', () => {
    it('should attach payment method', async () => {
      mockStripe.paymentMethods.attach.mockResolvedValue({ id: 'pm_123' } as any);
      mockStripe.customers.update.mockResolvedValue({} as any);
      await service.attachPaymentMethod('cus_123', 'pm_123', 'acct_123');
      expect(mockStripe.paymentMethods.attach).toHaveBeenCalled();
      expect(mockStripe.customers.update).toHaveBeenCalled();
    });
  });

  describe('attachSource', () => {
    it('should attach source', async () => {
      mockStripe.sources.create.mockResolvedValue({ id: 'src_123' } as any);
      mockStripe.customers.createSource.mockResolvedValue({} as any);
      await service.attachSource('cus_123', 'tok_123', 'acct_123');
      expect(mockStripe.sources.create).toHaveBeenCalled();
      expect(mockStripe.customers.createSource).toHaveBeenCalled();
    });
  });

  describe('getFreePaymentPayload', () => {
    it('should get free payment payload', () => {
      const oldPayment = {
        stripeAccountId: 'acct_123',
        customerRemoteId: 'cus_123',
      };
      const result = service.getFreePaymentPayload(oldPayment as any);
      expect(result.type).toBe(PaymentPlanEnums.FREE);
      expect(result.subscriptionItems).toEqual([]);
    });
  });

  describe('retryFailedInvoices', () => {
    it('should retry failed invoices', async () => {
      mockStripe.invoices.list.mockResolvedValue({
        data: [
          { id: 'inv_1', status: InvoiceStatus.DRAFT, amount_due: 1000 },
          { id: 'inv_2', status: InvoiceStatus.OPEN, amount_due: 2000 },
        ],
        has_more: false,
      } as any);
      mockStripe.invoices.finalizeInvoice.mockResolvedValue({ id: 'inv_1', status: InvoiceStatus.OPEN } as any);
      mockStripe.invoices.pay.mockResolvedValue({ id: 'inv_1', status: InvoiceStatus.PAID } as any);
      const payment = {
        customerRemoteId: 'cus_123',
        subscriptionRemoteId: 'sub_123',
        stripeAccountId: 'acct_123',
      };
      const result = await service.retryFailedInvoices({ orgId: 'org_123', payment: payment as any });
      expect(result).toBeDefined();
    });

    it('should throw error if invoice payment fails', async () => {
      mockStripe.invoices.list.mockResolvedValue({
        data: [{ id: 'inv_1', status: InvoiceStatus.OPEN, amount_due: 1000 }],
        has_more: false,
      } as any);
      mockStripe.invoices.pay.mockResolvedValue({ id: 'inv_1', status: InvoiceStatus.OPEN } as any);
      const payment = {
        customerRemoteId: 'cus_123',
        subscriptionRemoteId: 'sub_123',
        stripeAccountId: 'acct_123',
      };
      await expect(service.retryFailedInvoices({ orgId: 'org_123', payment: payment as any })).rejects.toThrow();
    });
  });

  describe('getSubscriptionCancelBannerData', () => {
    it('should get subscription cancel banner data', async () => {
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        current_period_end: Math.floor(Date.now() / 1000) + 86400 * 5,
        livemode: true,
      } as any);
      const payment = {
        subscriptionRemoteId: 'sub_123',
        status: PaymentStatusEnums.CANCELED,
        stripeAccountId: 'acct_123',
      };
      const result = await service.getSubscriptionCancelBannerData(payment as any);
      expect(result).toBeDefined();
    });

    it('should handle test clock', async () => {
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        current_period_end: Math.floor(Date.now() / 1000) + 86400 * 5,
        livemode: false,
        test_clock: 'clock_123',
      } as any);
      mockStripe.testHelpers.testClocks.retrieve.mockResolvedValue({
        frozen_time: Math.floor(Date.now() / 1000),
      } as any);
      const payment = {
        subscriptionRemoteId: 'sub_123',
        status: PaymentStatusEnums.CANCELED,
        stripeAccountId: 'acct_123',
      };
      const result = await service.getSubscriptionCancelBannerData(payment as any);
      expect(result).toBeDefined();
    });
  });

  describe('createSetupIntent', () => {
    it('should create setup intent', async () => {
      mockStripe.setupIntents.create.mockResolvedValue({ id: 'seti_123' } as any);
      const result = await service.createSetupIntent({} as any, { stripeAccount: 'acct_123' });
      expect(result).toEqual({ id: 'seti_123' });
    });
  });

  describe('getStripeAccountId', () => {
    it('should return payment stripeAccountId if exists', () => {
      const result = service.getStripeAccountId({
        payment: { stripeAccountId: 'acct_123' },
      });
      expect(result).toBe('acct_123');
    });

    it('should return stripeAccountIdInput if provided', () => {
      const result = service.getStripeAccountId({
        payment: {},
        stripeAccountIdInput: 'acct_input',
      });
      expect(result).toBe('acct_input');
    });

    it('should return NZ account if isAdminCharge', () => {
      const result = service.getStripeAccountId({
        payment: {},
        isAdminCharge: true,
      });
      expect(result).toBe('acct_nz');
    });

    it('should return account from country code', () => {
      const result = service.getStripeAccountId({
        payment: {},
        userCountrycode: 'US' as any,
      });
      expect(result).toBeDefined();
    });
  });

  describe('getStripeAccountFromCountryCode', () => {
    it('should return NZ account if US disabled', () => {
      const mockEnvServiceDisabled = {
        ...mockEnvironmentService,
        getByKey: jest.fn((key: string) => {
          if (key === EnvConstants.STRIPE_US_ACCOUNT_TOGGLE) return 'DISABLED';
          if (key === EnvConstants.STRIPE_NZ_CONNECTED_ACCOUNT) return 'acct_nz';
          if (key === EnvConstants.STRIPE_US_CONNECTED_ACCOUNT) return 'acct_us';
          return mockEnvironmentService.getByKey(key);
        }),
      };
      const hubspotWorkspaceService = mockHubspotWorkspaceService as any;
      const service2 = new PaymentService(
        mockEnvServiceDisabled as any,
        redisService,
        userService,
        emailService,
        organizationService,
        adminService,
        adminPaymentService,
        organizationDocStackService,
        loggerService,
        httpService,
        brazeService,
        mockStripe as any,
        slackService,
        awsService,
        featureFlagService,
        paymentUtilsService,
        hubspotWorkspaceService,
      );
      const result = service2.getStripeAccountFromCountryCode('US' as any);
      expect(result).toBe('acct_nz');
    });

    it('should return US account for US country code', () => {
      const result = service.getStripeAccountFromCountryCode('US' as any);
      expect(result).toBe('acct_us');
    });

    it('should return NZ account for other country codes', () => {
      const result = service.getStripeAccountFromCountryCode('NZ' as any);
      expect(result).toBe('acct_nz');
    });
  });

  describe('getCustomerInfo', () => {
    it('should return customer info for organization', async () => {
      const target = {
        billingEmail: 'test@test.com',
        payment: { currency: PaymentCurrencyEnums.USD },
      };
      const result = await service.getCustomerInfo(target as any, PaymentType.ORGANIZATION);
      expect(result.email).toBe('test@test.com');
    });

    it('should return customer info from stripe', async () => {
      mockStripe.customers.retrieve.mockResolvedValue({
        email: 'stripe@test.com',
        currency: 'usd',
      } as any);
      const target = {
        payment: {
          customerRemoteId: 'cus_123',
          stripeAccountId: 'acct_123',
        },
      };
      const result = await service.getCustomerInfo(target as any, PaymentType.INDIVIDUAL);
      expect(result.email).toBe('stripe@test.com');
    });

    it('should return null if customer not found', async () => {
      mockStripe.customers.retrieve.mockResolvedValue(null);
      const target = {
        payment: {
          customerRemoteId: 'cus_123',
          stripeAccountId: 'acct_123',
        },
      };
      const result = await service.getCustomerInfo(target as any, PaymentType.INDIVIDUAL);
      expect(result).toBeNull();
    });
  });

  describe('isStripeUS', () => {
    it('should return true if stripe account is US', () => {
      const result = service.isStripeUS('acct_us');
      expect(result).toBe(true);
    });

    it('should return false if stripe account is not US', () => {
      const result = service.isStripeUS('acct_nz');
      expect(result).toBe(false);
    });
  });

  describe('getLatestInvoice', () => {
    it('should get latest invoice', async () => {
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        latest_invoice: { id: 'inv_123' },
      } as any);
      const payment = {
        subscriptionRemoteId: 'sub_123',
        stripeAccountId: 'acct_123',
      };
      const result = await service.getLatestInvoice(payment as any);
      expect(result).toEqual({ id: 'inv_123' });
    });
  });

  describe('getInvoiceEmailAttachment', () => {
    it('should return null if no invoice pdf', async () => {
      const result = await service.getInvoiceEmailAttachment({ invoice_pdf: null } as any);
      expect(result).toBeNull();
    });

    it('should download invoice pdf', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
        } as any)
      );
      const result = await service.getInvoiceEmailAttachment({
        invoice_pdf: 'https://example.com/invoice.pdf',
        number: 'INV-123',
      } as any);
      expect(result).toBeDefined();
    });

    it('should handle download error', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
        } as any)
      );
      const result = await service.getInvoiceEmailAttachment({
        invoice_pdf: 'https://example.com/invoice.pdf',
        number: 'INV-123',
      } as any);
      expect(result).toBeNull();
    });
  });

  describe('updateInvoiceStatementDescriptor', () => {
    it('should update invoice statement descriptor', async () => {
      mockStripe.invoices.update.mockResolvedValue({} as any);
      await service.updateInvoiceStatementDescriptor({
        customerId: 'cus_123',
        invoiceId: 'inv_123',
        stripeAccount: 'acct_123',
      });
      expect(mockStripe.invoices.update).toHaveBeenCalled();
    });

    it('should handle error', async () => {
      mockStripe.invoices.update.mockRejectedValue(new Error('error'));
      await service.updateInvoiceStatementDescriptor({
        customerId: 'cus_123',
        invoiceId: 'inv_123',
        stripeAccount: 'acct_123',
      });
      expect(mockLoggerService.error).toHaveBeenCalled();
    });
  });

  describe('updateTotalMembersCustomerMetadata', () => {
    it('should update total members customer metadata', async () => {
      mockOrganizationService.getOrgById.mockResolvedValue({
        payment: { customerRemoteId: 'cus_123', stripeAccountId: 'acct_123' },
      });
      mockOrganizationService.countTotalActiveOrgMember.mockResolvedValue(10);
      mockStripe.customers.update.mockResolvedValue({} as any);
      await service.updateTotalMembersCustomerMetadata({ orgId: 'org_123' });
      expect(mockStripe.customers.update).toHaveBeenCalled();
    });

    it('should return early if no org found', async () => {
      mockOrganizationService.getOrgById.mockResolvedValue(null);
      await service.updateTotalMembersCustomerMetadata({ orgId: 'org_123' });
      expect(mockStripe.customers.update).not.toHaveBeenCalled();
    });

    it('should handle error', async () => {
      mockOrganizationService.getOrgById.mockRejectedValue(new Error('error'));
      await service.updateTotalMembersCustomerMetadata({ orgId: 'org_123' });
      expect(mockLoggerService.error).toHaveBeenCalled();
    });
  });

  describe('postSmbNotification', () => {
    it('should post smb notification if org in list', async () => {
      (service as any).smbOrganizationIdsCache = [];
      const handlers: { data?: (row: Record<string, string>) => void; end?: () => void } = {};
      const mockPipedStream = {
        on: jest.fn((event: string, handler: any) => {
          if (event === 'data') {
            handlers.data = handler;
            setImmediate(() => {
              if (handlers.data) {
                handlers.data({ '0': 'org_123' });
              }
            });
          }
          if (event === 'end') {
            handlers.end = handler;
            setImmediate(() => {
              if (handlers.end) {
                handlers.end();
              }
            });
          }
          return mockPipedStream;
        }),
      };
      const mockStream = {
        pipe: jest.fn(() => mockPipedStream),
      };
      mockAwsService.getFileFromTemporaryBucket.mockResolvedValue({
        Body: mockStream as any,
      });
      const organization = { _id: 'org_123' };
      await service.postSmbNotification({ organization: organization as any, notificationType: 'STARTED_TRIAL' as any });
      await new Promise(resolve => setImmediate(resolve));
      expect(mockSlackService.postSmbNotification).toHaveBeenCalled();
    });

    it('should not post if org not in list', async () => {
      mockAwsService.getFileFromTemporaryBucket.mockResolvedValue({
        Body: {
          pipe: jest.fn(() => ({
            on: jest.fn((event, handler) => {
              if (event === 'data') {
                handler({ '0': 'org_456' });
              }
              if (event === 'end') {
                handler();
              }
              return { on: jest.fn() };
            }),
          })),
        },
      });
      const organization = { _id: 'org_123' };
      await service.postSmbNotification({ organization: organization as any, notificationType: 'STARTED_TRIAL' as any });
      expect(mockSlackService.postSmbNotification).not.toHaveBeenCalled();
    });
  });

  describe('removePaymentMethodsFromCustomer', () => {
    it('should remove payment methods except specified one', async () => {
      mockStripe.customers.listPaymentMethods.mockResolvedValue({
        data: [
          { id: 'pm_1' },
          { id: 'pm_2' },
        ],
      } as any);
      mockPaymentUtilsService.isSourceCard.mockReturnValue(false);
      mockPaymentUtilsService.isPaymentMethod.mockReturnValue(true);
      mockStripe.paymentMethods.detach.mockResolvedValue({} as any);
      await service.removePaymentMethodsFromCustomer({
        customerRemoteId: 'cus_123',
        stripeAccountId: 'acct_123',
        except: 'pm_1',
      });
      expect(mockStripe.paymentMethods.detach).toHaveBeenCalled();
    });

    it('should throw error if no payment methods', async () => {
      mockStripe.customers.listPaymentMethods.mockResolvedValue({
        data: [],
      } as any);
      await expect(service.removePaymentMethodsFromCustomer({
        customerRemoteId: 'cus_123',
        stripeAccountId: 'acct_123',
      })).rejects.toThrow();
    });
  });

  describe('getPlanText', () => {
    it('should get plan text with trial', () => {
      const result = service.getPlanText(PaymentPlanEnums.BUSINESS, true);
      expect(result).toContain('Trial');
    });

    it('should get plan text without trial', () => {
      const result = service.getPlanText(PaymentPlanEnums.BUSINESS, false);
      expect(result).not.toContain('Trial');
    });
  });

  describe('getPaymentPlan', () => {
    it('should get payment plan', () => {
      mockEnvironmentService.getStripePlan.mockReturnValue('plan_123');
      const result = service.getPaymentPlan({
        planId: 'plan_123',
        period: PaymentPeriodEnums.MONTHLY,
        currency: PaymentCurrencyEnums.USD,
        stripeAccountId: 'acct_123',
      });
      expect(result).toBeDefined();
    });
  });

  describe('sendPurchaseGaEvent', () => {
    it('should send purchase ga event', () => {
      const paymentTarget = {
        _id: 'user_123',
        name: 'Test',
        payment: {
          type: PaymentPlanEnums.BUSINESS,
          period: PaymentPeriodEnums.MONTHLY,
        },
      };
      const invoice = {
        id: 'inv_123',
        currency: 'usd',
        total: 1000,
        subtotal: 1000,
      };
      service.sendPurchaseGaEvent({ paymentTarget, invoice });
      expect(mockHttpService.post).toHaveBeenCalled();
    });
  });

  describe('retrieveTestClock', () => {
    it('should retrieve test clock', async () => {
      mockStripe.testHelpers.testClocks.retrieve.mockResolvedValue({ id: 'clock_123' } as any);
      const result = await service.retrieveTestClock('clock_123', 'acct_123');
      expect(result).toEqual({ id: 'clock_123' });
    });
  });

  describe('isAllowUpgradeBusiness', () => {
    it('should return invalid quantity if quantity too low', async () => {
      mockOrganizationService.getTotalMemberInOrg.mockResolvedValue(5);
      const org = {
        _id: 'org_123',
        payment: {
          period: PaymentPeriodEnums.MONTHLY,
          quantity: 5,
          type: PaymentPlanEnums.BUSINESS,
        },
      };
      const result = await service.isAllowUpgradeBusiness(org as any, {
        period: PaymentPeriod.MONTHLY,
        quantity: 2,
        plan: PaymentPlanEnums.BUSINESS as any,
      });
      expect(result.isAllow).toBe(false);
    });

    it('should return invalid quantity if quantity too high', async () => {
      mockOrganizationService.getTotalMemberInOrg.mockResolvedValue(5);
      const org = {
        _id: 'org_123',
        payment: {
          period: PaymentPeriodEnums.MONTHLY,
          quantity: 5,
          type: PaymentPlanEnums.BUSINESS,
        },
      };
      const result = await service.isAllowUpgradeBusiness(org as any, {
        period: PaymentPeriod.MONTHLY,
        quantity: 1000,
        plan: PaymentPlanEnums.BUSINESS as any,
      });
      expect(result.isAllow).toBe(false);
    });

    it('should return allow if free plan', async () => {
      mockOrganizationService.getTotalMemberInOrg.mockResolvedValue(5);
      const org = {
        _id: 'org_123',
        payment: {
          period: PaymentPeriodEnums.MONTHLY,
          quantity: 5,
          type: PaymentPlanEnums.FREE,
        },
      };
      const result = await service.isAllowUpgradeBusiness(org as any, {
        period: PaymentPeriod.MONTHLY,
        quantity: 10,
        plan: PaymentPlanEnums.BUSINESS as any,
      });
      expect(result.isAllow).toBe(true);
    });

    it('should return incorrect plan if plan not business', async () => {
      mockOrganizationService.getTotalMemberInOrg.mockResolvedValue(5);
      const org = {
        _id: 'org_123',
        payment: {
          period: PaymentPeriodEnums.MONTHLY,
          quantity: 5,
          type: PaymentPlanEnums.BUSINESS,
        },
      };
      const result = await service.isAllowUpgradeBusiness(org as any, {
        period: PaymentPeriod.MONTHLY,
        quantity: 10,
        plan: PaymentPlanEnums.ENTERPRISE as any,
      });
      expect(result.isAllow).toBe(false);
    });

    it('should return false if enterprise plan', async () => {
      mockOrganizationService.getTotalMemberInOrg.mockResolvedValue(5);
      const org = {
        _id: 'org_123',
        payment: {
          period: PaymentPeriodEnums.MONTHLY,
          quantity: 5,
          type: PaymentPlanEnums.ENTERPRISE,
        },
      };
      const result = await service.isAllowUpgradeBusiness(org as any, {
        period: PaymentPeriod.MONTHLY,
        quantity: 10,
        plan: PaymentPlanEnums.BUSINESS as any,
      });
      expect(result.isAllow).toBe(false);
    });

    it('should return false if same plan', async () => {
      mockOrganizationService.getTotalMemberInOrg.mockResolvedValue(5);
      const org = {
        _id: 'org_123',
        payment: {
          period: PaymentPeriodEnums.MONTHLY,
          quantity: 10,
          type: PaymentPlanEnums.BUSINESS,
        },
      };
      const result = await service.isAllowUpgradeBusiness(org as any, {
        period: PaymentPeriod.MONTHLY,
        quantity: 10,
        plan: PaymentPlanEnums.BUSINESS as any,
      });
      expect(result.isAllow).toBe(false);
    });

    it('should return false if downgrading to monthly', async () => {
      mockOrganizationService.getTotalMemberInOrg.mockResolvedValue(5);
      const org = {
        _id: 'org_123',
        payment: {
          period: PaymentPeriodEnums.ANNUAL,
          quantity: 10,
          type: PaymentPlanEnums.BUSINESS,
        },
      };
      const result = await service.isAllowUpgradeBusiness(org as any, {
        period: PaymentPeriod.MONTHLY,
        quantity: 10,
        plan: PaymentPlanEnums.BUSINESS as any,
      });
      expect(result.isAllow).toBe(false);
    });
  });

  describe('getNextSubscriptionItemParams', () => {
    it('should return price and quantity for old team plan annual', () => {
      mockEnvironmentService.getByKey.mockImplementation((key: string) => {
        if (key === 'STRIPE_TEAM_MONTHLY_USD') return 'plan_old_team';
        return '';
      });
      mockEnvironmentService.getStripePlan.mockReturnValue('plan_new_team');
      const result = service.getNextSubscriptionItemParams({
        currentPayment: {
          period: PaymentPeriodEnums.ANNUAL,
          planRemoteId: 'plan_old_team',
          stripeAccountId: 'acct_123',
        },
        nextPayment: {
          period: PaymentPeriod.ANNUAL,
          quantity: 10,
          plan: PaymentPlanEnums.BUSINESS as any,
          currency: Currency.USD,
        },
        stripeAccountId: 'acct_123',
        paymentType: PaymentType.ORGANIZATION,
      });
      expect(result.price).toBeDefined();
    });

    it('should return only quantity if same period', () => {
      mockEnvironmentService.getStripePlan.mockReturnValue('plan_123');
      const result = service.getNextSubscriptionItemParams({
        currentPayment: {
          period: PaymentPeriodEnums.MONTHLY,
          planRemoteId: 'plan_123',
          stripeAccountId: 'acct_123',
        },
        nextPayment: {
          period: PaymentPeriod.MONTHLY,
          quantity: 10,
          plan: PaymentPlanEnums.BUSINESS as any,
          currency: Currency.USD,
        },
        stripeAccountId: 'acct_123',
        paymentType: PaymentType.ORGANIZATION,
      });
      expect(result.price).toBeUndefined();
    });

    it('should return price and quantity if different period', () => {
      mockEnvironmentService.getStripePlan.mockReturnValue('plan_123');
      const result = service.getNextSubscriptionItemParams({
        currentPayment: {
          period: PaymentPeriodEnums.MONTHLY,
          planRemoteId: 'plan_123',
          stripeAccountId: 'acct_123',
        },
        nextPayment: {
          period: PaymentPeriod.ANNUAL,
          quantity: 10,
          plan: PaymentPlanEnums.BUSINESS as any,
          currency: Currency.USD,
        },
        stripeAccountId: 'acct_123',
        paymentType: PaymentType.ORGANIZATION,
      });
      expect(result.price).toBeDefined();
    });
  });

  describe('getStripePlanWithOldTeam', () => {
    it('should return converted plan for old team annual', () => {
      mockEnvironmentService.getByKey.mockImplementation((key: string) => {
        if (key === 'STRIPE_TEAM_MONTHLY_USD') return 'plan_old_team';
        return 'plan_new';
      });
      const result = service.getStripePlanWithOldTeam(
        PaymentPlanEnums.BUSINESS,
        PaymentPeriodEnums.ANNUAL,
        PaymentCurrencyEnums.USD,
        'plan_old_team',
      );
      expect(mockEnvironmentService.getStripePlan).toHaveBeenCalled();
    });

    it('should return converted plan for old team monthly', () => {
      mockEnvironmentService.getByKey.mockImplementation((key: string) => {
        if (key === 'STRIPE_TEAM_MONTHLY_USD') return 'plan_old_team';
        return 'plan_new';
      });
      const result = service.getStripePlanWithOldTeam(
        PaymentPlanEnums.BUSINESS,
        PaymentPeriodEnums.MONTHLY,
        PaymentCurrencyEnums.USD,
        'plan_old_team',
      );
      expect(mockEnvironmentService.getStripePlan).toHaveBeenCalled();
    });

    it('should return normal plan if not old team plan', () => {
      const result = service.getStripePlanWithOldTeam(
        PaymentPlanEnums.BUSINESS,
        PaymentPeriodEnums.MONTHLY,
        PaymentCurrencyEnums.USD,
        'plan_new',
      );
      expect(mockEnvironmentService.getStripePlan).toHaveBeenCalled();
    });
  });

  describe('calculateNextBillingPrice', () => {
    it('should calculate next billing price with repeating coupon annual', () => {
      const invoice = {
        lines: {
          data: [{
            plan: { interval: 'year', amount: 1000 },
            quantity: 1,
            proration_details: { credited_items: null },
          }],
        },
        discounts: [{
          coupon: {
            duration: 'repeating',
            valid: true,
            duration_in_months: 6,
          },
        }],
        amount_due: 500,
      };
      const result = service.calculateNextBillingPrice(invoice);
      expect(result).toBe(1000);
    });

    it('should calculate next billing price with forever coupon', () => {
      const invoice = {
        lines: {
          data: [{
            plan: { interval: 'month', amount: 1000 },
            quantity: 1,
            proration_details: { credited_items: null },
          }],
        },
        discounts: [{
          coupon: {
            duration: 'forever',
            valid: true,
          },
        }],
        amount_due: 500,
      };
      const result = service.calculateNextBillingPrice(invoice);
      expect(result).toBe(1000);
    });

    it('should calculate next billing price with once coupon', () => {
      const invoice = {
        lines: {
          data: [{
            plan: { interval: 'month', amount: 1000 },
            quantity: 1,
            proration_details: { credited_items: null },
          }],
        },
        discounts: [{
          coupon: {
            duration: 'once',
            valid: true,
          },
        }],
        amount_due: 500,
      };
      const result = service.calculateNextBillingPrice(invoice);
      expect(result).toBe(1000);
    });

    it('should calculate next billing price without coupon', () => {
      const invoice = {
        lines: {
          data: [{
            plan: { interval: 'month', amount: 1000 },
            quantity: 1,
            proration_details: { credited_items: null },
          }],
        },
        amount_due: 1000,
      };
      const result = service.calculateNextBillingPrice(invoice);
      expect(result).toBe(1000);
    });
  });

  describe('calculateSubtotalOfInvoice', () => {
    it('should calculate subtotal of invoice', () => {
      const invoice = {
        lines: {
          data: [
            { amount: 1000 },
            { amount: 2000 },
            { amount: -500 },
          ],
        },
      };
      const result = service.calculateSubtotalOfInvoice(invoice);
      expect(result).toBe(3000);
    });
  });

  describe('getTrialInfoOfOrgPayment', () => {
    it('should get trial info for org payment', () => {
      const trialInfo = {
        highestTrial: PaymentPlanEnums.ORG_STARTER,
      };
      const result = service.getTrialInfoOfOrgPayment(trialInfo as any);
      expect(result.canUseStarterTrial).toBe(false);
      expect(result.canUseProTrial).toBe(true);
      expect(result.canUseBusinessTrial).toBe(true);
    });
  });

  describe('validateFree30Coupon', () => {
    it('should return false if not business plan', async () => {
      const result = await service.validateFree30Coupon({
        orgId: 'org_123',
        incomingPlan: PaymentPlanEnums.ORG_PRO as any,
        incomingPeriod: PaymentPeriod.MONTHLY,
        stripeAccountId: 'acct_123',
      });
      expect(result).toBe(false);
    });

    it('should return false if annual period', async () => {
      const result = await service.validateFree30Coupon({
        orgId: 'org_123',
        incomingPlan: PaymentPlanEnums.BUSINESS as any,
        incomingPeriod: PaymentPeriod.ANNUAL,
        stripeAccountId: 'acct_123',
      });
      expect(result).toBe(false);
    });

    it('should return true if no orgId', async () => {
      const result = await service.validateFree30Coupon({
        orgId: '',
        incomingPlan: PaymentPlanEnums.BUSINESS as any,
        incomingPeriod: PaymentPeriod.MONTHLY,
        stripeAccountId: 'acct_123',
      });
      expect(result).toBe(true);
    });

    it('should return false if org not found', async () => {
      mockOrganizationService.getOrgById.mockResolvedValue(null);
      const result = await service.validateFree30Coupon({
        orgId: 'org_123',
        incomingPlan: PaymentPlanEnums.BUSINESS as any,
        incomingPeriod: PaymentPeriod.MONTHLY,
        stripeAccountId: 'acct_123',
      });
      expect(result).toBe(false);
    });

    it('should return false if already used', async () => {
      mockOrganizationService.getOrgById.mockResolvedValue({
        payment: { customerRemoteId: 'cus_123' },
      });
      mockStripe.customers.retrieve.mockResolvedValue({
        metadata: { used_one_month_free: 'true' },
      } as any);
      const result = await service.validateFree30Coupon({
        orgId: 'org_123',
        incomingPlan: PaymentPlanEnums.BUSINESS as any,
        incomingPeriod: PaymentPeriod.MONTHLY,
        stripeAccountId: 'acct_123',
      });
      expect(result).toBe(false);
    });

    it('should return true if not used', async () => {
      mockOrganizationService.getOrgById.mockResolvedValue({
        payment: { customerRemoteId: 'cus_123' },
      });
      mockStripe.customers.retrieve.mockResolvedValue({
        metadata: {},
      } as any);
      const result = await service.validateFree30Coupon({
        orgId: 'org_123',
        incomingPlan: PaymentPlanEnums.BUSINESS as any,
        incomingPeriod: PaymentPeriod.MONTHLY,
        stripeAccountId: 'acct_123',
      });
      expect(result).toBe(true);
    });
  });

  describe('deductRemainingAmount', () => {
    it('should deduct remaining amount when amountDue becomes negative', () => {
      const result = service.deductRemainingAmount({
        remaining: 100,
        amountDue: 50,
        creditBalance: 0,
        nextBillingPrice: 1000,
      }, 100);
      expect(result.amountDue).toBe(0);
      expect(result.creditBalance).toBeGreaterThan(0);
    });

    it('should deduct remaining amount when amountDue stays positive', () => {
      const result = service.deductRemainingAmount({
        remaining: 100,
        amountDue: 200,
        creditBalance: 0,
        nextBillingPrice: 1000,
      }, 50);
      expect(result.amountDue).toBe(150);
    });
  });

  describe('getUnusedProrationInfo', () => {
    it('should get remaining unused amount', async () => {
      mockStripe.invoices.retrieveUpcoming.mockResolvedValue({
        lines: {
          data: [{ amount: -500 }],
        },
      } as any);
      const result = await service.getUnusedProrationInfo('sub_123', 'acct_123');
      expect(result).toEqual({ amount: 500, billingTimeStamp: '0' });
    });
  });

  describe('createCustomerBalance', () => {
    it('should create customer balance', async () => {
      mockStripe.invoices.retrieveUpcoming.mockResolvedValue({
        lines: {
          data: [{ amount: -500 }],
        },
      } as any);
      mockStripe.customers.createBalanceTransaction.mockResolvedValue({} as any);
      const result = await service.createCustomerBalance({
        customerRemoteId: 'cus_123',
        subscriptionRemoteId: 'sub_123',
        currency: Currency.USD,
        stripeAccountId: 'acct_123',
      });
      expect(result).toBe(500);
    });

    it('should return 0 if error', async () => {
      mockStripe.invoices.retrieveUpcoming.mockRejectedValue(new Error('error'));
      const result = await service.createCustomerBalance({
        customerRemoteId: 'cus_123',
        subscriptionRemoteId: 'sub_123',
        currency: Currency.USD,
        stripeAccountId: 'acct_123',
      });
      expect(result).toBe(0);
    });

    it('should return 0 if amount is 0', async () => {
      mockStripe.invoices.retrieveUpcoming.mockResolvedValue({
        lines: {
          data: [{ amount: 0 }],
        },
      } as any);
      const result = await service.createCustomerBalance({
        customerRemoteId: 'cus_123',
        subscriptionRemoteId: 'sub_123',
        currency: Currency.USD,
        stripeAccountId: 'acct_123',
      });
      expect(result).toBe(0);
    });
  });

  describe('getTotalDocStackUsed', () => {
    it('should get total doc stack used', async () => {
      mockOrganizationDocStackService.countFinishedDocs.mockResolvedValue(10);
      const result = await service.getTotalDocStackUsed('org_123');
      expect(result).toBe(10);
    });
  });

  describe('getFreeTrialTime', () => {
    it('should get free trial time', () => {
      const result = service.getFreeTrialTime();
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('handleStripeEarlyFraudWarning', () => {
    it('should handle stripe early fraud warning', async () => {
      mockStripe.charges.retrieve.mockResolvedValue({
        charge: 'ch_123',
        customer: 'cus_123',
        currency: 'usd',
        payment_method: 'pm_123',
        invoice: { subscription: 'sub_123' },
      } as any);
      mockStripe.charges.list.mockResolvedValue({
        data: [{
          id: 'ch_1',
          amount: 1000,
          payment_method: 'pm_123',
          disputed: false,
          refunded: false,
          paid: true,
        }],
      } as any);
      mockStripe.refunds.create.mockResolvedValue({ amount: 1000 } as any);
      mockStripe.subscriptions.cancel.mockResolvedValue({} as any);
      await service.handleStripeEarlyFraudWarning({
        data: { object: { charge: 'ch_123' } } as any,
        stripeAccount: 'acct_123',
      });
      expect(mockStripe.refunds.create).toHaveBeenCalled();
    });

    it('should return early if charge not found', async () => {
      mockStripe.charges.retrieve.mockResolvedValue(null);
      await service.handleStripeEarlyFraudWarning({
        data: { object: { charge: 'ch_123' } } as any,
        stripeAccount: 'acct_123',
      });
      expect(mockStripe.refunds.create).not.toHaveBeenCalled();
    });
  });

  describe('refundFraudChargesOfCustomer', () => {
    it('should refund fraud charges', async () => {
      mockStripe.charges.list.mockResolvedValue({
        data: [{
          id: 'ch_1',
          amount: 1000,
          payment_method: 'pm_fraud',
          disputed: false,
          refunded: false,
          paid: true,
        }],
      } as any);
      mockStripe.refunds.create.mockResolvedValue({ amount: 1000 } as any);
      const result = await service.refundFraudChargesOfCustomer({
        customerId: 'cus_123',
        fraudPaymentMethod: 'pm_fraud',
        stripeAccount: 'acct_123',
      });
      expect(result.refundedAmount).toBe(1000);
    });

    it('should skip charges that are disputed', async () => {
      mockStripe.charges.list.mockResolvedValue({
        data: [{
          id: 'ch_1',
          amount: 1000,
          payment_method: 'pm_fraud',
          disputed: true,
          refunded: false,
          paid: true,
        }],
      } as any);
      const result = await service.refundFraudChargesOfCustomer({
        customerId: 'cus_123',
        fraudPaymentMethod: 'pm_fraud',
        stripeAccount: 'acct_123',
      });
      expect(result.refundedAmount).toBe(0);
    });
  });

  describe('sendOrgSubscriptionCanceledEmail', () => {
    it('should send email with refunded amount', async () => {
      await service.sendOrgSubscriptionCanceledEmail({
        refundedFraudWarningAmount: '$10.00',
        targetEmails: ['test@test.com'],
        orgData: { name: 'Test Org', _id: 'org_123', payment: {} } as any,
        numberDaysUsePremium: 10,
      });
      expect(mockEmailService.sendEmailHOF).toHaveBeenCalled();
    });

    it('should send email without refunded amount', async () => {
      await service.sendOrgSubscriptionCanceledEmail({
        refundedFraudWarningAmount: '',
        targetEmails: ['test@test.com'],
        orgData: { name: 'Test Org', _id: 'org_123', payment: { period: PaymentPeriodEnums.MONTHLY } } as any,
        numberDaysUsePremium: 10,
      });
      expect(mockEmailService.sendEmailHOF).toHaveBeenCalled();
    });
  });

  describe('sendIndividualSubscriptionCanceledEmail', () => {
    it('should send email with refunded amount', () => {
      service.sendIndividualSubscriptionCanceledEmail({
        refundedFraudWarningAmount: '$10.00',
        targetEmails: ['test@test.com'],
        userData: { payment: {} } as any,
        numberDaysUsePremium: 10,
      });
      expect(mockEmailService.sendEmailHOF).toHaveBeenCalled();
    });

    it('should send email without refunded amount', () => {
      service.sendIndividualSubscriptionCanceledEmail({
        refundedFraudWarningAmount: '',
        targetEmails: ['test@test.com'],
        userData: { payment: { period: PaymentPeriodEnums.MONTHLY } } as any,
        numberDaysUsePremium: 10,
      });
      expect(mockEmailService.sendEmailHOF).toHaveBeenCalled();
    });
  });

  describe('retrieveSetupIntentSecret', () => {
    it('should retrieve existing setup intent', async () => {
      mockRedisService.getSetupIntent.mockResolvedValue('seti_123');
      mockStripe.setupIntents.retrieve.mockResolvedValue({ client_secret: 'secret_123' } as any);
      const result = await service.retrieveSetupIntentSecret({
        userId: 'user_123',
        stripeAccountId: 'acct_123',
        score: 0.9,
        openGoogleReferrer: [],
      });
      expect(result).toBe('secret_123');
    });

    it('should create new setup intent', async () => {
      mockRedisService.getSetupIntent.mockResolvedValue(null);
      mockStripe.setupIntents.create.mockResolvedValue({
        id: 'seti_123',
        client_secret: 'secret_123',
      } as any);
      const result = await service.retrieveSetupIntentSecret({
        userId: 'user_123',
        stripeAccountId: 'acct_123',
        score: 0.9,
        openGoogleReferrer: ['ref1'],
      });
      expect(result).toBe('secret_123');
      expect(mockRedisService.setSetupIntent).toHaveBeenCalled();
    });
  });

  describe('deactivateSetupIntent', () => {
    it('should deactivate setup intent', async () => {
      mockRedisService.getSetupIntent.mockResolvedValue('seti_123');
      await service.deactivateSetupIntent('user_123', 'acct_123');
      expect(mockRedisService.setSetupIntent).toHaveBeenCalled();
    });

    it('should not deactivate if no setup intent', async () => {
      mockRedisService.getSetupIntent.mockResolvedValue(null);
      await service.deactivateSetupIntent('user_123', 'acct_123');
      expect(mockRedisService.setSetupIntent).not.toHaveBeenCalled();
    });
  });

  describe('closeSubscriptionRemainingDateBanner', () => {
    it('should close banner for 30 days', async () => {
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        current_period_end: Math.floor(Date.now() / 1000) + 86400 * 20,
      } as any);
      const target = {
        _id: 'org_123',
        payment: {
          period: PaymentPeriod.ANNUAL,
          subscriptionRemoteId: 'sub_123',
          stripeAccountId: 'acct_123',
        },
      };
      await service.closeSubscriptionRemainingDateBanner({ target: target as any, userId: 'user_123' });
      expect(mockRedisService.setDisableSubscriptionRemainingBanner).toHaveBeenCalled();
    });
  });

  describe('shouldShowBillingRemainingDateBanner', () => {
    it('should show banner for monthly plan', async () => {
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        current_period_end: Math.floor(Date.now() / 1000) + 86400 * 5,
      } as any);
      mockRedisService.getDisableSubscriptionRemainingBanner.mockResolvedValue('0');
      const target = {
        _id: 'org_123',
        payment: {
          period: PaymentPeriod.MONTHLY,
          subscriptionRemoteId: 'sub_123',
          stripeAccountId: 'acct_123',
        },
      };
      const result = await service.shouldShowBillingRemainingDateBanner(target as any, 'user_123');
      expect(result).toBeDefined();
    });

    it('should not show banner if user closed it', async () => {
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        current_period_end: Math.floor(Date.now() / 1000) + 86400 * 5,
      } as any);
      mockRedisService.getDisableSubscriptionRemainingBanner.mockResolvedValue('2');
      const target = {
        _id: 'org_123',
        payment: {
          period: PaymentPeriod.MONTHLY,
          subscriptionRemoteId: 'sub_123',
          stripeAccountId: 'acct_123',
        },
      };
      const result = await service.shouldShowBillingRemainingDateBanner(target as any, 'user_123');
      expect(result).toBe(false);
    });
  });

  describe('sendRenewSuccessEmail', () => {
    it('should send email for individual', async () => {
      const target = {
        payment: { period: PaymentPeriodEnums.MONTHLY },
      };
      await service.sendRenewSuccessEmail(
        target as any,
        { email: 'test@test.com' },
        PaymentTypeEnums.INDIVIDUAL,
        {} as any,
      );
      expect(mockEmailService.sendEmailHOF).toHaveBeenCalled();
    });

    it('should send email for organization with braze', async () => {
      mockFeatureFlagService.getFeatureIsOn.mockResolvedValue(true);
      mockOrganizationService.getOrganizationMemberByRole.mockResolvedValue([
        { _id: 'user_123', email: 'admin@test.com' },
      ]);
      mockOrganizationService.countTotalActiveOrgMember.mockResolvedValue(10);
      mockStripe.paymentMethods.retrieve.mockResolvedValue({ card: { last4: '1234' } } as any);
      mockPaymentUtilsService.isIncludeSignSubscription.mockReturnValue(false);
      const target = {
        _id: 'org_123',
        name: 'Test Org',
        url: 'https://test.com',
        payment: {
          period: PaymentPeriodEnums.MONTHLY,
          subscriptionItems: [],
          type: PaymentPlanEnums.ORG_PRO,
          currency: PaymentCurrencyEnums.USD,
          stripeAccountId: 'acct_123',
        },
      };
      const customer = {
        invoice_settings: { default_payment_method: 'pm_123' },
      };
      const invoice = {
        created: Math.floor(Date.now() / 1000),
        lines: { data: [{ amount: 1000 }] },
        hosted_invoice_url: 'https://invoice.com',
      };
      await service.sendRenewSuccessEmail(
        target as any,
        customer as any,
        PaymentTypeEnums.ORGANIZATION,
        invoice as any,
      );
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(mockBrazeService.triggerRenewalEmailCampaign).toHaveBeenCalled();
    });

    it('should send email for organization without braze', async () => {
      mockFeatureFlagService.getFeatureIsOn.mockResolvedValue(false);
      mockOrganizationService.getOrganizationMemberByRole.mockResolvedValue([
        { email: 'admin@test.com' },
      ]);
      const target = {
        _id: 'org_123',
        name: 'Test Org',
        payment: {
          period: PaymentPeriodEnums.MONTHLY,
          subscriptionItems: [{ paymentStatus: PaymentStatusEnums.ACTIVE }],
        },
      };
      await service.sendRenewSuccessEmail(
        target as any,
        { email: 'test@test.com' } as any,
        PaymentTypeEnums.ORGANIZATION,
        {} as any,
      );
      expect(mockEmailService.sendEmailHOF).toHaveBeenCalled();
    });
  });

  describe('addExtraTrialDay', () => {
    it('should add extra trial day if feature flag enabled', async () => {
      mockFeatureFlagService.getFeatureIsOn.mockResolvedValue(true);
      await service.addExtraTrialDay({
        orgId: 'org_123',
        user: { _id: 'user_123' } as any,
        browserLanguage: 'en',
      });
      expect(mockRedisService.setRedisDataWithExpireTime).toHaveBeenCalled();
    });

    it('should not add extra trial day if feature flag disabled', async () => {
      mockFeatureFlagService.getFeatureIsOn.mockResolvedValue(false);
      await service.addExtraTrialDay({
        orgId: 'org_123',
        user: { _id: 'user_123' } as any,
        browserLanguage: 'en',
      });
      expect(mockRedisService.setRedisDataWithExpireTime).not.toHaveBeenCalled();
    });
  });

  describe('getLastSubscriptionEndedAt', () => {
    it('should return cached date', async () => {
      mockRedisService.getSubscriptionCanceledDate.mockResolvedValue(1000);
      const result = await service.getLastSubscriptionEndedAt({
        orgId: 'org_123',
        customerId: 'cus_123',
        stripeAccountId: 'acct_123',
      });
      expect(result).toBe(1000);
    });

    it('should return from stripe if not cached', async () => {
      mockRedisService.getSubscriptionCanceledDate.mockResolvedValue(null);
      mockStripe.subscriptions.list.mockResolvedValue({
        data: [{ ended_at: 2000 }],
      } as any);
      const result = await service.getLastSubscriptionEndedAt({
        orgId: 'org_123',
        customerId: 'cus_123',
        stripeAccountId: 'acct_123',
      });
      expect(result).toBe(2000);
      expect(mockRedisService.setSubscriptionCanceledDate).toHaveBeenCalled();
    });

    it('should return null if no subscription', async () => {
      mockRedisService.getSubscriptionCanceledDate.mockResolvedValue(null);
      mockStripe.subscriptions.list.mockResolvedValue({
        data: [],
      } as any);
      const result = await service.getLastSubscriptionEndedAt({
        orgId: 'org_123',
        customerId: 'cus_123',
        stripeAccountId: 'acct_123',
      });
      expect(result).toBeNull();
    });
  });

  describe('updateStripeCustomerEmail', () => {
    it('should update customer email', async () => {
      const user = {
        _id: 'user_123',
        payment: { customerRemoteId: 'cus_123' },
        email: 'old@test.com',
      };
      mockOrganizationService.getOrgListByUser.mockResolvedValue([
        { _id: 'org_1', payment: { customerRemoteId: 'cus_org_1' } },
      ]);
      mockOrganizationService.updateManyOrganizations.mockResolvedValue({} as any);
      mockStripe.customers.update.mockResolvedValue({} as any);
      await service.updateStripeCustomerEmail(user as any, 'new@test.com');
      expect(mockStripe.customers.update).toHaveBeenCalled();
    });

    it('should not update if no organizations', async () => {
      const user = {
        _id: 'user_123',
        payment: { customerRemoteId: 'cus_123' },
        email: 'old@test.com',
      };
      mockOrganizationService.getOrgListByUser.mockResolvedValue([]);
      await service.updateStripeCustomerEmail(user as any, 'new@test.com');
      expect(mockOrganizationService.updateManyOrganizations).not.toHaveBeenCalled();
    });
  });

  describe('getNewPaymentObject', () => {
    it('should return payment as is if free', async () => {
      const payment = {
        type: PaymentPlanEnums.FREE,
        subscriptionItems: [],
      };
      const result = await service.getNewPaymentObject(payment as any);
      expect(result).toEqual(payment);
    });

    it('should return payment as is if has pdf subscription', async () => {
      mockPaymentUtilsService.isIncludePdfSubscription.mockReturnValue(true);
      const payment = {
        type: PaymentPlanEnums.BUSINESS,
        subscriptionItems: [{ productName: PaymentProductEnums.PDF }],
      };
      const result = await service.getNewPaymentObject(payment as any);
      expect(result).toEqual(payment);
    });

    it('should migrate legacy payment to subscription items', async () => {
      mockPaymentUtilsService.isIncludePdfSubscription.mockReturnValue(false);
      mockRedisService.getMainSubscriptionItemId.mockResolvedValue(null);
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        items: {
          data: [{ id: 'si_1', price: { id: 'plan_123' } }],
        },
      } as any);
      mockPaymentUtilsService.filterSubItemByProduct.mockReturnValue([]);
      const payment = {
        type: PaymentPlanEnums.BUSINESS,
        planRemoteId: 'plan_123',
        quantity: 10,
        status: PaymentStatusEnums.ACTIVE,
        period: PaymentPeriodEnums.MONTHLY,
        currency: PaymentCurrencyEnums.USD,
        subscriptionRemoteId: 'sub_123',
        stripeAccountId: 'acct_123',
        subscriptionItems: [],
      };
      const result = await service.getNewPaymentObject(payment as any);
      expect(result.subscriptionItems).toBeDefined();
    });
  });

  describe('sendCancelSubscriptionEmail', () => {
    it('should send email for individual', async () => {
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        current_period_end: Math.floor(Date.now() / 1000) + 86400 * 10,
      } as any);
      const target = {
        payment: { subscriptionRemoteId: 'sub_123', stripeAccountId: 'acct_123' },
        email: 'test@test.com',
      };
      await service.sendCancelSubscriptionEmail({
        type: PaymentType.INDIVIDUAL,
        target: target as any,
      });
      expect(mockEmailService.sendEmailHOF).toHaveBeenCalled();
    });

    it('should send email for organization', async () => {
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        current_period_end: Math.floor(Date.now() / 1000) + 86400 * 10,
      } as any);
      mockOrganizationService.getOrganizationMemberByRole.mockResolvedValue([
        { email: 'admin@test.com' },
      ]);
      mockOrganizationService.getMembersByOrgId.mockResolvedValue([]);
      const canceledItems = [{ paymentStatus: PaymentStatusEnums.CANCELED, productName: PaymentProductEnums.SIGN }];
      mockOrganizationService.getOrgById.mockResolvedValue({
        _id: 'org_123',
        payment: {
          subscriptionItems: canceledItems,
        },
        premiumSeats: [],
      });
      const target = {
        _id: 'org_123',
        name: 'Test Org',
        payment: {
          subscriptionRemoteId: 'sub_123',
          stripeAccountId: 'acct_123',
          subscriptionItems: canceledItems,
        },
      };
      await service.sendCancelSubscriptionEmail({
        type: PaymentType.ORGANIZATION,
        target: target as any,
      });
      expect(mockEmailService.sendEmailHOF).toHaveBeenCalled();
    });
  });

  describe('cancelFailedSubscription', () => {
    it('should cancel all items', async () => {
      mockStripe.subscriptions.cancel.mockResolvedValue({} as any);
      mockRedisService.getRenewAttempt.mockResolvedValue(null);
      mockPaymentUtilsService.filterSubItemByProduct.mockReturnValue([]);
      mockOrganizationService.updateOrganizationProperty.mockResolvedValue({
        _id: 'org_123',
        name: 'Test Org',
        payment: {},
      });
      const payment = {
        subscriptionRemoteId: 'sub_123',
        subscriptionItems: [{ productName: PaymentProductEnums.PDF }],
        stripeAccountId: 'acct_123',
      };
      const result = await service.cancelFailedSubscription({
        payment: payment as any,
        itemsToCancel: [{ productName: PaymentProductEnums.PDF }] as any,
        clientId: 'org_123',
        target: { _id: 'org_123' } as any,
      });
      expect(result).toBeDefined();
      expect(result._id).toBe('org_123');
    });

    it('should cancel some items', async () => {
      mockStripe.subscriptions.update.mockResolvedValue({} as any);
      mockPaymentUtilsService.filterSubItemByProduct.mockReturnValue([{ productName: PaymentProductEnums.PDF }]);
      mockOrganizationService.updateOrganizationProperty.mockResolvedValue({
        _id: 'org_123',
        name: 'Test Org',
        payment: {},
      });
      const payment = {
        subscriptionRemoteId: 'sub_123',
        subscriptionItems: [
          { productName: PaymentProductEnums.PDF },
          { productName: PaymentProductEnums.SIGN },
        ],
        stripeAccountId: 'acct_123',
      };
      const result = await service.cancelFailedSubscription({
        payment: payment as any,
        itemsToCancel: [{ productName: PaymentProductEnums.SIGN }] as any,
        clientId: 'org_123',
        target: { _id: 'org_123' } as any,
      });
      expect(result).toBeDefined();
      expect(result._id).toBe('org_123');
    });
  });

  describe('cancelActiveSubscription', () => {
    it('should cancel all items', async () => {
      mockStripe.subscriptions.update.mockResolvedValue({} as any);
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        current_period_end: Math.floor(Date.now() / 1000) + 86400 * 10,
      } as any);
      mockPaymentUtilsService.filterSubItemByProduct.mockReturnValue([]);
      mockOrganizationService.getOrganizationMemberByRole.mockResolvedValue([]);
      mockOrganizationService.getMembersByOrgId.mockResolvedValue([]);
      mockOrganizationService.getOrgById.mockResolvedValue({
        _id: 'org_123',
        payment: { subscriptionItems: [] },
        premiumSeats: [],
      });
      const payment = {
        subscriptionRemoteId: 'sub_123',
        subscriptionItems: [
          { productName: PaymentProductEnums.PDF, paymentStatus: PaymentStatusEnums.ACTIVE },
        ],
        stripeAccountId: 'acct_123',
      };
      mockOrganizationService.updateOrganizationProperty.mockResolvedValue({
        _id: 'org_123',
        name: 'Test Org',
        payment: {
          subscriptionItems: [],
          subscriptionRemoteId: 'sub_123',
          stripeAccountId: 'acct_123',
        },
      });
      const result = await service.cancelActiveSubscription({
        payment: payment as any,
        itemsToCancel: [{ productName: PaymentProductEnums.PDF }] as any,
        subscriptionItemsInput: [{ productName: PaymentProductEnums.PDF }] as any,
        clientId: 'org_123',
        userContext: { _id: 'user_123' } as any,
      });
      expect(result).toBeDefined();
      expect(result._id).toBe('org_123');
    });

    it('should cancel some items', async () => {
      mockStripe.subscriptions.update.mockResolvedValue({} as any);
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        current_period_end: Math.floor(Date.now() / 1000) + 86400 * 10,
      } as any);
      mockPaymentUtilsService.filterSubItemByProduct.mockReturnValue([{ productName: PaymentProductEnums.PDF }]);
      mockOrganizationService.getOrganizationMemberByRole.mockResolvedValue([]);
      mockOrganizationService.getMembersByOrgId.mockResolvedValue([]);
      mockOrganizationService.getOrgById.mockResolvedValue({
        _id: 'org_123',
        payment: { subscriptionItems: [] },
        premiumSeats: [],
      });
      const payment = {
        subscriptionRemoteId: 'sub_123',
        subscriptionItems: [
          { productName: PaymentProductEnums.PDF, paymentStatus: PaymentStatusEnums.ACTIVE },
          { productName: PaymentProductEnums.SIGN, paymentStatus: PaymentStatusEnums.ACTIVE },
        ],
        stripeAccountId: 'acct_123',
      };
      mockOrganizationService.updateOrganizationProperty.mockResolvedValue({
        _id: 'org_123',
        name: 'Test Org',
        payment: {
          subscriptionItems: [{ productName: PaymentProductEnums.PDF, paymentStatus: PaymentStatusEnums.ACTIVE }],
          subscriptionRemoteId: 'sub_123',
          stripeAccountId: 'acct_123',
        },
      });
      const result = await service.cancelActiveSubscription({
        payment: payment as any,
        itemsToCancel: [{ productName: PaymentProductEnums.SIGN }] as any,
        subscriptionItemsInput: [{ productName: PaymentProductEnums.SIGN }] as any,
        clientId: 'org_123',
        userContext: { _id: 'user_123' } as any,
      });
      expect(result).toBeDefined();
      expect(result._id).toBe('org_123');
    });
  });
});
