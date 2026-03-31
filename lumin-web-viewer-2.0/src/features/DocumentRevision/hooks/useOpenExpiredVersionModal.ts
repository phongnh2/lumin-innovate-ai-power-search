import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import ViewerContext from 'screens/Viewer/Context';

import { useDocumentVersioningContext } from './useDocumentVersioningContext';

export const useOpenExpiredVersionModal = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { refetchVersions } = useDocumentVersioningContext();
  const { reloadDocumentToViewer } = useContext(ViewerContext);

  const openExpiredVersionModal = () => {
    dispatch(
      actions.openModal({
        title: t('viewer.revision.expiredModal.title'),
        message: t('viewer.revision.expiredModal.message'),
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        isFullWidthButton: true,
        confirmButtonTitle: t('viewer.revision.expiredModal.confirmButton'),
        cancelButtonTitle: '',
        onConfirm: async () => {
          await Promise.all([refetchVersions(), reloadDocumentToViewer()]);
        },
      })
    );
  };

  return {
    openExpiredVersionModal,
  };
};
