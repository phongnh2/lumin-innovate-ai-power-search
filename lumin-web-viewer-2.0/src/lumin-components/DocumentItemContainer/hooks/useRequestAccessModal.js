import React, { useState } from 'react';

import { RequestPermissionText } from 'lumin-components/RequestAccessDocumentList/constants';
import RequestPermissionModal from 'lumin-components/RequestPermissionModal';
import { RequestType } from 'luminComponents/RequestPermissionModal/requestType.enum';

import { eventTracking } from 'utils';

import { DocumentRole } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';

const useRequestAccessModal = ({ documentId, refetchDocument, modalType = RequestType.SHARER }) => {
  const [open, setOpen] = useState(false);
  const closeModal = () => setOpen(false);

  const handleOpenModal = () => {
    setOpen(true);
    eventTracking(UserEventConstants.EventType.REQUEST_DOCUMENT_PERMISSION, {
      permission: RequestPermissionText[DocumentRole.SHARER],
    });
  };

  return {
    open,
    openModal: handleOpenModal,
    closeModal,
    element: open && documentId && (
      <RequestPermissionModal
        onClose={closeModal}
        documentId={documentId}
        modalType={modalType}
        refetchDocument={refetchDocument}
      />
    ),
  };
};

export default useRequestAccessModal;
