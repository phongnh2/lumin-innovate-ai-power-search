import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { Navigate } from 'react-router';

import selectors from 'selectors';

import { ORG_TEXT } from 'constants/organizationConstants';

import { IOrganization, SuggestedOrganization } from 'interfaces/organization/organization.interface';

interface IJoinOrganizationFromOpenDriveContainerProps {
  children: React.ReactElement;
  orgList: SuggestedOrganization[];
  loading: boolean;
  documentId: string;
}

const JoinOrganizationFromOpenDriveContainer = ({
  children,
  orgList,
  loading,
  documentId,
}: IJoinOrganizationFromOpenDriveContainerProps): JSX.Element => {
  const { data: currentOrganization } = useSelector<unknown, { data: IOrganization }>(
    selectors.getCurrentOrganization,
    shallowEqual
  );
  const hasCurrentOrg = Boolean(currentOrganization?.url);
  const redirectTo = hasCurrentOrg ? `/${ORG_TEXT}/${currentOrganization.url}/documents` : '/';
  const shouldNavigate = !documentId || (!loading && !orgList.length);

  if (shouldNavigate) {
    if (documentId) {
      return <Navigate to={`/viewer/${documentId}`} />;
    }
    return <Navigate to={redirectTo} />;
  }

  return children;
};

export default JoinOrganizationFromOpenDriveContainer;
