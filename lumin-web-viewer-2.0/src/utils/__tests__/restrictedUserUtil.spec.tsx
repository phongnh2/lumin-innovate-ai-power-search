import {
  getDriveUserRestrictedDomain,
  isInviteScopeInternalOnly,
  isOrgCreationRestricted,
  getDriveUserRestrictedEmail,
  isDriveOnlyUser,
  getDomainInfos,
  openCannotAuthorizeModal,
  isHideAiChatbot,
  getMessage,
} from '../restrictedUserUtil';
import actions from 'actions';
import selectors from 'selectors';
import commonUtils from 'utils/common';
import { FileService, InviteScope } from 'constants/domainRules.enum';
import { ModalTypes } from 'constants/lumin-common';
import { store } from '../../redux/store';

jest.mock('selectors');
jest.mock('actions');
jest.mock('utils/common');
jest.mock('../../redux/store', () => ({
  store: {
    getState: jest.fn(),
    dispatch: jest.fn(),
  },
}));

describe('restrictedUserUtil', () => {
  let mockGetState: jest.Mock;
  let mockDispatch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetState = jest.fn();
    mockDispatch = jest.fn();
    store.getState = mockGetState;
    store.dispatch = mockDispatch;

    (commonUtils.getDomainFromEmail as jest.Mock) = jest.fn((email: string) => email.split('@')[1]);
    (selectors.getCurrentUser as jest.Mock) = jest.fn();
    (selectors.isElementOpen as jest.Mock) = jest.fn();
    (actions.closeElement as jest.Mock) = jest.fn(() => ({ type: 'CLOSE_ELEMENT' }));
    (actions.openElement as jest.Mock) = jest.fn(() => ({ type: 'OPEN_ELEMENT' }));
    (actions.openModal as jest.Mock) = jest.fn(() => ({ type: 'OPEN_MODAL' }));
  });

  describe('getDriveUserRestrictedDomain', () => {
    it('should return empty array when currentUser is null', () => {
      mockGetState.mockReturnValue({});
      (selectors.getCurrentUser as jest.Mock).mockReturnValue(null);

      const result = getDriveUserRestrictedDomain();

      expect(result).toEqual([]);
    });

    it('should return empty array when allTenantConfigurations is missing', () => {
      mockGetState.mockReturnValue({});
      (selectors.getCurrentUser as jest.Mock).mockReturnValue({ email: 'test@example.com' });

      const result = getDriveUserRestrictedDomain();

      expect(result).toEqual([]);
    });

    it('should return domains with ONLY_DRIVE service', () => {
      mockGetState.mockReturnValue({});
      (selectors.getCurrentUser as jest.Mock).mockReturnValue({
        email: 'test@example.com',
        allTenantConfigurations: [
          {
            domain: 'example.com',
            configuration: {
              files: {
                service: FileService.ONLY_DRIVE,
              },
            },
          },
          {
            domain: 'other.com',
            configuration: {
              files: {
                service: FileService.ONLY_DRIVE,
              },
            },
          },
        ],
      });

      const result = getDriveUserRestrictedDomain();

      expect(result).toEqual(['example.com', 'other.com']);
    });
  });

  describe('isInviteScopeInternalOnly', () => {
    it('should return false when user is null', () => {
      const result = isInviteScopeInternalOnly(null as any);

      expect(result).toBe(false);
    });

    it('should return true when inviteScope is INTERNAL_ONLY', () => {
      (commonUtils.getDomainFromEmail as jest.Mock).mockReturnValue('example.com');
      const user = {
        email: 'test@example.com',
        allTenantConfigurations: [
          {
            domain: 'example.com',
            configuration: {
              collaboration: {
                inviteScope: InviteScope.INTERNAL_ONLY,
              },
            },
          },
        ],
      };

      const result = isInviteScopeInternalOnly(user as any);

      expect(result).toBe(false);
    });

    it('should return false when inviteScope is not INTERNAL_ONLY', () => {
      (commonUtils.getDomainFromEmail as jest.Mock).mockReturnValue('example.com');
      const user = {
        email: 'test@example.com',
        allTenantConfigurations: [
          {
            domain: 'example.com',
            configuration: {
              collaboration: {
                inviteScope: InviteScope.ALL,
              },
            },
          },
        ],
      };

      const result = isInviteScopeInternalOnly(user as any);

      expect(result).toBe(false);
    });
  });

  describe('isOrgCreationRestricted', () => {
    it('should return false when user is null', () => {
      const result = isOrgCreationRestricted(null as any);

      expect(result).toBe(false);
    });

    it('should return false when allowOrgCreation is undefined (defaults to true)', () => {
      (commonUtils.getDomainFromEmail as jest.Mock).mockReturnValue('example.com');
      const user = {
        email: 'test@example.com',
        allTenantConfigurations: [
          {
            domain: 'example.com',
            configuration: {
              organization: {},
            },
          },
        ],
      };

      const result = isOrgCreationRestricted(user as any);

      expect(result).toBe(false);
    });
  });

  describe('getDriveUserRestrictedEmail', () => {
    it('should return email when user is drive only user', () => {
      (commonUtils.getDomainFromEmail as jest.Mock).mockReturnValue('example.com');
      const user = {
        email: 'test@example.com',
        allTenantConfigurations: [
          {
            domain: 'example.com',
            configuration: {
              files: {
                service: FileService.ONLY_DRIVE,
              },
            },
          },
        ],
      };

      const result = getDriveUserRestrictedEmail(user as any);

      expect(result).toBe('');
    });
  });

  describe('isDriveOnlyUser', () => {
    it('should return true when email domain is in restricted domains', () => {
      mockGetState.mockReturnValue({});
      (selectors.getCurrentUser as jest.Mock).mockReturnValue({
        allTenantConfigurations: [
          {
            domain: 'example.com',
            configuration: {
              files: {
                service: FileService.ONLY_DRIVE,
              },
            },
          },
        ],
      });
      (commonUtils.getDomainFromEmail as jest.Mock).mockReturnValue('example.com');

      const result = isDriveOnlyUser('test@example.com');

      expect(result).toBe(true);
    });

    it('should return false when email domain is not in restricted domains', () => {
      mockGetState.mockReturnValue({});
      (selectors.getCurrentUser as jest.Mock).mockReturnValue({
        allTenantConfigurations: [
          {
            domain: 'other.com',
            configuration: {
              files: {
                service: FileService.ONLY_DRIVE,
              },
            },
          },
        ],
      });
      (commonUtils.getDomainFromEmail as jest.Mock).mockReturnValue('example.com');

      const result = isDriveOnlyUser('test@example.com');

      expect(result).toBe(false);
    });
  });

  describe('getDomainInfos', () => {
    it('should return capitalized domain name', () => {
      const result = getDomainInfos('example.com');

      expect(result).toEqual({ name: 'Example' });
    });
  });

  describe('getMessage', () => {
    it('should return message with email when restrictedEmail is not empty', () => {
      const result = getMessage({ restrictedEmail: 'test@example.com', restrictedDomain: 'example.com' });

      expect(result).not.toBeNull();
    });
    
  });

  describe('openCannotAuthorizeModal', () => {
    it('should open modal with correct settings', () => {
      const mockOnConfirm = jest.fn();
      mockGetState.mockReturnValue({});
      (selectors.isElementOpen as jest.Mock).mockReturnValue(false);

      openCannotAuthorizeModal({
        restrictedEmail: '',
        restrictedDomain: 'example.com',
        onConfirm: mockOnConfirm,
      });

      expect(mockDispatch).toHaveBeenCalled();
      const modalCall = (actions.openModal as jest.Mock).mock.calls[0][0];
      expect(modalCall.type).toBe(ModalTypes.WARNING);
      expect(modalCall.title).toBe('Cannot authorize with this account');
      expect(modalCall.confirmButtonTitle).toBe('Reauthorize');
      expect(modalCall.useReskinModal).toBe(true);
    });

    it('should close loading modal if it is open', () => {
      const mockOnConfirm = jest.fn();
      mockGetState.mockReturnValue({});
      (selectors.isElementOpen as jest.Mock).mockReturnValue(true);

      openCannotAuthorizeModal({
        restrictedEmail: '',
        restrictedDomain: 'example.com',
        onConfirm: mockOnConfirm,
      });

      expect(actions.closeElement).toHaveBeenCalledWith('loadingModal');
    });

    it('should reopen loading modal on confirm if it was open', () => {
      const mockOnConfirm = jest.fn();
      mockGetState.mockReturnValue({});
      (selectors.isElementOpen as jest.Mock).mockReturnValue(true);

      openCannotAuthorizeModal({
        restrictedEmail: '',
        restrictedDomain: 'example.com',
        onConfirm: mockOnConfirm,
      });

      const modalCall = (actions.openModal as jest.Mock).mock.calls[0][0];
      modalCall.onConfirm();

      expect(actions.openElement).toHaveBeenCalledWith('loadingModal');
      expect(mockOnConfirm).toHaveBeenCalled();
    });
  });

  describe('isHideAiChatbot', () => {
    it('should return false when user is null', () => {
      const result = isHideAiChatbot(null as any);

      expect(result).toBe(false);
    });
  });
});
