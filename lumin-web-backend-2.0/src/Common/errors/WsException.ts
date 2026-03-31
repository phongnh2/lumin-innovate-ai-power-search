import { WsException } from '@nestjs/websockets';

import { DefaultErrorCode } from 'Common/constants/ErrorCode';

export class WsErrorException {
  public static BadRequest = (message: string, code?: string): WsException => new WsException({
    message,
    code: code || DefaultErrorCode.BAD_REQUEST,
  });

  public static Unauthorized = (message: string, code?: string): WsException => new WsException({
    message,
    code: code || DefaultErrorCode.UNAUTHORIZED,
  });

  public static NotFound = (message: string, code?: string): WsException => new WsException({
    message,
    code: code || DefaultErrorCode.NOT_FOUND,
  });

  public static Forbidden = (message: string, code?: string): WsException => new WsException({ message, code: code || DefaultErrorCode.FORBIDDEN });

  public static InternalServerError = (
    message: string,
    code?: string,
  ): WsException => new WsException({
    message,
    code: code || DefaultErrorCode.INTERNAL_SERVER_ERROR,
  });

  public static UnprocessableError = (
    message: string,
    code?: string,
  ): WsException => new WsException({
    message,
    code: code || DefaultErrorCode.UNPROCESSABLE_ERROR,
  });
}
