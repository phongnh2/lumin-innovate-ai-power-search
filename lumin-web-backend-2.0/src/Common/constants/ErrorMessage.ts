const ErrorMessage = {
  DOCUMENT: {
    FILE_SIZE: {
      FREE: 'The file you uploaded is too large. Please upload file below 20MB',
      PAID: 'The file you uploaded is too large. Please upload file below 200MB',
    },
    DAILY_UPLOAD: 'Daily document uploads reached the limit. Try again tomorrow.',
    INVALID: 'Invalid document. We don\'t support this file type.',
    BACKUP_EXISTED: 'Backup document existed',
    FILE_TYPE: 'Invalid file type. File must be in pdf/png/jpg/jpeg format',
    ONLY_VALID_IN_LUMIN_STORAGE: 'Document must be stored in Lumin storage',
    TEMPLATE_QUOTA_EXCEEDED: 'Template quota exceeded. Please remove some templates and try again.',
    DOMAIN_BLOCKED_FROM_CREATING_EXTERNAL_PDF: 'Domain blocked from creating external PDF',
  },
  TEMPLATE: {
    FILE_SIZE: 'The file you uploaded is too large. Please upload file below 200MB',
    DAILY_UPLOAD: 'Daily template uploads reached the limit. Try again tomorrow.',
  },
  COMMON: {
    INVALID_PASSWORD: 'Password must contain no whitespace, 8 characters, one uppercase, one lowercase and one number',
    RECAPTCHA_V3_VALIDATION_FAILED: 'Google recaptcha validation failed',
    EXCEED_THUMBNAIL_SIZE: 'Thumbnail file size exceeded the maximum allowed limit.',
  },
  COUPON: {
    INVALID: 'The coupon code is invalid.',
    NOT_FOUND: 'The coupon code does not exist.',
    EXPIRED: 'The coupon code has expired.',
    LIMIT_REACHED: 'The maximum number of redemptions for this coupon code has been reached.',
    INVALID_CURRENCY: 'The coupon code is invalid for your currency.',
  },
  USER: {
    USER_NOT_FOUND: 'User not found',
    ALREADY_SIGNED_IN_ANOTHER_METHOD: 'You already signed in with another method',
  },
  ORGANIZATION: {
    ORGANIZATION_NOT_FOUND: 'Organization not found',
    MEMBERSHIP_NOT_FOUND: 'Membership not found',
  },
  ORGANIZATION_TEAM: {
    TEAM_NOT_FOUND: 'Team not found',
    MEMBERSHIP_NOT_FOUND: 'Membership not found',
  },
};

export {
  ErrorMessage,
};
