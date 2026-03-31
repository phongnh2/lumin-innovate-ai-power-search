import logger from 'helpers/logger';

import { UseChatErrorType, ErrorDetailsType } from '../types';

export class ErrorExtractor {
  static extractUseChatError(error: Error): UseChatErrorType {
    try {
      const errorData = JSON.parse(error.message) as UseChatErrorType;
      return {
        code: errorData.code,
        details: errorData.details,
      };
    } catch (e) {
      logger.logError({
        error: e,
        message: 'Failed to extract use chat error',
      });
      return {
        code: null,
        details: {} as ErrorDetailsType,
      };
    }
  }
}
