export enum OpenOneDriveErrorCode {
  UnhanledExeption = 'unhandled_exception',
  WrongAccount = 'wrong_account',
  InvalidCredentials = 'invalid_credentials',
  AccessDenied = 'access_denied',
  InteractionRequired = 'interaction_required',
}

export interface GA4OpenOneDriveCommonAttributes {
  userAgent: string;
  anonymousUserId: string;
  ipAddress: string;
  currentUrl: string;
  referrer: string;
  isBusinessDomain: boolean;
}
