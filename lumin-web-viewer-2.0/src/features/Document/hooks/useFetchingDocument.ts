import { BrowserAuthError } from '@azure/msal-browser';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';

import actions from 'actions';
import selectors from 'selectors';

import { gapiLoader } from 'navigation/Router/setupGoogleClient';
import { useFetchExternalPdf } from 'screens/CreateExternalPdf/hook/useFetchExternalPdf';
import OfflineStrategy from 'screens/Viewer/Strategy/OfflineStrategy';
import OnlineStrategy from 'screens/Viewer/Strategy/OnlineStrategy';
import timeTracking from 'screens/Viewer/time-tracking';

import { useEnableStylingImpactForTemplates } from 'hooks/useEnableStylingImpactForTemplates';
import { useLatestRef } from 'hooks/useLatestRef';
import { useNetworkStatus } from 'hooks/useNetworkStatus';
import { useTranslation } from 'hooks/useTranslation';

import authServices from 'services/authServices';
import documentServices from 'services/documentServices';
import googleServices from 'services/googleServices';
import documentGraphServices from 'services/graphServices/documentGraphServices';
import { oneDriveServices } from 'services/oneDriveServices';

import logger from 'helpers/logger';

import { commonUtils } from 'utils/common';
import errorUtils from 'utils/error';
import OneDriveErrorUtils from 'utils/oneDriveError';
import { getDriveUserRestrictedDomain } from 'utils/restrictedUserUtil';

import { useEnabledFormInGuestMode } from 'features/OpenForm';
import { useIsTempEditMode } from 'features/OpenForm/hooks/useIsTempEditMode';

import { DriveErrorCode } from 'constants/authConstant';
import { OPENED_BY, ACCOUNTABLE_BY, DocumentRole, DOCUMENT_TYPE } from 'constants/documentConstants';
import { general } from 'constants/documentType';
import { ErrorCode } from 'constants/errorCode';
import { LocalStorageKey } from 'constants/localStorageKey';
import { ModalTypes, STORAGE_TYPE, LOGGER } from 'constants/lumin-common';
import { ROUTE_MATCH, Routers } from 'constants/Routers';
import { GET_DOCUMENT } from 'constants/timeTracking';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import { IDocumentBase } from 'interfaces/document/document.interface';

import useAnonymousViewPath from './useAnonymousViewPath';
import { useOpenDocumentErrorLogging } from './useOpenDocumentErrorLogging';
import { useTemplateViewerMatch } from './useTemplateViewerMatch';
import { useFetchFormTemplates } from '../../OpenForm/hooks/useFetchFormTemplates';
import { injectGoogleToken } from '../utils/injectGoogleToken';

