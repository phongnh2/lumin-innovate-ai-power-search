import { useCallback, useContext, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';

import CookieWarningContext from 'lumin-components/CookieWarningModal/Context';
import { useRequestAccessModal } from 'luminComponents/DocumentItemContainer/hooks';
import { DocumentListContext } from 'luminComponents/DocumentList/Context';
import { ExtendedDocumentModalProps } from 'luminComponents/DocumentList/HOC/withDocumentModal';
import { RequestPermissionText } from 'luminComponents/RequestAccessDocumentList/constants';
import { executeCopyText } from 'luminComponents/RightSideBarContent/utils';

import { cachingFileHandler } from 'HOC/OfflineStorageHOC';

import { useGetCurrentUser, useHomeMatch, useOfflineAction, useTranslation } from 'hooks';

import { documentGraphServices } from 'services/graphServices';

import { eventTracking, getShareLink, toastUtils } from 'utils';
import { DocumentViewerOpenFrom } from 'utils/Factory/EventCollection/constants/DocumentEvent';
import { getLanguage, getLanguageFromUrl } from 'utils/getLanguage';

import { socket } from '@socket';

import { featureStoragePolicy } from 'features/FeatureConfigs';

import { DocumentActions, DocumentRole } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';
import { LANGUAGES } from 'constants/language';
import { ModalTypes, STORAGE_TYPE } from 'constants/lumin-common';
import { Routers } from 'constants/Routers';
import { SOCKET_EMIT } from 'constants/socketConstant';
import { BASEURL } from 'constants/urls';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { DocumentActionsType } from '../types';

type UseDocumentActionsProps = {
  document: IDocumentBase;
  refetchDocument: () => void;
  openDocumentModal: ExtendedDocumentModalProps['openDocumentModal'];
  isDisabledSelection?: boolean;
};

type UseDocumentActionsOutput = {
  requestModalElement: JSX.Element;
  actions: DocumentActionsType;
};

const useDocumentActions = ({
  document,
  openDocumentModal,
  refetchDocument,
  isDisabledSelection,
}: UseDocumentActionsProps): UseDocumentActionsOutput => {
  const { t } = useTranslation();
  const currentUser = useGetCurrentUser();

  // [START] double click action
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { setCookieModalVisible, cookiesDisabled } = useContext(CookieWarningContext);
  const { externalDocumentExistenceGuard } = useContext(DocumentListContext) || {};

  const { isHomePage } = useHomeMatch();
  const openFrom = useMemo(
    () => (isHomePage ? DocumentViewerOpenFrom.HOMEPAGE : DocumentViewerOpenFrom.DOC_LIST),
    [isHomePage]
  );

  const onDoubleClickDocument = useCallback(() => {
    if (isDisabledSelection) {
      return;
    }
    if (
      cookiesDisabled &&
      featureStoragePolicy.externalStorages.includes(
        document.service as typeof STORAGE_TYPE.DROPBOX | typeof STORAGE_TYPE.GOOGLE | typeof STORAGE_TYPE.ONEDRIVE
      )
    ) {
      setCookieModalVisible(true);
      return;
    }
    externalDocumentExistenceGuard(document, () => {
      const language = getLanguage();
      const languageUrl = getLanguageFromUrl();
      if (language !== languageUrl && language !== LANGUAGES.EN) {
        const url = `${BASEURL}/${language}${Routers.VIEWER}/${document._id}`;
        window.location.replace(url);
      } else {
        navigate(`${Routers.VIEWER}/${document._id}`, {
          state: {
            previousPath: pathname,
            openFrom,
          },
        });
      }
    });
  }, [
    cookiesDisabled,
    document,
    externalDocumentExistenceGuard,
    isDisabledSelection,
    navigate,
    pathname,
    setCookieModalVisible,
    openFrom,
  ]);
  // [END] double click action

  // [START] star action
  const handleStarClick = useCallback(
    () => async () => {
      try {
        await documentGraphServices.starDocumentMutation({
          document,
          currentUser,
          clientId: currentUser._id,
        });
        socket.emit(SOCKET_EMIT.UPDATE_DOCUMENT, { roomId: document._id, type: 'star' });
      } catch (e) {
        toastUtils.openToastMulti({
          type: ModalTypes.ERROR,
          message: t('documentPage.errorMessageStarDocument'),
        });
      }
    },
    [document, currentUser, t]
  );
  // [END] star action

  // [START] copy link action
  const onCopyShareLink = useCallback(() => {
    executeCopyText(getShareLink(document._id)).catch(() => {});
    toastUtils.success({ message: t('modalShare.hasBeenCopied'), useReskinToast: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document._id]);
  // [END] copy link action

  const { element: requestModalElement, openModal: openRequestModal } = useRequestAccessModal({
    documentId: document._id,
    refetchDocument,
  });

  // [START] share action
  const onShareItemClick = useCallback(() => {
    if ([DocumentRole.SHARER, DocumentRole.OWNER].includes(document.roleOfDocument.toLowerCase())) {
      openDocumentModal({ mode: DocumentActions.Share, selectedDocuments: [document] });
      return;
    }
    eventTracking(UserEventConstants.EventType.REQUEST_DOCUMENT_PERMISSION, {
      permission: RequestPermissionText[DocumentRole.SHARER],
    }).catch(() => {});
    openRequestModal();
  }, [document, openDocumentModal, openRequestModal]);
  // [END] share action

  // [START] make offline action
  const { makeOffline, pendingDownloadedDocument, setPendingDownloadedDocument, onDownloadDocument } =
    useOfflineAction();

  useEffect(() => {
    const messageHandler = async ({ process }: { process: unknown }) => {
      if (cachingFileHandler.isSourceDownloadSuccess(process) && pendingDownloadedDocument) {
        await onDownloadDocument(pendingDownloadedDocument);
        setPendingDownloadedDocument(null);
      }
    };
    cachingFileHandler.subServiceWorkerHandler(messageHandler);

    return () => cachingFileHandler.unSubServiceWorkerHandler(messageHandler);
  }, [onDownloadDocument, pendingDownloadedDocument, setPendingDownloadedDocument]);
  // [END] make offline action

  const documentActions = useMemo(
    () =>
      ({
        viewInfo: () => openDocumentModal({ mode: DocumentActions.View, selectedDocuments: [document] }),
        open: () => onDoubleClickDocument(),
        makeACopy: () => openDocumentModal({ mode: DocumentActions.MakeACopy, selectedDocuments: [document] }),
        rename: () => openDocumentModal({ mode: DocumentActions.Rename, selectedDocuments: [document] }),
        markFavorite: handleStarClick(),
        remove: () => openDocumentModal({ mode: DocumentActions.Remove, selectedDocuments: [document] }),
        copyLink: () => onCopyShareLink(),
        share: onShareItemClick,
        move: () => openDocumentModal({ mode: DocumentActions.Move, selectedDocuments: [document] }),
        makeOffline: makeOffline(document),
      } as DocumentActionsType),
    [
      document,
      handleStarClick,
      makeOffline,
      onCopyShareLink,
      onDoubleClickDocument,
      onShareItemClick,
      openDocumentModal,
    ]
  );

  return {
    requestModalElement,
    actions: documentActions,
  };
};

export default useDocumentActions;
