import get from 'lodash/get';
import PropTypes from 'prop-types';
import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';

import actions from 'actions';
import selectors from 'selectors';

import { gapiLoader } from 'navigation/Router/setupGoogleClient';
import { oneDriveLoader } from 'navigation/Router/setupOnedriveClient';

import useAuthenticateService from 'lumin-components/DocumentList/hooks/useAuthenticateService';

import { useIsAnyDialogTypeOpen } from 'hooks/useIsAnyDialogTypeOpen';
import { useSaveOperation } from 'hooks/useSaveOperation';
import { useTranslation } from 'hooks/useTranslation';
import { useUpdateUserSubscription } from 'hooks/useUpdateUserSubscription';

import dropboxServices from 'services/dropboxServices';
import { oneDriveServices } from 'services/oneDriveServices';
import organizationServices from 'services/organizationServices';
import { kratosService } from 'services/oryServices';
import { ProfileSettingSections } from 'services/oryServices/kratos';
import userServices from 'services/userServices';

import { cookieManager } from 'helpers/cookieManager';

import dropboxError from 'utils/dropboxError';

import ContentCheckerProvider from 'features/ContentChecker/components/ContentCheckerProvider';
import MatchMediaLayoutProvider from 'features/MatchMediaLayout/components/MatchMediaLayoutProvider';
import { useMatchMediaLayoutContext } from 'features/MatchMediaLayout/hooks/useMatchMediaLayoutContext';
import { useSaveFileChangedInTempEditMode, useSaveFormFieldInTempEditMode } from 'features/OpenForm';

import { CookieStorageKey } from 'constants/cookieName';
import { ACCOUNTABLE_BY } from 'constants/documentConstants';
import { LocalStorageKey } from 'constants/localStorageKey';
import { STATUS_CODE, STORAGE_TYPE } from 'constants/lumin-common';
import { ORG_SUBSCRIPTION_TYPE } from 'constants/organizationConstants';
import { Routers } from 'constants/Routers';
import { SOCKET_EMIT, SOCKET_ON } from 'constants/socketConstant';
import {
  RENDER_PDF_DOCUMENT,
  START_DOWNLOAD_DOCUMENT,
  DOWNLOAD_DOCUMENT_COMPLETE,
  FIRST_PAGE_RENDER,
  LOAD_GAPI,
} from 'constants/timeTracking';

import { useConflictVersionHandler } from './hooks/useConflictVersionHandler';
import { useResetDocumentSyncState } from './hooks/useResetDocumentSyncState';
import useTrackCoreBundleLoadingTime from './hooks/useTrackCoreBundleLoadingTime';
import useVerifyRequiredCapabilities from './hooks/useVerifyRequiredCapabilities';
import PDFViewer from './PDFViewer';
import timeTracking from './time-tracking';
import { socket } from '../../socket';

import 'constants/quill.scss';

const withMatchMediaLayout = (Component) => (props) =>
  (
    <MatchMediaLayoutProvider>
      <Component {...props} />
    </MatchMediaLayoutProvider>
  );

