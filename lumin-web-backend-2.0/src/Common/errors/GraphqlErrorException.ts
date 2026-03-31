import { BadRequestException } from 'Common/errors/graphql/BadRequestException';
import { UnauthorizedException } from 'Common/errors/graphql/UnauthorizedException';
import { ConflictException } from 'Common/errors/graphql/ConflictException';
import { ForbiddenException } from 'Common/errors/graphql/ForbiddenException';
import { InternalServerErrorException } from 'Common/errors/graphql/InternalServerErrorException';
import { NotFoundException } from 'Common/errors/graphql/NotFoundException';
import { UnprocessableException } from 'Common/errors/graphql/UnprocessableException';
import { NotAcceptException } from 'Common/errors/graphql/NotAcceptException';
import { ApplicationError, ErrorMapping } from 'Common/errors/ServerErrorException';
import { GraphqlException } from 'Common/errors/graphql/GraphException';
import { TooManyRequestException } from 'Common/errors/graphql/TooManyRequestException';
import { DefaultErrorCode } from 'Common/constants/ErrorCode';

export class GraphErrorException {
  public static BadRequest = (message: string, code?: string, metadata = {}): BadRequestException => new BadRequestException(
    message, code || DefaultErrorCode.BAD_REQUEST, metadata,
  );

  public static Unauthorized = (message: string, code?: string, metadata = {}): UnauthorizedException => new UnauthorizedException(
    message, code || DefaultErrorCode.UNAUTHORIZED, metadata,
  );

  public static NotAcceptable = (message: string, code?: string, metadata = {}): NotAcceptException => new NotAcceptException(
    message, code || DefaultErrorCode.NOT_ACCEPTABLE, metadata,
  );

  public static Forbidden = (message: string, code?: string, metadata = {}): ForbiddenException => new ForbiddenException(
    message, code || DefaultErrorCode.FORBIDDEN, metadata,
  );

  public static NotFound = (message: string, code?: string, metadata = {}): NotFoundException => new NotFoundException(
    message, code || DefaultErrorCode.NOT_FOUND, metadata,
  );

  public static Conflict = (message: string, code?: string, metadata = {}): ConflictException => new ConflictException(
    message, code || DefaultErrorCode.CONFLICT, metadata,
  );

  public static InternalServerError = (
    message: string, code?: string, metadata = {},
  ): InternalServerErrorException => new InternalServerErrorException(
    message, code || DefaultErrorCode.INTERNAL_SERVER_ERROR, metadata,
  );

  public static UnprocessableError = (message: string, code?: string, metadata = {}): UnprocessableException => new UnprocessableException(
    message, code || DefaultErrorCode.UNPROCESSABLE_ERROR, metadata,
  );

  public static TooManyRequests = (message: string, code?: string, metadata = {}): TooManyRequestException => new TooManyRequestException(
    message, code || DefaultErrorCode.TOO_MANY_REQUESTS, metadata,
  );

  public static ApplicationError = (error: ApplicationError): GraphqlException => {
    const { code, errorCode, metadata } = error;
    const statusCode = ErrorMapping[code].httpStatus;
    return new GraphqlException(error.message, errorCode, statusCode, metadata);
  }
}
