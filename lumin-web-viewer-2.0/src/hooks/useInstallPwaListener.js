/**
 * @link https://web.dev/customize-install/
 */
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import logger from 'helpers/logger';
import { isStandaloneMode } from 'helpers/pwa';

import { LocalStorageKey } from 'constants/localStorageKey';

const OUTCOME = {
  DISMISSED: 'dismissed',
  ACCEPTED: 'accepted',
};

export function useInstallPwaListener() {
  const deferredPrompt = useRef(null);
  const dispatch = useDispatch();
  const [hasInstalled, setInstalled] = useState(true);
  const [detecting, setDetecting] = useState(true);
  const hideInstallPromotion = () => {
    dispatch(actions.disablePwaDownloadBanner());
  };
  const install = async () => {
    try {
      deferredPrompt.current?.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      if (outcome === OUTCOME.ACCEPTED) {
        hideInstallPromotion();
        setInstalled(true);
        deferredPrompt.current = null;
      }
    } catch (e) {
      logger.logError({ message: e.message, error: e });
    }
  };

  useEffect(() => {
    const onBeforeInstall = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      deferredPrompt.current = e;
      setInstalled(false);
      setDetecting(false);
      if (!localStorage.getItem(LocalStorageKey.DISABLE_PWA_DOWNLOAD)) {
        dispatch(actions.enablePwaDownloadBanner());
      }
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
    };
  }, []);

  useEffect(() => {
    const onAppInstalled = () => {
      hideInstallPromotion();
      deferredPrompt.current = null;
      setInstalled(true);
      setDetecting(false);
      window.lMode = 'PWA';
    };

    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  return {
    install,
    hasInstalled: window.lMode === 'PWA' || hasInstalled || isStandaloneMode,
    detecting,
  };
}
