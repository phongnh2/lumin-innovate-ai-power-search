import { DefaultErrorCode } from 'Common/constants/ErrorCode';
import { BadRequestException } from 'Common/errors/http/BadRequestException';
import { ConflictException } from 'Common/errors/http/ConflictException';
import { ForbiddenException } from 'Common/errors/http/ForbiddenException';
import { InternalServerErrorException } from 'Common/errors/http/InternalServerErrorException';
import { NotFoundException } from 'Common/errors/http/NotFoundException';
import { TooManyRequestException } from 'Common/errors/http/TooManyRequestException';
import { UnauthorizedException } from 'Common/errors/http/UnauthorizedException';
import { UnprocessableException } from 'Common/errors/http/UnprocessableException';

import { NotAcceptException } from './http/NotAcceptException';

export class HttpErrorException {
  public static BadRequest = (
    message: string,
    code?: string,
  ): BadRequestException => new BadRequestException(message, code || DefaultErrorCode.BAD_REQUEST);

  public static Unauthorized = (
    message: string,
    code?: string,
  ): UnauthorizedException => new UnauthorizedException(message, code || DefaultErrorCode.UNAUTHORIZED);

  public static Forbidden = (
    message: string,
    code?: string,
  ): ForbiddenException => new ForbiddenException(message, code || DefaultErrorCode.FORBIDDEN);

  public static NotFound = (
    message: string,
    code?: string,
  ): NotFoundException => new NotFoundException(message, code || DefaultErrorCode.NOT_FOUND);

  public static Conflict = (
    message: string,
    code?: string,
  ): ConflictException => new ConflictException(message, code || DefaultErrorCode.CONFLICT);

  public static InternalServerError = (
    message: string,
    code?: string,
  ): InternalServerErrorException => new InternalServerErrorException(message, code || DefaultErrorCode.INTERNAL_SERVER_ERROR);

  public static UnprocessableError = (
    message: string,
    code?: string,
  ): UnprocessableException => new UnprocessableException(message, code || DefaultErrorCode.UNPROCESSABLE_ERROR);

  public static TooManyRequests = (
    message: string,
    code?: string,
    metadata?: Record<string, unknown>,
  ): TooManyRequestException => new TooManyRequestException(message, code || DefaultErrorCode.TOO_MANY_REQUESTS, metadata);

  public static NotAcceptable = (
    message: string,
    code?: string,
  ): NotAcceptException => new NotAcceptException(message, code || DefaultErrorCode.NOT_ACCEPTABLE);
}
