import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';

// Track subscription callbacks
const subscriptionCallbacks: Record<string, (data: any) => void> = {};

// Mock useSubscription
jest.mock('@apollo/client', () => ({
  useSubscription: (query: any, options: any) => {
    // Store the onData callback for testing
    const queryName = query?.definitions?.[0]?.name?.value || 'unknown';
    if (options?.onData && !options?.skip) {
      subscriptionCallbacks[queryName] = options.onData;
    }
    return { data: undefined, loading: false, error: undefined };
  },
}));

// Mock GraphQL queries
jest.mock('graphQL/DocumentGraph', () => ({
  SUB_UPDATE_DOCUMENT_LIST: { definitions: [{ name: { value: 'SUB_UPDATE_DOCUMENT_LIST' } }] },
  SUB_UPDATE_DOCUMENT_INFO: { definitions: [{ name: { value: 'SUB_UPDATE_DOCUMENT_INFO' } }] },
  SUB_DELETE_ORIGINAL_DOCUMENT: { definitions: [{ name: { value: 'SUB_DELETE_ORIGINAL_DOCUMENT' } }] },
}));

jest.mock('graphQL/DocumentTemplateGraph', () => ({
  SUB_UPDATE_DOCUMENT_TEMPLATE_LIST: { definitions: [{ name: { value: 'SUB_UPDATE_DOCUMENT_TEMPLATE_LIST' } }] },
  SUB_DELETE_DOCUMENT_TEMPLATE: { definitions: [{ name: { value: 'SUB_DELETE_DOCUMENT_TEMPLATE' } }] },
}));

jest.mock('graphQL/FolderGraph', () => ({
  SUB_UPDATE_FOLDER: { definitions: [{ name: { value: 'SUB_UPDATE_FOLDER' } }] },
}));

// Mock hooks
jest.mock('hooks', () => ({
  useGetCurrentUser: () => ({ _id: 'user-123' }),
}));

// Mock constants
jest.mock('constants/lumin-common', () => ({
  STATUS_CODE: { SUCCEED: 200 },
}));

import useDocumentListSubscription from '../hooks/useDocumentListSubscription';

