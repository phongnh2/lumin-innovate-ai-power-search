import { OryResponseCode } from '@/lib/ory/errors';

export const ErrorCode = {
  User: {
    EMAIL_IS_BANNED: 'email_is_banned',
    PASSWORD_EXPIRED: 'password_expired',
    THIRD_PARTY_ACCOUNT: 'third_party_account',
    INCORRECT_EMAIL_PASSWORD: 'incorrect_email_password',
    UNACTIVATED_ACCOUNT: 'unactivated_account',
    EMAIL_EXISTS: 'email_exists',
    ALREADY_SIGNED_IN_ANOTHER_METHOD: 'already_signed_in_another_method',
    USER_NOT_FOUND: 'user_not_found',
    RECAPTCHA_V2_VALIDATION_FAILED: 'recaptcha_v2_validation_failed',
    ALREADY_VERIFIED: 'already_verified',
    UPDATED_NAME_INVALID: 'updated_name_invalid',
    EMAIL_NOT_CONFIGURED_FOR_SSO: 'email_not_configured_for_sso'
  },
  Avatar: {
    LIMIT_FILE_SIZE: 'limit_file_size',
    ONLY_ONE_FILE_ALLOWED: 'only_one_file_allowed',
    VALID_TYPE: 'valid_type',
    FILE_TYPE_NOT_EXIST: 'file_type_not_exist'
  },
  Password: {
    SIMILARITY_PASSWORD: 'similarity_password',
    LEAKED_PASSWORD: 'leaked_password'
  },
  Auth: {
    BROWSER_LOCATION_CHANGE_REQUIRED: 'browser_location_change_required',
    SESSION_ALREADY_AVAILABLE: 'session_already_available',
    TOKEN_EXPIRED: 'token_expired',
    SESSION_REFRESH_REQUIRED: 'session_refresh_required'
  }
};

//Mapping Ory error code to our system error code
const OryErrorCode = {
  [OryResponseCode.INCORRECT_CREDENTIALS]: {
    withReason() {
      return ErrorCode.User.INCORRECT_EMAIL_PASSWORD;
    }
  },
  [OryResponseCode.UNACTIVATED_ACCOUNT]: {
    withReason() {
      return ErrorCode.User.UNACTIVATED_ACCOUNT;
    }
  },
  [OryResponseCode.EMAIL_EXISTS]: {
    withReason() {
      return ErrorCode.User.EMAIL_EXISTS;
    }
  },
  [OryResponseCode.PASSWORD_SIMILARITY]: {
    withReason() {
      return ErrorCode.Password.SIMILARITY_PASSWORD;
    }
  },
  [OryResponseCode.PASSWORD_LEAKED]: {
    withReason() {
      return ErrorCode.Password.LEAKED_PASSWORD;
    }
  }
};

export const GetOryErrorCode = (id: number) => {
  const oryErrorCode = OryErrorCode[id];
  return oryErrorCode ? oryErrorCode.withReason() : id;
};

export enum HttpErrorCode {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  CONFLICT = 409,
  UNPROCESS_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500
}
