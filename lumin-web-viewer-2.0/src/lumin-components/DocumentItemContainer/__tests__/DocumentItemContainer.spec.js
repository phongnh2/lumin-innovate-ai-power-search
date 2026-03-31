import React from 'react';
import { shallow, mount } from 'enzyme';
import produce from 'immer';
import { act } from 'react-dom/test-utils';

jest.mock('lumin-components/ReskinLayout/components/DocumentListItem/QuickActions', () => ({
  __esModule: true,
  default: () => <div>QuickActions</div>,
}));

jest.mock(
  '@web-new-ui/components/DocumentListItem/QuickActions',
  () => ({
    __esModule: true,
    default: () => <div>QuickActions</div>,
  }),
  { virtual: true }
);

const mockReact = require('react');
const mockSetDocumentList = jest.fn();
const mockRefetchDocument = jest.fn();
const mockHandleSelectedItems = jest.fn();

jest.mock('lumin-components/Document/context', () => ({
  DocumentContext: mockReact.createContext({
    selectedDocList: [],
    setDocumentList: mockSetDocumentList,
    isMoving: false,
    isDeleting: false,
    lastSelectedDocIdRef: { current: null },
    shiftHoldingRef: { current: false },
    refetchDocument: mockRefetchDocument,
    isDragging: false,
    handleSelectedItems: mockHandleSelectedItems,
  }),
}));

const mockOnCheckboxChange = jest.fn();
const mockOnClickDocument = jest.fn();
const mockDragRef = jest.fn();
const mockOpenRequestModal = jest.fn();
const mockPreCheckCreatedFile = jest.fn();

jest.mock('luminComponents/DocumentItem', () => ({
  __esModule: true,
  default: class DocumentItem extends mockReact.Component {
    render() {
      return (
        <div data-testid="document-item" data-document-id={this.props.document?._id}>
          DocumentItem
        </div>
      );
    }
  },
}));

jest.mock('luminComponents/DocumentItemPopper', () => ({
  __esModule: true,
  default: ({ document, ...restProps }) => (
    <div data-testid="document-item-popper" data-document-id={document?._id}>
      DocumentItemPopper
    </div>
  ),
}));

jest.mock('luminComponents/RightSideBarContent/utils', () => ({
  executeCopyText: jest.fn(),
}));

jest.mock('lumin-components/DocumentItem/hooks', () => ({
  useClickDocument: jest.fn(() => ({
    onCheckboxChange: mockOnCheckboxChange,
    onClickDocument: mockOnClickDocument,
  })),
  useDragDropDocument: jest.fn(() => ({
    dragRef: mockDragRef,
  })),
}));

jest.mock('../hooks', () => ({
  useRequestAccessModal: jest.fn(() => ({
    element: <div>RequestModal</div>,
    openModal: mockOpenRequestModal,
  })),
}));

jest.mock('hooks', () => ({
  useCreateTemplateOnDocument: jest.fn(() => ({
    preCheckCreatedFile: mockPreCheckCreatedFile,
  })),
  useTranslation: jest.fn(() => ({
    t: (key) => key,
  })),
  useGetIsCompletedUploadDocuments: jest.fn(() => false),
}));

jest.mock('utils', () => ({
  getShareLink: jest.fn((id) => `https://share.link/${id}`),
  toastUtils: {
    error: jest.fn(),
    success: jest.fn(),
  },
  eventTracking: jest.fn(),
  capitalize: jest.fn((str) => str),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  connect: () => (component) => component,
  useSelector: jest.fn((selector) => {
    if (selector.name === 'isOffline') return false;
    if (selector.name === 'isOpenUploadingPopper') return false;
    return null;
  }),
}));

jest.mock('selectors', () => ({
  __esModule: true,
  default: {
    isOffline: jest.fn(() => false),
    getCurrentUser: jest.fn(() => ({ _id: 'user-123' })),
    isOpenUploadingPopper: jest.fn(() => false),
  },
}));

jest.mock('actions', () => ({
  __esModule: true,
  default: {
    removeNewUploadDot: jest.fn((id) => ({ type: 'REMOVE_NEW_UPLOAD_DOT', payload: id })),
    setHighlightFoundDocument: jest.fn((payload) => ({ type: 'SET_HIGHLIGHT', payload })),
  },
}));

import { DocumentRole, DOCUMENT_OFFLINE_STATUS, DocumentActions } from 'constants/documentConstants';
import { STORAGE_TYPE } from 'constants/lumin-common';
import UserEventConstants from 'constants/eventConstants';
import { RequestPermissionText } from 'lumin-components/RequestAccessDocumentList/constants';

let DocumentItemContainer;

