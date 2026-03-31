import { HttpErrorCode } from '@/constants/errorCode';
import { IException } from '@/lib/exceptions/interfaces/exception';

import { BaseException } from '../base.exception';

export class MethodNotAllowedException extends BaseException {
  constructor({ message, meta, code }: IException) {
    super(HttpErrorCode.NOT_ALLOWED, message, code, meta);
  }
}
