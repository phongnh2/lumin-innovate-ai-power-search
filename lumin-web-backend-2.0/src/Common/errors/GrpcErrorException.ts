import { Metadata } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

import { GrpcStatus } from 'Common/constants/GrpcConstants';
import { ApplicationError, ErrorMapping } from 'Common/errors/ServerErrorException';

export class GrpcErrorException {
  public static PermissionDenied = (message: string, errorCode: string): RpcException => {
    const metadata = new Metadata();
    metadata.set('error_code', errorCode);
    return new RpcException({
      message,
      errorCode,
      code: GrpcStatus.PERMISSION_DENIED,
      metadata,
    });
  };

  public static InvalidArgument = (message: string, errorCode: string): RpcException => {
    const metadata = new Metadata();
    metadata.set('error_code', errorCode);
    return new RpcException({
      message,
      errorCode,
      code: GrpcStatus.INVALID_ARGUMENT,
      metadata,
    });
  };

  public static NotFound = (message: string, errorCode: string): RpcException => {
    const metadata = new Metadata();
    metadata.set('error_code', errorCode);
    return new RpcException({
      message,
      errorCode,
      code: GrpcStatus.NOT_FOUND,
      metadata,
    });
  };

  public static Unknown = (message: string, errorCode: string): RpcException => {
    const metadata = new Metadata();
    metadata.set('error_code', errorCode);
    return new RpcException({
      message,
      errorCode,
      code: GrpcStatus.UNKNOWN,
      metadata,
    });
  };

  public static TooManyRequests = (message: string, errorCode: string, details: Record<string, unknown> = {}): RpcException => {
    const metadata = new Metadata();
    metadata.set('error_code', errorCode);
    metadata.set('details', JSON.stringify(details));
    return new RpcException({
      message,
      errorCode,
      code: GrpcStatus.RESOURCE_EXHAUSTED,
      metadata,
    });
  };

  public static Internal = (message: string, errorCode: string): RpcException => {
    const metadata = new Metadata();
    metadata.set('error_code', errorCode);
    return new RpcException({
      message,
      errorCode,
      code: GrpcStatus.INTERNAL,
      metadata,
    });
  };

  public static ApplicationError = (error: ApplicationError): RpcException => {
    const { code, errorCode, metadata } = error;
    const statusCode = ErrorMapping[code].grpcStatus;
    return new RpcException({
      message: error.message,
      code: statusCode,
      errorCode,
      additionData: metadata,
    });
  };
}
