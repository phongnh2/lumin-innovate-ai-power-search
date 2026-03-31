import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import selectors from 'selectors';

import { DocumentInfoModal } from 'luminComponents/ReskinLayout/components/DocumentInfoModal';

import { useShallowSelector } from 'hooks/useShallowSelector';

import logger from 'helpers/logger';

import { INFO_MODAL_TYPE } from 'constants/lumin-common';

import { closeDocumentInfoModal, documentInfoModalSelectors } from './slices';

const DocumentInfoModalContainer: React.FC = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector(documentInfoModalSelectors.isOpen);
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);

  if (!isOpen) {
    return null;
  }

  return (
    <DocumentInfoModal
      open={isOpen}
      currentTarget={currentDocument}
      modalType={INFO_MODAL_TYPE.DOCUMENT}
      onClose={() => dispatch(closeDocumentInfoModal())}
      onErrorCallback={(error: unknown) => logger.logError({ error })}
    />
  );
};

export default DocumentInfoModalContainer;