describe('useDocumentListSubscription', () => {
  const mockOnSubscription = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(subscriptionCallbacks).forEach(key => delete subscriptionCallbacks[key]);
  });

  describe('Initialization', () => {
    it('registers subscriptions when onSubscription is provided', () => {
      renderHook(() => useDocumentListSubscription({ onSubscription: mockOnSubscription }));
      expect(Object.keys(subscriptionCallbacks).length).toBeGreaterThan(0);
    });

    it('skips subscriptions when onSubscription is not provided', () => {
      renderHook(() => useDocumentListSubscription({}));
      expect(Object.keys(subscriptionCallbacks).length).toBe(0);
    });
  });

  describe('SUB_UPDATE_DOCUMENT_LIST', () => {
    it('calls onSubscription with document data on success', () => {
      renderHook(() => useDocumentListSubscription({ onSubscription: mockOnSubscription }));
      
      const callback = subscriptionCallbacks['SUB_UPDATE_DOCUMENT_LIST'];
      callback({
        data: {
          data: {
            updateDocumentList: {
              statusCode: 200,
              type: 'add',
              document: { _id: 'doc-1' },
              organizationId: 'org-1',
            },
          },
        },
      });

      expect(mockOnSubscription).toHaveBeenCalledWith({
        event: 'add',
        payload: { document: { _id: 'doc-1' }, organizationId: 'org-1' },
      });
    });

    it('does not call onSubscription when updateDocumentList is null', () => {
      renderHook(() => useDocumentListSubscription({ onSubscription: mockOnSubscription }));
      
      const callback = subscriptionCallbacks['SUB_UPDATE_DOCUMENT_LIST'];
      callback({ data: { data: { updateDocumentList: null } } });

      expect(mockOnSubscription).not.toHaveBeenCalled();
    });

    it('does not call onSubscription on failed status code', () => {
      renderHook(() => useDocumentListSubscription({ onSubscription: mockOnSubscription }));
      
      const callback = subscriptionCallbacks['SUB_UPDATE_DOCUMENT_LIST'];
      callback({
        data: {
          data: {
            updateDocumentList: { statusCode: 400, type: 'add', document: {} },
          },
        },
      });

      expect(mockOnSubscription).not.toHaveBeenCalled();
    });
  });

  describe('SUB_UPDATE_DOCUMENT_INFO', () => {
    it('calls onSubscription with document info', () => {
      renderHook(() => useDocumentListSubscription({ onSubscription: mockOnSubscription }));
      
      const callback = subscriptionCallbacks['SUB_UPDATE_DOCUMENT_INFO'];
      callback({
        data: {
          data: {
            updateDocumentInfo: {
              document: { _id: 'doc-1', name: 'updated.pdf' },
              type: 'update',
            },
          },
        },
      });

      expect(mockOnSubscription).toHaveBeenCalledWith({
        event: 'update',
        payload: { document: { _id: 'doc-1', name: 'updated.pdf' } },
      });
    });
  });

  describe('SUB_DELETE_ORIGINAL_DOCUMENT', () => {
    it('calls onSubscription with deleted document ids', () => {
      renderHook(() => useDocumentListSubscription({ onSubscription: mockOnSubscription }));
      
      const callback = subscriptionCallbacks['SUB_DELETE_ORIGINAL_DOCUMENT'];
      callback({
        data: {
          data: {
            deleteOriginalDocument: {
              statusCode: 200,
              type: 'delete',
              documentList: [{ documentId: 'doc-1' }, { documentId: 'doc-2' }],
            },
          },
        },
      });

      expect(mockOnSubscription).toHaveBeenCalledWith({
        event: 'delete',
        payload: { documentIds: ['doc-1', 'doc-2'] },
      });
    });

    it('does not call onSubscription when deleteOriginalDocument is null', () => {
      renderHook(() => useDocumentListSubscription({ onSubscription: mockOnSubscription }));
      
      const callback = subscriptionCallbacks['SUB_DELETE_ORIGINAL_DOCUMENT'];
      callback({ data: { data: { deleteOriginalDocument: null } } });

      expect(mockOnSubscription).not.toHaveBeenCalled();
    });

    it('does not call onSubscription on failed status code', () => {
      renderHook(() => useDocumentListSubscription({ onSubscription: mockOnSubscription }));
      
      const callback = subscriptionCallbacks['SUB_DELETE_ORIGINAL_DOCUMENT'];
      callback({
        data: {
          data: {
            deleteOriginalDocument: { statusCode: 500, type: 'delete', documentList: [] },
          },
        },
      });

      expect(mockOnSubscription).not.toHaveBeenCalled();
    });
  });

  describe('SUB_UPDATE_FOLDER', () => {
    it('calls onSubscription with folder data', () => {
      renderHook(() => useDocumentListSubscription({ onSubscription: mockOnSubscription }));
      
      const callback = subscriptionCallbacks['SUB_UPDATE_FOLDER'];
      callback({
        data: {
          data: {
            updateFolderSubscription: {
              subscriptionEvent: 'folder_update',
              folder: { _id: 'folder-1' },
              folders: [{ _id: 'folder-1' }],
            },
          },
        },
      });

      expect(mockOnSubscription).toHaveBeenCalledWith({
        event: 'folder_update',
        payload: { folder: { _id: 'folder-1' }, folders: [{ _id: 'folder-1' }] },
      });
    });

    it('does not call onSubscription when updateFolderSubscription is null', () => {
      renderHook(() => useDocumentListSubscription({ onSubscription: mockOnSubscription }));
      
      const callback = subscriptionCallbacks['SUB_UPDATE_FOLDER'];
      callback({ data: { data: { updateFolderSubscription: null } } });

      expect(mockOnSubscription).not.toHaveBeenCalled();
    });
  });

  describe('SUB_UPDATE_DOCUMENT_TEMPLATE_LIST', () => {
    it('calls onSubscription with template data on success', () => {
      renderHook(() => useDocumentListSubscription({ onSubscription: mockOnSubscription }));
      
      const callback = subscriptionCallbacks['SUB_UPDATE_DOCUMENT_TEMPLATE_LIST'];
      callback({
        data: {
          data: {
            updateDocumentTemplateList: {
              statusCode: 200,
              type: 'template_add',
              document: { _id: 'template-1' },
              organizationId: 'org-1',
            },
          },
        },
      });

      expect(mockOnSubscription).toHaveBeenCalledWith({
        event: 'template_add',
        payload: { document: { _id: 'template-1' }, organizationId: 'org-1' },
      });
    });

    it('does not call onSubscription when updateDocumentTemplateList is null', () => {
      renderHook(() => useDocumentListSubscription({ onSubscription: mockOnSubscription }));
      
      const callback = subscriptionCallbacks['SUB_UPDATE_DOCUMENT_TEMPLATE_LIST'];
      callback({ data: { data: { updateDocumentTemplateList: null } } });

      expect(mockOnSubscription).not.toHaveBeenCalled();
    });

    it('does not call onSubscription on failed status code', () => {
      renderHook(() => useDocumentListSubscription({ onSubscription: mockOnSubscription }));
      
      const callback = subscriptionCallbacks['SUB_UPDATE_DOCUMENT_TEMPLATE_LIST'];
      callback({
        data: {
          data: {
            updateDocumentTemplateList: { statusCode: 400, type: 'error', document: {} },
          },
        },
      });

      expect(mockOnSubscription).not.toHaveBeenCalled();
    });
  });

  describe('SUB_DELETE_DOCUMENT_TEMPLATE', () => {
    it('calls onSubscription with deleted template id', () => {
      renderHook(() => useDocumentListSubscription({ onSubscription: mockOnSubscription }));
      
      const callback = subscriptionCallbacks['SUB_DELETE_DOCUMENT_TEMPLATE'];
      callback({
        data: {
          data: {
            deleteDocumentTemplate: {
              statusCode: 200,
              type: 'template_delete',
              documentTemplateId: 'template-1',
            },
          },
        },
      });

      expect(mockOnSubscription).toHaveBeenCalledWith({
        event: 'template_delete',
        payload: { documentTemplateId: 'template-1' },
      });
    });

    it('does not call onSubscription when deleteDocumentTemplate is null', () => {
      renderHook(() => useDocumentListSubscription({ onSubscription: mockOnSubscription }));
      
      const callback = subscriptionCallbacks['SUB_DELETE_DOCUMENT_TEMPLATE'];
      callback({ data: { data: { deleteDocumentTemplate: null } } });

      expect(mockOnSubscription).not.toHaveBeenCalled();
    });

    it('does not call onSubscription on failed status code', () => {
      renderHook(() => useDocumentListSubscription({ onSubscription: mockOnSubscription }));
      
      const callback = subscriptionCallbacks['SUB_DELETE_DOCUMENT_TEMPLATE'];
      callback({
        data: {
          data: {
            deleteDocumentTemplate: { statusCode: 403, type: 'error', documentTemplateId: '' },
          },
        },
      });

      expect(mockOnSubscription).not.toHaveBeenCalled();
    });
  });
});

