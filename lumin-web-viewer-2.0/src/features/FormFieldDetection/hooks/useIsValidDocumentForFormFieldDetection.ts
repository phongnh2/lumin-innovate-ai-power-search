import { useSelector } from 'react-redux';

import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import { useEnabledFormFieldDetection } from './useEnabledFormFieldDetection';
import { isValidDocumentSize } from '../utils/detectionValidator';

export const useIsValidDocumentForFormFieldDetection = () => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const totalPages = useSelector(selectors.getTotalPages);
  const isOffline = useSelector(selectors.isOffline);
  const { enabledFormFieldDetection } = useEnabledFormFieldDetection();

  const isLocalFile = currentDocument?.isSystemFile;

  const isValidDocumentForFormFieldDetection =
    enabledFormFieldDetection && !isOffline && !isLocalFile && isValidDocumentSize(totalPages);

  return {
    isValidDocumentForFormFieldDetection,
  };
};
