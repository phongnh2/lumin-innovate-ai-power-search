import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import { closeMoveDocumentModal, moveDocumentModalSelectors } from 'features/MoveDocumentModal';

const MoveDocumentModal = lazyWithRetry(() => import('./MoveDocumentModal'));

const MoveDocumentModalContainer: React.FC = () => {
  const isOpen = useSelector(moveDocumentModalSelectors.isOpen);
  const documents = useSelector(moveDocumentModalSelectors.documents);
  const dispatch = useDispatch();

  if (!isOpen) {
    return null;
  }

  return <MoveDocumentModal documents={documents} onClose={() => dispatch(closeMoveDocumentModal())} />;
};

export default MoveDocumentModalContainer;
