import {
  HttpStatus,
} from '@nestjs/common';

import { CustomHttpException } from 'Common/errors/http/CustomHttpException';

export class NotAcceptException extends CustomHttpException {
  constructor(message: string, code: string) {
    super(message, code, HttpStatus.NOT_ACCEPTABLE);
  }
}
