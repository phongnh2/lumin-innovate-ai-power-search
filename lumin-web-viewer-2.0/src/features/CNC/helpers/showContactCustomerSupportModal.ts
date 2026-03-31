import React from 'react';
import { AnyAction } from 'redux';

import actions from 'actions';
import { store } from 'store';

import { isViewerRouteMatch } from 'hooks/useViewerMatch';

import { isTemplateViewerRouteMatch } from 'features/Document/hooks/useTemplateViewerMatch';

import ContactCustomerSupportModal from '../CncComponents/JoinOrganizationFromOpenDrive/components/ContactCustomerSupportModal';

const showContactCustomerSupportModal = ({ numberInvited }: { numberInvited: number }) => {
  const isViewer = isViewerRouteMatch(window.location.pathname);
  const isTemplateViewer = isTemplateViewerRouteMatch(window.location.pathname);
  const { dispatch } = store;

  const modalSettings = {
    message: React.createElement(ContactCustomerSupportModal, { numberInvited }),
    disableBackdropClick: true,
    disableEscapeKeyDown: true,
    useReskinModal: true,
    hideDefaultButtons: true,
    closeOnRouteChange: false,
  };
  if (isViewer || isTemplateViewer) {
    dispatch(actions.openViewerModal(modalSettings) as AnyAction);
  } else {
    dispatch(actions.openModal(modalSettings) as AnyAction);
  }
};

export default showContactCustomerSupportModal;
