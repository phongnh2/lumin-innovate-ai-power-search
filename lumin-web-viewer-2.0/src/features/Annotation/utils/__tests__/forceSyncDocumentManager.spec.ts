import core from 'core';
import selectors from 'selectors';
import { ForceSyncDocumentManager } from '../forceSyncDocumentManager';
import { AnnotationSubjectMapping } from 'constants/documentConstants';

jest.mock('core', () => ({
  isDocumentEncrypted: jest.fn(),
  getDocument: jest.fn(),
  getAnnotationsList: jest.fn(),
}));

jest.mock('store', () => ({
  store: {
    getState: jest.fn(),
  },
}));

jest.mock('selectors', () => ({
  getInternalAnnotationIds: jest.fn(),
}));

describe('ForceSyncDocumentManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ForceSyncDocumentManager.clearInstance();
  });

  it('should create a singleton instance', () => {
    const instance1 = ForceSyncDocumentManager.getInstance();
    const instance2 = ForceSyncDocumentManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should track modified annotations and calculate total', () => {
    const manager = ForceSyncDocumentManager.getInstance();
    const mockAnnots = [{ Id: '1' }, { Id: '2' }] as any[];

    manager.addModifiedAnnotations(mockAnnots);
    
    // Initially totalUnsyncedAnnots is 0
    expect(manager.getTotalAnnots()).toBe(2);

    manager.totalUnsyncedAnnots = 5;
    expect(manager.getTotalAnnots()).toBe(7);
  });

  it('should return static threshold', () => {
    // Assuming default is defined in constants, just checking it returns a number
    expect(typeof ForceSyncDocumentManager.getForceSyncAnnotationsThreshold()).toBe('number');
  });

  it('should prepare next sync by clearing tracked data', () => {
    const manager = ForceSyncDocumentManager.getInstance();
    manager.addModifiedAnnotations([{ Id: '1' }] as any[]);
    manager.totalUnsyncedAnnots = 5;

    manager.prepareNextSync();

    expect(manager.getTotalAnnots()).toBe(0);
    expect(manager.totalUnsyncedAnnots).toBe(0);
  });

  describe('checkAnnotationsChangedForceSync', () => {
    it('should return true if total tracked exceeds threshold', () => {
      const manager = ForceSyncDocumentManager.getInstance();
      const threshold = ForceSyncDocumentManager.getForceSyncAnnotationsThreshold();
      
      // Force it to exceed
      manager.totalUnsyncedAnnots = threshold + 1;
      
      expect(manager.checkAnnotationsChangedForceSync()).toBe(true);
    });

    it('should return false if total tracked is below threshold', () => {
      const manager = ForceSyncDocumentManager.getInstance();
      manager.totalUnsyncedAnnots = 0;
      
      expect(manager.checkAnnotationsChangedForceSync()).toBe(false);
    });
  });

  describe('checkAutomaticallyForceSync', () => {
    it('should return true if total unsynced exceeds threshold', async () => {
      const manager = ForceSyncDocumentManager.getInstance();
      const threshold = ForceSyncDocumentManager.getForceSyncAnnotationsThreshold();
      
      manager.totalUnsyncedAnnots = threshold + 1;
      (core.isDocumentEncrypted as jest.Mock).mockResolvedValue(false);
      (core.getDocument as jest.Mock).mockReturnValue({ isUsingPresignedUrlForImage: false });
      (selectors.getInternalAnnotationIds as jest.Mock).mockReturnValue([]);
      (core.getAnnotationsList as jest.Mock).mockReturnValue([]);

      const result = await manager.checkAutomaticallyForceSync();
      expect(result).toBe(true);
    });
    
    it('should return true if shouldForceSyncEncryptedDocument returns true', async () => {
      const manager = ForceSyncDocumentManager.getInstance();
      manager.totalUnsyncedAnnots = 0;
      
      // Mock shouldForceSyncEncryptedDocument logic to be true
      (core.isDocumentEncrypted as jest.Mock).mockResolvedValue(true);
      (core.getDocument as jest.Mock).mockReturnValue({ isUsingPresignedUrlForImage: true });
      (selectors.getInternalAnnotationIds as jest.Mock).mockReturnValue([]);
      (core.getAnnotationsList as jest.Mock).mockReturnValue([
        { Id: 'ext-1', Subject: AnnotationSubjectMapping.signature }
      ]);

      const result = await manager.checkAutomaticallyForceSync();
      expect(result).toBe(true);
    });
  });

  describe('shouldForceSyncEncryptedDocument', () => {
    it('should return true when all encrypted doc conditions are met', async () => {
      (core.isDocumentEncrypted as jest.Mock).mockResolvedValue(true);
      (core.getDocument as jest.Mock).mockReturnValue({ isUsingPresignedUrlForImage: true });
      (selectors.getInternalAnnotationIds as jest.Mock).mockReturnValue(['int-1']);
      // One signature is external (not in internal list)
      (core.getAnnotationsList as jest.Mock).mockReturnValue([
        { Id: 'int-1', Subject: AnnotationSubjectMapping.signature },
        { Id: 'ext-1', Subject: AnnotationSubjectMapping.signature },
      ]);

      const result = await ForceSyncDocumentManager.shouldForceSyncEncryptedDocument();
      expect(result).toBe(true);
    });

    it('should return false if document is not encrypted', async () => {
      (core.isDocumentEncrypted as jest.Mock).mockResolvedValue(false);
      const result = await ForceSyncDocumentManager.shouldForceSyncEncryptedDocument();
      expect(result).toBe(false);
    });

    it('should return false if NOT using presigned url', async () => {
      (core.isDocumentEncrypted as jest.Mock).mockResolvedValue(true);
      (core.getDocument as jest.Mock).mockReturnValue({ isUsingPresignedUrlForImage: false });
      const result = await ForceSyncDocumentManager.shouldForceSyncEncryptedDocument();
      expect(result).toBe(false);
    });
  });
});