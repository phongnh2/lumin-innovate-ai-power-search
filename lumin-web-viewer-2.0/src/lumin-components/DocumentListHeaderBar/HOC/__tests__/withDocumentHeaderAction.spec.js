import React from 'react';
import { shallow } from 'enzyme';
import { withDocumentHeaderAction } from '../withDocumentHeaderAction';
import { DocumentActions } from 'constants/documentConstants';
import { STATUS_CODE, ModalTypes, CHECKBOX_TYPE } from 'constants/lumin-common';
import { MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION } from 'constants/organizationConstants';

const mockDispatch = jest.fn();
const mockSetIsDeleting = jest.fn();
const mockUseSelector = jest.fn(() => ({}));

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useContext: jest.fn(() => ({
      selectedDocList: [{ _id: 'doc-1' }],
      selectedFolders: [{ _id: 'folder-1' }],
      setIsDeleting: mockSetIsDeleting,
    })),
  };
});

jest.mock('utils/toastUtils', () => ({
  openToastMulti: jest.fn(),
}));

jest.mock('services/documentServices', () => ({
  deleteMultipleDocument: jest.fn(() => Promise.resolve()),
  deleteSharedDocuments: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector) => mockUseSelector(selector),
  shallowEqual: jest.fn(),
  batch: (fn) => fn(),
}));

jest.mock('hooks', () => {
  const { folderType } = require('constants/documentConstants');

  return {
    useDocumentClientId: () => ({ clientId: 'client-1' }),
    useGetFolderType: jest.fn(() => folderType.INDIVIDUAL),
    useTranslation: () => ({ t: (key) => key }),
    useEnableWebReskin: () => ({ isEnableReskin: false }),
  };
});

jest.mock('selectors', () => ({
  __esModule: true,
  default: {
    getCurrentOrganization: jest.fn(() => ({
      data: { _id: 'org-1', totalActiveMember: 5 },
    })),
    getCurrentUser: jest.fn(() => ({ _id: 'user-1' })),
  },
}));

jest.mock('hooks/useDeleteFolder', () => ({
  __esModule: true,
  default: () => ({
    openDeleteModal: jest.fn(),
  }),
}));

