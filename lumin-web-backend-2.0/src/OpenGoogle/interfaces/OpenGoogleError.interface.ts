/* eslint-disable max-classes-per-file */
export enum OpenGoogleErrorCode {
  INVALID_CREDENTIALS = 'invalid_credentials',
  WRONG_ACCOUNT = 'wrong_account',
  ACCESS_DENIED = 'access_denied',
  INSUFFICIENT_PERMISSION = 'insufficient_permission',
  MEMBERSHIP_REQUIRED = 'membership_required',
  IP_ADDRESS_BLOCKED = 'ip_address_blocked',
  INVALID_MIMETYPE = 'invalid_mimetype'
}

type TMetadataBase = Record<string, unknown>;

export class OpenGoogleError<TMetadata extends TMetadataBase = TMetadataBase> extends Error {
  private _code: OpenGoogleErrorCode;

  private _metadata: TMetadata;

  constructor({ message, code, metadata }: {
    message: string,
    code: OpenGoogleErrorCode,
    metadata?: TMetadata
  }) {
    super(message);
    this._code = code;
    this._metadata = metadata;
  }

  is(code: OpenGoogleErrorCode): boolean {
    return this.code === code;
  }

  static isInstance(error: Error): boolean {
    return error instanceof OpenGoogleError;
  }

  get code(): OpenGoogleErrorCode { return this._code; }

  get metadata(): TMetadata { return this._metadata; }
}

export type AccessDenied = OpenGoogleError<{ email: string }>;

export type WrongAccount = OpenGoogleError<{ email: string }>;

export type InsufficientPermission = OpenGoogleError<{ email: string }>;

export type MembershipRequired = OpenGoogleError<{ email: string }>;

export type IpAddressBlocked = OpenGoogleError<{ email: string }>;

export type InvalidMimeType = OpenGoogleError<{ mimetype: string; nextUrl: string; }>;

export class OpenGoogleErrorException {
  static InvalidCredentials = (message: string): OpenGoogleError => new OpenGoogleError(
    { message, code: OpenGoogleErrorCode.INVALID_CREDENTIALS },
  );

  static WrongAccount = (message: string, metadata: { email: string })
  : WrongAccount => new OpenGoogleError<{ email: string }>(
    { message, code: OpenGoogleErrorCode.WRONG_ACCOUNT, metadata },
  );

  static AccessDenied = (message: string, metadata: { email: string })
  : AccessDenied => new OpenGoogleError<{ email: string }>(
    { message, code: OpenGoogleErrorCode.ACCESS_DENIED, metadata },
  );

  static InsufficientPermission = (message: string, metadata: { email: string })
  : InsufficientPermission => new OpenGoogleError<{email:string}>(
    { message, code: OpenGoogleErrorCode.INSUFFICIENT_PERMISSION, metadata },
  );

  static MembershipRequired = (message: string, metadata: { email: string }): MembershipRequired => new OpenGoogleError(
    { message, code: OpenGoogleErrorCode.MEMBERSHIP_REQUIRED, metadata },
  );

  static IpAddressBlocked = (message: string, metadata: { email: string }): IpAddressBlocked => new OpenGoogleError(
    { message, code: OpenGoogleErrorCode.IP_ADDRESS_BLOCKED, metadata },
  );

  static InvalidMimeType = (message: string, metadata: { mimetype: string; nextUrl: string; }): InvalidMimeType => new OpenGoogleError(
    { message, code: OpenGoogleErrorCode.INVALID_MIMETYPE, metadata },
  );
}
