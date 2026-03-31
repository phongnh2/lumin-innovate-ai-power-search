import {
  HttpStatus,
} from '@nestjs/common';

import { CustomHttpException } from 'Common/errors/http/CustomHttpException';

export class UnprocessableException extends CustomHttpException {
  constructor(message: string, code: string) {
    super(message, code, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
