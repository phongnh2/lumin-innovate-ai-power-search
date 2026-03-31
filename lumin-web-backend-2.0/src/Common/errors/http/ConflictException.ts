import {
  HttpStatus,
} from '@nestjs/common';

import { CustomHttpException } from 'Common/errors/http/CustomHttpException';

export class ConflictException extends CustomHttpException {
  constructor(message: string, code: string) {
    super(message, code, HttpStatus.CONFLICT);
  }
}
