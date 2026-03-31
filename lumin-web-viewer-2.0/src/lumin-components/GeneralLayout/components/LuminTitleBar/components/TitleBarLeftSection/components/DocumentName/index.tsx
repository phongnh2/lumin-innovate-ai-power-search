import React from 'react';

import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import { useIsTempEditMode } from 'features/OpenForm/hooks/useIsTempEditMode';

import DocumentName from './DocumentName';

import styles from './DocumentName.module.scss';

const DocumentNameContainer = () => {
  const { isTempEditMode } = useIsTempEditMode();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);

  if (isTempEditMode) {
    return currentDocument?.name ? <h2 className={styles.documentName}>{currentDocument.name}</h2> : null;
  }
  return <DocumentName />;
};

export default DocumentNameContainer;
