import { PasswordModalSource } from './PasswordModal.enum';

export const PASSWORD_MODAL_WORDINGS = {
  [PasswordModalSource.UNLOCK_QUERY]: {
    titleKey: 'viewer.passwordProtection.removePasswordModal.title',
    descriptionKey: 'viewer.passwordProtection.removePasswordModal.desc',
    placeholderKey: 'settingGeneral.yourPassword',
    submitButtonKey: 'common.remove',
  },
  [PasswordModalSource.EDIT_IN_AGREEMENT_GEN]: {
    titleKey: 'common.removePassword',
    descriptionKey: 'viewer.passwordProtection.editInAgreementGen.desc',
    placeholderKey: 'settingGeneral.yourPassword',
    submitButtonKey: 'common.remove',
  },
  [PasswordModalSource.UNLOCK]: {
    titleKey: 'message.passwordRequired',
    descriptionKey: 'message.enterPassword',
    placeholderKey: 'viewer.passwordProtection.enterCurrentPassword',
    submitButtonKey: 'action.submit',
  },
};
