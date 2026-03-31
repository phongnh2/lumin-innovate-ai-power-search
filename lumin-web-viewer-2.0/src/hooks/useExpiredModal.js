import { useDispatch } from 'react-redux';

import actions from 'actions';

import { useTranslation } from 'hooks';

import { ModalTypes } from 'constants/lumin-common';

export default function useExpiredModal() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const openExpiredModal = ({
    onConfirm,
    confirmButtonTitle = t('common.confirm'),
    title = t('viewer.fileWarningModal.permissionIsExpired'),
    message = t('viewer.fileWarningModal.loginAgain'),
    disableBackdropClick = true,
    cancelButtonTitle = t('common.cancel'),
    disableEscapeKeyDown = true,
    footerVariant='variant3',
    extraModalProperties = {},
  }) => {
    const modalSettings = {
      type: ModalTypes.WARNING,
      title,
      message,
      onConfirm,
      confirmButtonTitle,
      disableBackdropClick,
      disableEscapeKeyDown,
      cancelButtonTitle,
      footerVariant,
      ...extraModalProperties,
    };

    dispatch(actions.openModal(modalSettings));
  };

  return {
    openExpiredModal,
  };
}
