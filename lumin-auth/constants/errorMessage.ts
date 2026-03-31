import { ValidatorRule } from './validator-rule';

export const CommonErrorMessage = {
  User: {
    EMAIL_IS_BANNED: 'errorMessage.emailIsBanned',
    EMAIL_READY_EXISTS: 'errorMessage.emailExisted',
    PASSWORD_EXPIRED: 'errorMessage.passwordExpired',
    THIRD_PARTY_ACCOUNT: 'errorMessage.alreadySignupByThirdParty',
    INCORRECT_CREDENTIAL: 'errorMessage.incorrectEmailOrPassword',
    USER_NOT_FOUND: 'errorMessage.userNotFound',
    RECAPTCHA_V2_VALIDATION_FAILED: 'errorMessage.verifyRecaptchaFailed',
    ALREADY_SIGNED_IN_ANOTHER_METHOD: 'errorMessage.alreadySignedInAnotherMethod',
    UNACTIVATED_ACCOUNT: 'errorMessage.unVerifyAccount',
    ALREADY_VERIFIED: 'errorMessage.alreadyVerified'
  },
  Avatar: {
    LIMIT_FILE_SIZE: {
      key: 'errorMessage.avatarOversize',
      interpolation: { avatarSizeLimit: ValidatorRule.Avatar.MaximumAvatarSize / 1024 / 1024 }
    },
    ONLY_ONE_FILE_ALLOWED: 'errorMessage.onlyOnFileAllowed',
    VALID_TYPE: 'errorMessage.validFile',
    FILE_TYPE_NOT_EXIST: 'errorMessage.fileTypeNotExist'
  },
  Password: {
    SIMILARITY_PASSWORD: 'errorMessage.similarPassword',
    LEAKED_PASSWORD: 'errorMessage.leakedPassword'
  },
  Common: {
    GRPC_ERROR: 'errorMessage.grpcError',
    SOMETHING_WENT_WRONG: 'errorMessage.unknownError'
  },
  Auth: {
    SESSION_ALREADY_AVAILABLE: 'errorMessage.forceLogoutTitle'
  }
};
