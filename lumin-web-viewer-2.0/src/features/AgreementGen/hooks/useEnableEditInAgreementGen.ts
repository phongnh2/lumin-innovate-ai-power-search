import selectors from 'selectors';

import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import useShallowSelector from 'hooks/useShallowSelector';
import { useViewerMode } from 'hooks/useViewerMode';

import { general } from 'constants/documentType';

import { MAXIMUM_FILE_SIZE_FOR_EDIT_IN_AGREEMENT_GEN } from '../constants';

export const useEnableEditInAgreementGen = () => {
  const { isAnonymousMode, isOffline } = useViewerMode();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const currentUser = useGetCurrentUser();
  const isPdfFile = currentDocument?.mimeType === general.PDF;
  const isValidFileSize = currentDocument?.size < MAXIMUM_FILE_SIZE_FOR_EDIT_IN_AGREEMENT_GEN;
  const enabledForPromptSignIn = !currentUser;

  return {
    enabled: isPdfFile && isValidFileSize && !isOffline && !isAnonymousMode && !!currentUser,
    enabledForPromptSignIn,
  };
};
