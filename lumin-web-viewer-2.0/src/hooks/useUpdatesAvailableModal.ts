import { useDispatch } from 'react-redux';

import actions from 'actions';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { ModalTypes } from 'constants/lumin-common';

const useUpdatesAvailableModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isEnableReskin } = useEnableWebReskin();

  const openModal = () => {
    dispatch(
      actions.openModal({
        type: ModalTypes.WARNING,
        title: t('updatesAvailableModal.title'),
        message: t('updatesAvailableModal.content'),
        useReskinModal: true,
        confirmButtonTitle: t('common.reload'),
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        isFullWidthButton: !isEnableReskin,
        closeOnRouteChange: false,
        cancelButtonTitle: '',
        onConfirm: () => window.location.reload(),
      })
    );
  };

  return { open: openModal };
};

export default useUpdatesAvailableModal;
