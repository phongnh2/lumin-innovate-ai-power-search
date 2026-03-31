import get from 'lodash/get';
import { useEffect } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import actions from 'actions';
import selectors from 'selectors';

import { RequestPermissionText } from 'lumin-components/RequestAccessDocumentList/constants';
import { TriggerDownloadDocumentSource } from 'luminComponents/SaveAsModal/constant';
import { TriggerDownloadDocumentSourceType } from 'luminComponents/SaveAsModal/type';

import { useTranslation, useHitDocStackModalForOrgMembers, useLatestRef } from 'hooks';
import { useIntegrate } from 'hooks/useIntegrate';

import { userServices } from 'services';
import documentServices from 'services/documentServices';

import downloadPdf from 'helpers/downloadPdf';
import { getHitDocStackModalForSharedUser } from 'helpers/getHitDocStackModalForSharedUser';
import logger from 'helpers/logger';
import { print } from 'helpers/print';

import { eventTracking } from 'utils';
import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { MessageName, MessagePurpose } from 'utils/Factory/EventCollection/RightBarEventCollection';

import { readAloudActions } from 'features/ReadAloud/slices';
import { onDeleteSpeechTextHighlighted } from 'features/ReadAloud/utils/onHighlightSpeechText';

import dataElements from 'constants/dataElement';
import { DOCUMENT_TYPE, DocumentRole } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';
import { HUBSPOT_CONTACT_PROPERTIES } from 'constants/hubspotContactProperties';
import { OPERATION_CANCELED_MESSAGE, STORAGE_TYPE } from 'constants/lumin-common';
import { INTEGRATE_BUTTON_NAME } from 'constants/luminSign';
import { Modal } from 'constants/toolModal';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import { IDocumentBase, Storage } from 'interfaces/document/document.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';

import { FileType } from './documents/useGetFileType';

export enum CallbackResult {
  Success = 'success',
  Failed = 'failed',
}

enum DocStackProcess {
  Immediate = 'immediate',
  WaitSuccess = 'waitSuccess',
}

interface LocationStateProps {
  openShareModal: boolean;
}

