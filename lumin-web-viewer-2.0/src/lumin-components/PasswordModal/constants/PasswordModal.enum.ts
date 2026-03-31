export const PasswordModalSource = {
  UNLOCK: 'unlock',
  UNLOCK_QUERY: 'unlockQuery',
  EDIT_IN_AGREEMENT_GEN: 'editInAgreementGen',
} as const;

export type PasswordModalSourceType = typeof PasswordModalSource[keyof typeof PasswordModalSource];
