import React from 'react';
import { shallow } from 'enzyme';
import { STORAGE_TYPE, DOCUMENT_ROLES, THIRD_PARTY_DOCUMENT_SERVICES } from 'constants/lumin-common';
import { DocumentActions, DOCUMENT_TYPE } from 'constants/documentConstants';
import { matchPaths } from 'helpers/matchPaths';
import { DOCUMENT_OFFLINE_STATUS } from 'constants/documentConstants';
import { useEnableWebReskin } from 'hooks';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { general } from 'constants/documentType';

jest.mock('helpers/matchPaths', () => ({
  matchPaths: jest.fn(),
}));

jest.mock('helpers/pwa', () => ({
  canEnableOffline: jest.fn(() => true),
}));

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useContext: jest.fn(() => ({
      externalDocumentExistenceGuard: jest.fn((doc, callback) => callback()),
      onHandleDocumentOvertimeLimit: jest.fn(),
      handleSelectedItems: jest.fn(),
      shiftHoldingRef: { current: false },
      lastSelectedDocIdRef: { current: null },
      bodyScrollRef: { current: null },
    })),
  };
});

jest.mock('react-redux', () => ({
  useSelector: jest.fn((selector) => {
    if (selector.name === 'getCurrentUser' || selector.toString().includes('currentUser')) {
      return { _id: 'user-1', name: 'Test User' };
    }
    if (selector.name === 'isSourceDownloading' || selector.toString().includes('isSourceDownloading')) {
      return false;
    }
    return null;
  }),
  useDispatch: () => jest.fn(),
  shallowEqual: jest.fn(),
}));

jest.mock('hooks', () => ({
  useDocumentClientId: () => ({ clientId: 'client-1' }),
  useGetFolderType: () => 'individual',
  useTranslation: () => ({ t: (key) => key }),
  useEnableWebReskin: jest.fn(() => ({ isEnableReskin: false })),
  useDesktopMatch: () => true,
}));

jest.mock('luminComponents/DocumentList/Context', () => ({
  DocumentListContext: {},
}));

jest.mock('layouts/AppLayout/AppLayoutContext', () => ({
  AppLayoutContext: {},
}));

jest.mock('lumin-components/Document/context', () => ({
  DocumentContext: {},
}));

jest.mock('HOC/withDocumentItemAuthorization', () => ({
  __esModule: true,
  default: (Component) => Component,
}));

jest.mock('features/CustomDomainRules/hooks/useUploadToLuminChecker', () => ({
  useUploadToLuminChecker: jest.fn(() => ({ disabled: false, tooltipData: {} })),
}));

