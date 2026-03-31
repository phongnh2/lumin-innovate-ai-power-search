import PersonalDocumentUploadService from '../personalDocumentUploadService';
import axios from '@libs/axios';
import documentServices from '../documentServices';
import organizationServices from '../organizationServices';
import selectors from 'selectors';
import { store } from 'store';
import { eventTracking } from 'utils';
import { UploadDocFormField } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';
import { UploadOptions } from 'services/types/personalDocumentUploadService.type';

jest.mock('@libs/axios');
jest.mock('../documentServices');
jest.mock('../organizationServices');
jest.mock('selectors');
jest.mock('store', () => ({
  store: {
    getState: jest.fn(),
  },
}));
jest.mock('utils', () => ({
  eventTracking: jest.fn(() => Promise.resolve()),
  capitalize: jest.fn((str) => str),
}));

describe('PersonalDocumentUploadService', () => {
  let service: PersonalDocumentUploadService;
  const mockUserId = 'user_123';

  beforeEach(() => {
    jest.clearAllMocks();
    store.getState = jest.fn(() => ({}) as any);
    selectors.getCurrentUser = jest.fn(() => ({ _id: mockUserId } as any));
  });

  describe('constructor', () => {
    it('should create service instance with options', () => {
      const options = { timeout: 5000 };
      service = new PersonalDocumentUploadService(options as UploadOptions);

      expect(service).toBeInstanceOf(PersonalDocumentUploadService);
    });

    it('should create service instance without options', () => {
      service = new PersonalDocumentUploadService();

      expect(service).toBeInstanceOf(PersonalDocumentUploadService);
    });
  });

  describe('upload', () => {
    beforeEach(() => {
      service = new PersonalDocumentUploadService();
    });

    it('should upload document via axios when no orgId provided', async () => {
      const mockDocument = { _id: 'doc_123', name: 'test.pdf' };
      axios.axiosInstance.post = jest.fn().mockResolvedValue({ data: mockDocument });

      const params = {
        documentId: 'doc_123',
        folderId: 'folder_123',
        encodedUploadData: 'encoded_data',
        fileName: 'test.pdf',
      };

      const result = await service.upload(params);

      expect(axios.axiosInstance.post).toHaveBeenCalledWith(
        '/document/v2/upload',
        {
          [UploadDocFormField.CLIENT_ID]: mockUserId,
          [UploadDocFormField.UPLOAD_DATA]: 'encoded_data',
          [UploadDocFormField.FILE_NAME]: 'test.pdf',
          [UploadDocFormField.FOLDER_ID]: 'folder_123',
          [UploadDocFormField.DOCUMENT_ID]: 'doc_123',
        },
        undefined
      );

      expect(result).toEqual(mockDocument);
    });

    it('should upload document via graph when orgId provided', async () => {
      const mockDocument = { _id: 'doc_123', name: 'test.pdf' };
      organizationServices.uploadDocumentToPersonal = jest.fn().mockResolvedValue(mockDocument);

      const params = {
        orgId: 'org_123',
        documentId: 'doc_123',
        folderId: 'folder_123',
        encodedUploadData: 'encoded_data',
        fileName: 'test.pdf',
      };

      const result = await service.upload(params);

      expect(organizationServices.uploadDocumentToPersonal).toHaveBeenCalledWith(
        {
          ...params,
          userId: mockUserId,
        },
        undefined
      );

      expect(result).toEqual(mockDocument);
    });

    it('should upload document without folderId', async () => {
      const mockDocument = { _id: 'doc_123', name: 'test.pdf' };
      axios.axiosInstance.post = jest.fn().mockResolvedValue({ data: mockDocument });

      const params = {
        encodedUploadData: 'encoded_data',
        fileName: 'test.pdf',
      };

      const result = await service.upload(params);

      const postCall = (axios.axiosInstance.post as jest.Mock).mock.calls[0][1];
      expect(postCall[UploadDocFormField.FOLDER_ID]).toBeUndefined();
      expect(result).toEqual(mockDocument);
    });

    it('should upload document without documentId', async () => {
      const mockDocument = { _id: 'doc_123', name: 'test.pdf' };
      axios.axiosInstance.post = jest.fn().mockResolvedValue({ data: mockDocument });

      const params = {
        folderId: 'folder_123',
        encodedUploadData: 'encoded_data',
        fileName: 'test.pdf',
      };

      const result = await service.upload(params);

      const postCall = (axios.axiosInstance.post as jest.Mock).mock.calls[0][1];
      expect(postCall[UploadDocFormField.DOCUMENT_ID]).toBeUndefined();
      expect(result).toEqual(mockDocument);
    });

    it('should use custom options when uploading', async () => {
      const options = { timeout: 10000 };
      service = new PersonalDocumentUploadService(options as UploadOptions);

      const mockDocument = { _id: 'doc_123', name: 'test.pdf' };
      axios.axiosInstance.post = jest.fn().mockResolvedValue({ data: mockDocument });

      const params = {
        encodedUploadData: 'encoded_data',
        fileName: 'test.pdf',
      };

      await service.upload(params);

      expect(axios.axiosInstance.post).toHaveBeenCalledWith(
        '/document/v2/upload',
        expect.any(Object),
        options
      );
    });
  });

  describe('import', () => {
    beforeEach(() => {
      service = new PersonalDocumentUploadService();
    });

    it('should import personal documents without orgId', async () => {
      const mockDocuments = [
        { _id: 'doc_1', name: 'test1.pdf', remoteId: 'remote_1' },
        { _id: 'doc_2', name: 'test2.pdf', remoteId: 'remote_2' },
      ];

      documentServices.importThirdPartyDocuments = jest.fn().mockResolvedValue(mockDocuments);

      const documents = [
        { name: 'test1.pdf', remoteId: 'remote_1', service: 'google' },
        { name: 'test2.pdf', remoteId: 'remote_2', service: 'dropbox' },
      ];

      const params = {
        folderId: 'folder_123',
        documents,
      };

      const result = await service.import(params as any);

      expect(documentServices.importThirdPartyDocuments).toHaveBeenCalledWith({
        userId: mockUserId,
        documents,
        folderId: 'folder_123',
      });

      expect(eventTracking).toHaveBeenCalledTimes(2);
      expect(eventTracking).toHaveBeenCalledWith(
        UserEventConstants.EventType.IMPORT_DOCUMENT,
        {
          fileName: 'test1.pdf',
          source: 'google',
        }
      );
      expect(eventTracking).toHaveBeenCalledWith(
        UserEventConstants.EventType.IMPORT_DOCUMENT,
        {
          fileName: 'test2.pdf',
          source: 'dropbox',
        }
      );

      expect(result).toEqual(mockDocuments);
    });

    it('should import personal documents with orgId', async () => {
      const mockDocuments = [
        { _id: 'doc_1', name: 'test1.pdf', remoteId: 'remote_1' },
      ];

      organizationServices.uploadThirdPartyDocuments = jest.fn().mockResolvedValue(mockDocuments);

      const documents = [
        { name: 'test1.pdf', remoteId: 'remote_1', service: 'google' },
      ];

      const params = {
        orgId: 'org_123',
        folderId: 'folder_123',
        documents,
      };

      const result = await service.import(params as any);

      expect(organizationServices.uploadThirdPartyDocuments).toHaveBeenCalledWith({
        orgId: 'org_123',
        documents,
        folderId: 'folder_123',
      });

      expect(eventTracking).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockDocuments);
    });

    it('should handle event tracking errors gracefully', async () => {
      const mockDocuments = [
        { _id: 'doc_1', name: 'test1.pdf', remoteId: 'remote_1' },
      ];

      documentServices.importThirdPartyDocuments = jest.fn().mockResolvedValue(mockDocuments);
      (eventTracking as jest.Mock).mockRejectedValue(new Error('Tracking failed'));

      const documents = [
        { name: 'test1.pdf', remoteId: 'remote_1', service: 'google' },
      ];

      const params = {
        folderId: 'folder_123',
        documents,
      };

      const result = await service.import(params as any);

      expect(result).toEqual(mockDocuments);
    });

    it('should track multiple documents correctly', async () => {
      const mockDocuments = [
        { _id: 'doc_1', name: 'file1.pdf', remoteId: 'remote_1' },
        { _id: 'doc_2', name: 'file2.pdf', remoteId: 'remote_2' },
        { _id: 'doc_3', name: 'file3.pdf', remoteId: 'remote_3' },
      ];

      documentServices.importThirdPartyDocuments = jest.fn().mockResolvedValue(mockDocuments);

      const documents = [
        { name: 'file1.pdf', remoteId: 'remote_1', service: 'google' },
        { name: 'file2.pdf', remoteId: 'remote_2', service: 'dropbox' },
        { name: 'file3.pdf', remoteId: 'remote_3', service: 'onedrive' },
      ];

      const params = {
        documents,
      };

      await service.import(params as any);

      expect(eventTracking).toHaveBeenCalledTimes(3);
      expect(eventTracking).toHaveBeenNthCalledWith(
        1,
        UserEventConstants.EventType.IMPORT_DOCUMENT,
        {
          fileName: 'file1.pdf',
          source: 'google',
        }
      );
      expect(eventTracking).toHaveBeenNthCalledWith(
        2,
        UserEventConstants.EventType.IMPORT_DOCUMENT,
        {
          fileName: 'file2.pdf',
          source: 'dropbox',
        }
      );
      expect(eventTracking).toHaveBeenNthCalledWith(
        3,
        UserEventConstants.EventType.IMPORT_DOCUMENT,
        {
          fileName: 'file3.pdf',
          source: 'onedrive',
        }
      );
    });

    it('should handle empty documents array', async () => {
      documentServices.importThirdPartyDocuments = jest.fn().mockResolvedValue([]);

      const params = {
        documents: [] as any,
      };

      const result = await service.import(params);

      expect(eventTracking).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should use custom options when importing', async () => {
      const options = { timeout: 15000 };
      service = new PersonalDocumentUploadService(options as UploadOptions);

      const mockDocuments = [{ _id: 'doc_1', name: 'test.pdf', remoteId: 'remote_1' }];
      organizationServices.uploadThirdPartyDocuments = jest.fn().mockResolvedValue(mockDocuments);

      const documents = [{ name: 'test.pdf', remoteId: 'remote_1', service: 'google' }];

      const params = {
        orgId: 'org_123',
        documents,
      };

      await service.import(params as any);

      expect(organizationServices.uploadThirdPartyDocuments).toHaveBeenCalled();
    });
  });

  describe('getCurrentUserId', () => {
    it('should get current user id from store', () => {
      service = new PersonalDocumentUploadService();

      const params = {
        encodedUploadData: 'data',
        fileName: 'test.pdf',
      };

      axios.axiosInstance.post = jest.fn().mockResolvedValue({ data: {} });

      service.upload(params);

      expect(selectors.getCurrentUser).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      service = new PersonalDocumentUploadService();
    });

    it('should propagate upload errors', async () => {
      const error = new Error('Upload failed');
      axios.axiosInstance.post = jest.fn().mockRejectedValue(error);

      const params = {
        encodedUploadData: 'data',
        fileName: 'test.pdf',
      };

      await expect(service.upload(params)).rejects.toThrow('Upload failed');
    });

    it('should propagate import errors', async () => {
      const error = new Error('Import failed');
      documentServices.importThirdPartyDocuments = jest.fn().mockRejectedValue(error);

      const params = {
        documents: [{ name: 'test.pdf', remoteId: 'remote_1', service: 'google' }],
      };

      await expect(service.import(params as any)).rejects.toThrow('Import failed');
    });
  });
});
