/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useRef } from 'react';
import { useDispatch } from 'react-redux';

import { enqueueSnackbar } from '@libs/snackbar';

import actions from 'actions';

import { oneDriveLoader } from 'navigation/Router/setupOnedriveClient';

import { useTranslation } from 'hooks';

import { oneDriveServices } from 'services';
import {
  MessageData,
  PERSONAL_ACCOUNT_ONEDRIVE_PICKER_SCOPE,
  PERSONAL_ACCOUNT_AUTHORITY_URL,
  PickedOnedriveFileInfo,
  OneDrivePickerModes,
  DEFAULT_ONEDRIVE_AUTH_SCOPE,
  DriveType,
} from 'services/oneDriveServices';
import { ONEDRIVE_TOKEN_TYPE } from 'services/TokenStorageService';

import OneDriveErrorUtils from 'utils/oneDriveError';

import { LocalStorageKey } from 'constants/localStorageKey';
import { ModalTypes } from 'constants/lumin-common';
import { MICROSOFT_CLIENT_ID, MICROSOFT_FILE_PICKER_CLIENT_ID } from 'constants/urls';

import { oneDriveFilePickerOptions, oneDriveFolderPickerOptions } from '../config';
import { getIframePickerUrl } from '../utils';

type UseOneDriveMessageHandlerProps = {
  iframeRef: React.MutableRefObject<HTMLIFrameElement | null>;
  openPickerIframe: () => void;
  closePickerIframe: () => void;
  onClose: () => void;
  onPicked: (pickerResults: PickedOnedriveFileInfo[], onClear: () => void) => Promise<void>;
  mode?: OneDrivePickerModes;
};

