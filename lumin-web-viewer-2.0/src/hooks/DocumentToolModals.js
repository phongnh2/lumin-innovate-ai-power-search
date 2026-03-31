import get from 'lodash/get';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useMemo, memo } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import actions from 'actions';
import selectors from 'selectors';

import * as ShareModalStyled from 'lumin-components/ShareModal/ShareModal.styled';

import { useThemeMode, useTranslation, useHitDocStackModalForOrgMembers } from 'hooks';

import { getHitDocStackModalForSharedUser } from 'helpers/getHitDocStackModalForSharedUser';
import getOrgOfDoc from 'helpers/getOrgOfDoc';

import documentPermissionsChecker from 'utils/Factory/DocumentPermissions';
import { lazyWithRetry } from 'utils/lazyWithRetry';

import { AnimationBanner } from 'constants/banner';
import { DOCUMENT_TYPE, DocumentRole } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';
import { DOCUMENT_ROLES } from 'constants/lumin-common';
import { Modal } from 'constants/toolModal';

const ShareDocumentOrganizationModal = lazyWithRetry(() =>
  import(/* webpackPrefetch: true */ 'lumin-components/ShareDocumentOrganizationModal')
);
const RequestPermissionModal = lazyWithRetry(() =>
  import(/* webpackPrefetch: true */ 'lumin-components/RequestPermissionModal')
);
const ShareModal = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'lumin-components/ShareModal'));
const ShareDocumentLinkModal = lazyWithRetry(() =>
  import(/* webpackPrefetch: true */ 'lumin-components/ShareDocumentLinkModal')
);

const DocumentToolModals = ({ refetchDocument }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const currentDocument = useSelector(selectors.getCurrentDocument, shallowEqual);
  const organizations = useSelector(selectors.getOrganizationList, shallowEqual);

  const document = useSelector(selectors.getCurrentDocument, shallowEqual);
  const openToolModal = useSelector(selectors.getOpenToolModal, shallowEqual);
  const openShareModal = location.state?.openShareModal;
  const documentType = currentDocument?.documentType || '';

  const userRole = get(currentDocument, 'documentReference.data.userRole', '');
  const userPermissions = useMemo(() => {
    if (!documentType) {
      return '';
    }
    return documentPermissionsChecker.from(documentType).createChecker({
      document: currentDocument,
      userRole,
    });
  }, [currentDocument, documentType, userRole]);

  const canUpdateShareSetting = () => {
    if (!documentType) {
      return false;
    }
    if (DOCUMENT_TYPE.PERSONAL === documentType) {
      return currentDocument.roleOfDocument === DocumentRole.OWNER.toUpperCase();
    }
    return userPermissions.canUpdateShareSetting();
  };

  const [openSupportModal, setOpenSupportModal] = useState('');
  const themeMode = useThemeMode();
  const themeModeProvider = useMemo(() => ShareModalStyled.theme[themeMode], [themeMode]);

  const openViewerModal = (modalSettings) => dispatch(actions.openViewerModal(modalSettings));
  const orgOfDoc = getOrgOfDoc({ organizations, currentDocument: document });
  const hitDocStackModalSettings = useHitDocStackModalForOrgMembers({ orgOfDoc });
  const openHitDocStackModal = (action = UserEventConstants.Events.HeaderButtonsEvent.SHARE) => {
    if (document.isShared) {
      openViewerModal(getHitDocStackModalForSharedUser(action, t));
    } else {
      openViewerModal(hitDocStackModalSettings);
    }
  };
  const setCurrentDocument = (newDocument) => dispatch(actions.updateCurrentDocument(newDocument));
  const closeToolModal = () => {
    dispatch(actions.closeToolModal());
  };

  const _handleCloseMainModal = () => {
    dispatch(actions.setShouldShowRating(AnimationBanner.SHOW));
    closeToolModal();
    if (openShareModal) {
      // prevent open modal when close and reload page
      const state = { ...location.state };
      delete state.openShareModal;
      delete location.search;
      navigate({ ...location, state }, { replace: true });
    }
  };

  const isExternalOpened =
    ![DOCUMENT_TYPE.ORGANIZATION, DOCUMENT_TYPE.ORGANIZATION_TEAM].includes(documentType) || !orgOfDoc;

  const openRequestPermissionModal = () => setOpenSupportModal(Modal.REQUEST_PERMISSIONS);

  const renderMainModal = (refetchDocument = () => {}) => {
    switch (openToolModal) {
      case Modal.SHARE_DOCUMENT_ORG: {
        return (
          <ShareDocumentOrganizationModal
            open
            currentDocument={document}
            refetchDocument={refetchDocument}
            onClose={_handleCloseMainModal}
            openRequestModal={openRequestPermissionModal}
            updateDocument={setCurrentDocument}
            isExternalOpened={isExternalOpened}
          />
        );
      }
      case Modal.SHARE_DOCUMENT: {
        return (
          <ShareModal
            open
            onClose={_handleCloseMainModal}
            currentDocument={document}
            refetchDocument={refetchDocument}
            updateDocument={setCurrentDocument}
            openRequestModal={openRequestPermissionModal}
            isViewer
          />
        );
      }
      case Modal.REQUEST_PERMISSIONS: {
        return (
          <RequestPermissionModal
            onClose={closeToolModal}
            modalType={DOCUMENT_ROLES.SHARER}
            documentId={document._id}
          />
        );
      }
      case Modal.SHARE_LINK: {
        return (
          <ThemeProvider theme={themeModeProvider}>
            <ShareDocumentLinkModal
              currentDocument={document}
              shareSetting={document.shareSetting}
              handleClose={_handleCloseMainModal}
              refetchDocument={refetchDocument}
              updateDocument={setCurrentDocument}
              openHitDocStackModal={openHitDocStackModal}
              isOpen
              canUpdateShareSetting={canUpdateShareSetting()}
            />
          </ThemeProvider>
        );
      }
      default:
        return null;
    }
  };

  const _handleCloseSupportModal = () => {
    setOpenSupportModal('');
  };

  function renderSupportModal() {
    switch (openSupportModal) {
      case Modal.REQUEST_PERMISSIONS: {
        return (
          <RequestPermissionModal
            onClose={_handleCloseSupportModal}
            modalType={DOCUMENT_ROLES.SHARER}
            documentId={document._id}
          />
        );
      }
      case Modal.SHARE_DOCUMENT_ORG:
      case Modal.SHARE_DOCUMENT:
      default:
        return null;
    }
  }

  useEffect(() => {
    if (openToolModal) {
      setOpenSupportModal('');
    }
  }, [openToolModal]);

  const renderToolModal = (refetchDocument = () => {}) => (
    <>
      {renderMainModal(refetchDocument)}
      {renderSupportModal()}
    </>
  );

  return renderToolModal(refetchDocument);
};

DocumentToolModals.propTypes = {
  refetchDocument: PropTypes.func.isRequired,
};

export default memo(DocumentToolModals);
