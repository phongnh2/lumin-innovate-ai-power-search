import { shallowEqual, useSelector } from 'react-redux';
import { useMatch } from 'react-router';

import selectors from 'selectors';

import { DOCUMENT_TYPE } from 'constants/documentConstants';
import { ORG_TEXT } from 'constants/organizationConstants';
import { Routers, ROUTE_MATCH } from 'constants/Routers';
import { TEAM_TEXT } from 'constants/teamConstant';

export const useGetParentUrl = ({ folder }) => {
  const inOrganization = Boolean(useMatch({ path: ROUTE_MATCH.ORG_DOCUMENT, end: false }));
  const { data } = useSelector(selectors.getCurrentOrganization, shallowEqual);

  const getUrlInOrganization = () => {
    const { belongsTo } = folder;
    const { type, location: { _id } } = belongsTo;
    const { url } = data;
    switch (type.toUpperCase()) {
      case DOCUMENT_TYPE.PERSONAL:
        return `/${ORG_TEXT}/${url}/documents/personal`;
      case DOCUMENT_TYPE.ORGANIZATION:
        return `/${ORG_TEXT}/${url}/documents/${ORG_TEXT}`;
      case DOCUMENT_TYPE.ORGANIZATION_TEAM:
        return `/${ORG_TEXT}/${url}/documents/${TEAM_TEXT}/${_id}`;
      default:
        throw new Error('Document type is invalid');
    }
  };

  const getUrlInPersonal = () => Routers.PERSONAL_DOCUMENT;

  if (!folder) {
    return '';
  }

  return inOrganization ? getUrlInOrganization() : getUrlInPersonal();
};
