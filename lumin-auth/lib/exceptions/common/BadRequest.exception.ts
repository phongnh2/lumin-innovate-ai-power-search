import { HttpErrorCode } from '@/constants/errorCode';
import { IException } from '@/lib/exceptions/interfaces/exception';

import { BaseException } from '../base.exception';

export class BadRequestException extends BaseException {
  constructor({ message, meta, code }: IException) {
    super(HttpErrorCode.BAD_REQUEST, message, code, meta);
  }
}
