import { IDocumentBase } from 'interfaces/document/document.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';
import { OrganizationList } from 'interfaces/redux/organization.redux.interface';

import getOrgIdOfDoc from './getOrgIdOfDoc';

interface IGetOrgOfDocProps {
  organizations: OrganizationList;
  currentDocument: IDocumentBase;
}

function getOrgOfDoc({ organizations, currentDocument }: IGetOrgOfDocProps): IOrganization {
  const { data: orgList = [], loading, error } = organizations || {};
  const getOrganizationField = ({ organization }: { organization: IOrganization }): IOrganization => organization;

  const orgId = getOrgIdOfDoc({ currentDocument });

  if (loading || error) {
    return <IOrganization>{};
  }

  return orgList.map(getOrganizationField).find((organization) => organization._id === orgId);
}

export default getOrgOfDoc;
