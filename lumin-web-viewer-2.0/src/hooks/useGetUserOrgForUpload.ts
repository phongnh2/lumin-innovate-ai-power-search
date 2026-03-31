import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';

import useGetOrganizationData from './useGetOrganizationData';
import { useIsSystemFile } from './useIsSystemFile';
import { useViewerMatch } from './useViewerMatch';

const useGetUserOrgForUpload = () => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const currentOrganization = useGetOrganizationData();
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const organizations = useShallowSelector(selectors.getOrganizationList);
  const { lastAccessedOrgUrl } = currentUser || {};
  const { isViewer } = useViewerMatch();
  const { isSystemFile } = useIsSystemFile();
  const isInViewerWithPWA = isViewer && isSystemFile;
  const shouldGetOrgFromLastAccess = currentDocument?.isShared || isInViewerWithPWA;

  if (shouldGetOrgFromLastAccess && lastAccessedOrgUrl) {
    const orgFromLastAccess = organizations.data.find((org) => org.organization.url === lastAccessedOrgUrl);
    return orgFromLastAccess?.organization || null;
  }

  return currentOrganization;
};

export default useGetUserOrgForUpload;
