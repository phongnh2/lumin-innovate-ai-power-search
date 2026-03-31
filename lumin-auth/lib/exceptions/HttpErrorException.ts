import { IException } from '@/lib/exceptions/interfaces/exception';

import { BadRequestException } from './common/BadRequest.exception';
import { ForbiddenException } from './common/Forbidden.exception';
import { MethodNotAllowedException } from './common/MethodNotAllowed.exception';
import { UnauthorizedException } from './common/Unauthorized.exception';

export class HttpErrorException {
  public static BadRequest = ({ message, code, meta = {} }: IException): BadRequestException => new BadRequestException({ message, meta, code });
  public static Forbidden = ({ message, code, meta = {} }: IException): ForbiddenException => new ForbiddenException({ message, meta, code });
  public static NotAllowMethod = ({ message, code, meta = {} }: IException): MethodNotAllowedException =>
    new MethodNotAllowedException({ message, meta, code });
  public static Unauthorized = ({ message, code, meta = {} }: IException): UnauthorizedException => new UnauthorizedException({ message, meta, code });
}
