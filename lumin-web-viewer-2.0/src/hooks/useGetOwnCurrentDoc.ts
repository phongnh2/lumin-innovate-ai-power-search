import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import { useViewerMatch } from 'hooks/useViewerMatch';

import getOrgOfDoc from 'helpers/getOrgOfDoc';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';
import { IOrganizationData, OrganizationList } from 'interfaces/redux/organization.redux.interface';

const useGetOwnCurrentDoc = (): { organization: IOrganization } => {
  const { isViewer } = useViewerMatch();
  const currentDocument = useSelector<unknown, IDocumentBase>(selectors.getCurrentDocument, shallowEqual);
  const orgList = useSelector<unknown, OrganizationList>(selectors.getOrganizationList, shallowEqual);
  const { data: currentOrganization } = useSelector<unknown, IOrganizationData>(
    selectors.getCurrentOrganization,
    shallowEqual
  );
  const { isShared } = currentDocument || {};

  if (orgList.loading) {
    return {
      organization: null,
    };
  }
  const getOrganization = (): IOrganization =>
    isViewer
      ? getOrgOfDoc({
          organizations: orgList,
          currentDocument,
        })
      : currentOrganization;

  return {
    organization: (!currentDocument || isShared) && isViewer ? null : getOrganization(),
  };
};

export default useGetOwnCurrentDoc;
