import React, { useState } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { oneDriveLoader } from 'navigation/Router/setupOnedriveClient';

import { useEnableWebReskin, useGetCurrentUser, useTranslation } from 'hooks';

import { oneDriveServices } from 'services';

import logger from 'helpers/logger';

import { LocalStorageKey } from 'constants/localStorageKey';
import { LOGGER, ModalTypes } from 'constants/lumin-common';
import { MICROSOFT_ADD_INS_CLIENT_ID, MICROSOFT_CLIENT_ID } from 'constants/urls';

type UseAuthorizeProps = {
  onSuccess?: (url: string) => void;
};

const transformOneDriveUrl = (originalUrl: string) => {
  if (!originalUrl) {
    return '';
  }
  const url = new URL(originalUrl);
  return `${url.origin}/my`;
};

const useAuthorize = ({ onSuccess }: UseAuthorizeProps) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [isProcessing, setIsProcessing] = useState(false);

  const currentUser = useGetCurrentUser();
  const { isEnableReskin } = useEnableWebReskin();

  const openWrongAuthorizedAccountModal = (onConfirm: () => void) => {
    const modalSettings = {
      type: ModalTypes.WARNING,
      title: t('oneDriveAddInsAuthorization.wrongAuthorizedAccountModal.title'),
      message: (
        <Trans
          i18nKey="oneDriveAddInsAuthorization.wrongAuthorizedAccountModal.content"
          values={{ email: currentUser.email }}
          components={{ b: <b className={isEnableReskin ? 'kiwi-message--primary' : ''} /> }}
        />
      ),
      useReskinModal: isEnableReskin,
      confirmButtonTitle: t('common.ok'),
      confirmButtonProps: {
        withExpandedSpace: true,
      },
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
      onConfirm,
    };
    dispatch(actions.openModal(modalSettings));
  };

  const hasAuthorizedWithDefaultApp = () => {
    const configuration = oneDriveServices.getConfiguration();
    const isSignedIn = oneDriveServices.isSignedIn();
    return isSignedIn && configuration.auth.clientId === MICROSOFT_CLIENT_ID;
  };

  const hasInitializedWithNewApp = () => {
    const configuration = oneDriveServices.getConfiguration();
    const hasInitialized = oneDriveLoader.getState('client_initialized');
    return (
      (hasInitialized && configuration.auth.clientId === MICROSOFT_ADD_INS_CLIENT_ID) ||
      Boolean(localStorage.getItem(LocalStorageKey.HAS_INITIALIZED_WITH_ONEDRIVE_ADD_INS))
    );
  };

  const handleAuthorize = async () => {
    setIsProcessing(true);
    try {
      if (hasAuthorizedWithDefaultApp()) {
        await oneDriveServices.logoutCurrentAccount();
      }

      // Init new app
      if (!hasInitializedWithNewApp()) {
        await oneDriveLoader
          .load({ reInitialize: true, clientId: MICROSOFT_ADD_INS_CLIENT_ID })
          .wait('client_initialized');
        localStorage.setItem(LocalStorageKey.HAS_INITIALIZED_WITH_ONEDRIVE_ADD_INS, 'true');
      }

      // Authorize
      await oneDriveServices.getTokenWithScopes({
        scopes: [],
        loginHint: currentUser.email,
      });

      const currentAccount = oneDriveServices.getCurrentAccount();
      const remoteEmail = currentAccount?.idTokenClaims?.email as string;

      if (remoteEmail && currentUser.email !== remoteEmail.toLowerCase()) {
        setIsProcessing(false);
        await oneDriveServices.logoutCurrentAccount();
        openWrongAuthorizedAccountModal(handleAuthorize);
        return;
      }

      const accountInfo = await oneDriveServices.getMe();
      onSuccess?.(transformOneDriveUrl(accountInfo ? accountInfo.webUrl : ''));
    } catch (error) {
      setIsProcessing(false);
      logger.logError({
        reason: LOGGER.Service.ONEDRIVE_ADD_INS_AUTHORIZATION,
        error: error as Error,
        message: 'Error authorizing add-ins Microsoft OneDrive',
      });
    }
  };

  return { isProcessing, handleAuthorize };
};

export default useAuthorize;
