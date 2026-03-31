import {
  DocumentActionsType,
  FolderActionsType,
  DeleteOriginalDocumentPayload,
  UpdateDocumentListPayload,
  SubscriptionFunctionParams,
  FolderSubscriptionPayload,
} from '../types';

describe('DocumentList types', () => {
  describe('DocumentActionsType', () => {
    it('can be created with all required action functions', () => {
      const actions: DocumentActionsType = {
        viewInfo: jest.fn(),
        open: jest.fn(),
        makeACopy: jest.fn(),
        rename: jest.fn(),
        markFavorite: jest.fn(),
        remove: jest.fn(),
        copyLink: jest.fn(),
        share: jest.fn(),
        move: jest.fn(),
        makeOffline: jest.fn(),
      };

      expect(typeof actions.viewInfo).toBe('function');
      expect(typeof actions.open).toBe('function');
      expect(typeof actions.makeACopy).toBe('function');
      expect(typeof actions.rename).toBe('function');
      expect(typeof actions.markFavorite).toBe('function');
      expect(typeof actions.remove).toBe('function');
      expect(typeof actions.copyLink).toBe('function');
      expect(typeof actions.share).toBe('function');
      expect(typeof actions.move).toBe('function');
      expect(typeof actions.makeOffline).toBe('function');
    });
  });

  describe('FolderActionsType', () => {
    it('can be created with all required action functions', () => {
      const actions: FolderActionsType = {
        open: jest.fn(),
        viewInfo: jest.fn(),
        rename: jest.fn(),
        markFavorite: jest.fn(),
        remove: jest.fn(),
      };

      expect(typeof actions.open).toBe('function');
      expect(typeof actions.viewInfo).toBe('function');
      expect(typeof actions.rename).toBe('function');
      expect(typeof actions.markFavorite).toBe('function');
      expect(typeof actions.remove).toBe('function');
    });
  });

  describe('DeleteOriginalDocumentPayload', () => {
    it('can be created with required properties', () => {
      const payload: DeleteOriginalDocumentPayload = {
        statusCode: 200,
        type: 'DELETE',
        documentList: [
          { documentId: 'doc-1' },
          { documentId: 'doc-2', documentFolder: 'folder-1' },
        ],
      };

      expect(payload.statusCode).toBe(200);
      expect(payload.type).toBe('DELETE');
      expect(payload.documentList.length).toBe(2);
    });
  });

  describe('UpdateDocumentListPayload', () => {
    it('can be created with required properties', () => {
      const payload: UpdateDocumentListPayload = {
        statusCode: 200,
        type: 'UPDATE',
        document: { _id: 'doc-1', name: 'Document' } as any,
      };

      expect(payload.statusCode).toBe(200);
      expect(payload.type).toBe('UPDATE');
      expect(payload.document._id).toBe('doc-1');
    });

    it('can include optional organizationId', () => {
      const payload: UpdateDocumentListPayload = {
        statusCode: 200,
        type: 'UPDATE',
        document: { _id: 'doc-1', name: 'Document' } as any,
        organizationId: 'org-1',
      };

      expect(payload.organizationId).toBe('org-1');
    });
  });

  describe('SubscriptionFunctionParams', () => {
    it('can be created with event and payload', () => {
      const params: SubscriptionFunctionParams = {
        event: 'DOCUMENT_UPDATED',
        payload: {
          document: { _id: 'doc-1', name: 'Document' } as any,
        },
      };

      expect(params.event).toBe('DOCUMENT_UPDATED');
      expect(params.payload).toBeDefined();
    });
  });

  describe('FolderSubscriptionPayload', () => {
    it('can be created with required properties', () => {
      const payload: FolderSubscriptionPayload = {
        folder: { _id: 'folder-1', name: 'Folder' } as any,
        userId: 'user-1',
        subscriptionEvent: 'FOLDER_UPDATED',
      };

      expect(payload.folder._id).toBe('folder-1');
      expect(payload.userId).toBe('user-1');
      expect(payload.subscriptionEvent).toBe('FOLDER_UPDATED');
    });

    it('can include optional folders array', () => {
      const payload: FolderSubscriptionPayload = {
        folder: { _id: 'folder-1', name: 'Folder' } as any,
        folders: [
          { _id: 'folder-1', name: 'Folder 1' } as any,
          { _id: 'folder-2', name: 'Folder 2' } as any,
        ],
        userId: 'user-1',
        subscriptionEvent: 'FOLDERS_UPDATED',
      };

      expect(payload.folders?.length).toBe(2);
    });
  });
});

