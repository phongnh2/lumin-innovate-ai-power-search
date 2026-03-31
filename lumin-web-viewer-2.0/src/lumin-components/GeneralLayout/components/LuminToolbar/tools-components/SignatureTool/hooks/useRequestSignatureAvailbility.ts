import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useNetworkStatus } from 'hooks/useNetworkStatus';
import useShallowSelector from 'hooks/useShallowSelector';

import { isValidDocumentToSign } from 'helpers/validDocument';

export const useRequestSignatureAvailbility = () => {
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const isAnnotationLoaded = useSelector(selectors.getAnnotationsLoaded);
  const { isOnline } = useNetworkStatus();

  const isValidDocument = isValidDocumentToSign(currentUser, currentDocument);

  return {
    canRequest: Boolean(isAnnotationLoaded && isOnline && isValidDocument && currentDocument && currentUser),
  };
};
