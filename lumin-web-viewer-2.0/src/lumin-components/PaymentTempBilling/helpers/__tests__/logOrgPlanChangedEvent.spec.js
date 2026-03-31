import logOrgPlanChangedEvent from '../logOrgPlanChangedEvent';
import organizationEvent from 'utils/Factory/EventCollection/OrganizationEventCollection';

jest.mock('utils/Factory/EventCollection/OrganizationEventCollection', () => ({
  planChanged: jest.fn(),
}));

describe('logOrgPlanChangedEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call organizationEvent.planChanged with all parameters', () => {
    const params = {
      orgId: 'org-123',
      previousPayment: {
        type: 'pro',
        quantity: 5,
        period: 'monthly',
      },
      newPayment: {
        type: 'enterprise',
        quantity: 10,
        period: 'yearly',
      },
      previousDocStackStorage: {
        totalStack: 100,
      },
      newDocStackStorage: {
        totalStack: 200,
      },
    };

    logOrgPlanChangedEvent(params);

    expect(organizationEvent.planChanged).toHaveBeenCalledTimes(1);
    expect(organizationEvent.planChanged).toHaveBeenCalledWith({
      previousPlanName: 'pro',
      previousNumberOfUsers: 5,
      newNumberOfUsers: 10,
      newPlanName: 'enterprise',
      organizationId: 'org-123',
      previousPlanPeriod: 'monthly',
      newPlanPeriod: 'yearly',
      previousDocStack: 100,
      newDocStack: 200,
    });
  });

  it('should handle undefined/null values gracefully', () => {
    const params = {
      orgId: 'org-456',
      previousPayment: null,
      newPayment: undefined,
      previousDocStackStorage: {},
      newDocStackStorage: null,
    };

    logOrgPlanChangedEvent(params);

    expect(organizationEvent.planChanged).toHaveBeenCalledTimes(1);
    expect(organizationEvent.planChanged).toHaveBeenCalledWith({
      previousPlanName: undefined,
      previousNumberOfUsers: undefined,
      newNumberOfUsers: undefined,
      newPlanName: undefined,
      organizationId: 'org-456',
      previousPlanPeriod: undefined,
      newPlanPeriod: undefined,
      previousDocStack: undefined,
      newDocStack: undefined,
    });
  });

  it('should handle partial data', () => {
    const params = {
      orgId: 'org-789',
      previousPayment: {
        type: 'basic',
      },
      newPayment: {
        quantity: 15,
        period: 'monthly',
      },
      newDocStackStorage: {},
    };

    logOrgPlanChangedEvent(params);

    expect(organizationEvent.planChanged).toHaveBeenCalledTimes(1);
    expect(organizationEvent.planChanged).toHaveBeenCalledWith({
      previousPlanName: 'basic',
      previousNumberOfUsers: undefined,
      newNumberOfUsers: 15,
      newPlanName: undefined,
      organizationId: 'org-789',
      previousPlanPeriod: undefined,
      newPlanPeriod: 'monthly',
      previousDocStack: undefined,
      newDocStack: undefined,
    });
  });
});