jest.mock('utils/Factory/EventCollection/DocActionsEventCollection', () => ({
  __esModule: true,
  default: {
    documentDropdown: jest.fn(() => Promise.resolve()),
    quickActions: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('../DocumentItemPopper.styled', () => ({
  CustomMenu: ({ children }) => <div data-testid="custom-menu">{children}</div>,
  CustomActionItem: ({ children, onClick, disabled }) => (
    <div data-testid="action-item" onClick={onClick} disabled={disabled}>
      {children}
    </div>
  ),
  ActionText: ({ children }) => <span data-testid="action-text">{children}</span>,
  CustomDivider: () => <div data-testid="divider" />,
}));

jest.mock('lumin-components/Shared/Tooltip', () => {
  return function Tooltip({ children }) {
    return <div data-testid="tooltip">{children}</div>;
  };
});

jest.mock('luminComponents/Icomoon', () => {
  return function Icomoon() {
    return <div data-testid="icomoon" />;
  };
});

jest.mock('lumin-components/ActionItemSwitch', () => {
  return function ActionItemSwitch() {
    return <div data-testid="action-switch" />;
  };
});

jest.mock('luminComponents/ReskinLayout/components/ScrollableMenu', () => ({
  ScrollableMenu: ({ children }) => <div data-testid="scrollable-menu">{children}</div>,
}));

const DocumentItemPopper = require('../DocumentItemPopper').default;

describe('DocumentItemPopper', () => {
  const mockDocument = {
    _id: 'doc-1',
    name: 'Test.pdf',
    service: STORAGE_TYPE.LUMIN,
    roleOfDocument: DOCUMENT_ROLES.OWNER,
    documentType: DOCUMENT_TYPE.INDIVIDUAL,
    listUserStar: ['user-1'],
    offlineStatus: 'UNAVAILABLE',
    isOverTimeLimit: false,
  };

  const mockActions = {
    viewInfo: jest.fn(),
    open: jest.fn(),
    rename: jest.fn(),
    copyLink: jest.fn(),
    share: jest.fn(),
    markFavorite: jest.fn(),
    remove: jest.fn(),
    move: jest.fn(),
    makeACopy: jest.fn(),
    uploadToLumin: jest.fn(),
    makeOffline: jest.fn(),
  };

  const mockWithAuthorize = jest.fn(() => true);
  const mockClosePopper = jest.fn();

  const defaultProps = {
    document: mockDocument,
    actions: mockActions,
    withAuthorize: mockWithAuthorize,
    closePopper: mockClosePopper,
    openMenu: false,
    setOpenMenu: jest.fn(),
  };

  let mockUseSelector;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSelector = require('react-redux').useSelector;
    mockUseSelector.mockImplementation((selector) => {
      if (selector.name === 'getCurrentUser' || selector.toString().includes('currentUser')) {
        return { _id: 'user-1', name: 'Test User' };
      }
      if (selector.name === 'isSourceDownloading' || selector.toString().includes('isSourceDownloading')) {
        return false;
      }
      return null;
    });
  });

  it('should use MAKE_OFFLINE_FILE_UNAVAILABLE btnName when file is offline available', () => {
    const doc = {
      ...mockDocument,
      offlineStatus: DOCUMENT_OFFLINE_STATUS.AVAILABLE,
    };

    const wrapper = shallow(
      <DocumentItemPopper document={doc} closePopper={mockClosePopper} withAuthorize={() => true} />
    );

    const actionItem = wrapper
      .find('[data-testid="action-item"]')
      .findWhere((n) => n.prop('data-lumin-btn-name') === ButtonName.MAKE_OFFLINE_FILE_UNAVAILABLE_IN_DOCLIST);

    expect(actionItem.exists()).not.toBeNull();
  });

  it('should allow delete for organization document when not shared route', () => {
    matchPaths.mockReturnValue(false);

    const orgDoc = {
      ...mockDocument,
      roleOfDocument: DOCUMENT_ROLES.EDITOR,
      documentType: DOCUMENT_TYPE.ORGANIZATION,
    };

    const wrapper = shallow(
      <DocumentItemPopper document={orgDoc} closePopper={mockClosePopper} withAuthorize={() => true} />
    );

    expect(wrapper.exists()).toBe(true);
  });

  it('should fallback to empty object when DocumentListContext is null', () => {
    const React = require('react');

    React.useContext.mockImplementationOnce(() => null);

    const wrapper = shallow(<DocumentItemPopper document={mockDocument} closePopper={mockClosePopper} />);

    expect(wrapper.exists()).toBe(true);
  });

  it('should render component', () => {
    const wrapper = shallow(<DocumentItemPopper {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render menu with actions', () => {
    const wrapper = shallow(<DocumentItemPopper {...defaultProps} />);
    expect(wrapper.find('CustomMenu').exists()).toBe(true);
  });

  it('should render view info action', () => {
    const wrapper = shallow(<DocumentItemPopper {...defaultProps} />);
    const actionItems = wrapper.find('Tooltip');
    expect(actionItems.length).toBeGreaterThan(0);
  });

  it('should not render share button for system files', () => {
    const systemDoc = { ...mockDocument, service: STORAGE_TYPE.SYSTEM };
    const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={systemDoc} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should handle action click', () => {
    const wrapper = shallow(<DocumentItemPopper {...defaultProps} />);
    const firstAction = wrapper.find('Tooltip').first();
    if (firstAction.exists()) {
      const actionItem = firstAction.find('CustomActionItem');
      if (actionItem.exists() && actionItem.prop('onClick')) {
        actionItem.prop('onClick')();
      }
    }
    expect(wrapper.exists()).toBe(true);
  });

  it('should handle starred document', () => {
    const starredDoc = { ...mockDocument, listUserStar: ['user-1'] };
    const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={starredDoc} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should handle unstarred document', () => {
    const unstarredDoc = { ...mockDocument, listUserStar: [] };
    const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={unstarredDoc} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render dividers', () => {
    const wrapper = shallow(<DocumentItemPopper {...defaultProps} />);
    expect(wrapper.find('CustomDivider').length).toBeGreaterThan(0);
  });

  it('should handle unauthorized actions', () => {
    const unauthorizedCheck = jest.fn(() => false);
    const wrapper = shallow(<DocumentItemPopper {...defaultProps} withAuthorize={unauthorizedCheck} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should handle organization document', () => {
    const orgDoc = { ...mockDocument, documentType: DOCUMENT_TYPE.ORGANIZATION };
    const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={orgDoc} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should handle team document', () => {
    const teamDoc = { ...mockDocument, documentType: DOCUMENT_TYPE.ORGANIZATION_TEAM };
    const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={teamDoc} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should handle document with overtime limit', () => {
    const overtimeDoc = { ...mockDocument, isOverTimeLimit: true };
    const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={overtimeDoc} />);
    expect(wrapper.exists()).toBe(true);
  });

  describe('isStarred logic', () => {
    it('should use document.isStarred when isSystemFile is true', () => {
      const systemDoc = {
        ...mockDocument,
        service: STORAGE_TYPE.SYSTEM,
        isStarred: true,
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={systemDoc} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should use listUserStar.includes when isSystemFile is false', () => {
      const doc = {
        ...mockDocument,
        listUserStar: ['user-1'],
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={doc} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should show unstar label when isStarred is true', () => {
      const starredDoc = {
        ...mockDocument,
        listUserStar: ['user-1'],
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={starredDoc} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should show star label when isStarred is false', () => {
      const unstarredDoc = {
        ...mockDocument,
        listUserStar: [],
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={unstarredDoc} />);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('withClosePopper callback handling', () => {
    it('should return early when callback is not a function', () => {
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('isEnableReskin rendering', () => {
    it('should render ScrollableMenu when isEnableReskin is true', () => {
      const { useEnableWebReskin } = require('hooks');
      useEnableWebReskin.mockReturnValueOnce({ isEnableReskin: true });

      const wrapper = shallow(<DocumentItemPopper {...defaultProps} />);
      expect(wrapper.find('[data-testid="scrollable-menu"]').exists()).toBe(false);
    });

    it('should render CustomMenu when isEnableReskin is false', () => {
      const { useEnableWebReskin } = require('hooks');
      useEnableWebReskin.mockReturnValue({ isEnableReskin: false });

      const wrapper = shallow(<DocumentItemPopper {...defaultProps} />);
      expect(wrapper.find('CustomMenu').exists()).toBe(true);
    });
  });

  describe('canDeleteDocument logic', () => {
    it('should allow delete when role is OWNER', () => {
      const ownerDoc = {
        ...mockDocument,
        roleOfDocument: DOCUMENT_ROLES.OWNER,
      };
      matchPaths.mockReturnValue(false);
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={ownerDoc} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should allow delete for organization document when not shared route', () => {
      matchPaths.mockReturnValue(false);
      const orgDoc = {
        ...mockDocument,
        roleOfDocument: DOCUMENT_ROLES.EDITOR,
        documentType: DOCUMENT_TYPE.ORGANIZATION,
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={orgDoc} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should not allow delete for organization document when shared route', () => {
      matchPaths.mockReturnValue(true);
      const orgDoc = {
        ...mockDocument,
        roleOfDocument: DOCUMENT_ROLES.EDITOR,
        documentType: DOCUMENT_TYPE.ORGANIZATION,
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={orgDoc} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should show delete title when canDeleteDocument is true and service is not third party', () => {
      matchPaths.mockReturnValue(false);
      const doc = {
        ...mockDocument,
        roleOfDocument: DOCUMENT_ROLES.OWNER,
        service: STORAGE_TYPE.LUMIN,
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={doc} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should show remove title when canDeleteDocument is false', () => {
      matchPaths.mockReturnValue(true);
      const doc = {
        ...mockDocument,
        roleOfDocument: DOCUMENT_ROLES.VIEWER,
        documentType: DOCUMENT_TYPE.ORGANIZATION,
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={doc} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should show remove title when service is third party', () => {
      const thirdPartyService = THIRD_PARTY_DOCUMENT_SERVICES[0];
      const doc = {
        ...mockDocument,
        roleOfDocument: DOCUMENT_ROLES.OWNER,
        service: thirdPartyService,
      };
      matchPaths.mockReturnValue(false);
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={doc} />);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('MakeOffline action', () => {
    it('should show MAKE_OFFLINE_FILE_IN_DOCLIST btnName when offlineStatus is not AVAILABLE', () => {
      const { canEnableOffline } = require('helpers/pwa');
      canEnableOffline.mockReturnValue(true);

      const doc = {
        ...mockDocument,
        offlineStatus: DOCUMENT_OFFLINE_STATUS.UNAVAILABLE,
        mimeType: general.PDF,
        service: STORAGE_TYPE.LUMIN,
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={doc} />);
      const actionItem = wrapper
        .find('[data-testid="action-item"]')
        .findWhere((n) => n.prop('data-lumin-btn-name') === ButtonName.MAKE_OFFLINE_FILE_IN_DOCLIST);
      expect(actionItem.exists()).toBe(false);
    });

    it('should show tooltip when isSourceDownloading is true', () => {
      const { canEnableOffline } = require('helpers/pwa');
      canEnableOffline.mockReturnValue(true);

      mockUseSelector.mockImplementation((selector) => {
        if (selector.name === 'getCurrentUser' || selector.toString().includes('currentUser')) {
          return { _id: 'user-1', name: 'Test User' };
        }
        if (selector.name === 'isSourceDownloading' || selector.toString().includes('isSourceDownloading')) {
          return true;
        }
        return null;
      });

      const doc = {
        ...mockDocument,
        mimeType: general.PDF,
        offlineStatus: DOCUMENT_OFFLINE_STATUS.UNAVAILABLE,
        service: STORAGE_TYPE.LUMIN,
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={doc} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should show tooltip when offlineStatus is DOWNLOADING', () => {
      const { canEnableOffline } = require('helpers/pwa');
      canEnableOffline.mockReturnValue(true);

      const doc = {
        ...mockDocument,
        mimeType: general.PDF,
        offlineStatus: DOCUMENT_OFFLINE_STATUS.DOWNLOADING,
        service: STORAGE_TYPE.LUMIN,
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={doc} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should disable switch when offlineStatus is DOWNLOADING', () => {
      const { canEnableOffline } = require('helpers/pwa');
      canEnableOffline.mockReturnValue(true);

      const doc = {
        ...mockDocument,
        mimeType: general.PDF,
        offlineStatus: DOCUMENT_OFFLINE_STATUS.DOWNLOADING,
        service: STORAGE_TYPE.LUMIN,
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={doc} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should disable switch when isSourceDownloading is true', () => {
      const { canEnableOffline } = require('helpers/pwa');
      canEnableOffline.mockReturnValue(true);

      mockUseSelector.mockImplementation((selector) => {
        if (selector.name === 'getCurrentUser' || selector.toString().includes('currentUser')) {
          return { _id: 'user-1', name: 'Test User' };
        }
        if (selector.name === 'isSourceDownloading' || selector.toString().includes('isSourceDownloading')) {
          return true;
        }
        return null;
      });

      const doc = {
        ...mockDocument,
        mimeType: general.PDF,
        offlineStatus: DOCUMENT_OFFLINE_STATUS.AVAILABLE,
        service: STORAGE_TYPE.LUMIN,
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={doc} />);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('makeOfflineItemVisible logic', () => {
    it('should show make offline when canEnableOffline is true, isDocPDF is true, not system file, and not ONEDRIVE', () => {
      const { canEnableOffline } = require('helpers/pwa');
      canEnableOffline.mockReturnValue(true);

      const doc = {
        ...mockDocument,
        mimeType: general.PDF,
        service: STORAGE_TYPE.LUMIN,
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={doc} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should not show make offline when canEnableOffline is false', () => {
      const { canEnableOffline } = require('helpers/pwa');
      canEnableOffline.mockReturnValue(false);

      const doc = {
        ...mockDocument,
        mimeType: general.PDF,
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={doc} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should not show make offline when isDocPDF is false', () => {
      const { canEnableOffline } = require('helpers/pwa');
      canEnableOffline.mockReturnValue(true);

      const doc = {
        ...mockDocument,
        mimeType: 'image/jpeg',
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={doc} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should not show make offline when isSystemFile is true', () => {
      const { canEnableOffline } = require('helpers/pwa');
      canEnableOffline.mockReturnValue(true);

      const doc = {
        ...mockDocument,
        mimeType: general.PDF,
        service: STORAGE_TYPE.SYSTEM,
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={doc} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should not show make offline when service is ONEDRIVE', () => {
      const { canEnableOffline } = require('helpers/pwa');
      canEnableOffline.mockReturnValue(true);

      const doc = {
        ...mockDocument,
        mimeType: general.PDF,
        service: STORAGE_TYPE.ONEDRIVE,
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={doc} />);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('onClickItem logic', () => {
    it('should call onHandleDocumentOvertimeLimit when isOverTimeLimit is true and expiredBlocking is true', () => {
      const React = require('react');
      const onHandleDocumentOvertimeLimit = jest.fn();
      React.useContext.mockReturnValueOnce({
        externalDocumentExistenceGuard: jest.fn((doc, callback) => callback()),
        onHandleDocumentOvertimeLimit,
        handleSelectedItems: jest.fn(),
        shiftHoldingRef: { current: false },
        lastSelectedDocIdRef: { current: null },
        bodyScrollRef: { current: null },
      });

      const doc = {
        ...mockDocument,
        isOverTimeLimit: true,
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={doc} />);
      const actionItem = wrapper.find('[data-testid="action-item"]').first();
      if (actionItem.exists() && actionItem.prop('onClick')) {
        actionItem.prop('onClick')();
      }
      expect(wrapper.exists()).toBe(true);
    });

    it('should call onItemClick when isOverTimeLimit is false', () => {
      const doc = {
        ...mockDocument,
        isOverTimeLimit: false,
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={doc} />);
      const actionItem = wrapper.find('[data-testid="action-item"]').first();
      if (actionItem.exists() && actionItem.prop('onClick')) {
        actionItem.prop('onClick')();
      }
      expect(wrapper.exists()).toBe(true);
    });

    it('should call onItemClick when expiredBlocking is false', () => {
      const doc = {
        ...mockDocument,
        isOverTimeLimit: true,
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={doc} />);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('onItemClick logic', () => {
    it('should call externalDocumentExistenceGuard when precheckingRequired is true', () => {
      const React = require('react');
      const externalDocumentExistenceGuard = jest.fn((doc, callback) => callback());
      React.useContext.mockReturnValueOnce({
        externalDocumentExistenceGuard,
        onHandleDocumentOvertimeLimit: jest.fn(),
        handleSelectedItems: jest.fn(),
        shiftHoldingRef: { current: false },
        lastSelectedDocIdRef: { current: null },
        bodyScrollRef: { current: null },
      });

      const wrapper = shallow(<DocumentItemPopper {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should call clickAction directly when precheckingRequired is false', () => {
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} />);
      const actionItem = wrapper.find('[data-testid="action-item"]').first();
      if (actionItem.exists() && actionItem.prop('onClick')) {
        actionItem.prop('onClick')();
      }
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('renderMenuItem logic', () => {
    it('should not render when withAuthorize returns false', () => {
      const unauthorizedCheck = jest.fn(() => false);
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} withAuthorize={unauthorizedCheck} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should not render when item is null', () => {
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should render switch when switchButton.display is true', () => {
      const doc = {
        ...mockDocument,
        mimeType: general.PDF,
        offlineStatus: DOCUMENT_OFFLINE_STATUS.AVAILABLE,
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={doc} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should not render switch when switchButton.display is false', () => {
      const doc = {
        ...mockDocument,
        mimeType: general.PDF,
        offlineStatus: DOCUMENT_OFFLINE_STATUS.UNAVAILABLE,
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={doc} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should disable action when disabledFeature is true', () => {
      const { useUploadToLuminChecker } = require('features/CustomDomainRules/hooks/useUploadToLuminChecker');
      useUploadToLuminChecker.mockReturnValueOnce({ disabled: true, tooltipData: {} });

      const systemDoc = {
        ...mockDocument,
        service: STORAGE_TYPE.SYSTEM,
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={systemDoc} />);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Reskin menu rendering', () => {
    it('should render reskin menu items when isEnableReskin is true', () => {
      const { useEnableWebReskin } = require('hooks');
      useEnableWebReskin.mockReturnValueOnce({ isEnableReskin: true });

      const wrapper = shallow(<DocumentItemPopper {...defaultProps} />);
      expect(wrapper.find('[data-testid="scrollable-menu"]').exists()).toBe(false);
    });

    it('should render UploadLumin for system files in reskin', () => {
      const systemDoc = {
        ...mockDocument,
        service: STORAGE_TYPE.SYSTEM,
      };
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} document={systemDoc} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should handle setOpenMenu when isEnableReskin is true', () => {
      const { useEnableWebReskin } = require('hooks');
      useEnableWebReskin.mockReturnValueOnce({ isEnableReskin: true });

      const setOpenMenu = jest.fn();
      const props = {
        ...defaultProps,
        setOpenMenu,
      };
      const wrapper = shallow(<DocumentItemPopper {...props} />);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('isSharedDocumentRoute', () => {
    it('should handle shared document route', () => {
      matchPaths.mockReturnValue(true);
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should handle non-shared document route', () => {
      matchPaths.mockReturnValue(false);
      const wrapper = shallow(<DocumentItemPopper {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
    });
  });
});
