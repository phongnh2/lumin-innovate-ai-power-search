import {
  HttpStatus,
} from '@nestjs/common';

import { CustomHttpException } from 'Common/errors/http/CustomHttpException';

export class ForbiddenException extends CustomHttpException {
  constructor(message: string, code: string) {
    super(message, code, HttpStatus.FORBIDDEN);
  }
}
