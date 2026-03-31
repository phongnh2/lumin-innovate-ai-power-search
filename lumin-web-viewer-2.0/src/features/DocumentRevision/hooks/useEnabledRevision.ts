import selectors from 'selectors';

import { useGetFileType } from 'hooks/documents/useGetFileType';
import { useDocumentPermission } from 'hooks/useDocumentPermission';
import { useShallowSelector } from 'hooks/useShallowSelector';

import { documentStorage } from 'constants/documentConstants';
import { extensions } from 'constants/documentType';

export function useEnabledRevision() {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const fileType = useGetFileType();
  const isEnabledByFileType = ([extensions.PDF] as typeof fileType[]).includes(fileType);
  const { canEdit } = useDocumentPermission(currentDocument);

  const enabledForGoogleStorage = currentDocument?.service === documentStorage.google;

  const enabledForLuminStorage = isEnabledByFileType && canEdit && currentDocument?.service === documentStorage.s3;

  return {
    enabled: enabledForGoogleStorage || enabledForLuminStorage,
    enabledForLuminStorage,
  };
}
