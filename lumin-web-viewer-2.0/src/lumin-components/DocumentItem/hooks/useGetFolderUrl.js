import { shallowEqual, useSelector } from 'react-redux';
import { useMatch } from 'react-router';

import selectors from 'selectors';

import { DOCUMENT_TYPE } from 'constants/documentConstants';
import { ORG_TEXT } from 'constants/organizationConstants';
import { TEAM_TEXT } from 'constants/teamConstant';

export const useGetFolderUrl = ({ folderId, documentType, clientId }) => {
  const { data: organization, loading } = useSelector(selectors.getCurrentOrganization, shallowEqual) || {};
  const inOrganizationPage = Boolean(useMatch({ path: `/${ORG_TEXT}/:orgUrl`, end: false }));
  if (loading) {
    return '';
  }

  if (!inOrganizationPage) {
    return `/documents/personal/folder/${folderId}`;
  }

  return {
    [DOCUMENT_TYPE.PERSONAL]: `/${ORG_TEXT}/${organization.url}/documents/personal/folder/${folderId}`,
    [DOCUMENT_TYPE.ORGANIZATION]: `/${ORG_TEXT}/${organization.url}/documents/${ORG_TEXT}/folder/${folderId}`,
    [DOCUMENT_TYPE.ORGANIZATION_TEAM]: `/${ORG_TEXT}/${organization.url}/documents/${TEAM_TEXT}/${clientId}/folder/${folderId}`,
  }[documentType.toUpperCase()] || '';
};