export const useFetchingDocument = () => {
  const { t } = useTranslation();
  const currentUser = useSelector(selectors.getCurrentUser);
  const userId = currentUser?._id;
  const isCompletedGettingUserData = useSelector(selectors.getIsCompletedGettingUserData);
  const isAuthenticating = useSelector(selectors.isAuthenticating);
  const { isOffline } = useNetworkStatus();
  const isOfflineRef = useLatestRef(isOffline);
  const navigate = useNavigate();
  const isAnonymousViewPath = useAnonymousViewPath();
  const { documentId } = useParams();
  const { isTempEditMode } = useIsTempEditMode();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [googleTokenInjected, setGoogleTokenInjected] = useState(false);
  const { formTemplatesHandler } = useFetchFormTemplates();
  const { handleFetchExternalPdf } = useFetchExternalPdf();
  const { loading: calculatingOpenFormGuestModeVariant } = useEnabledFormInGuestMode();
  const { loading: calculatingStylingImpactForTemplates } = useEnableStylingImpactForTemplates();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const from = params.get('from');
  const isFromFunctionalLandingPage = from === 'functional-landing-page';
  const isFromChromeExtension = from === 'chrome_extension';
  const { error, setError } = useOpenDocumentErrorLogging();
  const { isTemplateViewer } = useTemplateViewerMatch();

  const validateIPWhitelist = async (email: string) => {
    try {
      await authServices.validateIPWhitelist(email);
    } catch (e) {
      const { code, metadata } = errorUtils.extractGqlError(e) as {
        code: string;
        metadata: { email: string };
      };
      if (code === ErrorCode.Org.MEMBERSHIP_NOT_FOUND) {
        dispatch(actions.setMembershipOfOrg({ require: true, email: metadata?.email }));
      } else {
        throw error;
      }
    }
  };

  const completeDocumentFetch = (document: IDocumentBase) => {
    dispatch(actions.fetchingCurrentDocumentComplete(document));
  };

  const handleGetThirdPartyFileInfoError = ({ err, storage }: { err: Error; storage: string }) => {
    const customError = err as {
      message: typeof DriveErrorCode[keyof typeof DriveErrorCode];
    };
    const oneDriveErr = new OneDriveErrorUtils([{ error: err as BrowserAuthError }]);

    if (
      !oneDriveErr.isPopupBlockedError() &&
      customError.message !== DriveErrorCode.MISSING_ACCESS_TOKEN &&
      storage === STORAGE_TYPE.ONEDRIVE
    ) {
      throw err;
    }
    const modalProps = {
      [STORAGE_TYPE.GOOGLE]: {
        type: ModalTypes.DRIVE,
        message: t('openDrive.popupBrowserBlocked', {
          storageService: 'Drive',
        }),
      },
      [STORAGE_TYPE.ONEDRIVE]: {
        type: ModalTypes.ONE_DRIVE,
        message: t('openDrive.popupBrowserBlocked', {
          storageService: 'OneDrive',
        }),
      },
    }[storage];

    const popupTriggerFunc = {
      [STORAGE_TYPE.GOOGLE]: () => {
        googleServices
          .implicitSignIn({
            loginHint: googleServices.getAccessTokenEmail(),
            callback: () => window.location.reload(),
          })
          .catch((_err) => {
            logger.logError({
              reason: LOGGER.Service.IMPLICIT_SIGN_IN_ERROR,
              error: _err as Error,
            });
          });
      },
      [STORAGE_TYPE.ONEDRIVE]: async () => {
        await oneDriveServices.getToken();
        window.location.reload();
      },
    }[storage];

    dispatch(
      actions.openViewerModal({
        ...modalProps,
        title: t('openDrive.permissionRequired'),
        confirmButtonTitle: t('openDrive.givePermission'),
        onConfirm: popupTriggerFunc,
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        isFullWidthButton: false,
      })
    );
  };

  const createAnonymousDocument = async ({
    remoteId,
    driveId,
    storage,
  }: {
    remoteId: string;
    driveId?: string;
    storage: string;
  }) => {
    let fileInfo = { name: '', size: '0', mimeType: general.PDF, createdTime: '', lastModified: '' };
    try {
      if (storage === STORAGE_TYPE.GOOGLE) {
        await gapiLoader.load().wait('client_loaded');
        fileInfo = await googleServices.getFileInfo(remoteId);
      }
      if (storage === STORAGE_TYPE.ONEDRIVE) {
        const {
          name,
          size,
          file,
          fileSystemInfo: { createdDateTime, lastModifiedDateTime },
        } = await oneDriveServices.getFileInfo({ remoteId, driveId });
        fileInfo = {
          name,
          size: size.toString(),
          mimeType: file.mimeType,
          createdTime: createdDateTime,
          lastModified: lastModifiedDateTime,
        };
      }
    } catch (e) {
      handleGetThirdPartyFileInfoError({ err: e as Error, storage });
    }
    return {
      _id: remoteId,
      name: fileInfo.name,
      size: fileInfo.size,
      isPersonal: true,
      mimeType: fileInfo.mimeType,
      createdAt: new Date(fileInfo.createdTime).getTime(),
      ownerName: 'Anonymous',
      roleOfDocument: DocumentRole.SPECTATOR,
      documentType: DOCUMENT_TYPE.PERSONAL,
      thumbnail: '',
      remoteId,
      lastAccess: fileInfo.lastModified,
      isStarred: false,
      metadata: {},
      documentStatus: {
        isPremium: false,
        openedBy: OPENED_BY.OTHER,
        accountableBy: ACCOUNTABLE_BY.PERSONAL,
        targetId: '',
      },
      shareSetting: {
        permission: 'SPECTATOR',
      },
      imageSignedUrls: {},
      service: storage,
      isOfflineValid: false,
      isAnonymousDocument: true,
      premiumToolsInfo: {},
      externalStorageAttributes: {
        driveId,
      },
    };
  };

  const handleAnonymousViewPath = async () => {
    if (currentUser) {
      try {
        const { document: documentData } = await documentServices.getDocumentByRemoteAndClientId({
          remoteId: documentId,
          clientId: currentUser._id,
        });
        navigate([Routers.VIEWER, documentData._id].join('/'), { replace: true });
      } catch {
        navigate(ROUTE_MATCH.DOCUMENT_NOT_FOUND, { replace: true });
      }
    } else {
      try {
        if (searchParams.get(UrlSearchParam.STORAGE) === STORAGE_TYPE.ONEDRIVE) {
          localStorage.setItem(LocalStorageKey.ANONYMOUS_MODE_HINT_EMAIL, searchParams.get(UrlSearchParam.HINT_EMAIL));
          const oneDriveDocument = await createAnonymousDocument({
            storage: STORAGE_TYPE.ONEDRIVE,
            remoteId: documentId,
            driveId: searchParams.get(UrlSearchParam.DRIVE_ID),
          });
          completeDocumentFetch(oneDriveDocument as unknown as IDocumentBase);
          return;
        }
        const driveDocument = await createAnonymousDocument({
          storage: STORAGE_TYPE.GOOGLE,
          remoteId: documentId,
        });
        googleServices.syncUpAccessToken();
        const { email } = googleServices.getImplicitAccessToken() || {};
        if (email && getDriveUserRestrictedDomain().includes(commonUtils.getDomainFromEmail(email))) {
          validateIPWhitelist(email).catch((err) => {
            logger.logError({
              reason: LOGGER.Service.VALIDATE_IP_WHITELIST_ERROR,
              error: err,
            });
          });
        }
        completeDocumentFetch(driveDocument as unknown as IDocumentBase);
      } catch (err) {
        logger.logError({
          reason: LOGGER.Service.CREATE_GUEST_DRIVE_FILE,
          error: err as Error,
        });
        navigate(Routers.SIGNIN);
      }
    }
  };

  const handleSystemFile = async (strategy: OfflineStrategy) => {
    try {
      const systemDocument = await strategy.getSystemDocument();
      completeDocumentFetch(systemDocument as unknown as IDocumentBase);
    } catch (e) {
      dispatch(actions.fetchingCurrentDocumentComplete(null));
      throw e;
    }
  };

  const handleTempEditMode = async (): Promise<void> => {
    if (isFromFunctionalLandingPage || isFromChromeExtension) {
      await handleFetchExternalPdf();
    } else {
      await formTemplatesHandler();
    }
  };

  const fetchDocumentTemplate = async () => {
    const {
      data: { documentTemplate, getFormField: fields },
    } = await documentGraphServices.getDocumentTemplate({ documentId });
    return { ...documentTemplate, fields };
  };

  useEffect(() => {
    if (isAnonymousViewPath && isCompletedGettingUserData && googleTokenInjected) {
      handleAnonymousViewPath().catch(() => {});
    }
  }, [userId, isCompletedGettingUserData, googleTokenInjected]);

  useEffect(() => {
    injectGoogleToken(() => setGoogleTokenInjected(true));
  }, []);

  useEffect(() => {
    if (isAuthenticating || calculatingOpenFormGuestModeVariant || calculatingStylingImpactForTemplates) {
      return;
    }

    const fetchDocument = async (strategy: OfflineStrategy | OnlineStrategy) => {
      try {
        dispatch(actions.startFetchingCurrentDocument());
        let document;
        if (isTemplateViewer) {
          document = await fetchDocumentTemplate();
        } else {
          document = await strategy.getDocument();
        }
        completeDocumentFetch(document as unknown as IDocumentBase);
      } catch (e) {
        dispatch(actions.fetchingCurrentDocumentComplete(null));
        throw e;
      }
    };

    const selectStrategyAndFetch = async () => {
      if (isAnonymousViewPath) {
        return;
      }

      if (isTempEditMode) {
        await handleTempEditMode();
        return;
      }

      const offlineStrategy = new OfflineStrategy(documentId);
      const onlineStrategy = new OnlineStrategy(documentId);

      if (offlineStrategy.isSystemFile) {
        await handleSystemFile(offlineStrategy);
        return;
      }

      if (isOfflineRef.current) {
        await fetchDocument(offlineStrategy);
      } else {
        timeTracking.register(GET_DOCUMENT);
        await fetchDocument(onlineStrategy).finally(() => {
          timeTracking.finishTracking(GET_DOCUMENT);
        });
      }
    };
    selectStrategyAndFetch().catch((e) => {
      setError(e as Error);
    });
  }, [
    isAuthenticating,
    documentId,
    isCompletedGettingUserData,
    isAnonymousViewPath,
    calculatingOpenFormGuestModeVariant,
    isTempEditMode,
    calculatingOpenFormGuestModeVariant,
    calculatingStylingImpactForTemplates,
  ]);

  return {
    fetchingDocumentError: error,
  };
};
