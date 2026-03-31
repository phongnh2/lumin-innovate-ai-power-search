import { TFunction } from 'react-i18next';

import { ModalTypes } from 'constants/lumin-common';

import { DiscardModal } from '../constants/customConstant';
import { DiscardModalType } from '../types/cncService.type';

export const getDiscardModalContent = ({
  type,
  isEnableReskin,
  t,
}: {
  type: DiscardModalType;
  isEnableReskin: boolean;
  t: TFunction;
}) => {
  switch (type) {
    case DiscardModal.INVITATION:
      return {
        title: t('settingGeneral.discardInvitations'),
        message: t('settingGeneral.discardInvitationsMessage'),
        type: ModalTypes.WARNING,
      };
    case DiscardModal.UNSAVED_CHANGES:
    default:
      return {
        title: t('settingGeneral.discardUnsavedChanges'),
        type: isEnableReskin ? '' : ModalTypes.WARNING,
      };
  }
};
