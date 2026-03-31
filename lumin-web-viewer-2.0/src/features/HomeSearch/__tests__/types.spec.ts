import { ListItemKinds, GetOrganizationResourcesPayload, FolderWithKind, DocumentWithKind } from '../types';

describe('HomeSearch types', () => {
  describe('ListItemKinds enum', () => {
    it('has FOLDER value', () => {
      expect(ListItemKinds.FOLDER).toBe('FOLDER');
    });

    it('has DOCUMENT value', () => {
      expect(ListItemKinds.DOCUMENT).toBe('DOCUMENT');
    });

    it('has exactly 2 values', () => {
      const values = Object.values(ListItemKinds);
      expect(values.length).toBe(2);
    });
  });

  describe('GetOrganizationResourcesPayload', () => {
    it('can be created with required properties', () => {
      const payload: GetOrganizationResourcesPayload = {
        folders: [],
        documents: [],
        total: 0,
        cursor: '',
      };

      expect(payload.folders).toEqual([]);
      expect(payload.documents).toEqual([]);
      expect(payload.total).toBe(0);
      expect(payload.cursor).toBe('');
    });
  });

  describe('FolderWithKind', () => {
    it('can be created with folder properties and kind', () => {
      const folder: FolderWithKind = {
        _id: 'folder-1',
        name: 'Test Folder',
        kind: ListItemKinds.FOLDER,
      } as FolderWithKind;

      expect(folder._id).toBe('folder-1');
      expect(folder.kind).toBe(ListItemKinds.FOLDER);
    });
  });

  describe('DocumentWithKind', () => {
    it('can be created with document properties and kind', () => {
      const document: DocumentWithKind = {
        _id: 'doc-1',
        name: 'Test Document',
        kind: ListItemKinds.DOCUMENT,
      } as DocumentWithKind;

      expect(document._id).toBe('doc-1');
      expect(document.kind).toBe(ListItemKinds.DOCUMENT);
    });
  });
});

