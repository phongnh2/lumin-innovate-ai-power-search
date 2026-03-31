import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { FeatureFlagKeys } from 'Common/constants/FeatureFlags';

import { CountryCodeEnums } from 'Auth/countryCode.enum';
import { EnvironmentService } from 'Environment/environment.service';
import { FeatureFlagService } from 'FeatureFlag/FeatureFlag.service';
import {  
  RetrieveOrganizationSetupIntentType,
  CreateOrganizationSubscriptionPlans,
  OrganizationPurpose
} from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { PaymentService } from 'Payment/payment.service';
import { PinpointService } from 'Pinpoint/pinpoint.service';
import { User } from 'User/interfaces/user.interface';

import { CashAppVariationView } from './eventTracking/cashAppVariationView';
import { IOrganization } from './interfaces/organization.interface';

import { OrganizationPaymentService } from './organization.payment.service';

describe('OrganizationPaymentService', () => {
  let service: OrganizationPaymentService;
  let redisService: jest.Mocked<RedisService>;
  let paymentService: jest.Mocked<PaymentService>;
  let featureFlagService: jest.Mocked<FeatureFlagService>;
  let environmentService: any;
  let pinpointService: jest.Mocked<PinpointService>;
  let loggerService: jest.Mocked<LoggerService>;

  const mockUser: Partial<User> & { countryCode: CountryCodeEnums } = {
    _id: new Types.ObjectId('5d5f85b5a7ab840c8d46f697').toString(),
    email: 'test@example.com',
    name: 'Test User',
    countryCode: CountryCodeEnums.US,
    metadata: {
      openGoogleReferrer: ['google.com'],
    } as any,
  };

  const mockOrganization: IOrganization = {
    _id: new Types.ObjectId('5d5f85b5a7ab840c8d46f698').toString(),
    name: 'Test Organization',
    createdAt: new Date(),
    avatarRemoteId: 'avatar123',
    ownerId: mockUser._id,
    payment: {
      customerRemoteId: 'cus_123',
      subscriptionRemoteId: 'sub_123',
      planRemoteId: 'price_123',
      type: 'ORG_STARTER',
      period: 'MONTHLY',
      status: 'ACTIVE',
      quantity: 1,
      currency: 'USD',
      trialInfo: {
        highestTrial: CreateOrganizationSubscriptionPlans.ORG_STARTER,
        endTrial: new Date(),
      },
      stripeAccountId: 'acct_123',
    },
    metadata: {
      firstUserJoinedManually: true,
      firstMemberInviteCollaborator: false,
      hasProcessedIndexingDocuments: false,
      promotions: [],
      promotionsClaimed: [],
      promotionsOffered: [],
    },
    reservePayment: {} as any,
    billingEmail: 'billing@example.com',
    url: 'test-org',
    domain: 'example.com',
    associateDomains: [],
    settings: {} as any,
    convertFromTeam: false,
    creationType: 'manual',
    unallowedAutoJoin: [],
    deletedAt: null,
    isMigratedFromTeam: false,
    reachUploadDocLimit: false,
    isDefault: false,
    docStackStartDate: new Date(),
    purpose: OrganizationPurpose.WORK,
  };

  const mockSetupIntent = {
    id: 'seti_123',
    object: 'setup_intent',
    application: null,
    automatic_payment_methods: null,
    cancellation_reason: null,
    client_secret: 'seti_123_secret',
    created: 1234567890,
    customer: null,
    description: null,
    flow_directions: null,
    last_setup_error: null,
    latest_attempt: null,
    livemode: false,
    mandate: null,
    metadata: {},
    next_action: null,
    on_behalf_of: null,
    payment_method: null,
    payment_method_options: {},
    payment_method_types: [],
    single_use_mandate: null,
    status: 'requires_payment_method',
    usage: 'off_session',
  } as any;

  const mockCashAppExperimentPayPmcId = 'pmc_cashapp_123';
  const mockStripeUSAccountId = 'acct_us_123';

  beforeEach(async () => {
    // Set up the mock before the service is created
    environmentService = {
      getByKey: jest.fn((key) => {
        if (key === EnvConstants.CASH_APP_EXPERIMENT_PMC_ID) return 'pmc_cashapp_123';
        if (key === EnvConstants.STRIPE_US_CONNECTED_ACCOUNT) return 'acct_us_123';
        return 'mock_value';
      })
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationPaymentService,
        {
          provide: RedisService,
          useValue: {
            getOrganizationSetupIntent: jest.fn(),
            setOrganizationSetupIntent: jest.fn(),
            removeOrganizationSetupIntent: jest.fn(),
          },
        },
        {
          provide: PaymentService,
          useValue: {
            createSetupIntent: jest.fn(),
            retrieveSetupIntent: jest.fn(),
            deactivateSetupIntent: jest.fn(),
          },
        },
        {
          provide: FeatureFlagService,
          useValue: {
            getFeatureIsOn: jest.fn(),
          },
        },
        {
          provide: EnvironmentService,
          useValue: environmentService,
        },
        {
          provide: PinpointService,
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            info: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrganizationPaymentService>(OrganizationPaymentService);
    redisService = module.get(RedisService);
    paymentService = module.get(PaymentService);
    featureFlagService = module.get(FeatureFlagService);
    pinpointService = module.get(PinpointService);
    loggerService = module.get(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('retrieveSetupIntentForOrganization', () => {
    const baseParams = {
      user: mockUser,
      organization: mockOrganization,
      stripeAccountId: 'acct_123',
      score: 0.9,
      openGoogleReferrer: ['google.com'],
      type: RetrieveOrganizationSetupIntentType.SUTTON_BANK_REROUTING,
    };

    describe('when type is SUTTON_BANK_REROUTING', () => {
      it('should create setup intent with cashapp payment method and return response', async () => {
        paymentService.createSetupIntent.mockResolvedValue(mockSetupIntent);

        const result = await service.retrieveSetupIntentForOrganization(baseParams);

        expect(paymentService.createSetupIntent).toHaveBeenCalledWith({
          metadata: {
            lumin_user_id: mockUser._id,
            circleId: mockOrganization._id,
            recaptchaScore: 0.9,
            ipCountryCode: CountryCodeEnums.US,
            type: RetrieveOrganizationSetupIntentType.SUTTON_BANK_REROUTING,
            openGoogleReferrer: 'google.com',
          },
          payment_method_types: ['cashapp'],
        }, { stripeAccount: 'acct_123' });

        expect(result).toEqual({
          clientSecret: mockSetupIntent.client_secret,
          accountId: 'acct_123',
        });
      });

      it('should handle empty openGoogleReferrer array', async () => {
        const params = { ...baseParams, openGoogleReferrer: [] };
        paymentService.createSetupIntent.mockResolvedValue(mockSetupIntent);

        await service.retrieveSetupIntentForOrganization(params);

        expect(paymentService.createSetupIntent).toHaveBeenCalledWith({
          metadata: {
            lumin_user_id: mockUser._id,
            circleId: mockOrganization._id,
            recaptchaScore: 0.9,
            ipCountryCode: CountryCodeEnums.US,
            type: RetrieveOrganizationSetupIntentType.SUTTON_BANK_REROUTING,
          },
          payment_method_types: ['cashapp'],
        }, { stripeAccount: 'acct_123' });
      });
    });

    describe('when type is not SUTTON_BANK_REROUTING', () => {
      const regularParams = { ...baseParams, type: undefined };

      describe('when setup intent exists in Redis', () => {
        it('should retrieve existing setup intent and return response', async () => {
          const existingSetupIntentId = 'seti_existing_123';
          redisService.getOrganizationSetupIntent.mockResolvedValue(existingSetupIntentId);
          paymentService.retrieveSetupIntent.mockResolvedValue(mockSetupIntent);

          const result = await service.retrieveSetupIntentForOrganization(regularParams);

          expect(redisService.getOrganizationSetupIntent).toHaveBeenCalledWith(
            mockOrganization._id,
            'acct_123'
          );
          expect(paymentService.retrieveSetupIntent).toHaveBeenCalledWith(
            existingSetupIntentId,
            'acct_123'
          );
          expect(result).toEqual({
            clientSecret: mockSetupIntent.client_secret,
            accountId: 'acct_123',
          });
        });
      });

      describe('when setup intent does not exist in Redis', () => {
        beforeEach(() => {
          redisService.getOrganizationSetupIntent.mockResolvedValue(null);
        });

        describe('when stripe account is US account', () => {
          it('should create setup intent for cash app experiment and return response', async () => {
            const cashAppSetupIntent = { ...mockSetupIntent, id: 'seti_cashapp_123' };
            paymentService.createSetupIntent.mockResolvedValue(cashAppSetupIntent);

            const result = await service.retrieveSetupIntentForOrganization({
              ...regularParams,
              stripeAccountId: mockStripeUSAccountId,
            });

            expect(result).toEqual({
              clientSecret: cashAppSetupIntent.client_secret,
              accountId: mockStripeUSAccountId,
            });
          });
        });

        describe('when stripe account is not US account', () => {
          it('should create regular setup intent and store in Redis', async () => {
            paymentService.createSetupIntent.mockResolvedValue(mockSetupIntent);

            const result = await service.retrieveSetupIntentForOrganization(regularParams);

            expect(paymentService.createSetupIntent).toHaveBeenCalledWith({
              metadata: {
                lumin_user_id: mockUser._id,
                circleId: mockOrganization._id,
                recaptchaScore: 0.9,
                ipCountryCode: CountryCodeEnums.US,
                openGoogleReferrer: 'google.com',
              },
            }, { stripeAccount: 'acct_123' });

            expect(redisService.setOrganizationSetupIntent).toHaveBeenCalledWith(
              mockOrganization._id,
              'acct_123',
              mockSetupIntent.id
            );

            expect(result).toEqual({
              clientSecret: mockSetupIntent.client_secret,
              accountId: 'acct_123',
            });
          });

          it('should handle empty openGoogleReferrer array', async () => {
            const params = { ...regularParams, openGoogleReferrer: [] };
            paymentService.createSetupIntent.mockResolvedValue(mockSetupIntent);

            await service.retrieveSetupIntentForOrganization(params);

            expect(paymentService.createSetupIntent).toHaveBeenCalledWith({
              metadata: {
                lumin_user_id: mockUser._id,
                circleId: mockOrganization._id,
                recaptchaScore: 0.9,
                ipCountryCode: CountryCodeEnums.US,
              },
            }, { stripeAccount: 'acct_123' });
          });
        });
      });
    });
  });

  describe('createSetupIntentForCashAppExperiment', () => {
    const baseParams = {
      user: mockUser,
      organization: mockOrganization,
      stripeAccountId: 'acct_123',
      score: 0.9,
      openGoogleReferrer: ['google.com'],
    };

    it('should create setup intent with cash app payment configuration when feature flag is enabled', async () => {
      featureFlagService.getFeatureIsOn = jest.fn().mockResolvedValue(true);
      paymentService.createSetupIntent.mockResolvedValue(mockSetupIntent);

      const result = await service.createSetupIntentForCashAppExperiment(baseParams);

      expect(featureFlagService.getFeatureIsOn).toHaveBeenCalledWith({
        user: mockUser,
        featureFlagKey: FeatureFlagKeys.ENABLE_CASH_APP_PAY,
        organization: mockOrganization,
      });

      expect(paymentService.createSetupIntent).toHaveBeenCalledWith({
        payment_method_configuration: mockCashAppExperimentPayPmcId,
        metadata: {
          lumin_user_id: mockUser._id,
          circleId: mockOrganization._id,
          recaptchaScore: 0.9,
          ipCountryCode: CountryCodeEnums.US,
          openGoogleReferrer: 'google.com',
        },
      }, { stripeAccount: 'acct_123' });

      expect(redisService.setOrganizationSetupIntent).toHaveBeenCalledWith(
        mockOrganization._id,
        'acct_123',
        mockSetupIntent.id
      );

      expect(result).toEqual(mockSetupIntent);
    });

    it('should create setup intent without cash app payment configuration when feature flag is disabled', async () => {
      featureFlagService.getFeatureIsOn = jest.fn().mockResolvedValue(false);
      paymentService.createSetupIntent.mockResolvedValue(mockSetupIntent);

      const result = await service.createSetupIntentForCashAppExperiment(baseParams);

      expect(paymentService.createSetupIntent).toHaveBeenCalledWith({
        metadata: {
          lumin_user_id: mockUser._id,
          circleId: mockOrganization._id,
          recaptchaScore: 0.9,
          ipCountryCode: CountryCodeEnums.US,
          openGoogleReferrer: 'google.com',
        },
      }, { stripeAccount: 'acct_123' });

      expect(result).toEqual(mockSetupIntent);
    });

    it('should handle empty openGoogleReferrer array', async () => {
      featureFlagService.getFeatureIsOn = jest.fn().mockResolvedValue(true);
      const params = { ...baseParams, openGoogleReferrer: [] };
      paymentService.createSetupIntent.mockResolvedValue(mockSetupIntent);

      await service.createSetupIntentForCashAppExperiment(params);

      expect(paymentService.createSetupIntent).toHaveBeenCalledWith({
        payment_method_configuration: mockCashAppExperimentPayPmcId,
        metadata: {
          lumin_user_id: mockUser._id,
          circleId: mockOrganization._id,
          recaptchaScore: 0.9,
          ipCountryCode: CountryCodeEnums.US,
        },
      }, { stripeAccount: 'acct_123' });
    });

    it('should track cash app variation view event', async () => {
      featureFlagService.getFeatureIsOn = jest.fn().mockResolvedValue(true);
      paymentService.createSetupIntent.mockResolvedValue(mockSetupIntent);

      await service.createSetupIntentForCashAppExperiment(baseParams);

      expect(pinpointService.add).toHaveBeenCalledWith(
        expect.any(CashAppVariationView)
      );

      const cashAppEvent = pinpointService.add.mock.calls[0][0] as CashAppVariationView;
      expect(cashAppEvent).toBeInstanceOf(CashAppVariationView);
    });
  });

  describe('trackCashAppVariationView', () => {
    const baseParams = {
      isEnableCashAppPay: true,
      organizationId: mockOrganization._id,
      LuminUserId: mockUser._id,
      ipCountryCode: CountryCodeEnums.US,
    };

    it('should track cash app variation view successfully', () => {
      service.trackCashAppVariationView(baseParams);

      expect(pinpointService.add).toHaveBeenCalledWith(
        expect.any(CashAppVariationView)
      );

      expect(loggerService.info).toHaveBeenCalledWith({
        message: 'Cash app variation view tracked',
        context: 'trackCashAppVariationView',
        extraInfo: baseParams,
      });
    });

    it('should handle tracking errors gracefully', () => {
      const error = new Error('Tracking failed');
      pinpointService.add.mockImplementation(() => {
        throw error;
      });

      service.trackCashAppVariationView(baseParams);

      expect(loggerService.error).toHaveBeenCalledWith({
        message: 'Error tracking cash app variation view',
        context: 'trackCashAppVariationView',
        error,
        extraInfo: baseParams,
      });
    });

    it('should track with disabled cash app pay', () => {
      const params = { ...baseParams, isEnableCashAppPay: false };

      service.trackCashAppVariationView(params);

      expect(pinpointService.add).toHaveBeenCalledWith(
        expect.any(CashAppVariationView)
      );
    });
  });

  describe('deactivateOrganizationSetupIntent', () => {
    const params = {
      orgId: mockOrganization._id,
      userId: mockUser._id,
      stripeAccountId: 'acct_123',
    };

    it('should deactivate setup intent and remove from Redis', async () => {
      redisService.removeOrganizationSetupIntent.mockResolvedValue(true);

      const result = await service.deactivateOrganizationSetupIntent(params);

      expect(paymentService.deactivateSetupIntent).toHaveBeenCalledWith(
        params.userId,
        params.stripeAccountId
      );

      expect(redisService.removeOrganizationSetupIntent).toHaveBeenCalledWith(
        params.orgId,
        params.stripeAccountId
      );

      expect(result).toBe(true);
    });

    it('should handle Redis removal failure', async () => {
      redisService.removeOrganizationSetupIntent.mockResolvedValue(false);

      const result = await service.deactivateOrganizationSetupIntent(params);

      expect(result).toBe(false);
    });
  });

  describe('constructor', () => {
    it('should initialize with environment variables', () => {
      expect(environmentService.getByKey).toHaveBeenCalledWith(EnvConstants.CASH_APP_EXPERIMENT_PMC_ID);
      expect(environmentService.getByKey).toHaveBeenCalledWith(EnvConstants.STRIPE_US_CONNECTED_ACCOUNT);
    });
  });

  describe('error handling', () => {
    it('should handle payment service errors gracefully', async () => {
      const error = new Error('Payment service error');
      paymentService.createSetupIntent.mockRejectedValue(error);

      await expect(
        service.retrieveSetupIntentForOrganization({
          user: mockUser,
          organization: mockOrganization,
          stripeAccountId: 'acct_123',
          score: 0.9,
          openGoogleReferrer: [],
          type: RetrieveOrganizationSetupIntentType.SUTTON_BANK_REROUTING,
        })
      ).rejects.toThrow('Payment service error');
    });

    it('should handle Redis service errors gracefully', async () => {
      const error = new Error('Redis service error');
      redisService.getOrganizationSetupIntent.mockRejectedValue(error);

      await expect(
        service.retrieveSetupIntentForOrganization({
          user: mockUser,
          organization: mockOrganization,
          stripeAccountId: 'acct_123',
          score: 0.9,
          openGoogleReferrer: [],
          type: undefined,
        })
      ).rejects.toThrow('Redis service error');
    });

    it('should handle feature flag service errors gracefully', async () => {
      const error = new Error('Feature flag service error');
      featureFlagService.getFeatureIsOn.mockRejectedValue(error);

      await expect(
        service.createSetupIntentForCashAppExperiment({
          user: mockUser,
          organization: mockOrganization,
          stripeAccountId: mockStripeUSAccountId,
          score: 0.9,
          openGoogleReferrer: [],
        })
      ).rejects.toThrow('Feature flag service error');
    });
  });
}); 
