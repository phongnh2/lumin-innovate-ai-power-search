import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { DocumentSyncService } from '../documentSync.service';
import { RedisService } from '../../Microservices/redis/redis.service';
import { LoggerService } from '../../Logger/Logger.service';
import { EventsGateway } from '../../Gateway/SocketIoConfig';
import { DocumentService } from '../document.service';
import { SocketRoomGetter } from '../../Gateway/SocketRoom';
import { SocketMessage } from '../../Gateway/SocketMessage';
import { DocumentStorageEnum, DocumentFromSourceEnum } from '../document.enum';
import { DocumentSyncStatus } from '../enums/document.sync.enum';

describe('DocumentSyncService', () => {
  let service: DocumentSyncService;
  let redisService: RedisService;
  let loggerService: LoggerService;
  let messageGateway: EventsGateway;
  let documentService: DocumentService;

  const mockSocketId = 'test-socket-id';
  const mockDocumentId = 'test-document-id';
  const mockSessionId = 'test-session-id';
  const mockRemoteId = 'test-remote-id';
  const mockKey = `documentSync:${mockDocumentId}`;

  let emitSpy: jest.Mock;
  let exceptMock: jest.Mock;
  let toMock: jest.Mock;

  beforeEach(async () => {
    emitSpy = jest.fn();
    exceptMock = jest.fn().mockReturnValue({ emit: emitSpy });

    const mockBroadcastOperator: any = {
      except: exceptMock,
      emit: emitSpy,
      adapter: {} as any,
      rooms: new Set<string>(),
      exceptRooms: new Set<string>(),
      flags: {},
      sockets: new Map(),
      server: {} as any,
      allSockets: jest.fn().mockResolvedValue(new Set()),
      compress: jest.fn(function() { return this; }),
      disconnectSockets: jest.fn(),
      emitWithAck: jest.fn(function() { return this; }),
      fetchSockets: jest.fn().mockResolvedValue([]),
      volatile: jest.fn(function() { return this; }),
      timeout: jest.fn(function() { return this; }),
    };

    toMock = jest.fn().mockReturnValue(mockBroadcastOperator);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentSyncService,
        {
          provide: RedisService,
          useValue: createMock<RedisService>({
            setHsetAsync: jest.fn().mockResolvedValue(1),
            setExpireKey: jest.fn(),
            isKeyExisted: jest.fn().mockResolvedValue(true),
            getAllHsetData: jest.fn().mockResolvedValue([]),
            removeKeyFromhset: jest.fn().mockResolvedValue(true),
            getHashLength: jest.fn().mockResolvedValue(0),
            deleteRedisByKey: jest.fn().mockResolvedValue(true),
          }),
        },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>({
            error: jest.fn(),
            warn: jest.fn(),
          }),
        },
        {
          provide: EventsGateway,
          useValue: {
            server: {
              to: toMock,
            },
          },
        },
        {
          provide: DocumentService,
          useValue: createMock<DocumentService>({
            getDocumentsByConditions: jest.fn().mockResolvedValue([]),
          }),
        },
      ],
    }).compile();

    service = module.get<DocumentSyncService>(DocumentSyncService);
    redisService = module.get<RedisService>(RedisService);
    loggerService = module.get<LoggerService>(LoggerService);
    messageGateway = module.get<EventsGateway>(EventsGateway);
    documentService = module.get<DocumentService>(DocumentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('pushSyncStatusToQueue', () => {
    it('should successfully push sync status to queue', async () => {
      const status = DocumentSyncStatus.PREPARING;
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);
      await service.pushSyncStatusToQueue(mockDocumentId, mockSessionId, { status });
      expect(redisService.setHsetAsync).toHaveBeenCalledWith(
        mockKey,
        mockSessionId,
        JSON.stringify({ updatedAt: now, status })
      );
      expect(redisService.setExpireKey).toHaveBeenCalledWith(mockKey, 3600);
    });

    it('should log error and rethrow when Redis operation fails', async () => {
      const status = DocumentSyncStatus.SYNCING;
      const error = new Error('Redis operation failed');
      jest.spyOn(redisService, 'setHsetAsync').mockRejectedValue(error);
      await expect(service.pushSyncStatusToQueue(mockDocumentId, mockSessionId, { status }))
        .rejects.toThrow(error);

      expect(loggerService.error).toHaveBeenCalledWith({
        context: 'pushSyncStatusToQueue',
        message: expect.stringContaining(`[pushSyncStatus] failed doc=${mockDocumentId} session=${mockSessionId}`),
        error,
      });
    });
  });

  describe('checkDocumentSyncStatus', () => {
    it('should return not syncing if the key does not exist', async () => {
      jest.spyOn(redisService, 'isKeyExisted').mockResolvedValue(false);

      const result = await service.checkDocumentSyncStatus(mockDocumentId);

      expect(result).toEqual({ isSyncing: false, sessions: [] });
      expect(redisService.isKeyExisted).toHaveBeenCalledWith(mockKey);
    });

    it('should return syncing status and sessions when data exists', async () => {
      const mockTime = 1623456789000;
      const mockRawData = [
        { key: 'session1', value: JSON.stringify({ updatedAt: mockTime, status: DocumentSyncStatus.SYNCING }) },
        { key: 'session2', value: JSON.stringify({ updatedAt: mockTime + 1000, status: DocumentSyncStatus.PREPARING }) },
      ];
      jest.spyOn(redisService, 'isKeyExisted').mockResolvedValue(true);
      jest.spyOn(redisService, 'getAllHsetData').mockResolvedValue(mockRawData);
      const result = await service.checkDocumentSyncStatus(mockDocumentId);

      expect(result).toEqual({
        isSyncing: true,
        sessions: [
          { sessionId: 'session1', updatedAt: mockTime },
          { sessionId: 'session2', updatedAt: mockTime + 1000 },
        ],
      });
    });

    it('should handle invalid JSON in session data', async () => {
      const mockRawData = [
        { key: 'session1', value: 'invalid-json' },
        { key: 'session2', value: JSON.stringify({ updatedAt: 123456789 }) },
      ];
      jest.spyOn(redisService, 'isKeyExisted').mockResolvedValue(true);
      jest.spyOn(redisService, 'getAllHsetData').mockResolvedValue(mockRawData);

      const result = await service.checkDocumentSyncStatus(mockDocumentId);

      expect(result).toEqual({
        isSyncing: true,
        sessions: [
          { sessionId: 'session1', updatedAt: 0 },
          { sessionId: 'session2', updatedAt: 123456789 },
        ],
      });
    });

    it('should log error and rethrow when Redis operation fails', async () => {
      const error = new Error('Redis operation failed');
      jest.spyOn(redisService, 'isKeyExisted').mockRejectedValue(error);

      await expect(service.checkDocumentSyncStatus(mockDocumentId))
        .rejects.toThrow(error);

      expect(loggerService.error).toHaveBeenCalledWith({
        context: 'checkDocumentSyncStatus',
        message: expect.stringContaining(`[checkStatus] failed doc=${mockDocumentId}`),
        stack: error.stack,
        error,
      });
    });
  });

  describe('clearDocumentSyncStatus', () => {
    it('should successfully clear a session and delete key when no sessions remain', async () => {
      jest.spyOn(redisService, 'removeKeyFromhset').mockResolvedValue(true);
      jest.spyOn(redisService, 'getHashLength').mockResolvedValue(0);
      
      const result = await service.clearDocumentSyncStatus(mockDocumentId, mockSessionId);

      expect(result).toBe(true);
      expect(redisService.removeKeyFromhset).toHaveBeenCalledWith(mockKey, mockSessionId);
      expect(redisService.getHashLength).toHaveBeenCalledWith(mockKey);
      expect(redisService.deleteRedisByKey).toHaveBeenCalledWith(mockKey);
    });

    it('should successfully clear a session but not delete key when sessions remain', async () => {
      jest.spyOn(redisService, 'removeKeyFromhset').mockResolvedValue(true);
      jest.spyOn(redisService, 'getHashLength').mockResolvedValue(1);
      
      const result = await service.clearDocumentSyncStatus(mockDocumentId, mockSessionId);

      expect(result).toBe(true);
      expect(redisService.removeKeyFromhset).toHaveBeenCalledWith(mockKey, mockSessionId);
      expect(redisService.getHashLength).toHaveBeenCalledWith(mockKey);
      expect(redisService.deleteRedisByKey).not.toHaveBeenCalled();
    });

    it('should log error and rethrow when Redis operation fails', async () => {
      const error = new Error('Redis operation failed');
      jest.spyOn(redisService, 'removeKeyFromhset').mockRejectedValue(error);

      await expect(service.clearDocumentSyncStatus(mockDocumentId, mockSessionId))
        .rejects.toThrow(error);

      expect(loggerService.error).toHaveBeenCalledWith({
        context: 'clearDocumentSyncStatus',
        message: expect.stringContaining(`[clearSync] failed doc=${mockDocumentId} session=${mockSessionId}`),
        stack: error.stack,
        error,
      });
    });
  });

  describe('removePreparedSyncStatus', () => {
    it('should return false if no data found (empty array)', async () => {
      jest.spyOn(redisService, 'getAllHsetData').mockResolvedValue([]);
      
      const result = await service.removePreparedSyncStatus(mockDocumentId, mockSessionId);

      expect(result).toBe(false);
    });

    it('should return false if data is null or undefined', async () => {
      jest.spyOn(redisService, 'getAllHsetData').mockResolvedValue(null as any);
      
      const result = await service.removePreparedSyncStatus(mockDocumentId, mockSessionId);

      expect(result).toBe(false);
    });

    it('should return false if session not found with preparing status', async () => {
      const mockRawData = [
        { key: 'session1', value: JSON.stringify({ status: DocumentSyncStatus.SYNCING }) },
        { key: mockSessionId, value: JSON.stringify({ status: DocumentSyncStatus.SYNCING }) },
      ];
      jest.spyOn(redisService, 'getAllHsetData').mockResolvedValue(mockRawData);
      
      const result = await service.removePreparedSyncStatus(mockDocumentId, mockSessionId);

      expect(result).toBe(false);
      expect(redisService.removeKeyFromhset).not.toHaveBeenCalled();
    });

    it('should return false if JSON parsing fails for session data', async () => {
      const mockRawData = [
        { key: mockSessionId, value: 'invalid-json-data' },
        { key: 'session2', value: JSON.stringify({ status: DocumentSyncStatus.SYNCING }) },
      ];
      jest.spyOn(redisService, 'getAllHsetData').mockResolvedValue(mockRawData);
      
      const result = await service.removePreparedSyncStatus(mockDocumentId, mockSessionId);

      expect(result).toBe(false);
      expect(redisService.removeKeyFromhset).not.toHaveBeenCalled();
    });

    it('should successfully remove a prepared sync session and delete key when no sessions remain', async () => {
      const mockRawData = [
        { key: mockSessionId, value: JSON.stringify({ status: DocumentSyncStatus.PREPARING }) },
      ];
      jest.spyOn(redisService, 'getAllHsetData').mockResolvedValue(mockRawData);
      jest.spyOn(redisService, 'removeKeyFromhset').mockResolvedValue(true);
      jest.spyOn(redisService, 'getHashLength').mockResolvedValue(0);
      
      const result = await service.removePreparedSyncStatus(mockDocumentId, mockSessionId);

      expect(result).toBe(true);
      expect(redisService.getAllHsetData).toHaveBeenCalledWith(mockKey);
      expect(redisService.removeKeyFromhset).toHaveBeenCalledWith(mockKey, mockSessionId);
      expect(redisService.getHashLength).toHaveBeenCalledWith(mockKey);
      expect(redisService.deleteRedisByKey).toHaveBeenCalledWith(mockKey);
    });

    it('should successfully remove a prepared sync session but not delete key when sessions remain', async () => {
      const mockRawData = [
        { key: mockSessionId, value: JSON.stringify({ status: DocumentSyncStatus.PREPARING }) },
        { key: 'otherSession', value: JSON.stringify({ status: DocumentSyncStatus.SYNCING }) },
      ];
      jest.spyOn(redisService, 'getAllHsetData').mockResolvedValue(mockRawData);
      jest.spyOn(redisService, 'removeKeyFromhset').mockResolvedValue(true);
      jest.spyOn(redisService, 'getHashLength').mockResolvedValue(1);
      
      const result = await service.removePreparedSyncStatus(mockDocumentId, mockSessionId);

      expect(result).toBe(true);
      expect(redisService.removeKeyFromhset).toHaveBeenCalledWith(mockKey, mockSessionId);
      expect(redisService.getHashLength).toHaveBeenCalledWith(mockKey);
      expect(redisService.deleteRedisByKey).not.toHaveBeenCalled();
    });

    it('should log error and rethrow when Redis operation fails', async () => {
      const error = new Error('Redis operation failed');
      jest.spyOn(redisService, 'getAllHsetData').mockRejectedValue(error);

      await expect(service.removePreparedSyncStatus(mockDocumentId, mockSessionId))
        .rejects.toThrow(error);

      expect(loggerService.error).toHaveBeenCalledWith({
        context: 'removePreparedSyncStatus',
        message: expect.stringContaining(`[removePreparedSync] failed doc=${mockDocumentId} session=${mockSessionId}`),
        stack: error.stack,
        error,
      });
    });
  });

  describe('publishSyncStatusToAllSessions', () => {
    const paramsS3 = {
      documentId: mockDocumentId,
      documentService: DocumentStorageEnum.S3,
      remoteId: mockRemoteId,
    };
    const paramsGoogle = {
      documentId: 'initial-google-doc-id',
      documentService: DocumentStorageEnum.GOOGLE,
      remoteId: mockRemoteId,
    };
    const payload = { increaseVersion: true, isSyncing: false, status: DocumentSyncStatus.SYNCING };

    it('should emit to document room for S3 storage', async () => {
      await service.publishSyncStatusToAllSessions(mockSocketId, paramsS3, payload);

      expect(toMock).toHaveBeenCalledWith(SocketRoomGetter.document(mockDocumentId));
      expect(exceptMock).toHaveBeenCalledWith(mockSocketId);
      expect(emitSpy).toHaveBeenCalledWith(
        `${SocketMessage.UPDATED_TEXT_CONTENT}-${mockDocumentId}`,
        {
          increaseVersion: true,
          isSyncing: false,
          status: DocumentSyncStatus.SYNCING,
          etag: undefined,
        },
      );
      expect(documentService.getDocumentsByConditions).not.toHaveBeenCalled();
    });

it('should emit directly to remoteId room for Google storage', async () => {
      await service.publishSyncStatusToAllSessions(mockSocketId, paramsGoogle, payload);

      expect(toMock).toHaveBeenCalledWith(SocketRoomGetter.document(mockRemoteId));
      expect(exceptMock).toHaveBeenCalledWith(mockSocketId);
      expect(emitSpy).toHaveBeenCalledWith(
        `${SocketMessage.UPDATED_TEXT_CONTENT}-test-remote-id`,
        expect.objectContaining(payload)
      );
      expect(emitSpy).toHaveBeenCalledTimes(1);
    });
    
    it('should log a warning for unhandled storage types', async () => {
      const paramsOther = {
        documentId: mockDocumentId,
        documentService: DocumentStorageEnum.DROPBOX,
        remoteId: mockRemoteId,
      };

      await service.publishSyncStatusToAllSessions(mockSocketId, paramsOther, payload);

      expect(loggerService.warn).toHaveBeenCalledWith({
        context: 'publishSyncStatusToAllSessions',
        message: `Unhandled document service type: ${DocumentStorageEnum.DROPBOX}`,
      });
      expect(toMock).not.toHaveBeenCalled();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should correctly handle payload in emit for S3', async () => {
      const specificPayload = { isSyncing: true, status: DocumentSyncStatus.PREPARING, increaseVersion: false };
      await service.publishSyncStatusToAllSessions(mockSocketId, paramsS3, specificPayload);
    
      expect(emitSpy).toHaveBeenCalledWith(
        `${SocketMessage.UPDATED_TEXT_CONTENT}-${mockDocumentId}`,
        {
          isSyncing: true,
          status: DocumentSyncStatus.PREPARING,
          increaseVersion: false,
          etag: undefined,
        },
      );
    });

    it('should correctly handle payload in emit for Google documents', async () => {
      const specificPayload = { documentId: 'initial-google-doc-id', isSyncing: false, status: DocumentSyncStatus.PREPARING, increaseVersion: true, etag: '1234567890' };
    
      await service.publishSyncStatusToAllSessions(mockSocketId, paramsGoogle, specificPayload);
    
      expect(emitSpy).toHaveBeenCalledWith(
        `${SocketMessage.UPDATED_TEXT_CONTENT}-test-remote-id`,
        expect.objectContaining({
          isSyncing: specificPayload.isSyncing,
          increaseVersion: specificPayload.increaseVersion,
          status: specificPayload.status,
          documentId: paramsGoogle.documentId
        })
      );
    });
  });

  describe('Private methods access (via public methods)', () => {
    it('getUpdateTextContentMessage should format message correctly (tested via publishSyncStatusToAllSessions S3)', async () => {
      await service.publishSyncStatusToAllSessions(mockSocketId, {
        documentId: 'specific-doc-id-for-message-test',
        documentService: DocumentStorageEnum.S3,
        remoteId: 'any-remote-id',
      }, { isSyncing: false, etag: '1234567890' });

      expect(emitSpy).toHaveBeenCalledWith(
        `${SocketMessage.UPDATED_TEXT_CONTENT}-specific-doc-id-for-message-test`,
        expect.any(Object),
      );
    });

    it('getKey should format redis key correctly (tested via pushSyncStatusToQueue)', async () => {
      await service.pushSyncStatusToQueue('specific-doc-id-for-key-test', mockSessionId, { status: DocumentSyncStatus.PREPARING });
      expect(redisService.setHsetAsync).toHaveBeenCalledWith(
        `documentSync:specific-doc-id-for-key-test`,
        mockSessionId,
        expect.any(String)
      );
    });
  });
});