const useDocumentTools = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useDispatch();
  const isLoadingDocument = useSelector(selectors.isLoadingDocument);
  const { handleEvent } = useIntegrate();
  const params = new URLSearchParams(location.search);
  const actionName = params.get('action');
  const REQUEST_ACCESS_ACTION = 'request_access';
  const openShareModal = (location.state as LocationStateProps)?.openShareModal;

  const document = useSelector(selectors.getCurrentDocument, shallowEqual) || ({} as IDocumentBase);
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const isOffline = useSelector(selectors.isOffline);
  const actionCountDocStack = useSelector(selectors.getActionCountDocStack);
  const isEmbedPrintSupported = useSelector(selectors.isEmbedPrintSupported);
  const currentDocumentRef = useLatestRef(document);

  const isEnabledSyncDriveTowardDocStack = actionCountDocStack?.sync;
  const orgOfDoc = get(document, 'documentReference.data', '') as IOrganization;
  const hitDocStackModalSettings = useHitDocStackModalForOrgMembers({ orgOfDoc });

  const openViewerModal = (modalSettings: Record<string, unknown>) => dispatch(actions.openViewerModal(modalSettings));
  const openToolDocumentModal = (modalType: string) => {
    if (!currentUser) {
      return;
    }
    dispatch(actions.openToolModalByType(modalType));
  };

  const openHitDocStackModal = (action: string) => {
    if (document.isShared) {
      openViewerModal(getHitDocStackModalForSharedUser(action, t));
    } else {
      openViewerModal(hitDocStackModalSettings);
    }
  };

  const handleDocStack =
    ({
      callback,
      action,
      process = DocStackProcess.Immediate,
      signal,
    }: {
      callback: () => Promise<{
        result: CallbackResult;
      }> | void;
      action?: string;
      process?: DocStackProcess;
      signal?: AbortSignal;
    }) =>
    async () => {
      if (!currentUser) {
        return;
      }
      if (!!document.remoteId && !isOffline) {
        const docStackInfo = await documentServices.getDocStackInfo(document._id, { signal });
        if (!docStackInfo.canFinishDocument) {
          openHitDocStackModal(action);
          return;
        }
      }
      const { result } = (await callback()) || {};

      if (!document.remoteId || isOffline) {
        return;
      }

      const shouldCountDocStack =
        process === DocStackProcess.Immediate ||
        (result === CallbackResult.Success && process === DocStackProcess.WaitSuccess);
      if (shouldCountDocStack) {
        documentServices.countDocStackUsage(document._id).catch((err) => {
          logger.logError({
            error: err,
            message: 'Failed to count doc stack usage',
          });
        });
      }

      documentServices.trackingUserUseDocument(document._id).catch((err) => {
        logger.logError({
          error: err,
          message: 'Failed to track user use document',
        });
      });
    };

  const handleEventTracking = ({ elementName, elementPurpose }: { elementName: string; elementPurpose?: string }) => {
    if (!elementName) {
      return;
    }
    eventTracking(UserEventConstants.EventType.CLICK, {
      elementName,
      elementPurpose,
    }).catch(() => {});
  };

  const onCancelReadAloudMode = () => {
    onDeleteSpeechTextHighlighted();
    window.speechSynthesis.cancel();
    dispatch(readAloudActions.resetReadAloud());
  };

  const handlePrintDocument = ({ inRightSideBar = false }) =>
    handleDocStack({
      callback: () => {
        onCancelReadAloudMode();
        const printOptions = {
          allPages: true,
          includeAnnotations: true,
          printQuality: 3,
          maintainPageOrientation: true,
        };
        print(dispatch, isEmbedPrintSupported, printOptions).catch(() => {});
        const elementName = inRightSideBar
          ? MessageName.PRINT_DOCUMENT
          : UserEventConstants.Events.HeaderButtonsEvent.PRINT;
        handleEventTracking({ elementName });
      },
      action: UserEventConstants.Events.HeaderButtonsEvent.PRINT,
    });

  const getElementName = (source: TriggerDownloadDocumentSourceType) => {
    switch (source) {
      case TriggerDownloadDocumentSource.HEADER_BUTTON: {
        return UserEventConstants.Events.HeaderButtonsEvent.DOWNLOAD;
      }
      case TriggerDownloadDocumentSource.RIGHT_SIDE_BAR_BUTTON: {
        return MessageName.DOWNLOAD_DOCUMENT;
      }
      case TriggerDownloadDocumentSource.LANDING_PAGE:
      default: {
        return '';
      }
    }
  };

  const handleDownloadDocument =
    ({ downloadType = 'pdf', source }: { downloadType?: FileType; source?: TriggerDownloadDocumentSourceType }) =>
    () => {
      onCancelReadAloudMode();
      if (isOffline) {
        handleDocStack({
          callback: () => {
            downloadPdf(dispatch, {
              downloadType,
              filename: currentDocumentRef.current.name,
              currentFileSize: currentDocumentRef.current.size,
            }).catch(() => {});
          },
          action: UserEventConstants.Events.HeaderButtonsEvent.DOWNLOAD,
        });
      } else {
        dispatch(actions.openElement(dataElements.SAVE_AS_MODAL));
        dispatch(actions.setOpenedElementData(dataElements.SAVE_AS_MODAL, { source }));
      }
      if (!isOffline) {
        userServices
          .saveHubspotProperties({
            key: HUBSPOT_CONTACT_PROPERTIES.DOWNLOAD_DOCUMENT,
            value: 'true',
          })
          .catch((err) => {
            logger.logError({
              error: err,
              message: 'Failed to save hubspot properties',
            });
          });
      }

      const elementName = getElementName(source);
      const isInRightSideBar = source === TriggerDownloadDocumentSource.RIGHT_SIDE_BAR_BUTTON;
      if (!elementName) {
        return;
      }
      const elementPurpose = isInRightSideBar
        ? MessagePurpose[MessageName.DOWNLOAD_DOCUMENT]
        : ButtonPurpose[ButtonName.DOWNLOAD_DOCUMENT];
      handleEventTracking({ elementName, elementPurpose });
    };

  const handleOpenShareModal = (openShareLinkModal = false) => {
    const canShareDocument = () => currentUser || document?.shareSetting?.permission === 'SHARER';
    const isOrgDocument = () =>
      [DOCUMENT_TYPE.ORGANIZATION, DOCUMENT_TYPE.ORGANIZATION_TEAM].includes(document.documentType);

    if (canShareDocument()) {
      if (openShareLinkModal) {
        openToolDocumentModal(Modal.SHARE_LINK);
      } else if (isOrgDocument()) {
        openToolDocumentModal(Modal.SHARE_DOCUMENT_ORG);
      } else {
        openToolDocumentModal(Modal.SHARE_DOCUMENT);
      }
    }
  };

  const addQueryParam = ({ inRightSideBar }: { inRightSideBar: boolean }) => {
    params.append(UrlSearchParam.OPEN_MODAL_FROM, inRightSideBar ? 'sidebar' : 'header');
    navigate(
      {
        search: params.toString(),
      },
      { replace: true }
    );
  };

  const handleShareDocument = ({ inRightSideBar = false }) => {
    handleEvent(INTEGRATE_BUTTON_NAME.INVITE_PEOPLE);
    handleOpenShareModal();
    addQueryParam({ inRightSideBar });
  };

  const handleRequestSharePermission = () => {
    openToolDocumentModal(Modal.REQUEST_PERMISSIONS);
    eventTracking(UserEventConstants.EventType.REQUEST_DOCUMENT_PERMISSION, {
      permission: RequestPermissionText[DocumentRole.SHARER],
    }).catch(() => {});
  };

  const handleDocStackForSyncExternalFile = async ({
    callback,
    storage,
    signal,
  }: {
    callback: () => Promise<{
      result: CallbackResult;
    }> | void;
    storage: Storage;
    signal?: AbortSignal;
  }) => {
    try {
      switch (storage) {
        case STORAGE_TYPE.GOOGLE:
          if (!isEnabledSyncDriveTowardDocStack) {
            await callback();
          }
          await handleDocStack({
            callback,
            process: DocStackProcess.WaitSuccess,
          })();
          break;
        case STORAGE_TYPE.DROPBOX: {
          if (!isEnabledSyncDriveTowardDocStack) {
            await callback();
            return;
          }
          await handleDocStack({
            callback,
            process: DocStackProcess.WaitSuccess,
            signal,
          })();
          break;
        }
        case STORAGE_TYPE.ONEDRIVE: {
          await handleDocStack({ callback, process: DocStackProcess.WaitSuccess, signal })();
          return;
        }

        default:
          await callback();
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.message === OPERATION_CANCELED_MESSAGE) {
        return;
      }

      logger.logError({
        error,
        message: 'Failed to sync external file to doc stack',
      });
    }
  };

  useEffect(() => {
    if (!isLoadingDocument && (openShareModal || actionName === REQUEST_ACCESS_ACTION)) {
      const isOrgDocument = [DOCUMENT_TYPE.ORGANIZATION, DOCUMENT_TYPE.ORGANIZATION_TEAM].includes(
        document.documentType
      );
      openToolDocumentModal(isOrgDocument ? Modal.SHARE_DOCUMENT_ORG : Modal.SHARE_DOCUMENT);
    }
  }, [isLoadingDocument, openShareModal, document.documentType]);

  return {
    handlePrintDocument,
    handleDownloadDocument,
    handleShareDocument,
    handleRequestSharePermission,
    openHitDocStackModal,
    handleDocStackForSyncExternalFile,
    handleDocStack,
  };
};

export default useDocumentTools;
