import { HttpStatus } from '@nestjs/common';
import { GrpcStatus } from 'Common/constants/GrpcConstants';

export const ServerStatusCode = {
  BAD_REQUEST: 1,
  UNAUTHORIZED: 2,
  FORBIDDEN: 3,
  NOT_FOUND: 4,
  CONFLICT: 5,
  INTERNAL: 6,
  NOT_ACCEPTABLE: 7,
  ALREADY_EXIST: 8,
};

export const ErrorMapping = {
  [ServerStatusCode.BAD_REQUEST]: {
    httpStatus: HttpStatus.BAD_REQUEST,
    grpcStatus: GrpcStatus.INVALID_ARGUMENT,
  },
  [ServerStatusCode.UNAUTHORIZED]: {
    httpStatus: HttpStatus.UNAUTHORIZED,
    grpcStatus: GrpcStatus.UNAUTHENTICATED,
  },
  [ServerStatusCode.FORBIDDEN]: {
    httpStatus: HttpStatus.FORBIDDEN,
    grpcStatus: GrpcStatus.PERMISSION_DENIED,
  },
  [ServerStatusCode.NOT_FOUND]: {
    httpStatus: HttpStatus.NOT_FOUND,
    grpcStatus: GrpcStatus.NOT_FOUND,
  },
  [ServerStatusCode.CONFLICT]: {
    httpStatus: HttpStatus.CONFLICT,
    grpcStatus: GrpcStatus.UNKNOWN,
  },
  [ServerStatusCode.INTERNAL]: {
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    grpcStatus: GrpcStatus.INTERNAL,
  },
  [ServerStatusCode.NOT_ACCEPTABLE]: {
    httpStatus: HttpStatus.NOT_ACCEPTABLE,
    grpcStatus: GrpcStatus.UNKNOWN,
  },
  [ServerStatusCode.ALREADY_EXIST]: {
    httpStatus: HttpStatus.BAD_REQUEST,
    grpcStatus: GrpcStatus.ALREADY_EXISTS,
  },
};

export interface ApplicationError {
  code: number,
  message: string,
  errorCode: string,
  metadata: Record<string, any>,
}

export class ServerErrorException {
  public static BadRequest(message: string, errorCode: string, metadata = {}): ApplicationError {
    return {
      code: ServerStatusCode.BAD_REQUEST,
      message,
      errorCode,
      metadata,
    };
  }

  public static Unauthorized(message: string, errorCode: string, metadata = {}): ApplicationError {
    return {
      code: ServerStatusCode.UNAUTHORIZED,
      message,
      errorCode,
      metadata,
    };
  }

  public static Forbidden(message: string, errorCode: string, metadata = {}): ApplicationError {
    return {
      code: ServerStatusCode.FORBIDDEN,
      message,
      errorCode,
      metadata,
    };
  }

  public static NotFound(message: string, errorCode: string, metadata = {}): ApplicationError {
    return {
      code: ServerStatusCode.NOT_FOUND,
      message,
      errorCode,
      metadata,
    };
  }

  public static Conflict(message: string, errorCode: string, metadata = {}): ApplicationError {
    return {
      code: ServerStatusCode.CONFLICT,
      message,
      errorCode,
      metadata,
    };
  }

  public static Internal(message: string, errorCode: string, metadata = {}): ApplicationError {
    return {
      code: ServerStatusCode.INTERNAL,
      message,
      errorCode,
      metadata,
    };
  }

  public static NotAcceptable(message: string, errorCode: string, metadata = {}): ApplicationError {
    return {
      code: ServerStatusCode.NOT_ACCEPTABLE,
      message,
      errorCode,
      metadata,
    };
  }

  public static AlreadyExist(message: string, errorCode: string, metadata = {}): ApplicationError {
    return {
      code: ServerStatusCode.ALREADY_EXIST,
      message,
      errorCode,
      metadata,
    };
  }
}