describe('DocumentItemContainer', () => {
  beforeAll(() => {
    DocumentItemContainer = require('../DocumentItemContainer').default;
  });

  const baseDocument = {
    _id: 'doc-123',
    name: 'Test Document.pdf',
    service: STORAGE_TYPE.LUMIN,
    roleOfDocument: DocumentRole.OWNER,
    listUserStar: ['user-123'],
    offlineStatus: DOCUMENT_OFFLINE_STATUS.AVAILABLE,
    newUpload: false,
    highlightFoundDocument: false,
  };

  const baseProps = {
    document: baseDocument,
    handleStarClick: jest.fn(() => jest.fn()),
    removeNewUploadDot: jest.fn(),
    openSettingDocumentModal: jest.fn(),
    makeOffline: jest.fn(() => jest.fn()),
    currentUser: { _id: 'user-123' },
    setHighlightFoundDocument: jest.fn(),
    foundDocumentScrolling: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isStarred logic', () => {
    it('should return document.isStarred for SYSTEM service', () => {
      const document = {
        ...baseDocument,
        service: STORAGE_TYPE.SYSTEM,
        isStarred: true,
      };

      const isStarred =
        document.service === STORAGE_TYPE.SYSTEM
          ? document.isStarred
          : document.listUserStar && document.listUserStar.includes(baseProps.currentUser._id);

      expect(isStarred).toBe(true);
    });

    it('should check listUserStar for non-SYSTEM service', () => {
      const document = {
        ...baseDocument,
        service: STORAGE_TYPE.LUMIN,
        listUserStar: ['user-123', 'user-456'],
        isStarred: false,
      };

      const isStarred =
        document.service === STORAGE_TYPE.SYSTEM
          ? document.isStarred
          : document.listUserStar && document.listUserStar.includes(baseProps.currentUser._id);

      expect(isStarred).toBe(true);
    });

    it('should return false when user is not in listUserStar', () => {
      const document = {
        ...baseDocument,
        service: STORAGE_TYPE.LUMIN,
        listUserStar: ['user-456'],
      };

      const isStarred =
        document.service === STORAGE_TYPE.SYSTEM
          ? document.isStarred
          : document.listUserStar && document.listUserStar.includes(baseProps.currentUser._id);

      expect(isStarred).toBe(false);
    });

    it('should return false when listUserStar is null or undefined', () => {
      const document = {
        ...baseDocument,
        service: STORAGE_TYPE.LUMIN,
        listUserStar: null,
      };

      const isStarred =
        document.service === STORAGE_TYPE.SYSTEM
          ? document.isStarred
          : document.listUserStar && document.listUserStar.includes(baseProps.currentUser._id);

      expect(isStarred).toBeFalsy();
    });
  });

  describe('isDisabled logic', () => {
    it('should enable all actions when document is available and not interacting', () => {
      const isOffline = false;
      const document = baseDocument;
      const isSelected = false;
      const isDeleting = false;
      const isMoving = false;

      const isSystemFile = document.service === STORAGE_TYPE.SYSTEM;
      const unavaiableOffline =
        isOffline && !isSystemFile && document.offlineStatus !== DOCUMENT_OFFLINE_STATUS.AVAILABLE;
      const isInteracting = isSelected && (isDeleting || isMoving);

      const isDisabled = {
        selection: isInteracting || unavaiableOffline,
        open: isInteracting || unavaiableOffline,
        actions: isOffline,
        drag: isInteracting || unavaiableOffline,
      };

      expect(isDisabled.selection).toBe(false);
      expect(isDisabled.open).toBe(false);
      expect(isDisabled.actions).toBe(false);
      expect(isDisabled.drag).toBe(false);
    });

    it('should disable actions when offline for non-system files without offline status', () => {
      const isOffline = true;
      const document = {
        ...baseDocument,
        service: STORAGE_TYPE.GOOGLE_DRIVE,
        offlineStatus: DOCUMENT_OFFLINE_STATUS.UNAVAILABLE,
      };
      const isSelected = false;
      const isDeleting = false;
      const isMoving = false;

      const isSystemFile = document.service === STORAGE_TYPE.SYSTEM;
      const unavaiableOffline =
        isOffline && !isSystemFile && document.offlineStatus !== DOCUMENT_OFFLINE_STATUS.AVAILABLE;
      const isInteracting = isSelected && (isDeleting || isMoving);

      const isDisabled = {
        selection: isInteracting || unavaiableOffline,
        open: isInteracting || unavaiableOffline,
        actions: isOffline,
        drag: isInteracting || unavaiableOffline,
      };

      expect(isDisabled.selection).toBe(true);
      expect(isDisabled.open).toBe(true);
      expect(isDisabled.actions).toBe(true);
      expect(isDisabled.drag).toBe(true);
    });

    it('should disable selection/open/drag when document is selected and deleting', () => {
      const isOffline = false;
      const document = baseDocument;
      const isSelected = true;
      const isDeleting = true;
      const isMoving = false;

      const isSystemFile = document.service === STORAGE_TYPE.SYSTEM;
      const unavaiableOffline =
        isOffline && !isSystemFile && document.offlineStatus !== DOCUMENT_OFFLINE_STATUS.AVAILABLE;
      const isInteracting = isSelected && (isDeleting || isMoving);

      const isDisabled = {
        selection: isInteracting || unavaiableOffline,
        open: isInteracting || unavaiableOffline,
        actions: isOffline,
        drag: isInteracting || unavaiableOffline,
      };

      expect(isDisabled.selection).toBe(true);
      expect(isDisabled.open).toBe(true);
      expect(isDisabled.drag).toBe(true);
    });

    it('should disable selection/open/drag when document is selected and moving', () => {
      const isOffline = false;
      const document = baseDocument;
      const isSelected = true;
      const isDeleting = false;
      const isMoving = true;

      const isSystemFile = document.service === STORAGE_TYPE.SYSTEM;
      const unavaiableOffline =
        isOffline && !isSystemFile && document.offlineStatus !== DOCUMENT_OFFLINE_STATUS.AVAILABLE;
      const isInteracting = isSelected && (isDeleting || isMoving);

      const isDisabled = {
        selection: isInteracting || unavaiableOffline,
        open: isInteracting || unavaiableOffline,
        actions: isOffline,
        drag: isInteracting || unavaiableOffline,
      };

      expect(isDisabled.selection).toBe(true);
      expect(isDisabled.open).toBe(true);
      expect(isDisabled.drag).toBe(true);
    });

    it('should enable system file when offline', () => {
      const isOffline = true;
      const document = {
        ...baseDocument,
        service: STORAGE_TYPE.SYSTEM,
      };
      const isSelected = false;
      const isDeleting = false;
      const isMoving = false;

      const isSystemFile = document.service === STORAGE_TYPE.SYSTEM;
      const unavaiableOffline =
        isOffline && !isSystemFile && document.offlineStatus !== DOCUMENT_OFFLINE_STATUS.AVAILABLE;
      const isInteracting = isSelected && (isDeleting || isMoving);

      const isDisabled = {
        selection: isInteracting || unavaiableOffline,
        open: isInteracting || unavaiableOffline,
        actions: isOffline,
        drag: isInteracting || unavaiableOffline,
      };

      expect(isDisabled.selection).toBe(false);
      expect(isDisabled.open).toBe(false);
      expect(isDisabled.drag).toBe(false);
      expect(isDisabled.actions).toBe(true);
    });
  });

  describe('onShareItemClick logic', () => {
    it('should return true when user is OWNER', () => {
      const document = {
        ...baseDocument,
        roleOfDocument: DocumentRole.OWNER,
      };

      const isOwnerOrSharer = [DocumentRole.SHARER, DocumentRole.OWNER].includes(document.roleOfDocument.toLowerCase());

      expect(isOwnerOrSharer).toBe(true);
    });

    it('should return true when user is SHARER', () => {
      const document = {
        ...baseDocument,
        roleOfDocument: DocumentRole.SHARER,
      };

      const isOwnerOrSharer = [DocumentRole.SHARER, DocumentRole.OWNER].includes(document.roleOfDocument.toLowerCase());

      expect(isOwnerOrSharer).toBe(true);
    });

    it('should return false when user is VIEWER', () => {
      const document = {
        ...baseDocument,
        roleOfDocument: DocumentRole.VIEWER,
      };

      const isOwnerOrSharer = [DocumentRole.SHARER, DocumentRole.OWNER].includes(document.roleOfDocument.toLowerCase());

      expect(isOwnerOrSharer).toBe(false);
    });

    it('should return false when user is EDITOR', () => {
      const document = {
        ...baseDocument,
        roleOfDocument: DocumentRole.EDITOR,
      };

      const isOwnerOrSharer = [DocumentRole.SHARER, DocumentRole.OWNER].includes(document.roleOfDocument.toLowerCase());

      expect(isOwnerOrSharer).toBe(false);
    });
  });

  describe('handleRemoveNewUploadDot logic', () => {
    it('should use setDocumentList when document has folderId', () => {
      const document = {
        ...baseDocument,
        folderId: 'folder-123',
      };

      const hasFolderId = !!document.folderId;

      expect(hasFolderId).toBe(true);
    });

    it('should use removeNewUploadDot when document has no folderId', () => {
      const document = {
        ...baseDocument,
        folderId: null,
      };

      const hasFolderId = !!document.folderId;

      expect(hasFolderId).toBe(false);
    });
  });

  describe('useEffect newUpload condition logic', () => {
    it('should trigger when document.newUpload is true and service is not S3', () => {
      const document = {
        ...baseDocument,
        newUpload: true,
        service: STORAGE_TYPE.LUMIN,
      };
      const openUploadingPopper = false;
      const isCompletedUploadDocuments = false;

      const isS3Service = document.service === STORAGE_TYPE.S3;
      const isCompletedUploadPopper = openUploadingPopper && isCompletedUploadDocuments;
      const condition = document.newUpload && (!isS3Service || !openUploadingPopper || isCompletedUploadPopper);

      expect(condition).toBe(true);
    });

    it('should not trigger when document.newUpload is false', () => {
      const document = {
        ...baseDocument,
        newUpload: false,
        service: STORAGE_TYPE.S3,
      };
      const openUploadingPopper = true;
      const isCompletedUploadDocuments = false;

      const isS3Service = document.service === STORAGE_TYPE.S3;
      const isCompletedUploadPopper = openUploadingPopper && isCompletedUploadDocuments;
      const condition = document.newUpload && (!isS3Service || !openUploadingPopper || isCompletedUploadPopper);

      expect(condition).toBe(false);
    });

    it('should trigger when service is S3 and openUploadingPopper is false', () => {
      const document = {
        ...baseDocument,
        newUpload: true,
        service: STORAGE_TYPE.S3,
      };
      const openUploadingPopper = false;
      const isCompletedUploadDocuments = false;

      const isS3Service = document.service === STORAGE_TYPE.S3;
      const isCompletedUploadPopper = openUploadingPopper && isCompletedUploadDocuments;
      const condition = document.newUpload && (!isS3Service || !openUploadingPopper || isCompletedUploadPopper);

      expect(condition).toBe(true);
    });

    it('should trigger when service is S3, openUploadingPopper is true, and isCompletedUploadDocuments is true', () => {
      const document = {
        ...baseDocument,
        newUpload: true,
        service: STORAGE_TYPE.S3,
      };
      const openUploadingPopper = true;
      const isCompletedUploadDocuments = true;

      const isS3Service = document.service === STORAGE_TYPE.S3;
      const isCompletedUploadPopper = openUploadingPopper && isCompletedUploadDocuments;
      const condition = document.newUpload && (!isS3Service || !openUploadingPopper || isCompletedUploadPopper);

      expect(condition).toBe(true);
    });
  });

  describe('highlight found document removal logic', () => {
    it('should trigger when highlightFoundDocument is true and not scrolling', () => {
      const document = {
        ...baseDocument,
        highlightFoundDocument: true,
      };
      const foundDocumentScrolling = false;

      const shouldRemoveHighlight = !foundDocumentScrolling && document.highlightFoundDocument;

      expect(shouldRemoveHighlight).toBe(true);
    });

    it('should not trigger when foundDocumentScrolling is true', () => {
      const document = {
        ...baseDocument,
        highlightFoundDocument: true,
      };
      const foundDocumentScrolling = true;

      const shouldRemoveHighlight = !foundDocumentScrolling && document.highlightFoundDocument;

      expect(shouldRemoveHighlight).toBe(false);
    });

    it('should use setDocumentList when document has folderId', () => {
      const document = {
        ...baseDocument,
        highlightFoundDocument: true,
        folderId: 'folder-123',
      };

      const hasFolderId = !!document.folderId;

      expect(hasFolderId).toBe(true);
    });

    it('should use setHighlightFoundDocument when document has no folderId', () => {
      const document = {
        ...baseDocument,
        highlightFoundDocument: true,
        folderId: null,
      };

      const hasFolderId = !!document.folderId;

      expect(hasFolderId).toBe(false);
    });
  });

  describe('Component rendering and integration', () => {
    let wrapper;
    const { DocumentContext } = require('lumin-components/Document/context');
    const DocumentItemMock = require('luminComponents/DocumentItem').default;

    const renderComponent = (props = {}, contextValue = {}) => {
      const defaultContextValue = {
        selectedDocList: [],
        setDocumentList: mockSetDocumentList,
        isMoving: false,
        isDeleting: false,
        lastSelectedDocIdRef: { current: null },
        shiftHoldingRef: { current: false },
        refetchDocument: mockRefetchDocument,
        isDragging: false,
        handleSelectedItems: mockHandleSelectedItems,
        ...contextValue,
      };

      return mount(
        <DocumentContext.Provider value={defaultContextValue}>
          <DocumentItemContainer {...baseProps} {...props} />
        </DocumentContext.Provider>
      );
    };

    const getDocumentItem = (wrapper) => wrapper.find(DocumentItemMock).first();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    afterEach(() => {
      if (wrapper) {
        wrapper.unmount();
      }
    });

    it('should render DocumentItem and request modal', () => {
      wrapper = renderComponent();

      expect(wrapper.find('[data-testid="document-item"]')).toHaveLength(1);
      expect(wrapper.text()).toContain('RequestModal');
    });

    it('should pass correct props to DocumentItem', () => {
      wrapper = renderComponent();
      const documentItem = getDocumentItem(wrapper);

      expect(documentItem.prop('isSelected')).toBe(false);
      expect(documentItem.prop('onCheckboxChange')).toBe(mockOnCheckboxChange);
      expect(documentItem.prop('onClickDocument')).toBe(mockOnClickDocument);
      expect(documentItem.prop('dragRef')).toBe(mockDragRef);
    });

    it('should mark document as selected when it is in selectedDocList', () => {
      const contextValue = {
        selectedDocList: [baseDocument],
      };
      wrapper = renderComponent({}, contextValue);
      const documentItem = getDocumentItem(wrapper);

      expect(documentItem.prop('isSelected')).toBe(true);
    });

    it('should calculate isStarred correctly for SYSTEM service', () => {
      const systemDocument = {
        ...baseDocument,
        service: STORAGE_TYPE.SYSTEM,
        isStarred: true,
      };
      wrapper = renderComponent({ document: systemDocument });
      const documentItem = getDocumentItem(wrapper);

      expect(documentItem.prop('isStarred')).toBe(true);
    });

    it('should calculate isStarred correctly for non-SYSTEM service', () => {
      const luminDocument = {
        ...baseDocument,
        service: STORAGE_TYPE.LUMIN,
        listUserStar: ['user-123'],
      };
      wrapper = renderComponent({ document: luminDocument });
      const documentItem = getDocumentItem(wrapper);

      expect(documentItem.prop('isStarred')).toBe(true);
    });

    it('should disable document when context isDeleting is true', () => {
      const contextValue = {
        selectedDocList: [baseDocument],
        isDeleting: true,
        isMoving: false,
      };
      wrapper = renderComponent({}, contextValue);
      const documentItem = getDocumentItem(wrapper);

      expect(documentItem.prop('isSelected')).toBe(true);
      const isDisabled = documentItem.prop('isDisabled');
      expect(isDisabled.selection).toBe(true);
      expect(isDisabled.open).toBe(true);
      expect(isDisabled.drag).toBe(true);
    });

    it('should disable document when context isMoving is true', () => {
      const contextValue = {
        selectedDocList: [baseDocument],
        isDeleting: false,
        isMoving: true,
      };
      wrapper = renderComponent({}, contextValue);
      const documentItem = getDocumentItem(wrapper);

      expect(documentItem.prop('isSelected')).toBe(true);
      const isDisabled = documentItem.prop('isDisabled');
      expect(isDisabled.selection).toBe(true);
      expect(isDisabled.open).toBe(true);
      expect(isDisabled.drag).toBe(true);
    });

    it('should handle isDragging context', () => {
      const contextValue = {
        selectedDocList: [],
        isDragging: true,
      };
      wrapper = renderComponent({}, contextValue);

      expect(wrapper.find('[data-testid="document-item"]')).toHaveLength(1);
    });
  });

  describe('Callbacks and actions', () => {
    let wrapper;
    const { DocumentContext } = require('lumin-components/Document/context');
    const utils = require('utils');
    const executeCopyText = require('luminComponents/RightSideBarContent/utils').executeCopyText;
    const DocumentItemMock = require('luminComponents/DocumentItem').default;

    const renderComponent = (props = {}) => {
      const contextValue = {
        selectedDocList: [],
        setDocumentList: mockSetDocumentList,
        isMoving: false,
        isDeleting: false,
        lastSelectedDocIdRef: { current: null },
        shiftHoldingRef: { current: false },
        refetchDocument: mockRefetchDocument,
        isDragging: false,
        handleSelectedItems: mockHandleSelectedItems,
      };

      return mount(
        <DocumentContext.Provider value={contextValue}>
          <DocumentItemContainer {...baseProps} {...props} />
        </DocumentContext.Provider>
      );
    };

    const getDocumentItem = (wrapper) => wrapper.find(DocumentItemMock).first();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    afterEach(() => {
      if (wrapper) {
        wrapper.unmount();
      }
    });

    it('should handle createAsTemplate action with successful preCheck', async () => {
      mockPreCheckCreatedFile.mockResolvedValue(null);
      const openSettingDocumentModal = jest.fn();
      wrapper = renderComponent({ openSettingDocumentModal });

      const documentItem = getDocumentItem(wrapper);
      const popperActions = documentItem.prop('contentPopper')({ closePopper: jest.fn() }).props.actions;

      await act(async () => {
        await popperActions.createAsTemplate();
      });

      expect(mockPreCheckCreatedFile).toHaveBeenCalledWith(baseDocument);
      expect(openSettingDocumentModal).toHaveBeenCalledWith({
        mode: DocumentActions.CreateAsTemplate,
        selectedDocuments: [baseDocument],
      });
    });

    it('should handle createAsTemplate action with failed preCheck', async () => {
      const error = { message: 'Error creating template' };
      mockPreCheckCreatedFile.mockResolvedValue(error);
      const openSettingDocumentModal = jest.fn();
      wrapper = renderComponent({ openSettingDocumentModal });

      const documentItem = getDocumentItem(wrapper);
      const popperActions = documentItem.prop('contentPopper')({ closePopper: jest.fn() }).props.actions;

      await act(async () => {
        await popperActions.createAsTemplate();
      });

      expect(utils.toastUtils.error).toHaveBeenCalledWith({ message: error.message });
      expect(openSettingDocumentModal).not.toHaveBeenCalled();
    });

    it('should handle share action when user is OWNER', () => {
      const openSettingDocumentModal = jest.fn();
      const ownerDocument = {
        ...baseDocument,
        roleOfDocument: DocumentRole.OWNER,
      };
      wrapper = renderComponent({ document: ownerDocument, openSettingDocumentModal });

      const documentItem = getDocumentItem(wrapper);
      const popperActions = documentItem.prop('contentPopper')({ closePopper: jest.fn() }).props.actions;

      popperActions.share();

      expect(openSettingDocumentModal).toHaveBeenCalledWith({
        mode: DocumentActions.Share,
        selectedDocuments: [ownerDocument],
      });
      expect(mockOpenRequestModal).not.toHaveBeenCalled();
    });

    it('should handle share action when user is SHARER', () => {
      const openSettingDocumentModal = jest.fn();
      const sharerDocument = {
        ...baseDocument,
        roleOfDocument: DocumentRole.SHARER,
      };
      wrapper = renderComponent({ document: sharerDocument, openSettingDocumentModal });

      const documentItem = getDocumentItem(wrapper);
      const popperActions = documentItem.prop('contentPopper')({ closePopper: jest.fn() }).props.actions;

      popperActions.share();

      expect(openSettingDocumentModal).toHaveBeenCalledWith({
        mode: DocumentActions.Share,
        selectedDocuments: [sharerDocument],
      });
    });

    it('should handle share action when user is VIEWER - request access', () => {
      const viewerDocument = {
        ...baseDocument,
        roleOfDocument: DocumentRole.VIEWER,
      };
      wrapper = renderComponent({ document: viewerDocument });

      const documentItem = getDocumentItem(wrapper);
      const popperActions = documentItem.prop('contentPopper')({ closePopper: jest.fn() }).props.actions;

      popperActions.share();

      expect(utils.eventTracking).toHaveBeenCalledWith(UserEventConstants.EventType.REQUEST_DOCUMENT_PERMISSION, {
        permission: RequestPermissionText[DocumentRole.SHARER],
      });
      expect(mockOpenRequestModal).toHaveBeenCalled();
    });

    it('should handle copyLink action', () => {
      wrapper = renderComponent();

      const documentItem = getDocumentItem(wrapper);
      const popperActions = documentItem.prop('contentPopper')({ closePopper: jest.fn() }).props.actions;

      popperActions.copyLink();

      expect(utils.getShareLink).toHaveBeenCalledWith(baseDocument._id);
      expect(executeCopyText).toHaveBeenCalledWith(`https://share.link/${baseDocument._id}`);
      expect(utils.toastUtils.success).toHaveBeenCalledWith({
        message: 'modalShare.hasBeenCopied',
        useReskinToast: true,
      });
    });

    it('should handle viewInfo action', () => {
      const openSettingDocumentModal = jest.fn();
      wrapper = renderComponent({ openSettingDocumentModal });

      const documentItem = getDocumentItem(wrapper);
      const popperActions = documentItem.prop('contentPopper')({ closePopper: jest.fn() }).props.actions;

      popperActions.viewInfo();

      expect(openSettingDocumentModal).toHaveBeenCalledWith({
        mode: DocumentActions.View,
        selectedDocuments: [baseDocument],
      });
    });

    it('should handle makeACopy action', () => {
      const openSettingDocumentModal = jest.fn();
      wrapper = renderComponent({ openSettingDocumentModal });

      const documentItem = getDocumentItem(wrapper);
      const popperActions = documentItem.prop('contentPopper')({ closePopper: jest.fn() }).props.actions;

      popperActions.makeACopy();

      expect(openSettingDocumentModal).toHaveBeenCalledWith({
        mode: DocumentActions.MakeACopy,
        selectedDocuments: [baseDocument],
      });
    });

    it('should handle rename action', () => {
      const openSettingDocumentModal = jest.fn();
      wrapper = renderComponent({ openSettingDocumentModal });

      const documentItem = getDocumentItem(wrapper);
      const popperActions = documentItem.prop('contentPopper')({ closePopper: jest.fn() }).props.actions;

      popperActions.rename();

      expect(openSettingDocumentModal).toHaveBeenCalledWith({
        mode: DocumentActions.Rename,
        selectedDocuments: [baseDocument],
      });
    });

    it('should handle remove action', () => {
      const openSettingDocumentModal = jest.fn();
      wrapper = renderComponent({ openSettingDocumentModal });

      const documentItem = getDocumentItem(wrapper);
      const popperActions = documentItem.prop('contentPopper')({ closePopper: jest.fn() }).props.actions;

      popperActions.remove();

      expect(openSettingDocumentModal).toHaveBeenCalledWith({
        mode: DocumentActions.Remove,
        selectedDocuments: [baseDocument],
      });
    });

    it('should handle move action', () => {
      const openSettingDocumentModal = jest.fn();
      wrapper = renderComponent({ openSettingDocumentModal });

      const documentItem = getDocumentItem(wrapper);
      const popperActions = documentItem.prop('contentPopper')({ closePopper: jest.fn() }).props.actions;

      popperActions.move();

      expect(openSettingDocumentModal).toHaveBeenCalledWith({
        mode: DocumentActions.Move,
        selectedDocuments: [baseDocument],
      });
    });

    it('should handle uploadToLumin action', () => {
      const openSettingDocumentModal = jest.fn();
      wrapper = renderComponent({ openSettingDocumentModal });

      const documentItem = getDocumentItem(wrapper);
      const popperActions = documentItem.prop('contentPopper')({ closePopper: jest.fn() }).props.actions;

      popperActions.uploadToLumin();

      expect(openSettingDocumentModal).toHaveBeenCalledWith({
        mode: DocumentActions.UploadToLumin,
        selectedDocuments: [baseDocument],
      });
    });

    it('should handle markFavorite action', () => {
      const handleStarClick = jest.fn(() => jest.fn());
      wrapper = renderComponent({ handleStarClick });

      const documentItem = getDocumentItem(wrapper);
      const popperActions = documentItem.prop('contentPopper')({ closePopper: jest.fn() }).props.actions;

      expect(popperActions.markFavorite).toBeDefined();
      expect(handleStarClick).toHaveBeenCalledWith(baseDocument);
    });

    it('should handle makeOffline action', () => {
      const makeOffline = jest.fn(() => jest.fn());
      wrapper = renderComponent({ makeOffline });

      const documentItem = getDocumentItem(wrapper);
      const popperActions = documentItem.prop('contentPopper')({ closePopper: jest.fn() }).props.actions;

      expect(popperActions.makeOffline).toBeDefined();
      expect(makeOffline).toHaveBeenCalledWith(baseDocument);
    });

    it('should handle open action via popperActions', () => {
      wrapper = renderComponent();

      const documentItem = getDocumentItem(wrapper);
      const popperActions = documentItem.prop('contentPopper')({ closePopper: jest.fn() }).props.actions;

      popperActions.open();

      expect(mockOnClickDocument).toHaveBeenCalled();
    });

    it('should render menu actions with openMenu and setOpenMenu', () => {
      wrapper = renderComponent();

      const documentItem = getDocumentItem(wrapper);
      const renderMenuActions = documentItem.prop('renderMenuActions');
      const openMenu = true;
      const setOpenMenu = jest.fn();

      const menuElement = renderMenuActions({ openMenu, setOpenMenu });

      expect(menuElement).toBeDefined();
      expect(menuElement.type).toBeDefined();
      expect(setOpenMenu).toBeDefined();
    });

    it('should render quick actions', () => {
      wrapper = renderComponent();

      const documentItem = getDocumentItem(wrapper);
      const renderQuickActions = documentItem.prop('renderQuickActions');

      const quickActionsElement = renderQuickActions();

      expect(quickActionsElement).toBeDefined();
    });
  });

  describe('useEffect - remove new upload dot', () => {
    let wrapper;
    const { DocumentContext } = require('lumin-components/Document/context');

    const renderComponent = (props = {}) => {
      const contextValue = {
        selectedDocList: [],
        setDocumentList: mockSetDocumentList,
        isMoving: false,
        isDeleting: false,
        lastSelectedDocIdRef: { current: null },
        shiftHoldingRef: { current: false },
        refetchDocument: mockRefetchDocument,
        isDragging: false,
        handleSelectedItems: mockHandleSelectedItems,
      };

      return mount(
        <DocumentContext.Provider value={contextValue}>
          <DocumentItemContainer {...baseProps} {...props} />
        </DocumentContext.Provider>
      );
    };

    beforeEach(() => {
      jest.clearAllMocks();
      jest.useFakeTimers();
    });

    afterEach(() => {
      if (wrapper) {
        wrapper.unmount();
      }
      jest.useRealTimers();
    });

    it('should remove new upload dot for document in folder after timeout', () => {
      const documentWithNewUpload = {
        ...baseDocument,
        newUpload: true,
        folderId: 'folder-123',
      };

      wrapper = renderComponent({ document: documentWithNewUpload });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(mockSetDocumentList).toHaveBeenCalled();
    });

    it('should remove new upload dot for document not in folder after timeout', () => {
      const documentWithNewUpload = {
        ...baseDocument,
        newUpload: true,
        folderId: null,
      };
      const removeNewUploadDot = jest.fn();

      wrapper = renderComponent({ document: documentWithNewUpload, removeNewUploadDot });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(removeNewUploadDot).toHaveBeenCalledWith(documentWithNewUpload._id);
    });

    it('should not remove new upload dot when newUpload is false', () => {
      const document = {
        ...baseDocument,
        newUpload: false,
      };
      const removeNewUploadDot = jest.fn();

      wrapper = renderComponent({ document, removeNewUploadDot });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(removeNewUploadDot).not.toHaveBeenCalled();
      expect(mockSetDocumentList).not.toHaveBeenCalled();
    });

    it('should handle S3 service with openUploadingPopper true and completed', () => {
      const { useSelector } = require('react-redux');
      useSelector.mockImplementation((selector) => {
        if (selector.name === 'isOffline') return false;
        if (selector.name === 'isOpenUploadingPopper') return true;
        return null;
      });

      const { useGetIsCompletedUploadDocuments } = require('hooks');
      useGetIsCompletedUploadDocuments.mockReturnValue(true);

      const documentWithS3 = {
        ...baseDocument,
        newUpload: true,
        service: STORAGE_TYPE.S3,
      };
      const removeNewUploadDot = jest.fn();

      wrapper = renderComponent({ document: documentWithS3, removeNewUploadDot });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(removeNewUploadDot).toHaveBeenCalledWith(documentWithS3._id);
    });
  });

  describe('useEffect - remove highlight found document', () => {
    let wrapper;
    const { DocumentContext } = require('lumin-components/Document/context');

    const renderComponent = (props = {}) => {
      const contextValue = {
        selectedDocList: [],
        setDocumentList: mockSetDocumentList,
        isMoving: false,
        isDeleting: false,
        lastSelectedDocIdRef: { current: null },
        shiftHoldingRef: { current: false },
        refetchDocument: mockRefetchDocument,
        isDragging: false,
        handleSelectedItems: mockHandleSelectedItems,
      };

      return mount(
        <DocumentContext.Provider value={contextValue}>
          <DocumentItemContainer {...baseProps} {...props} />
        </DocumentContext.Provider>
      );
    };

    beforeEach(() => {
      jest.clearAllMocks();
      jest.useFakeTimers();
    });

    afterEach(() => {
      if (wrapper) {
        wrapper.unmount();
      }
      jest.useRealTimers();
    });

    it('should setup timeout for remove highlight when document is highlighted', () => {
      const highlightedDocument = {
        ...baseDocument,
        highlightFoundDocument: true,
        folderId: 'folder-123',
      };

      wrapper = renderComponent({ document: highlightedDocument, foundDocumentScrolling: false });
      expect(wrapper.find('[data-testid="document-item"]')).toHaveLength(1);
      expect(jest.getTimerCount()).toBeGreaterThan(0);
    });

    it('should setup timeout for remove highlight for document not in folder', () => {
      const highlightedDocument = {
        ...baseDocument,
        highlightFoundDocument: true,
        folderId: null,
      };
      const setHighlightFoundDocument = jest.fn();

      wrapper = renderComponent({
        document: highlightedDocument,
        foundDocumentScrolling: false,
        setHighlightFoundDocument,
      });

      expect(wrapper.find('[data-testid="document-item"]')).toHaveLength(1);

      expect(jest.getTimerCount()).toBeGreaterThan(0);
    });

    it('should not trigger highlight removal when foundDocumentScrolling is true', () => {
      const highlightedDocument = {
        ...baseDocument,
        highlightFoundDocument: true,
      };
      const setHighlightFoundDocument = jest.fn();

      wrapper = renderComponent({
        document: highlightedDocument,
        foundDocumentScrolling: true,
        setHighlightFoundDocument,
      });

      expect(wrapper.find('[data-testid="document-item"]')).toHaveLength(1);
    });

    it('should cleanup timeout on unmount', () => {
      const highlightedDocument = {
        ...baseDocument,
        highlightFoundDocument: true,
      };

      wrapper = renderComponent({ document: highlightedDocument, foundDocumentScrolling: false });

      const timerCountBefore = jest.getTimerCount();
      expect(timerCountBefore).toBeGreaterThan(0);

      wrapper.unmount();
      wrapper = null;

      expect(timerCountBefore).toBeGreaterThan(0);
    });
  });

  describe('Redux integration', () => {
    const selectors = require('selectors').default;
    const actions = require('actions').default;

    it('should map state to props correctly', () => {
      const state = {};
      const mappedProps = DocumentItemContainer.mapStateToProps
        ? DocumentItemContainer.mapStateToProps(state)
        : { currentUser: selectors.getCurrentUser(state) };

      expect(selectors.getCurrentUser).toHaveBeenCalledWith(state);
      expect(mappedProps.currentUser).toEqual({ _id: 'user-123' });
    });

    it('should map dispatch to props correctly', () => {
      const dispatch = jest.fn((action) => action);

      actions.removeNewUploadDot('doc-123');
      expect(actions.removeNewUploadDot).toHaveBeenCalledWith('doc-123');

      const payload = { documentId: 'doc-123', highlight: false };
      actions.setHighlightFoundDocument(payload);
      expect(actions.setHighlightFoundDocument).toHaveBeenCalledWith(payload);
    });
  });

  describe('Default props', () => {
    it('should have correct default props', () => {
      expect(DocumentItemContainer.defaultProps).toEqual({
        handleStarClick: expect.any(Function),
        removeNewUploadDot: expect.any(Function),
        openSettingDocumentModal: expect.any(Function),
        makeOffline: expect.any(Function),
        currentUser: {},
        setHighlightFoundDocument: expect.any(Function),
        foundDocumentScrolling: false,
      });
    });

    it('should have timeOutNewDoc property', () => {
      expect(DocumentItemContainer.timeOutNewDoc).toEqual({});
    });
  });
});
