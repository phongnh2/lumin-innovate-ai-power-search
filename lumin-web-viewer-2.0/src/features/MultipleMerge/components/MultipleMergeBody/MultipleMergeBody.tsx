import React from 'react';

import { MultipleMergeStep } from '../../enum';
import { useMultipleMergeContext } from '../../hooks/useMultipleMergeContext';
import MultipleMergeDocumentsManipulation from '../MultipleMergeDocumentsManipulation/MultipleMergeDocumentsManipulation';
import MultipleMergeDocumentsProgress from '../MultipleMergeDocumentsProgress/MultipleMergeDocumentsProgress';
import MultipleMergeSaveDocument from '../MultipleMergeSaveDocument/MultipleMergeSaveDocument';

const MultipleMergeBody = () => {
  const { currentStep } = useMultipleMergeContext();

  switch (currentStep) {
    case MultipleMergeStep.SELECT_DOCUMENTS:
      return <MultipleMergeDocumentsManipulation />;
    case MultipleMergeStep.MERGING_DOCUMENTS:
      return <MultipleMergeDocumentsProgress />;
    case MultipleMergeStep.SAVE_DOCUMENT:
      return <MultipleMergeSaveDocument />;
    default:
      return null;
  }
};

export default MultipleMergeBody;
