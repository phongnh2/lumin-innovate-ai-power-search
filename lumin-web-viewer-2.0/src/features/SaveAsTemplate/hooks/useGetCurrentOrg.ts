import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import useGetOwnCurrentDoc from 'hooks/useGetOwnCurrentDoc';
import { useViewerMatch } from 'hooks/useViewerMatch';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';
import { OrganizationList } from 'interfaces/redux/organization.redux.interface';

export const useGetCurrentOrg = () => {
  const { isViewer } = useViewerMatch();
  const currentDocument = useSelector<unknown, IDocumentBase>(selectors.getCurrentDocument, shallowEqual);
  const orgList = useSelector<unknown, OrganizationList>(selectors.getOrganizationList, shallowEqual);
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);

  const { organization } = useGetOwnCurrentDoc();
  const { isShared } = currentDocument || {};

  const getLastAccessOrg = (): {
    organization: IOrganization;
    role: string;
  } => orgList.data.find((_organization) => _organization.organization.url === currentUser.lastAccessedOrgUrl);

  if (orgList.loading) {
    return null;
  }
  const getOrganization = (): IOrganization => {
    if (isViewer && isShared) {
      return getLastAccessOrg().organization;
    }
    return organization;
  };

  return getOrganization();
};
