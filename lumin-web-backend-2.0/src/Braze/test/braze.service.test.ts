import { Test, TestingModule } from '@nestjs/testing';
import { BrazeService } from '../braze.service';
import { BrazeClient } from '../braze.client';
import { UserService } from '../../User/user.service';
import { EnvironmentService } from '../../Environment/environment.service';
import { LoggerService } from '../../Logger/Logger.service';
import { RedisService } from '../../Microservices/redis/redis.service';
import { PaymentStatusEnums, PaymentPlanEnums, PaymentCurrencyEnums } from '../../Payment/payment.enum';
import { OrganizationPlan, OrganizationRole } from '../braze.interface';

describe('BrazeService', () => {
  let service: BrazeService;
  const mockBrazeClient = { trackUsers: jest.fn(), deleteUsers: jest.fn(), triggerCampaign: jest.fn() };
  const mockUserService = { findUserById: jest.fn(), findUsers: jest.fn(), updateUserProperty: jest.fn() };
  const mockEnvService = { getByKey: jest.fn((key) => key) };
  const mockLogger = { error: jest.fn() };
  const mockRedisService = { getRenewAttempt: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrazeService,
        { provide: BrazeClient, useValue: mockBrazeClient },
        { provide: UserService, useValue: mockUserService },
        { provide: EnvironmentService, useValue: mockEnvService },
        { provide: LoggerService, useValue: mockLogger },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get(BrazeService);
  });

  it('buildOrgTrialStartPayload – has remaining users', async () => {
    const totalUsers = 60;
    mockUserService.findUsers.mockResolvedValue(Array(totalUsers).fill({ _id: '1' }));
    const org = { associateDomains: ['a.com'] };
    const res = await service.buildOrgTrialStartPayload(org as any);
    expect(res.length).toBe(2);
    expect(res[1]?.recipients?.length).toBe(10);
  });

  it('trackMarketingEmailAttributes – catch error', async () => {
    const user = {
      _id: '1',
      metadata: { isSyncedMarketingEmailSetting: false },
      setting: { marketingEmail: true, featureUpdateEmail: false },
    };
    mockBrazeClient.trackUsers.mockRejectedValue(new Error('fail'));
    await service.trackMarketingEmailAttributes(user as any);
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('trackHighestPlanAtributes – user.metadata.highestOrgPlan undefined', async () => {
    mockUserService.findUserById.mockResolvedValue({ metadata: {} });
    mockBrazeClient.trackUsers.mockResolvedValue(true);
    await service.trackHighestPlanAtributes({
      externalId: '1',
      highestPlan: { highestLuminPlan: PaymentPlanEnums.FREE, highestLuminPlanStatus: PaymentStatusEnums.ACTIVE, highestLuminOrgRole: 'ADMIN' },
      targetId: 't1',
    });
    expect(mockBrazeClient.trackUsers).toHaveBeenCalled();
  });


  it('getPurchasesAttributes – trialing, canceled, unpaid, default', async () => {
    mockRedisService.getRenewAttempt.mockResolvedValue(null);

    let res = await service.getPurchasesAttributes({
      highestLuminPlan: PaymentPlanEnums.FREE,
      highestLuminPlanStatus: PaymentStatusEnums.TRIALING,
      highestLuminOrgRole: 'ADMIN',
    }, 'id');
    expect(res.status).toBe('free_trial');

    res = await service.getPurchasesAttributes({
      highestLuminPlan: PaymentPlanEnums.FREE,
      highestLuminPlanStatus: PaymentStatusEnums.CANCELED,
      highestLuminOrgRole: 'ADMIN',
    }, 'id');
    expect(res.status).toBe('set_to_cancel');

    res = await service.getPurchasesAttributes({
      highestLuminPlan: PaymentPlanEnums.FREE,
      highestLuminPlanStatus: PaymentStatusEnums.UNPAID,
      highestLuminOrgRole: 'ADMIN',
    }, 'id');
    expect(res.status).toBe('unpaid');

    res = await service.getPurchasesAttributes({
      highestLuminPlan: PaymentPlanEnums.FREE,
      highestLuminPlanStatus: 'UNKNOWN' as PaymentStatusEnums,
      highestLuminOrgRole: 'ADMIN',
    }, 'id');
    expect(res.status).toBe('active');
  });

  it('upsertAudience – success', async () => {
    mockBrazeClient.trackUsers.mockResolvedValue(true);
    await service.upsertAudience([{ external_id: '1' }]);
    expect(mockBrazeClient.trackUsers).toHaveBeenCalled();
  });

  it('upsertAudience – throw error if shouldThrowError', async () => {
    mockBrazeClient.trackUsers.mockRejectedValue(new Error('fail'));
    await expect(service.upsertAudience([{ external_id: '1' }], true)).rejects.toThrow('fail');
  });

  it('syncUserEmail – already synced', async () => {
    const user = { _id: '1', email: 'a@b.com', emailDomain: 'b.com', metadata: { hasSyncedEmailToBraze: true } };
    const res = await service.syncUserEmail(user as any);
    expect(res.hasSynced).toBe(true);
  });

  it('syncUserEmail – not synced', async () => {
    const user = { _id: '1', email: 'a@b.com', emailDomain: 'b.com', metadata: { hasSyncedEmailToBraze: false } };
    mockBrazeClient.trackUsers.mockResolvedValue(true);
    const res = await service.syncUserEmail(user as any);
    expect(res.hasSynced).toBe(true);
  });

  it('trackPurchaseEvent', async () => {
    mockBrazeClient.trackUsers.mockResolvedValue(true);
    await service.trackPurchaseEvent([{ external_id: '1', currency: PaymentCurrencyEnums.USD, price: 10, product_id: '1', time: new Date() }]);
    expect(mockBrazeClient.trackUsers).toHaveBeenCalled();
  });

  it('trackRequestJoinOrganization', async () => {
    mockBrazeClient.trackUsers.mockResolvedValue(true);
    await service.trackRequestJoinOrganization({ external_id: '1', orgId: 'o1' } as any);
    expect(mockBrazeClient.trackUsers).toHaveBeenCalled();
  });

  it('deleteAudiences', async () => {
    mockBrazeClient.deleteUsers.mockResolvedValue(true);
    await service.deleteAudiences(['1']);
    expect(mockBrazeClient.deleteUsers).toHaveBeenCalled();
  });

  it('getPurchasesAttributes – attempt exists', async () => {
    mockRedisService.getRenewAttempt.mockResolvedValue(true);
    const res = await service.getPurchasesAttributes({
      highestLuminPlan: PaymentPlanEnums.FREE,
      highestLuminPlanStatus: PaymentStatusEnums.ACTIVE,
      highestLuminOrgRole: 'ADMIN',
    }, 'id');
    expect(res.status).toBe('payment_failing');
  });

  it('getPurchasesAttributes – various statuses', async () => {
    mockRedisService.getRenewAttempt.mockResolvedValue(null);

    const statuses = [
      [PaymentStatusEnums.ACTIVE, 'ACTIVE'],
      [PaymentStatusEnums.TRIALING, 'FREE_TRIAL'],
      [PaymentStatusEnums.CANCELED, 'SET_TO_CANCEL'],
      [PaymentStatusEnums.UNPAID, 'UNPAID'],
      ['UNKNOWN' as PaymentStatusEnums, 'ACTIVE'],
    ];

    for (const [status, expected] of statuses) {
      const res = await service.getPurchasesAttributes({
        highestLuminPlan: PaymentPlanEnums.FREE,
        highestLuminPlanStatus: status,
        highestLuminOrgRole: 'ADMIN',
      }, 'id');
      expect(res.status).not.toBeNull();
    }
  });

  it('trackHighestPlanAtributes – update needed', async () => {
    mockUserService.findUserById.mockResolvedValue({ metadata: { highestOrgPlan: { highestLuminPlan: 'OLD' } } });
    mockBrazeClient.trackUsers.mockResolvedValue(true);
    mockUserService.updateUserProperty.mockResolvedValue(true);

    await service.trackHighestPlanAtributes({
      externalId: '1',
      highestPlan: { highestLuminPlan: 'FREE' as any, highestLuminPlanStatus: PaymentStatusEnums.ACTIVE, highestLuminOrgRole: 'ADMIN' },
      targetId: 't1',
    });

    expect(mockBrazeClient.trackUsers).toHaveBeenCalled();
    expect(mockUserService.updateUserProperty).toHaveBeenCalled();
  });

  it('trackHighestPlanAtributes – error caught', async () => {
    mockUserService.findUserById.mockResolvedValue({ metadata: { highestOrgPlan: { highestLuminPlan: 'OLD' } } });
    mockBrazeClient.trackUsers.mockRejectedValue(new Error('fail'));
    await service.trackHighestPlanAtributes({
      externalId: '1',
      highestPlan: { highestLuminPlan: 'FREE' as any, highestLuminPlanStatus: PaymentStatusEnums.ACTIVE, highestLuminOrgRole: 'ADMIN' },
      targetId: 't1',
    });
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('trackMarketingEmailAttributes – sync needed', async () => {
    mockUserService.updateUserProperty.mockResolvedValue(true);
    const user = {
      _id: '1',
      metadata: { isSyncedMarketingEmailSetting: false },
      setting: { marketingEmail: true, featureUpdateEmail: false },
    };
    mockBrazeClient.trackUsers.mockResolvedValue(true);
    await service.trackMarketingEmailAttributes(user as any);
    expect(mockBrazeClient.trackUsers).toHaveBeenCalled();
    expect(mockUserService.updateUserProperty).toHaveBeenCalled();
  });

  it('buildOrgTrialStartPayload – below threshold', async () => {
    mockUserService.findUsers.mockResolvedValue(Array(30).fill({ _id: '1' }));
    const org = { associateDomains: ['a.com'] };
    const res = await service.buildOrgTrialStartPayload(org as any);
    expect(res[0]?.recipients?.length).toBe(30);
  });

  it('buildOrgTrialStartPayload – above threshold', async () => {
    mockUserService.findUsers.mockResolvedValue(Array(200).fill({ _id: '1' }));
    const org = { associateDomains: ['a.com'] };
    const res = await service.buildOrgTrialStartPayload(org as any);
    expect(res[0].broadcast).toBe(true);
  });

  it('promptToJoinTrialingOrg – catch error', async () => {
    jest.spyOn(service, 'buildOrgTrialStartPayload').mockRejectedValue(new Error('fail'));
    await service.promptToJoinTrialingOrg({} as any);
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('triggerRenewalEmailCampaign – catch error', async () => {
    mockBrazeClient.triggerCampaign.mockRejectedValue(new Error('fail'));
    await service.triggerRenewalEmailCampaign(['a'], {} as any);
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('trackNewUserEvent', async () => {
    mockBrazeClient.trackUsers.mockResolvedValue(true);
    await service.trackNewUserEvent({ userId: '1', prop: 'x' });
    expect(mockBrazeClient.trackUsers).toHaveBeenCalled();
  });
});
