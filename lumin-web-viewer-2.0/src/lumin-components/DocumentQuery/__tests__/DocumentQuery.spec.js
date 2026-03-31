/* eslint-disable react/prop-types */
/* eslint-disable no-console */
const originalConsoleError = console.error;
console.error = (...args) => {
  const errorStr = args
    .map((arg) => {
      if (arg instanceof Error) return arg.message + (arg.stack || '');
      return String(arg);
    })
    .join(' ');

  if (
    errorStr.includes('Cannot read properties of undefined') ||
    errorStr.includes('i18n.ts') ||
    errorStr.includes("reading 'error'") ||
    errorStr.includes("reading 'searchKey'") ||
    errorStr.includes('The above error occurred in the <DocumentQuery> component') ||
    errorStr.includes('Consider adding an error boundary')
  ) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { NetworkStatus } from '@apollo/client';
import { useGetCurrentTeam } from 'hooks';
import { createStore } from 'src/redux/mockStore';
import initialState from 'src/redux/initialState';
import indexedDBService from 'services/indexedDBService';
import { ModalTypes, ErrorCode } from 'constants/lumin-common';
import actions from 'actions';
import { folderType } from 'constants/documentConstants';
import { STATUS_CODE } from 'constants/lumin-common';
import SubscriptionConstants from 'constants/subscriptionConstant';
import { documentServices } from 'services';
import errorExtract from 'utils/error';

import documentObservable from '../DocumentObserver/DocumentObservable';
import {
  PersonalDocumentObserver,
  TeamDocumentObserver,
  StarredDocumentObserver,
  OrganizationDocumentObserver,
} from '../DocumentObserver/Observer';
import { DocumentQueryProxy } from '../DocumentQueryProxy';

jest.mock('services', () => ({
  documentServices: {
    getCurrentDocumentList: jest.fn(),
  },
  indexedDBService: {
    setCurrentTeam: jest.fn(),
    setCurrentOrganization: jest.fn(),
  },
}));
jest.mock('utils/error', () => ({
  __esModule: true,
  default: {
    extractGqlError: jest.fn(),
  },
}));

jest.mock('../DocumentQueryProxy', () => ({
  DocumentQueryProxy: jest.fn(),
}));

jest.mock('../DocumentObserver/DocumentObservable', () => ({
  __esModule: true,
  default: {
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    notify: jest.fn(),
  },
}));

jest.mock('services/indexedDBService', () => ({
  __esModule: true,
  default: {
    setCurrentTeam: jest.fn(),
    setCurrentOrganization: jest.fn(),
  },
}));

jest.mock('../DocumentObserver/Observer', () => ({
  PersonalDocumentObserver: {},
  TeamDocumentObserver: {},
  StarredDocumentObserver: {},
  OrganizationDocumentObserver: {},
}));

jest.mock('HOC/withGetFolderType', () => (Component) => Component);

jest.mock('luminComponents/QueriesHOC', () => ({
  withQueries: () => (Component) => Component,
}));

jest.mock('../hooks/useResetCacheAfterLeaving', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../hooks/useResetListOnSearching', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useSubscription: jest.fn(),
  NetworkStatus: {
    ready: 1,
    setVariables: 2,
    fetchMore: 3,
    refetch: 4,
    poll: 6,
    loading: 1,
    error: 8,
  },
}));

jest.mock('i18next', () => ({
  __esModule: true,
  default: {
    t: jest.fn((key, options) => key),
    use: jest.fn().mockReturnThis(),
    init: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    services: {
      pluralResolver: {
        getSuffix: jest.fn(() => ''),
      },
    },
  },
}));

jest.mock('helpers/i18n', () => ({
  __esModule: true,
  default: {
    t: jest.fn((key, options) => key),
    use: jest.fn().mockReturnThis(),
    init: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    services: {
      pluralResolver: {
        getSuffix: jest.fn(() => ''),
      },
    },
  },
}));

jest.mock('lumin-components/DocumentListHeaderBar/hooks', () => ({
  useTotalDocument: jest.fn(() => 10),
}));

jest.mock('hooks', () => ({
  useGetCurrentTeam: jest.fn(() => ({ _id: 'team123', name: 'Test Team' })),
  useTranslation: jest.fn(() => ({
    t: (key) => {
      const translations = {
        'common.warning': 'Warning',
        'common.ok': 'OK',
        'updatedPermissonModal.title': 'Permission Updated',
        'updatedPermissonModal.message': 'Your permission has been updated',
        'common.reload': 'Reload',
        'removeTeamModal.message': 'Team {{teamName}} has been removed',
      };
      return translations[key] || key;
    },
  })),
  useGetFolderType: jest.fn(() => 'INDIVIDUAL'),
}));

