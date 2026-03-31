import { HttpErrorCode } from '@/constants/errorCode';
import { IException } from '@/lib/exceptions/interfaces/exception';

import { BaseException } from '../base.exception';

export class UnauthorizedException extends BaseException {
  constructor({ message, meta, code }: IException) {
    super(HttpErrorCode.UNAUTHORIZED, message, code, meta);
  }
}
