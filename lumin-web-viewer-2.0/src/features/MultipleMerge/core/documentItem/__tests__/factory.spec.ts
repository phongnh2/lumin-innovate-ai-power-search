import { DocumentItemFactory } from '../factory';
import { GoogleDriveItem } from '../googleDrive';
import { LocalDocumentItem } from '../local';
import { FileSource } from '../../../enum';

// Mock the Item classes to verify constructor calls
jest.mock('../googleDrive', () => ({
  GoogleDriveItem: jest.fn(),
}));

jest.mock('../local', () => ({
  LocalDocumentItem: jest.fn(),
}));

// Mock Enum
jest.mock('../../../enum', () => ({
  FileSource: {
    GOOGLE: 'GOOGLE',
    LOCAL: 'LOCAL',
    LUMIN: 'LUMIN',
  },
}));

describe('DocumentItemFactory', () => {
  const mockCallbacks = {
    onError: jest.fn(),
    onLoadDocumentComplete: jest.fn(),
    onSetupPasswordHandler: jest.fn(),
  };

  const mockFile = new File([''], 'test.pdf', { type: 'application/pdf' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createDocumentItem', () => {
    it('should return null if file is missing in mergeItem', () => {
      const mergeItem = {
        _id: 'doc-1',
        name: 'test',
        source: FileSource.LOCAL,
        // file is undefined
      };

      const result = DocumentItemFactory.createDocumentItem({
        mergeItem: mergeItem as any, // Cast to verify runtime check
        ...mockCallbacks,
      });

      expect(result).toBeNull();
      expect(GoogleDriveItem).not.toHaveBeenCalled();
      expect(LocalDocumentItem).not.toHaveBeenCalled();
    });

    it('should create a GoogleDriveItem when source is GOOGLE', () => {
      const mergeItem = {
        _id: 'doc-google',
        remoteId: 'remote-123',
        name: 'google-doc.pdf',
        source: FileSource.GOOGLE,
        file: mockFile,
      };

      DocumentItemFactory.createDocumentItem({
        mergeItem,
        ...mockCallbacks,
      });

      expect(GoogleDriveItem).toHaveBeenCalledTimes(1);
      expect(GoogleDriveItem).toHaveBeenCalledWith({
        _id: mergeItem._id,
        remoteId: mergeItem.remoteId,
        name: mergeItem.name,
        onError: mockCallbacks.onError,
        onLoadDocumentComplete: mockCallbacks.onLoadDocumentComplete,
        onSetupPasswordHandler: mockCallbacks.onSetupPasswordHandler,
      });
      expect(LocalDocumentItem).not.toHaveBeenCalled();
    });

    it('should create a LocalDocumentItem when source is NOT GOOGLE (e.g. LOCAL)', () => {
      const mergeItem = {
        _id: 'doc-local',
        name: 'local-doc.pdf',
        source: FileSource.LOCAL,
        file: mockFile,
      };

      DocumentItemFactory.createDocumentItem({
        mergeItem,
        ...mockCallbacks,
      });

      expect(LocalDocumentItem).toHaveBeenCalledTimes(1);
      expect(LocalDocumentItem).toHaveBeenCalledWith({
        _id: mergeItem._id,
        file: mergeItem.file,
        name: mergeItem.name,
        onError: mockCallbacks.onError,
        onLoadDocumentComplete: mockCallbacks.onLoadDocumentComplete,
        onSetupPasswordHandler: mockCallbacks.onSetupPasswordHandler,
      });
      expect(GoogleDriveItem).not.toHaveBeenCalled();
    });

    it('should create a LocalDocumentItem when source is LUMIN (default fallback)', () => {
      const mergeItem = {
        _id: 'doc-lumin',
        name: 'lumin-doc.pdf',
        source: FileSource.LUMIN,
        file: mockFile,
      };

      DocumentItemFactory.createDocumentItem({
        mergeItem,
        ...mockCallbacks,
      });

      expect(LocalDocumentItem).toHaveBeenCalledTimes(1);
      expect(LocalDocumentItem).toHaveBeenCalledWith(expect.objectContaining({
        _id: 'doc-lumin',
      }));
    });
  });
});