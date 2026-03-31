import { HttpErrorCode } from '@/constants/errorCode';
import { IException } from '@/lib/exceptions/interfaces/exception';

import { BaseException } from '../base.exception';

export class UnprocessEntityException extends BaseException {
  constructor({ message, meta, code }: IException) {
    super(HttpErrorCode.UNPROCESS_ENTITY, message, code, meta);
  }
}
