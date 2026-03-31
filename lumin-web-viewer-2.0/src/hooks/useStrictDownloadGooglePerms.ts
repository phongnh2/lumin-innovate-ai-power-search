/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { ModalTypes } from 'constants/lumin-common';

import { useTranslation } from './useTranslation';

const useStrictDownloadGooglePerms = (): {
  showModal: (handleAction: () => void, onCancel: () => void) => void;
} => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const onClose = (): void => {
    dispatch(actions.closeModal());
  };

  const handleRetry = (handleAction: () => void): void => {
    dispatch(actions.updateModalProperties({
      isProcessing: true,
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
    }));
    handleAction();
  };

  const getContent = (handleAction: () => void, onCancel: () => void): Record<string, any> => ({
    type: ModalTypes.ERROR,
    title: t('modalStrictDownloadPermission.title'),
    message: t('modalStrictDownloadPermission.message'),
    confirmButtonTitle: t('common.tryAgain'),
    cancelButtonTitle: t('common.GotIt'),
    onCancel: () => {onCancel(); onClose();},
    onConfirm: () => handleRetry(handleAction),
    useReskinModal: true,
  });

  const showModal = (handleAction: () => void, onCancel?: () => void): void => {
    dispatch(actions.openModal(getContent(handleAction, onCancel)));
  };
  return {
    showModal,
  };
};

export default useStrictDownloadGooglePerms;
