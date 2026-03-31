import { render } from '@testing-library/react';
import {
  getOrgBannerData,
  getScheduledDeleteOrgModalSettings,
  getMemberUnit,
  getMemberText,
  addLastAccessOrg,
  isMatchOrgIdPath,
  isMatchOrgDashboard,
  canPaySubscription,
  getIndexPlan,
  canStartTrialPlan,
  mappingOrgWithRoleAndTeams,
} from '../orgUtils';
import lastAccessOrgs from 'utils/lastAccessOrgs';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';
import { Plans } from 'constants/plan';
import { BannerType } from 'constants/banner';

jest.mock('utils/date', () => ({
  formatMDYTime: jest.fn((date) => `formatted-${date}`),
}));

jest.mock('utils/lastAccessOrgs', () => ({
  setToStorage: jest.fn(),
}));

jest.mock('utils/getCommonBanner', () => jest.fn(() => ({
  COMMON_BANNER: { id: 'common', mainTitle: 'Common' },
})));

jest.mock('utils/getLanguage', () => ({
  getFullPathWithPresetLang: jest.fn((path) => `/en${path}`),
}));

describe('orgUtils', () => {
  const t = (key) => key;

  describe('getOrgBannerData', () => {
    it('should return banner data with common banner included', () => {
      const result = getOrgBannerData(t);
      expect(result[BannerType.CREATE_TEAM].bannerClass).toBe('createTeam');
      expect(result.COMMON_BANNER.mainTitle).toBe('Common');
    });
  });

  describe('getScheduledDeleteOrgModalSettings', () => {
    const onConfirm = jest.fn();

    it('should return admin settings for ORGANIZATION_ADMIN', () => {
      const setting = getScheduledDeleteOrgModalSettings({
        userRole: ORGANIZATION_ROLES.ORGANIZATION_ADMIN,
        orgName: 'Org1',
        deletedAt: '2025-12-03',
      }, onConfirm);

      expect(setting.confirmButtonTitle).toBe('Reactivate');
      expect(setting.cancelButtonTitle).toBe('Later');
      expect(setting.onConfirm).toBe(onConfirm);
      const { container } = render(setting.message);
      expect(container.textContent).toContain('Org1');
      expect(container.textContent).toContain('will be deleted');
    });

    it('should return non-admin settings for other roles', () => {
      const setting = getScheduledDeleteOrgModalSettings({
        userRole: 'member',
        orgName: 'Org2',
        deletedAt: '2025-12-04',
      }, onConfirm);

      expect(setting.confirmButtonTitle).toBe('OK');
      expect(setting.onConfirm).toBeInstanceOf(Function);
      const { container } = render(setting.message);
      expect(container.textContent).toContain('Org2');
    });
  });

  describe('getMemberUnit & getMemberText', () => {
    it('should return correct unit and text', () => {
      expect(getMemberUnit(1)).toBe('member');
      expect(getMemberUnit(2)).toBe('members');
      expect(getMemberText(1)).toBe('1 member');
      expect(getMemberText(3)).toBe('3 members');
    });
  });

  describe('addLastAccessOrg', () => {
    it('should call lastAccessOrgs.setToStorage', () => {
      addLastAccessOrg({ id: 'org1', url: '/org1' });
      expect(lastAccessOrgs.setToStorage).toHaveBeenCalledWith({ id: 'org1', url: '/org1' });
    });
  });

  describe('isMatchOrgIdPath', () => {
    it('should match correct org URL', () => {
      expect(isMatchOrgIdPath('/org')).toBe(false);
      expect(isMatchOrgIdPath('/circle/123456789012345678901234')).toBe(true);
      expect(isMatchOrgIdPath('/other')).toBe(false);
    });
  });

  describe('isMatchOrgDashboard', () => {
    it('should match correct dashboard URL', () => {
      expect(isMatchOrgDashboard('/org/my-org/dashboard')).toBe(false);
      expect(isMatchOrgDashboard('/org/my-org/dashboard/')).toBe(false);
      expect(isMatchOrgDashboard('/org/my-org/settings')).toBe(false);
    });
  });

  describe('canPaySubscription', () => {
    it('should return true for admin or billing moderator', () => {
      expect(canPaySubscription('ORGANIZATION_ADMIN')).toBe(true);
      expect(canPaySubscription('billing_moderator')).toBe(true);
    });
    it('should return false for other roles', () => {
      expect(canPaySubscription('member')).toBe(false);
    });
  });

  describe('getIndexPlan', () => {
    it('should return correct index', () => {
      expect(getIndexPlan(Plans.ORG_STARTER)).toBe(Object.values(Plans).indexOf(Plans.ORG_STARTER));
    });
  });

  describe('canStartTrialPlan', () => {
    const trialInfo = {
      canUseStarterTrial: true,
      canUseProTrial: false,
      canUseBusinessTrial: true,
    };

    it('should return correct boolean based on plan', () => {
      expect(canStartTrialPlan(Plans.ORG_STARTER, trialInfo)).toBe(true);
      expect(canStartTrialPlan(Plans.ORG_PRO, trialInfo)).toBe(false);
      expect(canStartTrialPlan(Plans.ORG_BUSINESS, trialInfo)).toBe(true);
      expect(canStartTrialPlan('UNKNOWN_PLAN', trialInfo)).toBe(false);
    });
  });

  describe('mappingOrgWithRoleAndTeams', () => {
    it('should map organization with role and default empty teams', () => {
      const org = { id: 'org1', userRole: 'Admin' };
      const mapped = mappingOrgWithRoleAndTeams(org);
      expect(mapped.role).toBe('admin');
      expect(mapped.organization.teams).toEqual([]);
    });

    it('should keep existing teams', () => {
      const org = { id: 'org2', userRole: 'Member', teams: [{ id: 'team1' }] };
      const mapped = mappingOrgWithRoleAndTeams(org);
      expect(mapped.organization.teams).toEqual([{ id: 'team1' }]);
    });
  });
});
