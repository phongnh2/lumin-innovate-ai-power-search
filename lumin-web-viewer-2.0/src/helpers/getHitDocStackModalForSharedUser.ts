import { TFunction } from 'react-i18next';

import { isEnabledReskin } from 'features/Reskin';

import UserEventConstants from 'constants/eventConstants';
import { ModalTypes } from 'constants/lumin-common';

import { HitDocStackModal } from 'interfaces/document/document.interface';

export const getHitDocStackModalForSharedUser = (action: string, t: TFunction): HitDocStackModal => {
  const messageKey =
    action === UserEventConstants.Events.HeaderButtonsEvent.SHARE
      ? 'modalHitDocstackSharedUser.messageToWithother'
      : 'modalHitDocstackSharedUser.message';
  return {
    type: isEnabledReskin() ? ModalTypes.HIT_DOC_STACK : ModalTypes.FIRE,
    title: t('modalHitDocstackSharedUser.title'),
    message: t(messageKey, { action: action.toLowerCase() }),
    confirmButtonTitle: t('action.ok'),
    onConfirm: () => {},
    useReskinModal: true,
    confirmButtonProps: {
      withExpandedSpace: true,
    },
  };
};
