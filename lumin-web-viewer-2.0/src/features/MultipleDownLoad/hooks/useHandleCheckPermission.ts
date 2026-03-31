import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import useAuthenticateService from 'luminComponents/DocumentList/hooks/useAuthenticateService';

import { useLatestRef, useTranslation } from 'hooks';

import { dropboxServices, googleServices, oneDriveServices } from 'services';
import electronDropboxServices, { DropboxAuthResult } from 'services/electronDropboxServices';

import { isElectron } from 'utils/corePathHelper';

import { LocalStorageKey } from 'constants/localStorageKey';
import { DROPBOX_AUTHORIZE_DOWNLOAD_API } from 'constants/urls';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { multipleDownloadSelectors, setHasOpenedDropboxAuthWindow } from '../slice';

const DROPBOX_AUTH_TIMEOUT = 60 * 1000;

interface DropboxAuthMessage {
  token?: string;
  cancelAuthorize?: boolean;
}

const useHandleCheckPermission = () => {
  const { authentication } = useAuthenticateService();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const hasOpenedDropboxAuthWindow = useSelector(multipleDownloadSelectors.getHasOpenedDropboxAuthWindow);
  const hasOpenedDropboxAuthWindowRef = useLatestRef(hasOpenedDropboxAuthWindow);

  const checkDriveDocument = async (document: IDocumentBase) => {
    await authentication.drive([document]);
    const driveInfo = await googleServices.getFileInfo(document.remoteId);
    const { canDownload } = driveInfo.capabilities;
    if (!canDownload) {
      throw new Error(t('multipleDownload.lackOfPermission'));
    }
  };

  const checkOneDriveDocument = async (document: IDocumentBase) => {
    await authentication.oneDrive();
    await oneDriveServices.getFileInfo({
      driveId: document?.externalStorageAttributes?.driveId,
      remoteId: document?.remoteId,
    });
  };

  const accessDeniedError = useMemo(() => new Error(t('openDrive.accessDenied')), [t]);

  const authenticateDropboxElectron = useCallback(
    (remoteId: string): Promise<void> =>
      new Promise((resolve, reject) => {
        let hasCleanedUp = false;
        let timeoutId: number;
        let unsubscribe: () => void = () => {};

        const cleanup = () => {
          if (hasCleanedUp) return;
          hasCleanedUp = true;
          clearTimeout(timeoutId);
          unsubscribe();
        };

        const handleSubscription = async (payload: DropboxAuthResult) => {
          if (payload.error) {
            cleanup();
            reject(accessDeniedError);
            return;
          }

          if (!payload.token) {
            return;
          }

          try {
            await dropboxServices.getFileMetaData(remoteId);
            cleanup();
            resolve();
          } catch (err) {
            cleanup();
            reject(err);
          }
        };

        unsubscribe = electronDropboxServices.subscribe(handleSubscription);

        timeoutId = window.setTimeout(() => {
          cleanup();
          reject(accessDeniedError);
        }, DROPBOX_AUTH_TIMEOUT);

        electronDropboxServices.authenticate({ authorizeUrl: DROPBOX_AUTHORIZE_DOWNLOAD_API }).catch((error) => {
          cleanup();
          reject(error);
        });
      }),
    [accessDeniedError]
  );

  const authenticateDropboxWeb = useCallback(
    (remoteId: string): Promise<void> => {
      window.open(DROPBOX_AUTHORIZE_DOWNLOAD_API, '_blank');

      return new Promise((resolve, reject) => {
        let timeoutId: NodeJS.Timeout | null = null;
        let isCleanedUp = false;

        async function verifyFileMetadata() {
          try {
            await dropboxServices.getFileMetaData(remoteId);
            resolve();
          } catch (error) {
            reject(error);
          }
        }

        /* eslint-disable @typescript-eslint/no-use-before-define */
        async function handleAuthCallback(e: MessageEvent<DropboxAuthMessage>) {
          if (window.location.origin !== e.origin) return;

          const { token, cancelAuthorize } = e.data;

          if (cancelAuthorize) {
            cleanup();
            reject(accessDeniedError);
            return;
          }

          const currentDropboxToken = localStorage.getItem(LocalStorageKey.DROPBOX_TOKEN);
          if (token || currentDropboxToken) {
            if (token && typeof token === 'string') {
              localStorage.setItem(LocalStorageKey.DROPBOX_TOKEN, token);
            }
            cleanup();
            await verifyFileMetadata();
          }
        }

        function cleanup() {
          if (isCleanedUp) return;
          isCleanedUp = true;
          if (timeoutId) clearTimeout(timeoutId);
          window.removeEventListener('message', handleAuthCallback);
        }
        /* eslint-enable @typescript-eslint/no-use-before-define */

        async function handleTimeout() {
          cleanup();
          if (!localStorage.getItem(LocalStorageKey.DROPBOX_TOKEN)) {
            reject(accessDeniedError);
          } else {
            await verifyFileMetadata();
          }
        }

        timeoutId = setTimeout(handleTimeout, DROPBOX_AUTH_TIMEOUT);
        window.addEventListener('message', handleAuthCallback, false);
      });
    },
    [accessDeniedError]
  );

  const checkDropboxDocument = useCallback(
    async ({ document }: { document: IDocumentBase }): Promise<void> => {
      if (localStorage.getItem(LocalStorageKey.DROPBOX_TOKEN)) {
        await dropboxServices.getFileMetaData(document.remoteId);
        return;
      }

      if (hasOpenedDropboxAuthWindowRef.current) {
        throw accessDeniedError;
      }

      dispatch(setHasOpenedDropboxAuthWindow(true));

      if (isElectron()) {
        await authenticateDropboxElectron(document.remoteId);
      } else {
        await authenticateDropboxWeb(document.remoteId);
      }
    },
    [accessDeniedError, dispatch, hasOpenedDropboxAuthWindowRef, authenticateDropboxElectron, authenticateDropboxWeb]
  );

  return {
    checkDriveDocument,
    checkOneDriveDocument,
    checkDropboxDocument,
  };
};

export default useHandleCheckPermission;
