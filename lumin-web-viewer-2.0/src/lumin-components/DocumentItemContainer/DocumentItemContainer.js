import produce from 'immer';
import PropTypes from 'prop-types';
import React, { useEffect, useCallback, useMemo, useContext } from 'react';
import { connect, useSelector } from 'react-redux';

import QuickActions from '@web-new-ui/components/DocumentListItem/QuickActions';

import actions from 'actions';
import selectors from 'selectors';

import { DocumentContext } from 'lumin-components/Document/context';
import { useClickDocument, useDragDropDocument } from 'lumin-components/DocumentItem/hooks';
import { RequestPermissionText } from 'lumin-components/RequestAccessDocumentList/constants';
import DocumentItem from 'luminComponents/DocumentItem';
import DocumentItemPopper from 'luminComponents/DocumentItemPopper';
import { executeCopyText } from 'luminComponents/RightSideBarContent/utils';

import { useCreateTemplateOnDocument, useTranslation, useGetIsCompletedUploadDocuments } from 'hooks';

import { getShareLink, toastUtils, eventTracking } from 'utils';

import {
  DocumentActions,
  DocumentRole,
  DOCUMENT_OFFLINE_STATUS,
  REMOVE_UPLOAD_ICON_TIMEOUT,
  REMOVE_HIGHLIGHT_FOUND_DOCUMENT_TIMEOUT,
} from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';
import { STORAGE_TYPE } from 'constants/lumin-common';

import { useRequestAccessModal } from './hooks';

const propTypes = {
  document: PropTypes.object.isRequired,
  handleStarClick: PropTypes.func,
  removeNewUploadDot: PropTypes.func,
  openSettingDocumentModal: PropTypes.func,
  makeOffline: PropTypes.func,
  currentUser: PropTypes.object,
  setHighlightFoundDocument: PropTypes.func,
  foundDocumentScrolling: PropTypes.bool,
};

const defaultProps = {
  handleStarClick: () => {},
  removeNewUploadDot: () => {},
  openSettingDocumentModal: () => {},
  makeOffline: () => {},
  currentUser: {},
  setHighlightFoundDocument: () => {},
  foundDocumentScrolling: false,
};