export const useOneDriveMessageHandler = ({
  iframeRef,
  openPickerIframe,
  closePickerIframe,
  onClose,
  onPicked,
  mode = OneDrivePickerModes.FILES,
}: UseOneDriveMessageHandlerProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const pickerAccessTokenRef = useRef('');
  const portRef = useRef<MessagePort>();
  let channelMessageListener: ((message: MessageEvent<MessageData>) => void) | undefined;

  function initializeMessageListener(event: MessageEvent<Record<string, unknown>>): void {
    if (event.source) {
      const message = event.data;
      const channelId =
        mode === OneDrivePickerModes.FOLDERS
          ? oneDriveFolderPickerOptions.messaging.channelId
          : oneDriveFilePickerOptions.messaging.channelId;
      // the channelId is part of the configuration options, but we could have multiple pickers so that is supported via channels
      if (message.type === 'initialize' && message.channelId === channelId) {
        portRef.current = event.ports?.[0];

        portRef.current?.addEventListener('message', channelMessageListener);

        portRef.current?.start();

        portRef.current.postMessage({
          type: 'activate',
        });
      }
    }
  }

  function clearPickerState() {
    window.removeEventListener('message', initializeMessageListener);
    portRef.current?.close();
    iframeRef.current = null;
    pickerAccessTokenRef.current = '';
    closePickerIframe();
    onClose();
  }

  const getCachedPickerData = async (): Promise<{ baseUrl: string; driveType: DriveType }> => {
    const cacheValue = localStorage.getItem(LocalStorageKey.ONEDRIVE_FILE_PICKER_CACHE);
    const parsedValue = (cacheValue ? JSON.parse(cacheValue) : null) as {
      baseUrl: string;
      driveType: DriveType;
    } | null;
    return parsedValue || (await oneDriveServices.getPickerInitialData());
  };

  const getFileAccessScopes = (isPersonalDrive: boolean) =>
    isPersonalDrive ? [DEFAULT_ONEDRIVE_AUTH_SCOPE] : ['https://graph.microsoft.com/.default'];

  const refreshTokenIfExpired = async () => {
    const cachedToken = localStorage.getItem(LocalStorageKey.ONEDRIVE_FILE_ACCESS_TOKEN);
    if (!cachedToken) {
      return;
    }

    const { expiredAt, email } = JSON.parse(cachedToken) as {
      expiredAt: string;
      email: string;
    };

    if (Number(expiredAt) >= Date.now()) {
      return;
    }

    const { driveType } = await getCachedPickerData();

    const isPersonalDrive = driveType === DriveType.Personal;

    await oneDriveServices.getTokenWithScopes({
      scopes: getFileAccessScopes(isPersonalDrive),
      loginHint: email,
      additionalAuthParams: {
        prompt: 'consent',
        ...(isPersonalDrive && { authority: PERSONAL_ACCOUNT_AUTHORITY_URL }),
      },
      tokenType: ONEDRIVE_TOKEN_TYPE.FILE_ACCESS,
    });
  };

  channelMessageListener = async (message: MessageEvent<MessageData>) => {
    const payload = message.data;
    if (message.data.type === 'command') {
      portRef.current?.postMessage({
        type: 'acknowledge',
        id: message.data.id,
      });
      const command = payload.data;
      switch (command.command) {
        case 'authenticate': {
          try {
            if (!pickerAccessTokenRef.current) {
              throw new Error('Unable to obtain token');
            }
            portRef.current.postMessage({
              type: 'result',
              id: message.data.id,
              data: {
                result: 'token',
                token: pickerAccessTokenRef.current,
              },
            });
          } catch (error) {
            portRef.current.postMessage({
              type: 'result',
              id: message.data.id,
              data: {
                result: 'error',
                error: {
                  code: 'unableToObtainToken',
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  message: error.message,
                },
              },
            });
          }
          break;
        }
        case 'close':
          clearPickerState();
          break;
        case 'pick': {
          try {
            await refreshTokenIfExpired();
            await onPicked(command.items as PickedOnedriveFileInfo[], clearPickerState);

            portRef.current.postMessage({
              type: 'result',
              id: message.data.id,
              data: {
                result: 'success',
              },
            });
          } catch (error) {
            portRef.current.postMessage({
              type: 'result',
              id: message.data.id,
              data: {
                result: 'error',
                error: {
                  code: 'unusableItem',
                  message: error instanceof Error ? error.message : 'Unknown error',
                },
              },
            });
          }

          break;
        }
        default:
          // Unsupported command
          console.warn(`Unsupported command: ${JSON.stringify(command)}`, 2);
          portRef.current.postMessage({
            type: 'result',
            id: message.data.id,
            data: {
              result: 'error',
              error: {
                code: 'unsupportedCommand',
                message: command.command,
              },
            },
          });
          break;
      }
    }
  };

  const getInitPickerEssentialData = async () => {
    const { baseUrl, driveType } = await getCachedPickerData();

    const isPersonalDrive = driveType === DriveType.Personal;

    const pickerToken = await oneDriveServices.getTokenWithScopes(
      isPersonalDrive
        ? {
            scopes: [PERSONAL_ACCOUNT_ONEDRIVE_PICKER_SCOPE],
            additionalAuthParams: {
              authority: PERSONAL_ACCOUNT_AUTHORITY_URL,
            },
            tokenType: ONEDRIVE_TOKEN_TYPE.PICKER,
          }
        : {
            scopes: [`${baseUrl}/.default`],
            tokenType: ONEDRIVE_TOKEN_TYPE.PICKER,
          }
    );

    // Pre-fetch file access token for better performance
    const fileAccessScopes = isPersonalDrive ? [DEFAULT_ONEDRIVE_AUTH_SCOPE] : ['https://graph.microsoft.com/.default'];
    await oneDriveServices.getTokenWithScopes({
      scopes: fileAccessScopes,
      loginHint: pickerToken.cid,
      additionalAuthParams: {
        ...(isPersonalDrive && { authority: PERSONAL_ACCOUNT_AUTHORITY_URL }),
      },
      tokenType: ONEDRIVE_TOKEN_TYPE.FILE_ACCESS,
    });

    if (isPersonalDrive) {
      localStorage.setItem(LocalStorageKey.SHOULD_RENEW_ONEDRIVE_AUTH_TOKEN, 'true');
    }

    return {
      cid: pickerToken.cid,
      accessToken: pickerToken.accessToken,
      isPersonalDrive,
      baseUrl,
    };
  };

  const submitFormToLoadPicker = (url: string) => {
    if (!iframeRef.current?.contentWindow || !pickerAccessTokenRef.current) {
      return;
    }

    const { contentWindow } = iframeRef.current;

    const form = contentWindow.document.createElement('form');
    form.setAttribute('action', url);
    form.setAttribute('method', 'POST');

    const tokenInput = contentWindow.document.createElement('input');

    tokenInput.setAttribute('type', 'hidden');
    tokenInput.setAttribute('name', 'access_token');
    tokenInput.setAttribute('value', pickerAccessTokenRef.current);

    form.appendChild(tokenInput);
    contentWindow.document.body.append(form);

    form.submit();

    window.addEventListener('message', initializeMessageListener);
  };

  const getInitializedState = () => {
    const configuration = oneDriveServices.getConfiguration();
    const { clientId } = configuration.auth;
    const isDefaultClientId = [MICROSOFT_CLIENT_ID, MICROSOFT_FILE_PICKER_CLIENT_ID].includes(clientId);
    return {
      clientId,
      hasInitialized: oneDriveLoader.getState('client_initialized') && isDefaultClientId,
    };
  };

  const initialPicker = async () => {
    const { hasInitialized, clientId } = getInitializedState();
    if (!hasInitialized) {
      localStorage.removeItem(LocalStorageKey.HAS_INITIALIZED_WITH_ONEDRIVE_ADD_INS);
      await oneDriveLoader.load({ reInitialize: true, clientId }).wait('client_initialized');
    }

    await oneDriveServices.getAccessToken();
    const { cid, accessToken, isPersonalDrive, baseUrl } = await getInitPickerEssentialData();
    pickerAccessTokenRef.current = accessToken;
    const pickerIframeUrl = getIframePickerUrl({ isPersonalDrive, cid, baseUrl, mode });
    submitFormToLoadPicker(pickerIframeUrl);
  };

  const handleBlockPopupError = (onConfirm: () => void) => {
    dispatch(
      actions.openModal({
        type: ModalTypes.ERROR,
        title: t('openDrive.permissionRequired'),
        message: t('openDrive.popupBrowserBlocked', { storageService: 'OneDrive' }),
        confirmButtonTitle: t('openDrive.givePermission'),
        cancelButtonTitle: t('common.cancel'),
        onConfirm,
        onCancel: () => dispatch(actions.closeModal()),
        isFullWidthButton: false,
        useReskinModal: true,
      })
    );
  };

  const showErrorModal = (message: string) => {
    dispatch(
      actions.openModal({
        type: ModalTypes.ERROR,
        title: t('common.somethingWentWrong'),
        message,
        confirmButtonTitle: t('common.gotIt'),
        onConfirm: () => {
          dispatch(actions.closeModal());
        },
        useReskinModal: true,
      })
    );
  };

  const openFilePicker = async () => {
    openPickerIframe();
    try {
      await initialPicker();
    } catch (error) {
      closePickerIframe();
      const oneDriveErrorUtils = new OneDriveErrorUtils([{ error }]);

      if (oneDriveErrorUtils.isClosePopUpError() || oneDriveErrorUtils.isAuthenticationCancelled()) {
        enqueueSnackbar({
          message: t('openDrive.accessDenied'),
          variant: 'error',
        });
        return;
      }

      if (oneDriveErrorUtils.isPopupBlockedError()) {
        handleBlockPopupError(() => {
          dispatch(actions.closeModal());
          openFilePicker().catch(() => {});
        });
        return;
      }

      if (oneDriveErrorUtils.isExpectedAuthError()) {
        return;
      }

      showErrorModal(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return {
    openFilePicker,
    clearPickerState,
  };
};
