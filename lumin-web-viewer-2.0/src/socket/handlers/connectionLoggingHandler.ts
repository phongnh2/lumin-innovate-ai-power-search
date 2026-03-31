/* eslint-disable class-methods-use-this */
import logger from 'helpers/logger';

import { type ISocketHandler } from './handlers';

export class ConnectionLoggingHandler implements ISocketHandler {
  name = 'connectionLogging';

  onConnect = (): void => {
    logger.logInfo({
      message: 'Socket connected successfully',
      reason: 'Socket connection established',
    });
  };

  onReconnect = ({ attemptNumber, pathName }: { attemptNumber: number; pathName: string }): void => {
    logger.logInfo({
      message: 'Socket reconnected successfully',
      reason: 'Socket reconnection completed',
      attributes: {
        attemptNumber,
        pathName,
      },
    });
  };

  onReconnectAttempt = ({ attemptNumber, pathName }: { attemptNumber: number; pathName: string }): void => {
    logger.logInfo({
      message: 'Reconnect attempt',
      reason: 'Log reconnect attempt to server',
      attributes: {
        attemptNumber,
        pathName,
      },
    });
  };

  onDisconnect = (reason?: string): void => {
    logger.logInfo({
      message: 'Socket disconnected',
      reason: 'Socket connection lost',
      attributes: { reason },
    });
  };

  onReconnectFailed = ({ pathName }: { pathName: string }): void => {
    logger.logInfo({
      message: 'Reconnect failed',
      reason: 'Log reconnect to server failure after all attempts	',
      attributes: {
        pathName,
      },
    });
  };

  onReconnectError = ({ error, pathName }: { error: Error; pathName: string }): void => {
    logger.logInfo({
      message: 'Reconnect error',
      reason: 'Log reconnect to server error',
      attributes: {
        ...error,
        pathName,
      },
    });
  };
}

export const connectionLoggingHandler = new ConnectionLoggingHandler();
