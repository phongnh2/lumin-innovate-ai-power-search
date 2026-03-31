export enum IntercomContactRole {
  USER = 'user',
  LEAD = 'lead',
  CONTACT = 'contact'
}

export enum IntercomMessageType {
  EMAIL = 'email',
  IN_APP = 'inapp',
}

export enum IntercomOperators {
  EQUAL = '=',
  NOT_EQUAL = '!=',
  IN = 'IN',
  NOT_IN = 'NIN',
  LOWER_THAN = '<',
  GREATER_THAN = '>',
  CONTAIN = '~',
  NOT_CONTAIN = '!~',
  STARTS_WITH = '^',
  ENDS_WITH = '$',
}
