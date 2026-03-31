import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import { closeCopyDocumentModal, copyDocumentModalSelectors } from 'features/CopyDocumentModal';

const CopyDocumentModal = lazyWithRetry(() => import('./CopyDocumentModal'));

const CopyDocumentModalContainer: React.FC = () => {
  const isOpen = useSelector(copyDocumentModalSelectors.isOpen);
  const document = useSelector(copyDocumentModalSelectors.document);
  const dispatch = useDispatch();

  if (!isOpen || !document) {
    return null;
  }

  return <CopyDocumentModal document={document} onClose={() => dispatch(closeCopyDocumentModal())} />;
};

export default CopyDocumentModalContainer;
