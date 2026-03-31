/* eslint-disable sonarjs/no-duplicate-string */
import { get } from 'lodash';

import { AppFeatures, featureStoragePolicy } from 'features/FeatureConfigs';

import { STORAGE_TYPE } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { handleStorageMerge } from './handleStorageMerge';

jest.mock('lodash', () => ({
  get: jest.fn(),
}));

jest.mock('features/FeatureConfigs', () => ({
  AppFeatures: {
    MERGE_FILE: 'MergeFile',
  },
  featureStoragePolicy: {
    isFeatureEnabledForStorage: jest.fn(),
  },
}));

describe('handleStorageMerge', () => {
  const mockGet = get as jest.MockedFunction<typeof get>;
  const mockIsFeatureEnabledForStorage = featureStoragePolicy.isFeatureEnabledForStorage as jest.MockedFunction<
    typeof featureStoragePolicy.isFeatureEnabledForStorage
  >;
  const mockT = jest.fn((key: string) => {
    if (key === 'viewer.chatbot.restrictions.storage') {
      return `This feature is unavailable with your current storage type.`;
    }
    if (key === 'viewer.chatbot.feature.merge') {
      return 'Merge';
    }
    return key;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when storage is supported for merging', () => {
    it('should return empty string for S3 storage', () => {
      const mockDocument = {} as IDocumentBase;
      mockGet.mockReturnValue(STORAGE_TYPE.S3);
      mockIsFeatureEnabledForStorage.mockReturnValue(true);

      const result = handleStorageMerge(mockDocument, mockT);

      expect(mockGet).toHaveBeenCalledWith(mockDocument, 'service', '');
      expect(mockIsFeatureEnabledForStorage).toHaveBeenCalledWith(AppFeatures.MERGE_FILE, STORAGE_TYPE.S3);
      expect(result).toBe('');
    });

    it('should return empty string for GOOGLE storage', () => {
      const mockDocument = {} as IDocumentBase;
      mockGet.mockReturnValue(STORAGE_TYPE.GOOGLE);
      mockIsFeatureEnabledForStorage.mockReturnValue(true);

      const result = handleStorageMerge(mockDocument, mockT);

      expect(mockGet).toHaveBeenCalledWith(mockDocument, 'service', '');
      expect(mockIsFeatureEnabledForStorage).toHaveBeenCalledWith(AppFeatures.MERGE_FILE, STORAGE_TYPE.GOOGLE);
      expect(result).toBe('');
    });

    it('should return empty string for LOCAL storage', () => {
      const mockDocument = {} as IDocumentBase;
      mockGet.mockReturnValue(STORAGE_TYPE.LOCAL);
      mockIsFeatureEnabledForStorage.mockReturnValue(true);

      const result = handleStorageMerge(mockDocument, mockT);

      expect(mockGet).toHaveBeenCalledWith(mockDocument, 'service', '');
      expect(mockIsFeatureEnabledForStorage).toHaveBeenCalledWith(AppFeatures.MERGE_FILE, STORAGE_TYPE.LOCAL);
      expect(result).toBe('');
    });

    it('should return empty string for CACHING storage', () => {
      const mockDocument = {} as IDocumentBase;
      mockGet.mockReturnValue(STORAGE_TYPE.CACHING);
      mockIsFeatureEnabledForStorage.mockReturnValue(true);

      const result = handleStorageMerge(mockDocument, mockT);

      expect(mockGet).toHaveBeenCalledWith(mockDocument, 'service', '');
      expect(mockIsFeatureEnabledForStorage).toHaveBeenCalledWith(AppFeatures.MERGE_FILE, STORAGE_TYPE.CACHING);
      expect(result).toBe('');
    });

    it('should return empty string for SYSTEM storage', () => {
      const mockDocument = {} as IDocumentBase;
      mockGet.mockReturnValue(STORAGE_TYPE.SYSTEM);
      mockIsFeatureEnabledForStorage.mockReturnValue(true);

      const result = handleStorageMerge(mockDocument, mockT);

      expect(mockGet).toHaveBeenCalledWith(mockDocument, 'service', '');
      expect(mockIsFeatureEnabledForStorage).toHaveBeenCalledWith(AppFeatures.MERGE_FILE, STORAGE_TYPE.SYSTEM);
      expect(result).toBe('');
    });
  });

  describe('when storage is not supported for merging', () => {
    it('should return error message for ONEDRIVE storage', () => {
      const mockDocument = {} as IDocumentBase;
      mockGet.mockReturnValue(STORAGE_TYPE.ONEDRIVE);
      mockIsFeatureEnabledForStorage.mockReturnValue(false);

      const result = handleStorageMerge(mockDocument, mockT);

      expect(mockGet).toHaveBeenCalledWith(mockDocument, 'service', '');
      expect(mockIsFeatureEnabledForStorage).toHaveBeenCalledWith(AppFeatures.MERGE_FILE, STORAGE_TYPE.ONEDRIVE);
      expect(result).toBe('This feature is unavailable with your current storage type.');
    });

    it('should return error message for DROPBOX storage', () => {
      const mockDocument = {} as IDocumentBase;
      mockGet.mockReturnValue(STORAGE_TYPE.DROPBOX);
      mockIsFeatureEnabledForStorage.mockReturnValue(false);

      const result = handleStorageMerge(mockDocument, mockT);

      expect(mockGet).toHaveBeenCalledWith(mockDocument, 'service', '');
      expect(mockIsFeatureEnabledForStorage).toHaveBeenCalledWith(AppFeatures.MERGE_FILE, STORAGE_TYPE.DROPBOX);
      expect(result).toBe('This feature is unavailable with your current storage type.');
    });

    it('should return error message for empty string service', () => {
      const mockDocument = {} as IDocumentBase;
      mockGet.mockReturnValue('');
      mockIsFeatureEnabledForStorage.mockReturnValue(false);

      const result = handleStorageMerge(mockDocument, mockT);

      expect(mockGet).toHaveBeenCalledWith(mockDocument, 'service', '');
      expect(mockIsFeatureEnabledForStorage).toHaveBeenCalledWith(AppFeatures.MERGE_FILE, '');
      expect(result).toBe('This feature is unavailable with your current storage type.');
    });

    it('should return error message for null service', () => {
      const mockDocument = {} as IDocumentBase;
      mockGet.mockReturnValue(null);
      mockIsFeatureEnabledForStorage.mockReturnValue(false);

      const result = handleStorageMerge(mockDocument, mockT);

      expect(mockGet).toHaveBeenCalledWith(mockDocument, 'service', '');
      expect(mockIsFeatureEnabledForStorage).toHaveBeenCalledWith(AppFeatures.MERGE_FILE, null);
      expect(result).toBe('This feature is unavailable with your current storage type.');
    });

    it('should return error message for undefined service', () => {
      const mockDocument = {} as IDocumentBase;
      mockGet.mockReturnValue(undefined);
      mockIsFeatureEnabledForStorage.mockReturnValue(false);

      const result = handleStorageMerge(mockDocument, mockT);

      expect(mockGet).toHaveBeenCalledWith(mockDocument, 'service', '');
      expect(mockIsFeatureEnabledForStorage).toHaveBeenCalledWith(AppFeatures.MERGE_FILE, undefined);
      expect(result).toBe('This feature is unavailable with your current storage type.');
    });
  });

  describe('translation function calls', () => {
    it('should call translation function with correct parameters when storage is not supported', () => {
      const mockDocument = {} as IDocumentBase;
      mockGet.mockReturnValue(STORAGE_TYPE.ONEDRIVE);
      mockIsFeatureEnabledForStorage.mockReturnValue(false);

      handleStorageMerge(mockDocument, mockT);

      expect(mockT).toHaveBeenCalledWith('viewer.chatbot.restrictions.storage', {
        featureName: 'Merge',
      });
    });

    it('should not call translation function when storage is supported', () => {
      const mockDocument = {} as IDocumentBase;
      mockGet.mockReturnValue(STORAGE_TYPE.S3);
      mockIsFeatureEnabledForStorage.mockReturnValue(true);

      handleStorageMerge(mockDocument, mockT);

      expect(mockT).not.toHaveBeenCalled();
    });
  });

  describe('lodash get function calls', () => {
    it('should call lodash get with correct parameters', () => {
      const mockDocument = { _id: '123', name: 'test.pdf' } as IDocumentBase;
      mockGet.mockReturnValue(STORAGE_TYPE.S3);
      mockIsFeatureEnabledForStorage.mockReturnValue(true);

      handleStorageMerge(mockDocument, mockT);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(mockDocument, 'service', '');
    });
  });

  describe('feature storage policy calls', () => {
    it('should call isFeatureEnabledForStorage with correct parameters', () => {
      const mockDocument = {} as IDocumentBase;
      mockGet.mockReturnValue(STORAGE_TYPE.GOOGLE);
      mockIsFeatureEnabledForStorage.mockReturnValue(true);

      handleStorageMerge(mockDocument, mockT);

      expect(mockIsFeatureEnabledForStorage).toHaveBeenCalledTimes(1);
      expect(mockIsFeatureEnabledForStorage).toHaveBeenCalledWith(AppFeatures.MERGE_FILE, STORAGE_TYPE.GOOGLE);
    });
  });

  describe('edge cases', () => {
    it('should handle document with null value', () => {
      const mockDocument = null as unknown as IDocumentBase;
      mockGet.mockReturnValue(STORAGE_TYPE.ONEDRIVE);
      mockIsFeatureEnabledForStorage.mockReturnValue(false);

      const result = handleStorageMerge(mockDocument, mockT);

      expect(mockGet).toHaveBeenCalledWith(mockDocument, 'service', '');
      expect(result).toBe('This feature is unavailable with your current storage type.');
    });

    it('should handle document with undefined value', () => {
      const mockDocument = undefined as unknown as IDocumentBase;
      mockGet.mockReturnValue(STORAGE_TYPE.DROPBOX);
      mockIsFeatureEnabledForStorage.mockReturnValue(false);

      const result = handleStorageMerge(mockDocument, mockT);

      expect(mockGet).toHaveBeenCalledWith(mockDocument, 'service', '');
      expect(result).toBe('This feature is unavailable with your current storage type.');
    });
  });
});
