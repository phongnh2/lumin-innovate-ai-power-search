import { toLower } from 'lodash';
import React from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';

import RequestPermissionImage from 'assets/images/permission_required.svg';

import actions from 'actions';
import selectors from 'selectors';

import { useDocumentContext } from 'luminComponents/Document/context/DocumentContext';
import { useRequestAccessModal } from 'luminComponents/DocumentItemContainer/hooks';

import authServices from 'services/authServices';

import getCurrentRole from 'helpers/getCurrentRole';

import { useHandleManipulateDateGuestMode } from 'features/GuestModeManipulateCache/useHandleManipuldateGuestMode';

import { DocumentRole, POPPER_PERMISSION_TYPE } from 'constants/documentConstants';

import useShallowSelector from './useShallowSelector';
import { useTranslation } from './useTranslation';

const RoleMapping = [
  DocumentRole.OWNER,
  DocumentRole.SHARER,
  DocumentRole.EDITOR,
  DocumentRole.VIEWER,
  DocumentRole.SPECTATOR,
];

export const useRequestPermissionChecker = ({ permissionRequest }) => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const currentDocumentRole = getCurrentRole(currentDocument);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { handleBypassPermission } = useHandleManipulateDateGuestMode();

  const { refetchDocument } = useDocumentContext();

  const { element: requestAccessModalElement, openModal: triggerOpenRequestAccessModal } = useRequestAccessModal({
    documentId: currentDocument?._id,
    modalType: permissionRequest,
    refetchDocument,
  });

  const openRequestAccessModal = () => {
    triggerOpenRequestAccessModal();
    dispatch(actions.closeModal());
  };

  const handleSignIn = () => {
    authServices.signInInsideViewer(currentDocument);
    dispatch(actions.closeModal());
  };

  const getMessage = () => {
    switch (permissionRequest.toLowerCase()) {
      case DocumentRole.SHARER:
        return t('viewer.onlySharePermission');
      case DocumentRole.EDITOR:
        return t('viewer.onlyEditPermission');
      case DocumentRole.VIEWER:
        return t('viewer.onlyCommentPermission');
      default: {
        return '';
      }
    }
  };

  const openPermissionDeniedModal = () => {
    const modalSettings = {
      title: t('viewer.requestPermissionUpModal.permissionRequired'),
      message: getMessage(),
      center: true,
      icon: RequestPermissionImage,
      onConfirm: openRequestAccessModal,
      confirmButtonTitle: (
        <Trans
          i18nKey="pageTitle.requestPermissionAccess"
          values={{ permission: t(POPPER_PERMISSION_TYPE[permissionRequest.toUpperCase()].text).toLowerCase() }}
        />
      ),
      cancelButtonTitle: null,
      confirmDataLumin: {
        fullWidth: true,
        size: 'lg',
      },
    };
    dispatch(actions.openViewerModal(modalSettings));
  };

  const openRequestSignInModal = () => {
    const modalSettings = {
      title: t('viewer.makeACopy.signInRequired'),
      message: t('viewer.makeACopy.messageSignInRequired'),
      center: true,
      confirmButtonTitle: t('authorizeRequest.signInNow'),
      cancelButtonTitle: null,
      icon: RequestPermissionImage,
      confirmDataLumin: {
        fullWidth: true,
        size: 'lg',
      },
      onConfirm: handleSignIn,
    };
    dispatch(actions.openViewerModal(modalSettings));
  };

  const checkPermission =
    ({ role, onSuccess, onFailed, activeBtn }) =>
    () => {
      const roleIndex = RoleMapping.indexOf(role);
      const currentRoleIndex = RoleMapping.indexOf(toLower(currentDocumentRole));
      const isBypassPermission = handleBypassPermission(activeBtn);
      if ((currentRoleIndex <= roleIndex && currentUser) || isBypassPermission) {
        onSuccess();
        return;
      }
      if (onFailed) {
        onFailed();
        return;
      }

      if (!currentUser) {
        openRequestSignInModal();
      } else {
        openPermissionDeniedModal();
      }
    };

  return {
    withSharePermission: (onSuccess, onFailed) =>
      checkPermission({
        role: DocumentRole.SHARER,
        onSuccess,
        onFailed,
      }),
    withEditPermission: (onSuccess, onFailed, activeBtn) =>
      checkPermission({
        role: DocumentRole.EDITOR,
        onSuccess,
        onFailed,
        activeBtn,
      }),
    withCommentPermission: (onSuccess, onFailed) =>
      checkPermission({
        role: DocumentRole.VIEWER,
        onSuccess,
        onFailed,
      }),
    requestAccessModalElement,
    openRequestAccessModal,
  };
};
