import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import logger from 'helpers/logger';

import { AUTH_SERVICE_URL } from 'constants/urls';

import { LoadingScreen } from './components';
import { useFileHandlers, useNavigation } from './hooks';

const OpenLumin = () => {
  const [fileId, setFileId] = useState<string | undefined>();
  const navigate = useNavigate();

  const { handleNavigation } = useNavigation({ fileId });
  const { handleUrlFileParams, setupElectronFileListener, setupPWAFileHandler } = useFileHandlers({ setFileId });

  useEffect(() => {
    handleNavigation().catch((error) => {
      logger.logError({
        error: error as Error,
        context: handleNavigation.name,
      });
    });
  }, [handleNavigation]);

  useEffect(() => {
    if (document.referrer.includes(AUTH_SERVICE_URL)) {
      navigate('/');
      return undefined;
    }

    handleUrlFileParams();
    const removeElectronListener = setupElectronFileListener();
    setupPWAFileHandler();

    return () => {
      removeElectronListener?.();
    };
  }, [navigate, handleUrlFileParams, setupElectronFileListener, setupPWAFileHandler]);

  return <LoadingScreen fileId={fileId} />;
};

export default OpenLumin;
