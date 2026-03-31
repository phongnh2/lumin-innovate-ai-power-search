import { useDispatch } from 'react-redux';

import actions from 'actions';

import { ModalTypes } from 'constants/lumin-common';

import { useTranslation } from './useTranslation';

const useForceReloadModal = ({ onConfirm: onConfirmProp } = {}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const onConfirm = onConfirmProp || (() => window.location.reload());
  const openModal = () => {
    const modalSettings = {
      type: ModalTypes.WARNING,
      title: t('orgPage.yourPermissionUpdated'),
      message: t('orgPage.reloadToHaveNewPermission'),
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
      isFullWidthButton: true,
      confirmButtonTitle: t('common.reload'),
      onConfirm,
    };
    dispatch(actions.openModal(modalSettings));
  };
  return { openModal };
};

export default useForceReloadModal;