const Viewer = (props) => {
  const dispatch = useDispatch();
  const { navigate, currentUser, closeModal } = props;
  const { open } = useIsAnyDialogTypeOpen();
  const { t } = useTranslation();
  const { authentication, handleCheckError } = useAuthenticateService();
  const { hasDownloadPermission, showRequiredPermissionModal } = useVerifyRequiredCapabilities();
  const { isNarrowScreen } = useMatchMediaLayoutContext();
  const { documentId: documentIdParam } = useParams();
  const { saveFileChangedInTempEditMode } = useSaveFileChangedInTempEditMode();
  const { saveFormFieldInTempEditMode } = useSaveFormFieldInTempEditMode();
  const isDefaultMode = useSelector(selectors.isDefaultMode);
  const conflictVersionHandler = useConflictVersionHandler();
  const saveOperations = useSaveOperation();

  useUpdateUserSubscription();

  useTrackCoreBundleLoadingTime();

  useResetDocumentSyncState();

  const handleVerifyDocument = useCallback(async ({ documents, onSuccess, setLoading }) => {
    const executer = (verifiedDocuments, onVerifySuccess) => {
      handleVerifyDocument({ documents: verifiedDocuments, onSuccess: onVerifySuccess, setLoading });
      closeModal();
    };
    const currentDocument = documents[0];
    const afterVerifyAuth = async () => {
      const isDownloadableDocument = await hasDownloadPermission(currentDocument);
      if (!isDownloadableDocument) {
        showRequiredPermissionModal();
      } else {
        onSuccess(currentDocument);
      }
    };
    try {
      switch (currentDocument.service) {
        case STORAGE_TYPE.GOOGLE: {
          timeTracking.register(LOAD_GAPI);
          await gapiLoader.load().wait('client_initialized');
          timeTracking.finishTracking(LOAD_GAPI);
          await authentication.drive([currentDocument]);
          break;
        }
        case STORAGE_TYPE.DROPBOX: {
          const isAuthenticated = authentication.dropbox({
            documents,
            onSuccess: afterVerifyAuth,
            executer,
          });
          if (!isAuthenticated) {
            return;
          }
          await dropboxServices.getDropboxUserInfo();
          break;
        }
        case STORAGE_TYPE.ONEDRIVE: {
          await oneDriveLoader.load().wait('client_initialized');
          if (cookieManager.get(CookieStorageKey.IN_FLOW)) {
            await oneDriveLoader.load().wait('access_token_loaded');
            cookieManager.delete(CookieStorageKey.IN_FLOW);
          }
          // Require authentication: token is expired or user not logged in
          await authentication.oneDrive();
          // Require authorization: check user's permission on document
          await oneDriveServices.getFileInfo({
            driveId: currentDocument.externalStorageAttributes.driveId,
            remoteId: currentDocument.remoteId,
          });
          break;
        }
        default:
          break;
      }
      await afterVerifyAuth();
    } catch (error) {
      if (dropboxError.isTokenExpiredError(get(error, 'response.data.error'))) {
        localStorage.removeItem(LocalStorageKey.DROPBOX_TOKEN);
        executer(documents, onSuccess);
        return;
      }
      handleCheckError(error, {
        documents,
        onSuccess: afterVerifyAuth,
        executer,
        setLoading,
      });
    }
  }, [documentIdParam]);

  useEffect(() => {
    timeTracking.register(RENDER_PDF_DOCUMENT);
    timeTracking.register(START_DOWNLOAD_DOCUMENT);
    timeTracking.register(DOWNLOAD_DOCUMENT_COMPLETE);
    timeTracking.register(FIRST_PAGE_RENDER);
  }, [documentIdParam]);

  const openLoginGoogleModal = async ({ name, settings, domain, associateDomains }) => {
    const isInternalUser = userServices.isInternalOrgUser(currentUser.email, domain);
    const isUserWithAssociateDomain = userServices.isUserWithAssociateDomain(currentUser.email, associateDomains);
    const isUserLoginWithGoogle = await userServices.isUserLoginWithGoogle({ loginService: currentUser.loginService });
    const isUserLoginWithDropbox = await userServices.isUserLoginWithDropbox({
      loginService: currentUser.loginService,
    });
    if (
      settings.googleSignIn &&
      (isInternalUser || isUserWithAssociateDomain) &&
      !isUserLoginWithGoogle &&
      !isUserLoginWithDropbox
    ) {
      organizationServices.forceMemberLoginWithGoogle({
        orgName: name,
        onConfirm: async () => {
          props.updateModalProperties({
            isProcessing: true,
          });
          kratosService.profileSettings(true, ProfileSettingSections.GOOGLE_SIGN_IN);
        },
        onCancel: () => {
          dispatch(actions.resetOrganization());
          navigate(Routers.ORGANIZATION_LIST);
        },
        t,
      });
    }
  };

  const subcribeEventOnDocument = useCallback(
    async ({ accountableBy, refId, documentId, data }, { showAccessUpdateToast }) => {
      if (accountableBy === ACCOUNTABLE_BY.ORGANIZATION) {
        openLoginGoogleModal(data);
        props.subcribeUpdateOrganization(refId, {
          [ORG_SUBSCRIPTION_TYPE.GOOGLE_SIGN_IN_SECURITY_UPDATE]: {
            exec: openLoginGoogleModal,
          },
          [ORG_SUBSCRIPTION_TYPE.PAYMENT_UPDATE]: {
            exec: showAccessUpdateToast,
          }
        });
        socket.emit(SOCKET_EMIT.JOIN_TO_ORG_ROOM, { documentId });
        socket.on(SOCKET_ON.DELETE_ORGANIZATION, () => showAccessUpdateToast());
        socket.on(SOCKET_ON.ORG_PAYMENT_UPDATED, ({ memberIds }) => {
          if (memberIds.includes(currentUser._id)) {
            showAccessUpdateToast();
          }
        });
      }
    },
    []
  );

  const subcribeEventDeleteDocument = useCallback(async (clientId, callback) => {
    props.subcriptDeleteMultipleDocument(clientId, (data) => {
      if (data?.statusCode === STATUS_CODE.SUCCEED) {
        callback(data);
      }
    });
  }, []);

  return (
    <ContentCheckerProvider>
      <PDFViewer
        handleVerifyDocument={handleVerifyDocument}
        subcribeEventOnDocument={subcribeEventOnDocument}
        subcribeEventDeleteDocument={subcribeEventDeleteDocument}
        isAnyDialogTypeOpen={open}
        isNewLayout
        isNarrowScreen={isNarrowScreen}
        saveFileChanged={saveFileChangedInTempEditMode}
        saveFormFieldInTempEditMode={saveFormFieldInTempEditMode}
        isDefaultMode={isDefaultMode}
        conflictVersionHandler={conflictVersionHandler}
        saveOperations={saveOperations}
        {...props}
      />
    </ContentCheckerProvider>
  );
};

Viewer.propTypes = {
  location: PropTypes.object,
  navigate: PropTypes.func,
  currentUser: PropTypes.object,
  closeModal: PropTypes.func,
  subcribeUpdateOrganization: PropTypes.func,
  updateModalProperties: PropTypes.func,
  subcriptDeleteMultipleDocument: PropTypes.func,
  isOffline: PropTypes.bool,
};

Viewer.defaultProps = {
  location: {},
  navigate: () => {},
  currentUser: {},
  closeModal: () => {},
  subcribeUpdateOrganization: () => {},
  updateModalProperties: () => {},
  subcriptDeleteMultipleDocument: () => {},
  isOffline: false,
};

export default withMatchMediaLayout(Viewer);
