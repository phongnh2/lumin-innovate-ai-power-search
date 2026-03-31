/* eslint-disable max-classes-per-file */
export class GrpcStatus {
  public static readonly OK = 0;

  public static readonly CANCELLED = 1;

  public static readonly UNKNOWN = 2;

  public static readonly INVALID_ARGUMENT = 3;

  public static readonly NOT_FOUND = 5;

  public static readonly ALREADY_EXISTS = 6;

  public static readonly PERMISSION_DENIED = 7;

  public static readonly RESOURCE_EXHAUSTED = 8;

  public static readonly ABORTED = 10;

  public static readonly INTERNAL = 13;

  public static readonly UNAUTHENTICATED = 16;
}

export class GrpcAvailableServices {
  public static readonly LUMIN_CONTRACT = 'LUMIN_CONTRACT';

  public static readonly LUMIN_TOOL = 'LUMIN_TOOL';
}

export const GrpcRequestAllowedSerivces = [
  GrpcAvailableServices.LUMIN_CONTRACT,
  GrpcAvailableServices.LUMIN_TOOL,
];
