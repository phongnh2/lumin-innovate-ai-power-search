import { useDispatch } from 'react-redux';

import actions from 'actions';

import dropboxServices from 'services/dropboxServices';
import googleServices from 'services/googleServices';
import { oneDriveServices } from 'services/oneDriveServices';

import { DataElements } from 'constants/dataElement';
import { STORAGE_TYPE } from 'constants/lumin-common';

const useRequestPermission = (storageType: string) => {
  const dispatch = useDispatch();
  const requestGooglePermission = async (hasPermissionCallback: () => void, onError: (err: unknown) => void) => {
    try {
      dispatch(actions.openElement(DataElements.LOADING_MODAL));
      await googleServices.implicitSignIn({
        callback: hasPermissionCallback,
      });
    } catch (err) {
      onError(err);
    } finally {
      dispatch(actions.closeElement(DataElements.LOADING_MODAL));
    }
  };

  const requestDropboxPermission = (hasPermissionCallback: () => void, onError: (err: unknown) => void) => {
    dispatch(actions.openElement(DataElements.LOADING_MODAL));
    dropboxServices.requestPermission();
    window.addEventListener(
      'dropboxAuthorized',
      (event: CustomEvent<{ token: string }>) => {
        const { token, errorMessage } = event.detail as { token?: string; errorMessage?: string };
        if (token) {
          hasPermissionCallback();
        } else {
          onError(errorMessage);
        }
        dispatch(actions.closeElement(DataElements.LOADING_MODAL));
      },
      { once: true }
    );
  };

  const requestOneDrivePermission = async (hasPermissionCallback: () => void, onError: (err: unknown) => void) => {
    try {
      dispatch(actions.openElement('loadingModal'));
      await oneDriveServices.getToken();
      hasPermissionCallback();
    } catch (err) {
      onError(err);
    } finally {
      dispatch(actions.closeElement('loadingModal'));
    }
  };
  return (hasPermissionCallback = () => {}, onError = () => {}) => {
    switch (storageType) {
      case STORAGE_TYPE.GOOGLE:
        return requestGooglePermission(hasPermissionCallback, onError);
      case STORAGE_TYPE.DROPBOX:
        return requestDropboxPermission(hasPermissionCallback, onError);
      case STORAGE_TYPE.ONEDRIVE:
        return requestOneDrivePermission(hasPermissionCallback, onError);
      default:
        throw new Error(`Invalid storage type: ${storageType}`);
    }
  };
};

export default useRequestPermission;
