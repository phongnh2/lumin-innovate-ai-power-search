import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { useLeftSideBarFeatureValidation } from '@new-ui/components/LuminLeftSideBar/hooks/useLeftSideBarFeatureValidation';

import core from 'core';
import selectors from 'selectors';

import { useDocumentViewerLoaded } from 'hooks/useDocumentViewerLoaded';
import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import { useShallowSelector } from 'hooks/useShallowSelector';

import { documentSyncSelectors } from 'features/Document/slices';

import { ORGANIZATION_ROLES } from 'constants/organizationConstants';
import { TEAM_ROLES } from 'constants/teamConstant';

export const usePasswordManagerPermission = () => {
  const currentUser = useGetCurrentUser();
  const { loaded } = useDocumentViewerLoaded();
  const checkDocumentIsEncrypted = async () => {
    const doc = core.getDocument();
    if (!doc) {
      return false;
    }
    const pdfDoc = await doc.getPDFDoc();
    await pdfDoc.initSecurityHandler();
    const securityHandler = await pdfDoc.getSecurityHandler();
    const isEncrypted = await pdfDoc.isEncrypted();
    return isEncrypted && (await securityHandler?.isUserPasswordRequired());
  };
  const {
    data: hasPassword,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['checkDocumentIsEncrypted'],
    queryFn: checkDocumentIsEncrypted,
    enabled: loaded,
  });

  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { isFeatureDisabled: isDisabledSecurityHandlers } = useLeftSideBarFeatureValidation();

  const { ownerId: documentOwnerId, documentReference, isSystemFile, documentType } = currentDocument || {};
  const { _id: userId } = currentUser || {};
  const isDocumentOwner = documentOwnerId === userId;
  const { userRole } = documentReference?.data || {};
  const isAdminGroup = userRole
    ? [ORGANIZATION_ROLES.ORGANIZATION_ADMIN, ORGANIZATION_ROLES.BILLING_MODERATOR, TEAM_ROLES.ADMIN].includes(
        userRole?.toUpperCase()
      )
    : false;

  const isDocumentSyncing = useSelector(documentSyncSelectors.isSyncing);

  const canSet = !hasPassword && !isLoading;

  const canChange = hasPassword && !isLoading;

  const canDelete = hasPassword && !isLoading;

  return {
    canSet,
    canChange,
    canDelete,
    refetchPasswordPermissionCheck: refetch,
    canEnable: (isDocumentOwner || isAdminGroup || isSystemFile) && !isDocumentSyncing && !isDisabledSecurityHandlers,
    isValidating: isLoading,
    isPersonalDoc: documentType === 'PERSONAL',
  };
};
