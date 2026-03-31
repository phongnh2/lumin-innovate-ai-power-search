import { OrganizationUtilities } from '../Organization';
import { ORGANIZATION_ROLES, ORG_TEAM_ROLE, ORGANIZATION_CREATION_TYPE } from 'constants/organizationConstants';
import { InviteUsersSetting } from 'constants/organization.enum';
import { PaymentHelpers } from 'utils/payment';

jest.mock('../Payment', () => ({
  PaymentUtilities: jest.fn().mockImplementation(() => ({
    getQuantity: () => 5,
    isFree: jest.fn(() => false),
    isUnifyFree: jest.fn(() => false),
  })),
}));

jest.mock('utils/payment', () => ({
  PaymentHelpers: {
    isDocStackPlan: jest.fn(() => false),
  },
}));

describe('OrganizationUtilities', () => {
  const baseOrg = {
    userRole: ORGANIZATION_ROLES.MEMBER,
    teams: [],
    payment: {},
    domain: 'a.com',
    associateDomains: ['b.com'],
    creationType: ORGANIZATION_CREATION_TYPE.AUTOMATIC,
    totalMember: 2,
    settings: {},
  };

  test('constructor sets default empty values when organization is missing fields', () => {
    const util = new OrganizationUtilities({});
    expect(util.organization).toEqual({});
  });

  const create = (overrides = {}) => new OrganizationUtilities({ organization: { ...baseOrg, ...overrides } });

  test('getRole returns upper-case role', () => {
    const util = create({ userRole: 'member' });
    expect(util.getRole()).toBe('MEMBER');
  });

  test('isMember works', () => {
    const util = create({ userRole: ORGANIZATION_ROLES.MEMBER });
    expect(util.isMember()).toBe(true);
  });

  test('isAdmin works', () => {
    const util = create({ userRole: ORGANIZATION_ROLES.ORGANIZATION_ADMIN });
    expect(util.isAdmin()).toBe(true);
  });

  test('isModerator works', () => {
    const util = create({ userRole: ORGANIZATION_ROLES.BILLING_MODERATOR });
    expect(util.isModerator()).toBe(true);
  });

  test('isConvertedFromTeam works', () => {
    const util = create({ convertFromTeam: true });
    expect(util.isConvertedFromTeam()).toBeUndefined();
  });

  test('isManager = admin OR moderator', () => {
    expect(create({ userRole: ORGANIZATION_ROLES.ORGANIZATION_ADMIN }).isManager()).toBe(true);
    expect(create({ userRole: ORGANIZATION_ROLES.BILLING_MODERATOR }).isManager()).toBe(true);
    expect(create({ userRole: ORGANIZATION_ROLES.MEMBER }).isManager()).toBe(false);
  });

  test('isTeamAdmin detects team admin role', () => {
    const util = create({
      teams: [{ roleOfUser: ORG_TEAM_ROLE.ADMIN }],
    });
    expect(util.isTeamAdmin()).toBeTruthy();
  });

  test('domainList returns main + associates for AUTOMATIC creation', () => {
    const util = create();
    expect(util.domainList()).toEqual(['a.com', 'b.com']);
  });

  test('domainList returns only associates when not AUTOMATIC', () => {
    const util = create({ creationType: 'MANUAL' });
    expect(util.domainList()).toEqual(['b.com']);
  });

  test('getDomainsWithAtSign joins list', () => {
    const util = create();
    expect(util.getDomainsWithAtSign()).toBe('a.com, b.com');
  });

  test('hasSlot returns true when totalMember < quantity', () => {
    const util = create({ totalMember: 1 });
    expect(util.hasSlot()).toBe(true);
  });

  test('isLastActiveOrg works', () => {
    const util = create({ isLastActiveOrg: true });
    expect(util.isLastActiveOrg()).toBe(true);
  });

  test('getUrl works', () => {
    const util = create({ url: 'test-org' });
    expect(util.getUrl()).toBe('test-org');
  });

  test('hasInviteUsersPermission false when no setting', () => {
    const util = create({ settings: {} });
    expect(util.hasInviteUsersPermission()).toBe(false);
  });

  test('member can invite only if ANYONE_CAN_INVITE', () => {
    const util1 = create({
      userRole: ORGANIZATION_ROLES.MEMBER,
      settings: { inviteUsersSetting: InviteUsersSetting.ANYONE_CAN_INVITE },
    });
    const util2 = create({
      userRole: ORGANIZATION_ROLES.MEMBER,
      settings: { inviteUsersSetting: InviteUsersSetting.ADMIN_ONLY },
    });
    const util3 = create({
      userRole: ORGANIZATION_ROLES.ORGANIZATION_ADMIN,
      settings: { inviteUsersSetting: InviteUsersSetting.ANYONE_CAN_INVITE },
    });

    expect(util1.hasInviteUsersPermission()).toBe(true);
    expect(util2.hasInviteUsersPermission()).toBe(false);
    expect(util3.hasInviteUsersPermission()).toBe(true);
  });

  test('manager always has invite permission', () => {
    const util = create({
      userRole: ORGANIZATION_ROLES.ORGANIZATION_ADMIN,
      settings: { inviteUsersSetting: InviteUsersSetting.ADMIN_ONLY },
    });

    expect(util.hasInviteUsersPermission()).toBe(false);
  });

  test('canUpgradeSign = not SignPro & not UnifyFree', () => {
    const util = create({ isSignProSeat: false });
    util.paymentUtilities.isUnifyFree.mockReturnValue(false);
    expect(util.canUpgradeSign()).toBe(true);
  });

  test('isUpgradeSignSeat = manager + canUpgradeSign', () => {
    const util = create({
      userRole: ORGANIZATION_ROLES.ORGANIZATION_ADMIN,
      isSignProSeat: false,
    });
    expect(util.isUpgradeSignSeat()).toBe(true);
  });

  test('isRequestUpgradeSignSeat = member + canUpgradeSign', () => {
    const util = create({
      userRole: ORGANIZATION_ROLES.MEMBER,
      isSignProSeat: false,
    });
    expect(util.isRequestUpgradeSignSeat()).toBe(true);
  });
});
