import {
  HttpStatus,
} from '@nestjs/common';

import { CustomHttpException } from 'Common/errors/http/CustomHttpException';

export class BadRequestException extends CustomHttpException {
  constructor(message: string, code: string) {
    super(message, code, HttpStatus.BAD_REQUEST);
  }
}