function DocumentItemContainer(props) {
  const {
    document,
    handleStarClick,
    removeNewUploadDot,
    openSettingDocumentModal,
    makeOffline,
    currentUser,
    setHighlightFoundDocument,
    foundDocumentScrolling,
  } = props;
  const isOffline = useSelector(selectors.isOffline);
  const { t } = useTranslation();
  const {
    selectedDocList,
    setDocumentList,
    isMoving,
    isDeleting,
    lastSelectedDocIdRef,
    shiftHoldingRef,
    refetchDocument,
    isDragging,
    handleSelectedItems,
  } = useContext(DocumentContext);

  const { dragRef } = useDragDropDocument({ document });

  const { element: requestModalElement, openModal: openRequestModal } = useRequestAccessModal({
    documentId: document._id,
    refetchDocument,
  });

  const isSelected = selectedDocList.some((item) => item._id === document._id);

  const isDisabled = useMemo(() => {
    const isSystemFile = document.service === STORAGE_TYPE.SYSTEM;
    const unavaiableOffline =
      isOffline && !isSystemFile && document.offlineStatus !== DOCUMENT_OFFLINE_STATUS.AVAILABLE;
    const isInteracting = isSelected && (isDeleting || isMoving);
    return {
      selection: isInteracting || unavaiableOffline,
      open: isInteracting || unavaiableOffline,
      actions: isOffline,
      drag: isInteracting || unavaiableOffline,
    };
  }, [isOffline, document.offlineStatus, isSelected, isDeleting, isMoving, isDragging]);

  const isStarred = useMemo(
    () =>
      document.service === STORAGE_TYPE.SYSTEM
        ? document.isStarred
        : document.listUserStar && document.listUserStar.includes(currentUser._id),
    [document, currentUser._id]
  );

  const { onCheckboxChange, onClickDocument } = useClickDocument({
    document,
    isDisabled: isDisabled.selection,
    isDisabledSelection: isDisabled.selection,
    lastSelectedDocIdRef,
    shiftHoldingRef,
    handleSelectedItems,
  });
  const { preCheckCreatedFile } = useCreateTemplateOnDocument();

  const handleCreateAsTemplate = useCallback(async () => {
    const error = await preCheckCreatedFile(document);
    if (error) {
      toastUtils.error({ message: error.message });
      return;
    }
    openSettingDocumentModal({ mode: DocumentActions.CreateAsTemplate, selectedDocuments: [document] });
  }, [document]);

  const onShareItemClick = useCallback(() => {
    if ([DocumentRole.SHARER, DocumentRole.OWNER].includes(document.roleOfDocument.toLowerCase())) {
      openSettingDocumentModal({ mode: DocumentActions.Share, selectedDocuments: [document] });
      return;
    }
    eventTracking(UserEventConstants.EventType.REQUEST_DOCUMENT_PERMISSION, {
      permission: RequestPermissionText[DocumentRole.SHARER],
    });
    openRequestModal();
  }, [document]);

  const onCopyShareLink = () => {
    executeCopyText(getShareLink(document._id));
    toastUtils.success({ message: t('modalShare.hasBeenCopied'), useReskinToast: true });
  };

  const popperActions = useMemo(
    () => ({
      viewInfo: () => openSettingDocumentModal({ mode: DocumentActions.View, selectedDocuments: [document] }),
      open: () => onClickDocument(),
      makeACopy: () => openSettingDocumentModal({ mode: DocumentActions.MakeACopy, selectedDocuments: [document] }),
      rename: () => openSettingDocumentModal({ mode: DocumentActions.Rename, selectedDocuments: [document] }),
      markFavorite: handleStarClick(document),
      remove: () => openSettingDocumentModal({ mode: DocumentActions.Remove, selectedDocuments: [document] }),
      copyLink: onCopyShareLink,
      share: onShareItemClick,
      move: () => openSettingDocumentModal({ mode: DocumentActions.Move, selectedDocuments: [document] }),
      createAsTemplate: handleCreateAsTemplate,
      makeOffline: makeOffline(document),
      uploadToLumin: () =>
        openSettingDocumentModal({ mode: DocumentActions.UploadToLumin, selectedDocuments: [document] }),
    }),
    [document]
  );

  const contentPopper = useCallback(
    ({ closePopper }) => <DocumentItemPopper document={document} closePopper={closePopper} actions={popperActions} />,
    [popperActions, document]
  );

  const renderMenuActions = useCallback(
    ({ openMenu, setOpenMenu }) => (
      <DocumentItemPopper
        document={document}
        actions={popperActions}
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
        closePopper={() => setOpenMenu(false)}
      />
    ),
    [popperActions, document]
  );

  const renderQuickActions = useCallback(
    () => <QuickActions document={document} actions={popperActions} />,
    [popperActions, document]
  );

  const documentItemMemo = useMemo(
    () => (
      <DocumentItem
        {...props}
        contentPopper={contentPopper}
        isSelected={isSelected}
        isDisabled={isDisabled}
        onCheckboxChange={onCheckboxChange}
        onClickDocument={onClickDocument}
        dragRef={dragRef}
        isStarred={isStarred}
        renderMenuActions={renderMenuActions}
        renderQuickActions={renderQuickActions}
      />
    ),
    [contentPopper, isSelected, isDisabled, onCheckboxChange, onClickDocument, renderMenuActions, props]
  );

  const handleRemoveNewUploadDot = () => {
    if (document.folderId) {
      // Remove upload dot for document in folder
      setDocumentList((prevDocuments) =>
        produce(prevDocuments, (draft) => {
          const targetDocument = draft.find((item) => item._id === document._id);
          targetDocument.newUpload = false;
        })
      );
    } else {
      // Remove upload dot for document not being in any folder
      removeNewUploadDot(document._id);
    }
  };

  const isCompletedUploadDocuments = useGetIsCompletedUploadDocuments();
  const openUploadingPopper = useSelector(selectors.isOpenUploadingPopper);

  useEffect(() => {
    let timeout = null;
    const isS3Service = document.service === STORAGE_TYPE.S3;
    const isCompletedUploadPopper = openUploadingPopper && isCompletedUploadDocuments;
    const condition = document.newUpload && (!isS3Service || !openUploadingPopper || isCompletedUploadPopper);
    if (condition) {
      timeout = setTimeout(() => {
        handleRemoveNewUploadDot();
      }, REMOVE_UPLOAD_ICON_TIMEOUT);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [document.newUpload, document.service, isCompletedUploadDocuments]);

  useEffect(() => {
    const handleRemoveHighlightFoundDocument = () => {
      if (!foundDocumentScrolling && document.highlightFoundDocument) {
        if (document.folderId) {
          setDocumentList((prevDocuments) =>
            produce(prevDocuments, (draft) => {
              const targetDocument = draft.find((item) => item._id === document._id);
              targetDocument.highlightFoundDocument = false;
            })
          );
        } else {
          setHighlightFoundDocument({ documentId: document._id, highlight: false });
        }
      }
    };
    const timeout = setTimeout(() => {
      handleRemoveHighlightFoundDocument();
    }, REMOVE_HIGHLIGHT_FOUND_DOCUMENT_TIMEOUT);
    return () => {
      clearTimeout(timeout);
    };
  }, [document.highlightFoundDocument, document._id, setHighlightFoundDocument, document.folderId, setDocumentList]);

  return (
    <>
      {documentItemMemo}
      {requestModalElement}
    </>
  );
}

DocumentItemContainer.propTypes = propTypes;
DocumentItemContainer.defaultProps = defaultProps;
DocumentItemContainer.timeOutNewDoc = {};

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
});

const mapDispatchToProps = (dispatch) => ({
  removeNewUploadDot: (documentId) => dispatch(actions.removeNewUploadDot(documentId)),
  setHighlightFoundDocument: (payload) => dispatch(actions.setHighlightFoundDocument(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DocumentItemContainer);
