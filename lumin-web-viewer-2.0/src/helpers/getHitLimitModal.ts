import { TFunction } from 'react-i18next';

import { isEnabledReskin } from 'features/Reskin';

import { ModalTypes } from 'constants/lumin-common';

import { HitDocStackModal } from 'interfaces/document/document.interface';

interface IHitLimitModalProps {
  isUnifyFree: boolean;
  canStartTrial: boolean;
  isOrgManager: boolean;
  type: string;
  titleKey: string;
  onUpgrade?: () => void;
  onStartTrial?: () => void;
  onCancelUpgrade: () => void;
  onCancelTrial: () => void;
  t: TFunction;
}

export const getHitLimitModal = ({
  isOrgManager,
  isUnifyFree,
  canStartTrial,
  type: typeProps,
  titleKey,
  onUpgrade,
  onStartTrial,
  onCancelUpgrade,
  onCancelTrial,
  t,
}: IHitLimitModalProps): HitDocStackModal => {
  const title = t(titleKey);
  const useReskinModal = true;

  const type = isEnabledReskin() ? ModalTypes.HIT_DOC_STACK : typeProps;
  const extraProps = isEnabledReskin()
    ? {
        titleCentered: true,
      }
    : {};

  if (isUnifyFree) {
    const modalSettings = canStartTrial
      ? {
          message: t('modalHitlimit.managerFreeOrgMessage'),
          confirmButtonTitle: t('common.startTrial'),
          cancelButtonTitle: t('common.cancel'),
          onConfirm: onStartTrial,
          onCancel: onCancelTrial,
          ...extraProps,
        }
      : {
          message: t('modalHitlimit.managerOrgMessage'),
          confirmButtonTitle: t('common.upgrade'),
          cancelButtonTitle: t('common.cancel'),
          onConfirm: onUpgrade,
          onCancel: onCancelUpgrade,
          ...extraProps,
        };
    return {
      type,
      title,
      useReskinModal,
      ...modalSettings,
    };
  }
  if (isOrgManager) {
    return {
      type,
      title,
      useReskinModal,
      message: t('modalHitlimit.managerOrgMessage'),
      confirmButtonTitle: t('common.upgrade'),
      onConfirm: onUpgrade,
      onCancel: onCancelUpgrade,
      ...extraProps,
    };
  }
  return {
    type,
    title,
    useReskinModal,
    message: t('modalHitlimit.memberOrgMessage'),
    confirmButtonTitle: t('action.ok'),
    onConfirm: () => {},
    confirmButtonProps: {
      withExpandedSpace: true,
    },
    ...extraProps,
  };
};
