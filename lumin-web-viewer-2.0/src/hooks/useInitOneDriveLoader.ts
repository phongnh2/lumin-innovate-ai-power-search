import { useEffect, useRef } from 'react';
import { useMatch } from 'react-router';

import { oneDriveLoader } from 'navigation/Router/setupOnedriveClient';

import { cookieManager } from 'helpers/cookieManager';

import { IN_FLOW } from 'constants/commonConstant';
import { CookieStorageKey } from 'constants/cookieName';
import { LocalStorageKey } from 'constants/localStorageKey';
import { MICROSOFT_ADD_INS_CLIENT_ID, MICROSOFT_CLIENT_ID, MICROSOFT_FILE_PICKER_CLIENT_ID } from 'constants/urls';

import { useGetCurrentUser } from './useGetCurrentUser';
import { useViewerMatch } from './useViewerMatch';

const useInitOneDriveLoader = () => {
  const hasLoaded = useRef(false);

  const { isViewer } = useViewerMatch();
  const isGuestPath = Boolean(useMatch({ path: '/viewer/guest/:documentId', end: false }));
  const currentUser = useGetCurrentUser();

  const getOneDriveClientId = () => {
    const { isOneDriveAddInsWhitelisted, isOneDriveFilePickerWhitelisted } = currentUser || {};
    if (isOneDriveFilePickerWhitelisted) {
      return MICROSOFT_FILE_PICKER_CLIENT_ID;
    }
    if (isOneDriveAddInsWhitelisted) {
      const hasInitWithNewApp = Boolean(localStorage.getItem(LocalStorageKey.HAS_INITIALIZED_WITH_ONEDRIVE_ADD_INS));
      const isFromOpenFileFlow = cookieManager.get(CookieStorageKey.IN_FLOW) === IN_FLOW.ONEDRIVE;
      if ((isFromOpenFileFlow && isViewer) || hasInitWithNewApp) {
        return MICROSOFT_ADD_INS_CLIENT_ID;
      }
    }
    return MICROSOFT_CLIENT_ID;
  };

  const loadOneDriveClient = (clientId: string) => {
    hasLoaded.current = true;
    oneDriveLoader.load({ reInitialize: true, clientId });
  };

  useEffect(() => {
    if (hasLoaded.current) {
      return;
    }
    if (isGuestPath) {
      loadOneDriveClient(MICROSOFT_CLIENT_ID);
      return;
    }
    if (!currentUser?._id) {
      return;
    }
    const clientId = getOneDriveClientId();
    if (clientId === MICROSOFT_ADD_INS_CLIENT_ID) {
      localStorage.setItem(LocalStorageKey.HAS_INITIALIZED_WITH_ONEDRIVE_ADD_INS, 'true');
    }
    loadOneDriveClient(clientId);
  }, [currentUser?._id]);
};

export default useInitOneDriveLoader;
