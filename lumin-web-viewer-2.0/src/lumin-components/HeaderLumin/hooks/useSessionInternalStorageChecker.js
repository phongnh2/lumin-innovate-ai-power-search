import { useDispatch } from 'react-redux';

import actions from 'actions';

import { useExpiredModal, useTranslation } from 'hooks';

import dropboxServices from 'services/dropboxServices';
import googleServices from 'services/googleServices';

import { LocalStorageKey } from 'constants/localStorageKey';
import { STORAGE_TYPE } from 'constants/lumin-common';

export default function useSessionInternalStorageChecker() {
  const { openExpiredModal } = useExpiredModal();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const extraModalProperties = {
    cancelButtonTitle: t('common.cancel'),
    onCancel: () => {},
  };
  const handleInternalStoragePermission = async ({
    hasPermissionCallback = () => {},
    storageType = '',
  }) => {
    const requestPermissionList = {
      [STORAGE_TYPE.GOOGLE]: {
        isExpiredSession: !googleServices.isSignedIn(),
        requestPermission: async () => {
          try {
            dispatch(actions.openElement('loadingModal'));
            await googleServices.implicitSignIn({
              callback: hasPermissionCallback,
            });
          } catch (error) {
            console.log('error', error);
          } finally {
            dispatch(actions.closeElement('loadingModal'));
          }
        },
      },
      [STORAGE_TYPE.DROPBOX]: {
        isExpiredSession: !localStorage.getItem(LocalStorageKey.DROPBOX_TOKEN),
        requestPermission: () => {
          dispatch(actions.openElement('loadingModal'));
          const childWindow = dropboxServices.requestPermission();
          /**
           * Monitors the status of a child window and takes action when it is closed.
           * This function periodically checks if the child window is still open and responds
           * when the child window is closed.
           * */
          const checkChildWindow = setInterval(() => {
            if (childWindow && childWindow.closed) {
              clearInterval(checkChildWindow);
              dispatch(actions.closeElement('loadingModal'));
            }
          }, 1000);
        },
      },
    };

    if (requestPermissionList[storageType].isExpiredSession && storageType) {
      openExpiredModal({
        extraModalProperties,
        onConfirm: () => requestPermissionList[storageType].requestPermission(),
      });
      return;
    }

    hasPermissionCallback();
  };

  return {
    handleInternalStoragePermission,
  };
}
