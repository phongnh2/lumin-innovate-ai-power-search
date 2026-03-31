/* eslint-disable class-methods-use-this */
import selectors from 'selectors';
import { store } from 'store';

import { commandHandler } from 'HOC/OfflineStorageHOC';

import logger from 'helpers/logger';

import { annotationSyncQueue } from 'features/AnnotationSyncQueue';

import { type ISocketHandler } from './handlers';

export class AnnotationSyncHandler implements ISocketHandler {
  name = 'annotationSync';

  private async processQueueForCurrentDocument(): Promise<void> {
    try {
      const state = store.getState();
      const currentDocument = selectors.getCurrentDocument(state);

      if (currentDocument?._id) {
        await annotationSyncQueue.processQueueForDocument(currentDocument._id);

        logger.logInfo({
          message: 'Annotation sync queue processed successfully',
          reason: 'Socket connection established - processing queued annotations',
        });
      }
    } catch (error) {
      logger.logError({
        message: 'Failed to process annotation queue on socket connection',
        reason: 'Error processing queued annotations',
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  onConnect = (): void => {
    commandHandler.enabledOfflineTracking = false;
  };

  onReconnect = async (): Promise<void> => {
    await this.processQueueForCurrentDocument();
    commandHandler.enabledOfflineTracking = false;
  };

  onDisconnect = (): void => {
    commandHandler.enabledOfflineTracking = true;
  };
}

export const annotationSyncHandler = new AnnotationSyncHandler();
