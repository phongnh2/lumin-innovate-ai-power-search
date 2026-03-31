import {
  HttpStatus,
} from '@nestjs/common';

import { CustomHttpException } from 'Common/errors/http/CustomHttpException';

export class TooManyRequestException extends CustomHttpException {
  constructor(message: string, code: string, metadata?: Record<string, unknown>) {
    super(message, code, HttpStatus.TOO_MANY_REQUESTS, metadata);
  }
}
