import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import getOrgOfDoc from 'helpers/getOrgOfDoc';

import useGetCurrentOrganization from './useGetCurrentOrganization';
import { useViewerMatch } from './useViewerMatch';

const useGetOrganizationData = () => {
  const currentOrganization = useGetCurrentOrganization();
  const currentDocument = useSelector(selectors.getCurrentDocument, shallowEqual);
  const organizations = useSelector(selectors.getOrganizationList, shallowEqual);
  const { isViewer } = useViewerMatch();
  if (isViewer) {
    const org = getOrgOfDoc({ organizations, currentDocument });
    // document is not belong to any organization
    return org || null;
  }
  return currentOrganization;
};

export default useGetOrganizationData;
