import { store } from 'store';
import selectors from 'selectors';
import featureStoragePolicies, { AppFeatures } from 'features/FeatureConfigs/featureStoragePolicies';
import logger from 'helpers/logger';
import {
  getDocumentHeight,
  convertFileToBlob,
  includeFormFields,
  canUseImageSignedUrl,
} from '../documentUtil';

jest.mock('store', () => ({
  store: { getState: jest.fn() },
}));

jest.mock('selectors', () => ({
  getCurrentDocument: jest.fn(),
  isOffline: jest.fn(),
  getAnnotationsLoaded: jest.fn(),
}));

jest.mock('features/FeatureConfigs/featureStoragePolicies', () => ({
  __esModule: true,
  default: {
    isFeatureEnabledForStorage: jest.fn(),
  },
  AppFeatures: { SIGNED_URL_IMAGE: 'SIGNED_URL_IMAGE' },
}));

jest.mock('helpers/logger', () => ({
  logError: jest.fn(),
}));

describe('documentUtil', () => {
  describe('getDocumentHeight', () => {
    it('should return Desktop height if isTabletUpMatch=true', () => {
      expect(getDocumentHeight(true)).toBe(96);
    });
    it('should return Mobile height if isTabletUpMatch=false', () => {
      expect(getDocumentHeight(false)).toBe(72);
    });
  });

  describe('convertFileToBlob', () => {
    it('should convert file to Blob with name and type', async () => {
      const file = new File(['hello'], 'test.txt', { type: 'text/plain' });
      const blob = await convertFileToBlob(file);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/plain');
      expect(blob.name).toBe('test.txt');
    });

    it('should return original file if arrayBuffer fails', async () => {
      const file = {
        name: 'fail.txt',
        type: 'text/plain',
        arrayBuffer: jest.fn(() => { throw new Error('fail'); }),
      };
      const result = await convertFileToBlob(file);
      expect(result).toBe(file);
    });
  });

  describe('includeFormFields', () => {
    const mockFdf = { saveAsXFDFAsString: jest.fn() };
    const mockDoc = { fdfExtract: jest.fn() };
    const documentInstance = { getPDFDoc: jest.fn() };

    beforeEach(() => {
      jest.clearAllMocks();
      window.Core = { PDFNet: { PDFDoc: { ExtractFlag: { e_forms_only: 'e_forms_only' } } } };
    });

    it('should return true if FDF string contains <fields>', async () => {
      mockFdf.saveAsXFDFAsString.mockResolvedValue('<fields>...');
      mockDoc.fdfExtract.mockResolvedValue(mockFdf);
      documentInstance.getPDFDoc.mockResolvedValue(mockDoc);

      const result = await includeFormFields(documentInstance);
      expect(result).toBe(true);
      expect(mockDoc.fdfExtract).toHaveBeenCalledWith('e_forms_only');
    });

    it('should return false if FDF string does not contain <fields>', async () => {
      mockFdf.saveAsXFDFAsString.mockResolvedValue('no fields');
      mockDoc.fdfExtract.mockResolvedValue(mockFdf);
      documentInstance.getPDFDoc.mockResolvedValue(mockDoc);

      const result = await includeFormFields(documentInstance);
      expect(result).toBe(false);
    });

    it('should return false and log error if getPDFDoc throws', async () => {
      const error = new Error('fail');
      documentInstance.getPDFDoc.mockRejectedValue(error);
      const result = await includeFormFields(documentInstance);
      expect(result).toBe(false);
      expect(logger.logError).toHaveBeenCalledWith({ error });
    });
  });

  describe('canUseImageSignedUrl', () => {
    const state = {};
    const currentDocument = { service: 'SERVICE', temporaryEdit: false };

    beforeEach(() => {
      jest.clearAllMocks();
      store.getState.mockReturnValue(state);
      selectors.getCurrentDocument.mockReturnValue(currentDocument);
      selectors.isOffline.mockReturnValue(false);
      selectors.getAnnotationsLoaded.mockReturnValue(true);
    });

    it('should return true if all conditions met', () => {
      featureStoragePolicies.isFeatureEnabledForStorage.mockReturnValue(true);
      expect(canUseImageSignedUrl()).toBe(true);
    });

    it('should return false if storage feature disabled', () => {
      featureStoragePolicies.isFeatureEnabledForStorage.mockReturnValue(false);
      expect(canUseImageSignedUrl()).toBe(false);
    });

    it('should return false if offline', () => {
      featureStoragePolicies.isFeatureEnabledForStorage.mockReturnValue(true);
      selectors.isOffline.mockReturnValue(true);
      expect(canUseImageSignedUrl()).toBe(false);
    });

    it('should return false if annotations not loaded', () => {
      featureStoragePolicies.isFeatureEnabledForStorage.mockReturnValue(true);
      selectors.getAnnotationsLoaded.mockReturnValue(false);
      expect(canUseImageSignedUrl()).toBe(false);
    });

    it('should return false if document is in temp edit mode', () => {
      featureStoragePolicies.isFeatureEnabledForStorage.mockReturnValue(true);
      selectors.getCurrentDocument.mockReturnValue({ ...currentDocument, temporaryEdit: true });
      expect(canUseImageSignedUrl()).toBe(false);
    });
  });
});
