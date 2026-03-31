export const FORM_INPUT_NAME = {
  // Common
  EMAIL: 'email',
  NAME: 'name',
  SIGN_ON_NAME: 'yourName',

  // Payment
  CARDHOLDER_NAME: 'cardholderName',
  CARD_NUMBER: 'cardNumber',
  EXP_DATE: 'expDate',
  CVC: 'cvc',
  PROMOTION_CODE: 'promotionCode',

  // Authentication
  PASSWORD: 'password',

  // Organization
  ORGANIZATION_TYPE: 'organizationType',
  ORGANIZATION_NAME: 'organizationName',
  INVITED_EMAIL: 'invitedEmail',
  ORGANIZATION_AVATAR: 'organizationAvatar',

  // Template
  TEMPLATE_THUMBNAIL: 'templateThumbnail',
  TEMPLATE_NAME: 'templateName',
  TEMPLATE_DESCRIPTION: 'templateDescription',
  TEMPLATE_DESTINATION: 'templateDestination',

  // Signatures
  PLACE_MULTIPLE_SIGNATURES: 'placeSignatureMultipleTimes',

  INVITE_MEMBER: 'invitedEmail',
};

export const FORM_INPUT_PURPOSE = {
  [FORM_INPUT_NAME.EMAIL]: "User's email",
  [FORM_INPUT_NAME.NAME]: "User's name",
  [FORM_INPUT_NAME.CARDHOLDER_NAME]: "Cardholder's name",
  [FORM_INPUT_NAME.CARD_NUMBER]: "User's card number",
  [FORM_INPUT_NAME.EXP_DATE]: "User's exp date",
  [FORM_INPUT_NAME.CVC]: "User's cvc",
  [FORM_INPUT_NAME.PROMOTION_CODE]: "User's promotion code",
  [FORM_INPUT_NAME.PASSWORD]: "User's password",

  [FORM_INPUT_NAME.ORGANIZATION_TYPE]: 'Organization creation type',
  [FORM_INPUT_NAME.ORGANIZATION_NAME]: "Organization's name",
  [FORM_INPUT_NAME.INVITED_EMAIL]: "Invited member's email",
  [FORM_INPUT_NAME.ORGANIZATION_AVATAR]: "Organization's avatar",

  [FORM_INPUT_NAME.TEMPLATE_THUMBNAIL]: "Customize template's thumbnail",
  [FORM_INPUT_NAME.TEMPLATE_NAME]: "Customize template's name",
  [FORM_INPUT_NAME.TEMPLATE_DESCRIPTION]: "Input template's description",
  [FORM_INPUT_NAME.TEMPLATE_DESTINATION]: "Change template's destination",

  [FORM_INPUT_NAME.PLACE_MULTIPLE_SIGNATURES]: 'The user leave a check on the Place signature multiple times checkbox to place signature',

  [FORM_INPUT_NAME.INVITE_MEMBER]: 'The text input where the filled email will be invited to Circle',
};
