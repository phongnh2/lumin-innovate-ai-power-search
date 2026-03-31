import { useEffect, useMemo, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { capitalize } from 'lodash';

import selectors from 'selectors';
import { DOCUMENT_TYPE } from 'constants/documentConstants';
import { ORGANIZATION_TEXT } from 'constants/organizationConstants';

const TEXT_TOOLTIP_CIRCLE = `This file will be created as template in this ${capitalize(ORGANIZATION_TEXT)}`;
const TEXT_TOOLTIP_TEAM = 'This file will be created as template in this Team';

const useTemplateDestination = ({ documentType, clientId, isShared }) => {
  const organizationList = useSelector(selectors.getOrganizationList, shallowEqual).data || {};
  const teamList = useSelector(selectors.getTeams, shallowEqual);
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual) || {};
  const [textTooltip, setTextTooltip] = useState('');

  const isDocumentOrg = documentType === DOCUMENT_TYPE.ORGANIZATION;
  const isDocumentTeam = documentType === DOCUMENT_TYPE.ORGANIZATION_TEAM;

  const getOrganizationById = (orgId) => {
    const orgData = organizationList.find(({ organization = {} }) => organization._id === orgId);
    return orgData?.organization || {};
  };
  const initialDestination = useMemo(() => {
    if (isShared) {
      return {
        id: currentUser._id,
        content: currentUser.name,
        source: DOCUMENT_TYPE.PERSONAL,
      };
    }
    switch (documentType) {
      case DOCUMENT_TYPE.ORGANIZATION: {
        const {
          _id: orgId, name, url, totalActiveMember,
        } = getOrganizationById(clientId);
        return {
          id: orgId,
          content: name,
          source: DOCUMENT_TYPE.ORGANIZATION,
          orgUrl: url,
          extra: {
            totalMember: totalActiveMember,
          },
        };
      }
      case DOCUMENT_TYPE.ORGANIZATION_TEAM: {
        const teamData = teamList.find(({ _id }) => _id === clientId);
        const { _id: teamId, name, belongsTo: { targetId } } = teamData;
        const { name: orgName, url: orgUrl } = getOrganizationById(targetId);

        return {
          id: teamId,
          content: name,
          source: DOCUMENT_TYPE.ORGANIZATION_TEAM,
          orgUrl,
          parentName: orgName,
        };
      }
      default:
        return {
          id: currentUser._id,
          content: currentUser.name,
          source: DOCUMENT_TYPE.PERSONAL,
        };
    }
  }, [documentType, clientId, currentUser, isShared]);

  useEffect(() => {
    isDocumentOrg && setTextTooltip(TEXT_TOOLTIP_CIRCLE);
    isDocumentTeam && setTextTooltip(TEXT_TOOLTIP_TEAM);
  }, [isDocumentOrg, isDocumentTeam]);

  return {
    initialDestination,
    isPersonalDocument: isShared || !isDocumentOrg && !isDocumentTeam,
    textTooltip,
  };
};

export default useTemplateDestination;
