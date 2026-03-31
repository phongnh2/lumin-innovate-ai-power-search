import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import selectors from 'selectors';

import RenameDocumentModal from 'luminComponents/RenameDocumentModal';

import { closeRenameDocumentModal, renameDocumentModalSelectors } from './slices';

const RenameDocumentModalContainer = () => {
  const dispatch = useDispatch();
  const currentDocument = useSelector(selectors.getCurrentDocument);
  const { isOpen } = useSelector(renameDocumentModalSelectors.renameDocumentModal);

  const onCloseModal = () => dispatch(closeRenameDocumentModal());

  return <RenameDocumentModal isOnlyRenaming open={isOpen} document={currentDocument} onCancel={onCloseModal} />;
};

export default RenameDocumentModalContainer;
