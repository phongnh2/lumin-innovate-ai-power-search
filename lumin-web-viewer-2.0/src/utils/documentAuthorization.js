/// <reference path="./documentAuthorization.d.ts" />

import withOrganizationAuthorization from 'src/HOC/withDocumentItemAuthorization/withOrganizationAuthorization';
import withOrgTeamAuthorization from 'src/HOC/withDocumentItemAuthorization/withOrgTeamAuthorization';
import withPersonalAuthorization from 'src/HOC/withDocumentItemAuthorization/withPersonalAuthorization';

import { DOCUMENT_TYPE } from 'constants/documentConstants';

export const getDocAuthorizationHOF = ({ document, teams, orgData, currentUser }) => {
  const { documentType, clientId } = document || {};
  switch (documentType) {
    case DOCUMENT_TYPE.PERSONAL:
      return withPersonalAuthorization(document);
    case DOCUMENT_TYPE.ORGANIZATION_TEAM: {
      const teamOwnedDocument = teams?.find((team) => team._id === clientId);
      if (teamOwnedDocument) {
        return withOrgTeamAuthorization({ userRole: teamOwnedDocument.roleOfUser, document, currentUser });
      }
      return withPersonalAuthorization(document);
    }
    case DOCUMENT_TYPE.ORGANIZATION: {
      const orgOwnedDocument = orgData?.find((item) => item.organization._id === clientId);
      if (orgOwnedDocument) {
        const userRole = orgOwnedDocument.role;
        return withOrganizationAuthorization({ document, userRole, currentUser });
      }
      return withPersonalAuthorization(document);
    }
    default:
      throw new Error(`Document type is invalid: ${documentType}`);
  }
};
