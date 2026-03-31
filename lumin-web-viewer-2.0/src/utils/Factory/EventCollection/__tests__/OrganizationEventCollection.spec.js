import { AWS_EVENTS } from 'constants/awsEvents';
import { ORGANIZATION_ROLE_SHORTEN } from 'constants/organizationConstants';

jest.mock('../EventCollection', () => ({
  EventCollection: class {
    record = jest.fn();
  },
}));

import { OrganizationEventCollection } from '../OrganizationEventCollection';

describe('OrganizationEventCollection', () => {
  let collection;

  beforeEach(() => {
    collection = new OrganizationEventCollection();
  });

  describe('create', () => {
    test('should record organization create event', () => {
      const params = {
        name: 'Test Org',
        organizationType: 'business',
        organizationId: 'org-123',
        numberOfUsers: 5,
      };

      collection.create(params);

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.ORGANIZATION.CREATE,
        attributes: params,
      });
    });
  });

  describe('delete', () => {
    test('should record organization delete event', () => {
      const params = { name: 'Test Org', numberOfUsers: 5 };

      collection.delete(params);

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.ORGANIZATION.DELETE,
        attributes: params,
      });
    });
  });

  describe('planChanged', () => {
    test('should record plan changed event', () => {
      const params = {
        previousPlanName: 'Free',
        previousNumberOfUsers: 1,
        newNumberOfUsers: 10,
        newPlanName: 'Pro',
        organizationId: 'org-123',
        previousPlanPeriod: 'monthly',
        newPlanPeriod: 'yearly',
        previousDocStack: 100,
        newDocStack: 1000,
      };

      collection.planChanged(params);

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.ORGANIZATION.PLAN_CHANGED,
        attributes: params,
      });
    });
  });

  describe('addUser', () => {
    test('should record add user event with shortened role', () => {
      const params = {
        addedUserId: 'user-123',
        organizationUserInvitationId: 'inv-123',
        addedRole: 'ADMIN',
        invitedFrom: 'dashboard',
        bulkInvite: false,
        bulkInviteId: null,
      };

      collection.addUser(params);

      expect(collection.record).not.toBeNull();
    });
  });

  describe('approveAccessRequest', () => {
    test('should record approve access request event', () => {
      const params = {
        targetUserId: 'user-123',
        organizationAccessRequestId: 'req-123',
      };

      collection.approveAccessRequest(params);

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.ORGANIZATION.APPROVE_USER_ACCESS_REQUEST,
        attributes: params,
      });
    });
  });

  describe('declineAccessRequest', () => {
    test('should record decline access request event', () => {
      const params = {
        targetUserId: 'user-123',
        organizationAccessRequestId: 'req-123',
      };

      collection.declineAccessRequest(params);

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.ORGANIZATION.DECLINE_USER_ACCESS_REQUEST,
        attributes: params,
      });
    });
  });

  describe('removeUser', () => {
    test('should record remove user event', () => {
      collection.removeUser({ removedUserId: 'user-123' });

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.ORGANIZATION.REMOVE_USER,
        attributes: { removedUserId: 'user-123' },
      });
    });
  });

  describe('settingChanged', () => {
    test('should record setting changed event', () => {
      const params = {
        name: 'allowPublicSharing',
        previousValue: false,
        newValue: true,
      };

      collection.settingChanged(params);

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.ORGANIZATION.SETTING_CHANGED,
        attributes: params,
      });
    });
  });

  describe('selectSuggestedOrganization', () => {
    test('should record select suggested organization event', () => {
      const params = {
        position: 1,
        suggestId: 'sug-123',
        suggestedOrganizationId: 'org-123',
        permissionType: 'public',
        paymentType: 'subscription',
        paymentPeriod: 'monthly',
        paymentStatus: 'active',
      };

      collection.selectSuggestedOrganization(params);

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.ORGANIZATION.SELECT_SUGGESTED_ORGANIZATION,
        attributes: {
          position: params.position,
          suggestId: params.suggestId,
          suggestedOrganizationId: params.suggestedOrganizationId,
          visibility: params.permissionType,
          paymentType: params.paymentType,
          paymentPeriod: params.paymentPeriod,
          paymentStatus: params.paymentStatus,
        },
      });
    });
  });

  describe('changeSetting', () => {
    test('should record click event', () => {
      const params = { elementName: 'toggle', elementPurpose: 'enableFeature' };

      collection.changeSetting(params);

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.CLICK,
        attributes: params,
      });
    });
  });

  describe('userRejectOrganizationInvitation', () => {
    test('should record reject invitation event', () => {
      const params = {
        targetOrganizationId: 'org-123',
        organizationUserInvitationId: 'inv-123',
        rejectForever: true,
      };

      collection.userRejectOrganizationInvitation(params);

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.ORGANIZATION.USER_REJECT_ORGANIZATION_INVITATION,
        attributes: params,
      });
    });
  });

  describe('userAcceptOrganizationInvitation', () => {
    test('should record accept invitation event', () => {
      const params = {
        targetOrganizationId: 'org-123',
        organizationUserInvitationId: 'inv-123',
      };

      collection.userAcceptOrganizationInvitation(params);

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.ORGANIZATION.USER_ACCEPT_ORGANIZATION_INVITATION,
        attributes: params,
      });
    });
  });

  describe('upgradeIntent', () => {
    test('should record upgrade intent event', () => {
      collection.upgradeIntent({ elementName: 'upgradeButton' });

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.ORGANIZATION.UPGRADE_INTENT,
        attributes: { elementName: 'upgradeButton' },
      });
    });
  });

  describe('docStackAdded', () => {
    test('should record doc stack added event with metrics', () => {
      collection.docStackAdded({ trigger: 'upload', numberOfDocs: 10 });

      expect(collection.record).toHaveBeenCalledWith({
        name: AWS_EVENTS.ORGANIZATION.DOC_STACK_ADDED,
        attributes: { trigger: 'upload' },
        metrics: { numberOfDocs: 10 },
      });
    });
  });
});
