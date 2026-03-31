export enum XeroOAuthMessageType {
  ERROR = 'XERO_OAUTH_ERROR',
  SUCCESS = 'XERO_OAUTH_SUCCESS',
  CANCELLED = 'XERO_OAUTH_CANCELLED'
}

export interface XeroOAuthMessage {
  type: XeroOAuthMessageType;
  email?: string;
  error?: string;
}
