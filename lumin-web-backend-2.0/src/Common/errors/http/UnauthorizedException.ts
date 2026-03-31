import {
  HttpStatus,
} from '@nestjs/common';

import { CustomHttpException } from 'Common/errors/http/CustomHttpException';

export class UnauthorizedException extends CustomHttpException {
  constructor(message: string, code: string) {
    super(message, code, HttpStatus.UNAUTHORIZED);
  }
}
