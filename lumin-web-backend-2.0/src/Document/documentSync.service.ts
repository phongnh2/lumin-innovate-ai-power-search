import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { EventsGateway } from 'Gateway/SocketIoConfig';
import { SocketMessage } from 'Gateway/SocketMessage';
import { SocketRoomGetter } from 'Gateway/SocketRoom';
import { LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';

import { DocumentStorageEnum } from './document.enum';
import { DocumentService } from './document.service';
import { DocumentSyncStatus } from './enums/document.sync.enum';

@Injectable()
export class DocumentSyncService {
  private readonly KEY_PREFIX = 'documentSync:';

  private readonly KEY_TTL_SECONDS = 60 * 60; // 1 hour TTL

  constructor(
    private readonly redisService: RedisService,
    private readonly loggerService: LoggerService,
    @Inject(forwardRef(() => EventsGateway))
    private readonly messageGateway: EventsGateway,
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
  ) {}

  private getKey(documentId: string) {
    return `${this.KEY_PREFIX}${documentId}`;
  }

  /**
   * Start or update a user's sync session for a document.
   * Stores last update timestamp in Redis and resets the TTL.
   *
   * @param status - The current sync status:
   *   - `preparing`: Document is being prepared for syncing (initial stage)
   *   - `syncing`: Document is actively being synced to storage
   */
  async pushSyncStatusToQueue(
    documentId: string,
    sessionId: string,
    {
      status,
      etag,
    }: {
      status: DocumentSyncStatus,
      etag?: string,
    },
  ): Promise<void> {
    const key = this.getKey(documentId);
    const now = Date.now();
    const payload = JSON.stringify({ updatedAt: now, status, etag });
    try {
      await this.redisService.setHsetAsync(key, sessionId, payload);
      this.redisService.setExpireKey(key, this.KEY_TTL_SECONDS);
    } catch (error) {
      this.loggerService.error({
        context: this.pushSyncStatusToQueue.name,
        message: `[pushSyncStatus] failed doc=${documentId} session=${sessionId}`,
        error,
      });
      throw error;
    }
  }

  /**
   * Retrieve all active sync sessions for a document,
   * returning whether any users are still syncing.
   */
  async checkDocumentSyncStatus(
    documentId: string,
  ): Promise<{
    isSyncing: boolean;
    sessions: { sessionId: string; updatedAt: number }[];
  }> {
    const key = this.getKey(documentId);
    try {
      const exists = await this.redisService.isKeyExisted(key);
      if (!exists) {
        return { isSyncing: false, sessions: [] };
      }

      const raw = await this.redisService.getAllHsetData<string>(key);
      const sessions = raw.map(({ key: sId, value }) => {
        try {
          const { updatedAt } = JSON.parse(value);
          return { sessionId: sId, updatedAt };
        } catch {
          return { sessionId: sId, updatedAt: 0 };
        }
      });

      const isSyncing = sessions.length > 0;
      return { isSyncing, sessions };
    } catch (error) {
      this.loggerService.error({
        context: this.checkDocumentSyncStatus.name,
        message: `[checkStatus] failed doc=${documentId}`,
        stack: (error as Error).stack,
        error,
      });
      throw error;
    }
  }

  /**
   * Remove a session's sync state.
   * If no sessions remain, delete the Redis key entirely.
   */
  async clearDocumentSyncStatus(
    documentId: string,
    sessionId: string,
  ): Promise<boolean> {
    const key = this.getKey(documentId);
    try {
      const removed = await this.redisService.removeKeyFromhset(key, sessionId);
      const remaining = await this.redisService.getHashLength(key);
      if (remaining === 0) {
        await this.redisService.deleteRedisByKey(key);
      }
      return removed;
    } catch (error) {
      this.loggerService.error({
        context: this.clearDocumentSyncStatus.name,
        message: `[clearSync] failed doc=${documentId} session=${sessionId}`,
        stack: (error as Error).stack,
        error,
      });
      throw error;
    }
  }

  async removePreparedSyncStatus(documentId: string, sessionId: string): Promise<boolean> {
    const key = this.getKey(documentId);
    try {
      const data = await this.redisService.getAllHsetData<string>(key);
      if (!data) {
        return false;
      }

      const preparedSession = data.find(({ key: sId, value }) => {
        try {
          const { status } = JSON.parse(value);
          return sId === sessionId && status === DocumentSyncStatus.PREPARING;
        } catch {
          return false;
        }
      });
      if (!preparedSession) {
        return false;
      }

      const removed = await this.redisService.removeKeyFromhset(key, sessionId);
      const remaining = await this.redisService.getHashLength(key);
      if (remaining === 0) {
        await this.redisService.deleteRedisByKey(key);
      }
      return removed;
    } catch (error) {
      this.loggerService.error({
        context: this.removePreparedSyncStatus.name,
        message: `[removePreparedSync] failed doc=${documentId} session=${sessionId}`,
        stack: (error as Error).stack,
        error,
      });
      throw error;
    }
  }

  publishSyncStatusToAllSessions(
    senderId: string,
    { documentId, documentService, remoteId }: {
      documentId: string;
      documentService: DocumentStorageEnum;
      remoteId?: string;
    },
    payload: { increaseVersion?: boolean; isSyncing: boolean; status?: DocumentSyncStatus; etag?: string },
  ) {
    const messagePayload = {
      isSyncing: payload.isSyncing,
      increaseVersion: payload.increaseVersion,
      status: payload.status,
      etag: payload.etag,
    };

    switch (documentService) {
      case DocumentStorageEnum.S3:
        this.messageGateway.server
          .to(SocketRoomGetter.document(documentId))
          .except(senderId)
          .emit(`${SocketMessage.UPDATED_TEXT_CONTENT}-${documentId}`, messagePayload);
        break;

      case DocumentStorageEnum.GOOGLE:
        if (remoteId) {
          // Emit directly to the remoteId room - all users with same remoteId are already in this room
          // This eliminates the need to iterate through thousands of individual document rooms
          this.messageGateway.server
            .to(SocketRoomGetter.document(remoteId))
            .except(senderId)
            .emit(`${SocketMessage.UPDATED_TEXT_CONTENT}-${remoteId}`, {
              ...messagePayload,
              documentId,
            });
        }
        break;

      default:
        this.loggerService.warn({
          context: this.publishSyncStatusToAllSessions.name,
          message: `Unhandled document service type: ${documentService}`,
        });
    }
  }
}