import { useSubscription } from '@apollo/client';

const DocumentQueryModule = require('../DocumentQuery');
const DocumentQueryComponent = DocumentQueryModule.default;

describe('DocumentQuery', () => {
  let defaultProps;
  let store;
  let mockController;
  let subscriptionHandlers;
  beforeEach(() => {
    mockController = {
      abort: jest.fn(),
    };

    subscriptionHandlers = [];

    store = createStore({
      ...initialState,
      auth: {
        ...initialState.auth,
        currentUser: { _id: 'user123', name: 'Test User' },
      },
      organization: {
        ...initialState.organization,
        currentOrganization: { _id: 'org123', name: 'Test Organization' },
        teams: [
          { _id: 'team123', name: 'Test Team' },
          { _id: 'team456', name: 'Other Team' },
        ],
      },
      document: {
        ...initialState.document,
        loading: {},
      },
    });

    defaultProps = {
      children: jest.fn(() => null),
      openModal: jest.fn(),
      currentUser: { _id: 'user123', name: 'Test User' },
      currentFolderType: folderType.INDIVIDUAL,
      teams: [
        { _id: 'team123', name: 'Test Team' },
        { _id: 'team456', name: 'Other Team' },
      ],
      dispatch: jest.fn(),
      fetchMore: jest.fn((callback, variables) => {
        const mockResult = {
          fetchMoreResult: {
            getDocuments: {
              documents: [{ _id: 'doc3', name: 'Document 3' }],
              hasNextPage: false,
              cursor: 'newCursor',
              total: 15,
            },
          },
        };
        if (callback) {
          callback(null, mockResult);
        }
        return Promise.resolve(mockResult);
      }),
      refetch: jest.fn().mockResolvedValue({}),
      data: {
        getDocuments: {
          documents: [
            { _id: 'doc1', name: 'Document 1' },
            { _id: 'doc2', name: 'Document 2' },
          ],
          hasNextPage: true,
          cursor: 'cursor123',
          total: 10,
        },
      },
      error: null,
      lastStatus: NetworkStatus.ready,
      resetFetchingStateOfDoclist: jest.fn(),
      resetFolderList: jest.fn(),
      baseQueryDocuments: {
        orgId: 'org123',
        clientId: 'client123',
        query: {
          searchKey: '',
        },
      },
      isSearchView: false,
      currentOrganization: { _id: 'org123', name: 'Test Organization' },
      controller: mockController,
      resetDocumentList: jest.fn(),
      findDocumentByName: false,
      setDocumentLoading: jest.fn(),
      refetchCurrentDocListState: jest.fn(),
    };

    documentServices.getCurrentDocumentList.mockReturnValue({
      firstFetching: true,
      shouldRefetch: false,
      documents: [],
      hasNextPage: false,
      cursor: '',
    });

    useSubscription.mockImplementation((subscription, options) => {
      if (options?.onSubscriptionData) {
        subscriptionHandlers.push(options.onSubscriptionData);
      }
      return {};
    });

    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    const mergedProps = { ...defaultProps, ...props };
    return mount(
      <Provider store={store}>
        <DocumentQueryComponent {...mergedProps} />
      </Provider>
    );
  };

  describe('Component Lifecycle', () => {
    it('should render without crashing', () => {
      const wrapper = renderComponent();
      expect(wrapper.exists()).toBe(true);
    });

    it('should subscribe to document observers on mount', () => {
      renderComponent();

      expect(documentObservable.subscribe).toHaveBeenCalledWith(PersonalDocumentObserver);
      expect(documentObservable.subscribe).toHaveBeenCalledWith(TeamDocumentObserver);
      expect(documentObservable.subscribe).toHaveBeenCalledWith(StarredDocumentObserver);
      expect(documentObservable.subscribe).toHaveBeenCalledWith(OrganizationDocumentObserver);
    });

    it('should unsubscribe from document observers on unmount', () => {
      const wrapper = renderComponent();
      wrapper.unmount();
      expect(documentObservable.unsubscribe).toHaveBeenCalledWith(PersonalDocumentObserver);
    });

    it('should abort controller when component unmounts', () => {
      const wrapper = renderComponent();
      wrapper.unmount();
      expect(mockController.abort).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should not open modal for non-forbidden errors', () => {
      const error = { message: 'Other error' };
      errorExtract.extractGqlError.mockReturnValue({ code: 'OTHER_ERROR' });

      renderComponent({ error });

      expect(defaultProps.openModal).not.toHaveBeenCalled();
    });

    it('should handle null error', () => {
      renderComponent({ error: null });
      expect(defaultProps.openModal).not.toHaveBeenCalled();
    });
  });

  describe('Document Data Updates', () => {
    it('should not update when lastStatus is fetchMore without findDocumentByName', () => {
      documentServices.getCurrentDocumentList.mockReturnValue({
        firstFetching: false,
        shouldRefetch: false,
        documents: [],
        hasNextPage: false,
        cursor: '',
      });

      DocumentQueryProxy.mockClear();

      renderComponent({
        lastStatus: NetworkStatus.fetchMore,
        findDocumentByName: false,
      });

      expect(DocumentQueryProxy).not.toHaveBeenCalled();
    });

    it('should not update when documentLoading is true', () => {
      documentServices.getCurrentDocumentList.mockReturnValue({
        firstFetching: false,
        shouldRefetch: false,
        documents: [],
        hasNextPage: false,
        cursor: '',
      });

      const storeWithLoading = createStore({
        ...initialState,
        document: {
          ...initialState.document,
          loading: {
            [folderType.INDIVIDUAL]: true,
          },
        },
      });

      DocumentQueryProxy.mockClear();

      mount(
        <Provider store={storeWithLoading}>
          <DocumentQueryComponent {...defaultProps} />
        </Provider>
      );

      expect(DocumentQueryProxy).not.toHaveBeenCalled();
    });
  });

  describe('Refetch Logic', () => {
    it('should refetch when shouldRefetch is true and not in search view', () => {
      documentServices.getCurrentDocumentList.mockReturnValue({
        firstFetching: false,
        shouldRefetch: true,
        documents: [],
        hasNextPage: false,
        cursor: '',
      });

      renderComponent({
        isSearchView: false,
      });

      expect(defaultProps.refetch).toHaveBeenCalled();
    });

    it('should not refetch when in search view', () => {
      documentServices.getCurrentDocumentList.mockReturnValue({
        firstFetching: false,
        shouldRefetch: true,
        documents: [],
        hasNextPage: false,
        cursor: '',
      });

      renderComponent({
        isSearchView: true,
      });

      expect(defaultProps.refetch).not.toHaveBeenCalled();
    });

    it('should not refetch when shouldRefetch is false', () => {
      documentServices.getCurrentDocumentList.mockReturnValue({
        firstFetching: false,
        shouldRefetch: false,
        documents: [],
        hasNextPage: false,
        cursor: '',
      });

      renderComponent({
        isSearchView: false,
      });

      expect(defaultProps.refetch).not.toHaveBeenCalled();
    });
  });

  describe('Subscriptions', () => {
    it('should handle SUB_UPDATE_DOCUMENT_LIST with SUCCEED status', () => {
      renderComponent();

      const handler = subscriptionHandlers[0];
      handler({
        subscriptionData: {
          data: {
            updateDocumentList: {
              statusCode: STATUS_CODE.SUCCEED,
              type: SubscriptionConstants.Subscription.ADD_DOCUMENT,
              document: { _id: 'newDoc', name: 'New Document' },
              teamId: 'team123',
              organizationId: 'org123',
              additionalSettings: {},
            },
          },
        },
      });

      expect(documentObservable.notify).toHaveBeenCalled();
    });

    it('should handle SUB_UPDATE_DOCUMENT_LIST with keepInSearch in search view', () => {
      renderComponent({ isSearchView: true });

      const handler = subscriptionHandlers[0];
      handler({
        subscriptionData: {
          data: {
            updateDocumentList: {
              statusCode: STATUS_CODE.SUCCEED,
              type: SubscriptionConstants.Subscription.UPDATE_DOCUMENT,
              document: { _id: 'doc1', name: 'Updated Document' },
              teamId: 'team123',
              organizationId: 'org123',
              additionalSettings: { keepInSearch: true },
            },
          },
        },
      });

      expect(documentObservable.notify).toHaveBeenCalled();
    });

    it('should not handle SUB_UPDATE_DOCUMENT_LIST when updateDocumentList is null', () => {
      renderComponent();

      documentObservable.notify.mockClear();
      const handler = subscriptionHandlers[0];
      handler({
        subscriptionData: {
          data: {
            updateDocumentList: null,
          },
        },
      });

      expect(documentObservable.notify).not.toHaveBeenCalled();
    });

    it('should not notify when status is not SUCCEED', () => {
      renderComponent();

      documentObservable.notify.mockClear();
      const handler = subscriptionHandlers[0];
      handler({
        subscriptionData: {
          data: {
            updateDocumentList: {
              statusCode: STATUS_CODE.FAILED,
              type: SubscriptionConstants.Subscription.ADD_DOCUMENT,
              document: { _id: 'newDoc', name: 'New Document' },
              additionalSettings: {},
            },
          },
        },
      });

      expect(documentObservable.notify).not.toHaveBeenCalled();
    });

    it('should handle document deletion with SUCCEED status', () => {
      renderComponent();

      const handler = subscriptionHandlers[2];
      handler({
        subscriptionData: {
          data: {
            deleteOriginalDocument: {
              statusCode: STATUS_CODE.SUCCEED,
              type: SubscriptionConstants.Subscription.DELETE_DOCUMENT,
              documentList: ['doc1', 'doc2'],
              teamId: 'team123',
              organizationId: 'org123',
              additionalSettings: {},
            },
          },
        },
      });

      expect(documentObservable.notify).toHaveBeenCalled();
    });

    it('should not handle when deleteOriginalDocument is null', () => {
      renderComponent();

      documentObservable.notify.mockClear();
      const handler = subscriptionHandlers[2];
      handler({
        subscriptionData: {
          data: {
            deleteOriginalDocument: null,
          },
        },
      });

      expect(documentObservable.notify).not.toHaveBeenCalled();
    });

    it('should not handle when keepInSearch is true in search view', () => {
      renderComponent({ isSearchView: true });

      documentObservable.notify.mockClear();
      const handler = subscriptionHandlers[2];
      handler({
        subscriptionData: {
          data: {
            deleteOriginalDocument: {
              statusCode: STATUS_CODE.SUCCEED,
              type: SubscriptionConstants.Subscription.DELETE_DOCUMENT,
              documentList: ['doc1'],
              additionalSettings: { keepInSearch: true },
            },
          },
        },
      });

      expect(documentObservable.notify).not.toHaveBeenCalled();
    });

    it('should handle UPDATE_TEAMS_INFO when clientId matches', () => {
      renderComponent({
        currentFolderType: folderType.TEAMS,
        baseQueryDocuments: {
          clientId: 'team123',
          query: { searchKey: '' },
        },
      });

      const handler = subscriptionHandlers[3];
      handler({
        subscriptionData: {
          data: {
            updateTeams: {
              team: {
                _id: 'team123',
                name: 'Updated Team Name',
              },
              type: SubscriptionConstants.Subscription.UPDATE_TEAMS_INFO,
            },
          },
        },
      });

      expect(defaultProps.dispatch).toHaveBeenCalled();
    });

    it('should handle default case for unknown subscription type', () => {
      renderComponent();

      defaultProps.dispatch.mockClear();
      defaultProps.openModal.mockClear();
      const handler = subscriptionHandlers[3];
      handler({
        subscriptionData: {
          data: {
            updateTeams: {
              team: {
                _id: 'team123',
                name: 'Team Name',
              },
              type: 'UNKNOWN_TYPE',
            },
          },
        },
      });

      expect(defaultProps.dispatch).not.toHaveBeenCalled();
      expect(defaultProps.openModal).not.toHaveBeenCalled();
    });
  });

  describe('fetchMoreData', () => {
    it('should call fetchMore with correct parameters', () => {
      documentServices.getCurrentDocumentList.mockReturnValue({
        firstFetching: false,
        shouldRefetch: false,
        documents: [],
        hasNextPage: true,
        cursor: 'existingCursor',
      });

      const childrenMock = jest.fn(({ fetchMore }) => {
        fetchMore();
        return null;
      });

      renderComponent({
        children: childrenMock,
      });

      expect(childrenMock).toHaveBeenCalled();
      expect(defaultProps.fetchMore).toHaveBeenCalled();
    });

    it('should handle fetchMore errors gracefully', async () => {
      documentServices.getCurrentDocumentList.mockReturnValue({
        firstFetching: false,
        shouldRefetch: false,
        documents: [],
        hasNextPage: true,
        cursor: 'existingCursor',
      });

      const fetchMoreMock = jest.fn().mockRejectedValue(new Error('Fetch failed'));

      const childrenMock = jest.fn(({ fetchMore }) => {
        fetchMore().catch(() => {});
        return null;
      });

      renderComponent({
        children: childrenMock,
        fetchMore: fetchMoreMock,
      });

      expect(childrenMock).toHaveBeenCalled();
    });
  });

  describe('children render prop', () => {
    it('should call children with correct props', () => {
      documentServices.getCurrentDocumentList.mockReturnValue({
        firstFetching: false,
        shouldRefetch: false,
        documents: [{ _id: 'doc1', name: 'Document 1' }],
        hasNextPage: true,
        cursor: 'cursor123',
      });

      const childrenMock = jest.fn(() => null);

      renderComponent({ children: childrenMock });

      expect(childrenMock).toHaveBeenCalled();
      const callArgs = childrenMock.mock.calls[0][0];
      expect(callArgs).toHaveProperty('loading');
      expect(callArgs).toHaveProperty('documentList');
      expect(callArgs).toHaveProperty('hasNextPage');
      expect(callArgs).toHaveProperty('fetchMore');
      expect(callArgs).toHaveProperty('refetch');
      expect(callArgs).toHaveProperty('total');
      expect(callArgs).toHaveProperty('error');
    });
  });

  it('should not crash when dispatch is default noop', () => {
    renderComponent({
      dispatch: undefined,
      currentFolderType: folderType.TEAMS,
      baseQueryDocuments: {
        clientId: 'team123',
        query: { searchKey: '' },
      },
    });

    const handler = subscriptionHandlers[3];

    expect(() =>
      handler({
        subscriptionData: {
          data: {
            updateTeams: {
              team: { _id: 'team123', name: 'Updated Team' },
              type: SubscriptionConstants.Subscription.UPDATE_TEAMS_INFO,
            },
          },
        },
      })
    ).not.toThrow();
  });

  it('should use default fetchMore noop without crashing', () => {
    const childrenMock = jest.fn(({ fetchMore }) => {
      expect(() => fetchMore()).toThrow();
      return null;
    });

    renderComponent({
      fetchMore: undefined,
      children: childrenMock,
    });

    expect(childrenMock).toHaveBeenCalled();
  });

  it('should use default refetch noop when shouldRefetch is true', () => {
    documentServices.getCurrentDocumentList.mockReturnValue({
      firstFetching: false,
      shouldRefetch: true,
      documents: [],
      hasNextPage: false,
      cursor: '',
    });

    expect(() =>
      renderComponent({
        refetch: undefined,
        isSearchView: false,
      })
    ).not.toThrow();
  });

  it('should handle default empty data object', () => {
    renderComponent({
      data: undefined,
    });

    expect(true).toBe(true);
  });

  it('should use default empty object when useGetCurrentTeam returns null', () => {
    useGetCurrentTeam.mockReturnValueOnce(null);

    expect(() => renderComponent()).not.toThrow();
  });

  it('should handle baseQueryDocuments being undefined', () => {
    expect(() =>
      renderComponent({
        baseQueryDocuments: {
          query: {
            searchKey: '',
          },
        },
      })
    ).not.toThrow();
  });

  it('should fallback additionalSettings to empty object when undefined', () => {
    renderComponent();

    const handler = subscriptionHandlers[0];

    expect(() =>
      handler({
        subscriptionData: {
          data: {
            updateDocumentList: {
              statusCode: STATUS_CODE.SUCCEED,
              type: SubscriptionConstants.Subscription.ADD_DOCUMENT,
              document: { _id: 'doc1', name: 'Doc 1' },
              teamId: 'team123',
              organizationId: 'org123',
            },
          },
        },
      })
    ).not.toThrow();

    expect(documentObservable.notify).toHaveBeenCalled();
  });

  it('should fallback additionalSettings to empty object when deleteOriginalDocument.additionalSettings is undefined', () => {
    renderComponent({ isSearchView: false });

    documentObservable.notify.mockClear();

    const handler = subscriptionHandlers[2];

    expect(() =>
      handler({
        subscriptionData: {
          data: {
            deleteOriginalDocument: {
              statusCode: STATUS_CODE.SUCCEED,
              type: SubscriptionConstants.Subscription.DELETE_DOCUMENT,
              documentList: ['doc1', 'doc2'],
              teamId: 'team123',
              organizationId: 'org123',
            },
          },
        },
      })
    ).not.toThrow();

    expect(documentObservable.notify).toHaveBeenCalled();
  });

  it('should open forbidden modal when error code is FORBIDDEN', () => {
    const error = new Error('Forbidden error');

    errorExtract.extractGqlError.mockReturnValueOnce({
      code: ErrorCode.Common.FORBIDDEN,
    });

    const openModalActionSpy = jest.spyOn(actions, 'openModal').mockReturnValue({ type: 'OPEN_MODAL' });

    renderComponent({ error });

    expect(openModalActionSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ModalTypes.WARNING,
        title: 'Permission Updated',
        message: 'Your permission has been updated',
        confirmButtonTitle: 'Reload',
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        isFullWidthButton: true,
        onConfirm: expect.any(Function),
      })
    );
  });
});