jest.mock('utils/Factory/EventCollection/DocActionsEventCollection', () => ({
  __esModule: true,
  default: {
    bulkActions: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('@apollo/client', () => ({
  gql: jest.fn((literals) => literals),
  useSubscription: jest.fn(() => ({})),
  ApolloClient: jest.fn(),
  InMemoryCache: jest.fn(),
  ApolloLink: { from: jest.fn() },
  split: jest.fn(),
  createHttpLink: jest.fn(),
}));

jest.mock('src/apollo/index', () => ({
  __esModule: true,
  client: {},
  link: {},
  cache: {},
}));

jest.mock('services/graphServices/user', () => ({}));
jest.mock('services/userServices', () => ({}));
jest.mock('helpers/createFeatureAPI', () => ({}));
jest.mock('core/disableFeatures', () => ({}));
jest.mock('core/index', () => ({}));

jest.mock('HOC/OfflineStorageHOC', () => ({
  systemFileHandler: {
    delete: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('services/graphServices/folder', () => ({
  deleteMultipleFolder: jest.fn(() => Promise.resolve()),
}));

jest.mock('actions', () => ({
  openModal: jest.fn((settings) => ({ type: 'OPEN_MODAL', payload: settings })),
  updateModalProperties: jest.fn((props) => ({ type: 'UPDATE_MODAL_PROPERTIES', payload: props })),
  closeModal: jest.fn(() => ({ type: 'CLOSE_MODAL' })),
}));

describe('withDocumentHeaderAction', () => {
  const TestComponent = (props) => (
    <div data-testid="test-component">
      <button id="remove" onClick={props.onRemove}>
        Remove
      </button>
      <button id="move" onClick={props.onMove}>
        Move
      </button>
      <button id="merge" onClick={props.onMerge}>
        Merge
      </button>
    </div>
  );

  const defaultProps = {
    setRemoveDocList: jest.fn(),
    setRemoveFolderList: jest.fn(),
    openDocumentModal: jest.fn(),
    setSelectDocMode: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const selectors = require('selectors');
    mockUseSelector.mockImplementation((selector) => {
      if (selector === selectors.default.getCurrentOrganization) {
        return {
          data: { _id: 'org-1', totalActiveMember: 5 },
        };
      }
      if (selector === selectors.default.getCurrentUser) {
        return { _id: 'user-1' };
      }
      return {};
    });
  });

  it('should wrap component', () => {
    const Wrapped = withDocumentHeaderAction(TestComponent);
    expect(Wrapped).toBeDefined();
  });

  it('should render wrapped component', () => {
    const Wrapped = withDocumentHeaderAction(TestComponent);

    const wrapper = shallow(<Wrapped {...defaultProps} />).dive();

    expect(wrapper.find('[data-testid="test-component"]').exists()).toBe(true);
  });

  it('should handle onRemove', () => {
    const Wrapped = withDocumentHeaderAction(TestComponent);

    const wrapper = shallow(<Wrapped {...defaultProps} />).dive();

    wrapper.find('#remove').simulate('click');
    expect(wrapper.exists()).toBe(true);
  });

  it('should handle onMove', () => {
    const Wrapped = withDocumentHeaderAction(TestComponent);

    const wrapper = shallow(<Wrapped {...defaultProps} />).dive();

    wrapper.find('#move').simulate('click');

    expect(defaultProps.openDocumentModal).toHaveBeenCalledWith({
      mode: DocumentActions.Move,
      selectedDocuments: expect.any(Array),
    });
  });

  it('should handle onMerge', () => {
    const Wrapped = withDocumentHeaderAction(TestComponent);

    const wrapper = shallow(<Wrapped {...defaultProps} />).dive();

    wrapper.find('#merge').simulate('click');

    expect(defaultProps.openDocumentModal).toHaveBeenCalledWith({
      mode: DocumentActions.Merge,
      selectedDocuments: expect.any(Array),
    });
  });

  it('should handle subscription callback', () => {
    const { useSubscription } = require('@apollo/client');

    useSubscription.mockImplementation((_, { onSubscriptionData }) => {
      onSubscriptionData({
        subscriptionData: {
          data: {
            deleteOriginalDocument: {
              statusCode: STATUS_CODE.SUCCEED,
              documentList: [{ documentId: 'doc-1' }],
            },
          },
        },
      });
      return {};
    });

    const Wrapped = withDocumentHeaderAction(TestComponent);
    const wrapper = shallow(<Wrapped {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should work with SHARED folder type', () => {
    const hooks = require('hooks');
    const { folderType } = require('constants/documentConstants');

    hooks.useGetFolderType.mockReturnValue(folderType.SHARED);

    const Wrapped = withDocumentHeaderAction(TestComponent);
    const wrapper = shallow(<Wrapped {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should work with DEVICE folder type', () => {
    const hooks = require('hooks');
    const { folderType } = require('constants/documentConstants');

    hooks.useGetFolderType.mockReturnValue(folderType.DEVICE);

    const Wrapped = withDocumentHeaderAction(TestComponent);
    const wrapper = shallow(<Wrapped {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should work with ORGANIZATION folder type', () => {
    const hooks = require('hooks');
    const { folderType } = require('constants/documentConstants');

    hooks.useGetFolderType.mockReturnValue(folderType.ORGANIZATION);

    const Wrapped = withDocumentHeaderAction(TestComponent);
    const wrapper = shallow(<Wrapped {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  describe('subscription callback', () => {
    it('should handle subscription callback with null deleteOriginalDocument', () => {
      const { useSubscription } = require('@apollo/client');
      const React = require('react');

      useSubscription.mockImplementation((_, { onSubscriptionData }) => {
        onSubscriptionData({
          subscriptionData: {
            data: {
              deleteOriginalDocument: null,
            },
          },
        });
        return {};
      });

      const Wrapped = withDocumentHeaderAction(TestComponent);
      const wrapper = shallow(<Wrapped {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
    });

    it('should handle subscription callback with non-success statusCode', () => {
      const { useSubscription } = require('@apollo/client');

      useSubscription.mockImplementation((_, { onSubscriptionData }) => {
        onSubscriptionData({
          subscriptionData: {
            data: {
              deleteOriginalDocument: {
                statusCode: STATUS_CODE.FAILED,
                documentList: [{ documentId: 'doc-1' }],
              },
            },
          },
        });
        return {};
      });

      const Wrapped = withDocumentHeaderAction(TestComponent);
      const wrapper = shallow(<Wrapped {...defaultProps} />);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('onRemoveMultipleDoc', () => {
    it('should delete multiple documents (normal tab)', async () => {
      const toastUtils = require('utils/toastUtils');
      const documentServices = require('services/documentServices');
      const actions = require('actions');
      const React = require('react');

      React.useContext.mockReturnValue({
        selectedDocList: [{ _id: 'doc-1' }, { _id: 'doc-2' }],
        selectedFolders: [],
        setIsDeleting: mockSetIsDeleting,
      });

      const Wrapped = withDocumentHeaderAction(TestComponent);
      const wrapper = shallow(<Wrapped {...defaultProps} />).dive();

      wrapper.find('#remove').simulate('click');

      const modalCall = mockDispatch.mock.calls.find((call) => call[0].type === 'OPEN_MODAL');
      expect(modalCall).toBeDefined();
      const onConfirm = modalCall[0].payload.onConfirm;

      await onConfirm(false);

      expect(documentServices.deleteMultipleDocument).toHaveBeenCalledWith({
        documentIds: ['doc-1', 'doc-2'],
        clientId: 'client-1',
        isNotify: false,
      });

      expect(toastUtils.openToastMulti).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ModalTypes.SUCCESS,
          message: 'modalDeleteDoc.documentsHaveBeenDeleted',
        })
      );
      expect(actions.closeModal).toHaveBeenCalled();
      expect(defaultProps.setRemoveDocList).toHaveBeenCalledWith({
        type: CHECKBOX_TYPE.DELETE,
      });
      expect(mockSetIsDeleting).toHaveBeenCalledWith(false);
    });

    it('should delete multiple documents (shared tab)', async () => {
      const toastUtils = require('utils/toastUtils');
      const documentServices = require('services/documentServices');
      const actions = require('actions');
      const hooks = require('hooks');
      const { folderType } = require('constants/documentConstants');
      const React = require('react');

      hooks.useGetFolderType.mockReturnValue(folderType.SHARED);
      React.useContext.mockReturnValue({
        selectedDocList: [{ _id: 'doc-1' }, { _id: 'doc-2' }],
        selectedFolders: [],
        setIsDeleting: mockSetIsDeleting,
      });

      const Wrapped = withDocumentHeaderAction(TestComponent);
      const wrapper = shallow(<Wrapped {...defaultProps} />).dive();

      wrapper.find('#remove').simulate('click');

      const modalCall = mockDispatch.mock.calls.find((call) => call[0].type === 'OPEN_MODAL');
      const onConfirm = modalCall[0].payload.onConfirm;

      await onConfirm(false);

      expect(documentServices.deleteSharedDocuments).toHaveBeenCalledWith({
        documentIds: ['doc-1', 'doc-2'],
      });

      expect(toastUtils.openToastMulti).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ModalTypes.SUCCESS,
          message: 'modalDeleteDoc.documentsHaveBeenRemoved',
        })
      );
    });

    it('should delete multiple documents (device tab)', async () => {
      const toastUtils = require('utils/toastUtils');
      const systemFileHandler = require('HOC/OfflineStorageHOC').systemFileHandler;
      const actions = require('actions');
      const hooks = require('hooks');
      const { folderType } = require('constants/documentConstants');
      const React = require('react');

      hooks.useGetFolderType.mockReturnValue(folderType.DEVICE);
      React.useContext.mockReturnValue({
        selectedDocList: [
          { _id: 'doc-1', fileHandle: 'handle-1' },
          { _id: 'doc-2', fileHandle: 'handle-2' },
        ],
        selectedFolders: [],
        setIsDeleting: mockSetIsDeleting,
      });

      const Wrapped = withDocumentHeaderAction(TestComponent);
      const wrapper = shallow(<Wrapped {...defaultProps} />).dive();

      wrapper.find('#remove').simulate('click');

      const modalCall = mockDispatch.mock.calls.find((call) => call[0].type === 'OPEN_MODAL');
      const onConfirm = modalCall[0].payload.onConfirm;

      await onConfirm(false);

      expect(systemFileHandler.delete).toHaveBeenCalledTimes(2);
      expect(toastUtils.openToastMulti).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ModalTypes.SUCCESS,
        })
      );
    });

    it('should handle error when deleting multiple documents', async () => {
      const toastUtils = require('utils/toastUtils');
      const documentServices = require('services/documentServices');
      const actions = require('actions');
      const React = require('react');
      const error = new Error('Delete failed');

      React.useContext.mockReturnValue({
        selectedDocList: [{ _id: 'doc-1' }, { _id: 'doc-2' }],
        selectedFolders: [],
        setIsDeleting: mockSetIsDeleting,
      });

      const Wrapped = withDocumentHeaderAction(TestComponent);
      const wrapper = shallow(<Wrapped {...defaultProps} />).dive();

      wrapper.find('#remove').simulate('click');

      const modalCall = mockDispatch.mock.calls.find((call) => call[0].type === 'OPEN_MODAL');
      expect(modalCall).toBeDefined();
      const onConfirm = modalCall[0].payload.onConfirm;

      documentServices.deleteMultipleDocument.mockReset();
      documentServices.deleteMultipleDocument.mockRejectedValue(error);

      await onConfirm(false);

      expect(toastUtils.openToastMulti).toBeCalled();
    });
  });

  describe('onRemoveMultipleFolder', () => {
    it('should delete multiple folders successfully', async () => {
      const toastUtils = require('utils/toastUtils');
      const folderApi = require('services/graphServices/folder');
      const actions = require('actions');
      const React = require('react');

      React.useContext.mockReturnValue({
        selectedDocList: [],
        selectedFolders: [{ _id: 'folder-1' }, { _id: 'folder-2' }],
        setIsDeleting: mockSetIsDeleting,
      });

      const Wrapped = withDocumentHeaderAction(TestComponent);
      const wrapper = shallow(<Wrapped {...defaultProps} />).dive();

      wrapper.find('#remove').simulate('click');

      const modalCall = mockDispatch.mock.calls.find((call) => call[0].type === 'OPEN_MODAL');
      const onConfirm = modalCall[0].payload.onConfirm;

      await onConfirm(true);

      expect(folderApi.deleteMultipleFolder).toHaveBeenCalledWith({
        folderIds: ['folder-1', 'folder-2'],
        clientId: 'client-1',
        isNotify: true,
      });

      expect(toastUtils.openToastMulti).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ModalTypes.SUCCESS,
          message: 'modalFolder.foldersHaveBeenRemoved',
        })
      );
      expect(actions.closeModal).toHaveBeenCalled();
      expect(defaultProps.setRemoveFolderList).toHaveBeenCalledWith({
        type: CHECKBOX_TYPE.DELETE,
      });
      expect(mockSetIsDeleting).toHaveBeenCalledWith(false);
    });

    it('should handle error when deleting multiple folders', async () => {
      const toastUtils = require('utils/toastUtils');
      const folderApi = require('services/graphServices/folder');
      const actions = require('actions');
      const React = require('react');
      const error = new Error('Delete folder failed');

      folderApi.deleteMultipleFolder.mockRejectedValue(error);
      React.useContext.mockReturnValue({
        selectedDocList: [],
        selectedFolders: [{ _id: 'folder-1' }, { _id: 'folder-2' }],
        setIsDeleting: mockSetIsDeleting,
      });

      const Wrapped = withDocumentHeaderAction(TestComponent);
      const wrapper = shallow(<Wrapped {...defaultProps} />).dive();

      wrapper.find('#remove').simulate('click');

      const modalCall = mockDispatch.mock.calls.find((call) => call[0].type === 'OPEN_MODAL');
      expect(modalCall).toBeDefined();
      const onConfirm = modalCall[0].payload.onConfirm;

      await onConfirm(false);

      expect(toastUtils.openToastMulti).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ModalTypes.ERROR,
          error,
        })
      );
      expect(actions.closeModal).toHaveBeenCalled();
      expect(mockSetIsDeleting).toHaveBeenCalledWith(false);
    });
  });

  describe('onRemove with folders', () => {
    it('should open delete modal for single folder', () => {
      const useDeleteFolder = require('hooks/useDeleteFolder');
      const React = require('react');

      const mockOpenDeleteModal = jest.fn();
      useDeleteFolder.default = jest.fn(() => ({
        openDeleteModal: mockOpenDeleteModal,
      }));

      React.useContext.mockReturnValue({
        selectedDocList: [],
        selectedFolders: [{ _id: 'folder-1' }],
        setIsDeleting: mockSetIsDeleting,
      });

      const Wrapped = withDocumentHeaderAction(TestComponent);
      const wrapper = shallow(<Wrapped {...defaultProps} />).dive();

      wrapper.find('#remove').simulate('click');

      expect(mockOpenDeleteModal).toHaveBeenCalled();
    });

    it('should open modal for multiple folders (non-organization)', () => {
      const actions = require('actions');
      const React = require('react');
      const hooks = require('hooks');
      const { folderType } = require('constants/documentConstants');

      hooks.useGetFolderType.mockReturnValue(folderType.INDIVIDUAL);
      React.useContext.mockReturnValue({
        selectedDocList: [],
        selectedFolders: [{ _id: 'folder-1' }, { _id: 'folder-2' }],
        setIsDeleting: mockSetIsDeleting,
      });

      const Wrapped = withDocumentHeaderAction(TestComponent);
      const wrapper = shallow(<Wrapped {...defaultProps} />).dive();

      wrapper.find('#remove').simulate('click');

      const modalCall = mockDispatch.mock.calls.find((call) => call[0].type === 'OPEN_MODAL');
      expect(modalCall).toBeDefined();
      expect(modalCall[0].payload.title).toBe('modalFolder.deleteFolders');
      expect(modalCall[0].payload.checkboxMessage).toBeUndefined();
    });

    it('should open modal for multiple folders (organization, under size limit)', () => {
      const actions = require('actions');
      const selectors = require('selectors');
      const React = require('react');
      const hooks = require('hooks');
      const { folderType } = require('constants/documentConstants');

      hooks.useGetFolderType.mockReturnValue(folderType.ORGANIZATION);
      mockUseSelector.mockImplementation((selector) => {
        if (selector === selectors.default.getCurrentOrganization) {
          return {
            data: { _id: 'org-1', totalActiveMember: 10 },
          };
        }
        if (selector === selectors.default.getCurrentUser) {
          return { _id: 'user-1' };
        }
        return {};
      });
      React.useContext.mockReturnValue({
        selectedDocList: [],
        selectedFolders: [{ _id: 'folder-1' }, { _id: 'folder-2' }],
        setIsDeleting: mockSetIsDeleting,
      });

      const Wrapped = withDocumentHeaderAction(TestComponent);
      const wrapper = shallow(<Wrapped {...defaultProps} />).dive();

      wrapper.find('#remove').simulate('click');

      const modalCall = mockDispatch.mock.calls.find((call) => call[0].type === 'OPEN_MODAL');
      expect(modalCall[0].payload.checkboxMessage).toBe('modalDeleteDoc.notifyEveryoneThisAction');
    });

    it('should open modal for multiple folders (organization, over size limit)', () => {
      const actions = require('actions');
      const selectors = require('selectors');
      const React = require('react');
      const hooks = require('hooks');
      const { folderType } = require('constants/documentConstants');

      hooks.useGetFolderType.mockReturnValue(folderType.ORGANIZATION);
      mockUseSelector.mockImplementation((selector) => {
        if (selector === selectors.default.getCurrentOrganization) {
          return {
            data: { _id: 'org-1', totalActiveMember: MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION + 1 },
          };
        }
        if (selector === selectors.default.getCurrentUser) {
          return { _id: 'user-1' };
        }
        return {};
      });
      React.useContext.mockReturnValue({
        selectedDocList: [],
        selectedFolders: [{ _id: 'folder-1' }, { _id: 'folder-2' }],
        setIsDeleting: mockSetIsDeleting,
      });

      const Wrapped = withDocumentHeaderAction(TestComponent);
      const wrapper = shallow(<Wrapped {...defaultProps} />).dive();

      wrapper.find('#remove').simulate('click');

      const modalCall = mockDispatch.mock.calls.find((call) => call[0].type === 'OPEN_MODAL');
      expect(modalCall[0].payload.checkboxMessage).toBe('modalDeleteDoc.notifyAdminThisAction');
    });
  });

  describe('onRemove with documents', () => {
    it('should open document modal for single document', () => {
      const React = require('react');

      React.useContext.mockReturnValue({
        selectedDocList: [{ _id: 'doc-1' }],
        selectedFolders: [],
        setIsDeleting: mockSetIsDeleting,
      });

      const Wrapped = withDocumentHeaderAction(TestComponent);
      const wrapper = shallow(<Wrapped {...defaultProps} />).dive();

      wrapper.find('#remove').simulate('click');

      expect(defaultProps.openDocumentModal).toHaveBeenCalledWith({
        mode: DocumentActions.Remove,
        selectedDocuments: [{ _id: 'doc-1' }],
      });
    });

    it('should open modal for multiple documents (shared tab)', () => {
      const actions = require('actions');
      const React = require('react');
      const hooks = require('hooks');
      const { folderType } = require('constants/documentConstants');

      hooks.useGetFolderType.mockReturnValue(folderType.SHARED);
      React.useContext.mockReturnValue({
        selectedDocList: [{ _id: 'doc-1' }, { _id: 'doc-2' }],
        selectedFolders: [],
        setIsDeleting: mockSetIsDeleting,
      });

      const Wrapped = withDocumentHeaderAction(TestComponent);
      const wrapper = shallow(<Wrapped {...defaultProps} />).dive();

      wrapper.find('#remove').simulate('click');

      const modalCall = mockDispatch.mock.calls.find((call) => call[0].type === 'OPEN_MODAL');
      expect(modalCall[0].payload.title).toBe('modalDeleteDoc.removeTheseDocuments');
      expect(modalCall[0].payload.message).toBe('modalDeleteDoc.deleteSharedDocumentsDesc');
      expect(modalCall[0].payload.confirmButtonTitle).toBe('common.remove');
    });

    it('should open modal for multiple documents (individual tab)', () => {
      const actions = require('actions');
      const React = require('react');
      const hooks = require('hooks');
      const { folderType } = require('constants/documentConstants');

      hooks.useGetFolderType.mockReturnValue(folderType.INDIVIDUAL);
      React.useContext.mockReturnValue({
        selectedDocList: [{ _id: 'doc-1' }, { _id: 'doc-2' }],
        selectedFolders: [],
        setIsDeleting: mockSetIsDeleting,
      });

      const Wrapped = withDocumentHeaderAction(TestComponent);
      const wrapper = shallow(<Wrapped {...defaultProps} />).dive();

      wrapper.find('#remove').simulate('click');

      const modalCall = mockDispatch.mock.calls.find((call) => call[0].type === 'OPEN_MODAL');
      expect(modalCall[0].payload.title).toBe('modalDeleteDoc.deleteTheseDocuments');
      expect(modalCall[0].payload.message).toBeDefined();
      expect(modalCall[0].payload.confirmButtonTitle).toBe('common.delete');
    });

    it('should open modal for multiple documents (other tab)', () => {
      const actions = require('actions');
      const React = require('react');
      const hooks = require('hooks');
      const { folderType } = require('constants/documentConstants');

      hooks.useGetFolderType.mockReturnValue(folderType.DEVICE);
      React.useContext.mockReturnValue({
        selectedDocList: [{ _id: 'doc-1' }, { _id: 'doc-2' }],
        selectedFolders: [],
        setIsDeleting: mockSetIsDeleting,
      });

      const Wrapped = withDocumentHeaderAction(TestComponent);
      const wrapper = shallow(<Wrapped {...defaultProps} />).dive();

      wrapper.find('#remove').simulate('click');

      const modalCall = mockDispatch.mock.calls.find((call) => call[0].type === 'OPEN_MODAL');
      expect(modalCall[0].payload.message).toBe('modalDeleteDoc.deleteDocumentsDesc');
    });

    it('should open modal for multiple documents (organization, under size limit)', () => {
      const actions = require('actions');
      const selectors = require('selectors');
      const React = require('react');
      const hooks = require('hooks');
      const { folderType } = require('constants/documentConstants');

      hooks.useGetFolderType.mockReturnValue(folderType.ORGANIZATION);
      mockUseSelector.mockImplementation((selector) => {
        if (selector === selectors.default.getCurrentOrganization) {
          return {
            data: { _id: 'org-1', totalActiveMember: 10 },
          };
        }
        if (selector === selectors.default.getCurrentUser) {
          return { _id: 'user-1' };
        }
        return {};
      });
      React.useContext.mockReturnValue({
        selectedDocList: [{ _id: 'doc-1' }, { _id: 'doc-2' }],
        selectedFolders: [],
        setIsDeleting: mockSetIsDeleting,
      });

      const Wrapped = withDocumentHeaderAction(TestComponent);
      const wrapper = shallow(<Wrapped {...defaultProps} />).dive();

      wrapper.find('#remove').simulate('click');

      const modalCall = mockDispatch.mock.calls.find((call) => call[0].type === 'OPEN_MODAL');
      expect(modalCall[0].payload.checkboxMessage).toBe('modalDeleteDoc.notifyEveryoneThisAction');
    });

    it('should open modal for multiple documents (organization, over size limit)', () => {
      const actions = require('actions');
      const selectors = require('selectors');
      const React = require('react');
      const hooks = require('hooks');
      const { folderType } = require('constants/documentConstants');

      hooks.useGetFolderType.mockReturnValue(folderType.ORGANIZATION);
      mockUseSelector.mockImplementation((selector) => {
        if (selector === selectors.default.getCurrentOrganization) {
          return {
            data: { _id: 'org-1', totalActiveMember: MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION + 1 },
          };
        }
        if (selector === selectors.default.getCurrentUser) {
          return { _id: 'user-1' };
        }
        return {};
      });
      React.useContext.mockReturnValue({
        selectedDocList: [{ _id: 'doc-1' }, { _id: 'doc-2' }],
        selectedFolders: [],
        setIsDeleting: mockSetIsDeleting,
      });

      const Wrapped = withDocumentHeaderAction(TestComponent);
      const wrapper = shallow(<Wrapped {...defaultProps} />).dive();

      wrapper.find('#remove').simulate('click');

      const modalCall = mockDispatch.mock.calls.find((call) => call[0].type === 'OPEN_MODAL');
      expect(modalCall[0].payload.checkboxMessage).toBe('modalDeleteDoc.notifyAdminThisAction');
    });
  });
});
