import { createContext } from 'react';

import { useDocumentsManipulation } from '../hooks/useDocumentsManipulation';
import { useMultipleMergeHandler } from '../hooks/useMultipleMergeHandler';

type MultipleMergeContextPayload = {
  isLoadingDocument: boolean;
  getAbortController: () => AbortController;
  onClose: () => void;
  disabledMergeButton: boolean;
  isExceedMaxDocumentsSize: boolean;
} & ReturnType<typeof useDocumentsManipulation> &
  ReturnType<typeof useMultipleMergeHandler>;

export const MultipleMergeContext = createContext({} as MultipleMergeContextPayload);
