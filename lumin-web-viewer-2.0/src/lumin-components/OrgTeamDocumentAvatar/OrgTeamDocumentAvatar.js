import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import selectors from 'selectors';

import Icomoon from 'luminComponents/Icomoon';
import MaterialAvatar from 'luminComponents/MaterialAvatar';

import { Colors } from 'constants/lumin-common';
import avatarUtils from 'utils/avatar';
import { useGetCurrentTeam } from 'hooks';
import {
  StyledHeader, StyledSubTitle, StyledTitle, StyledTitleContainer,
} from './OrgTeamDocumentAvatar.styled';

function OrganizationDocumentAvatar({ organizations }) {
  const currentTeam = useGetCurrentTeam();
  const { avatarRemoteId, name: teamName } = currentTeam;
  const { data } = organizations;

  const getOrganizationName = (teamInfo, organizationList) => {
    const { belongsTo } = teamInfo;
    const organizationData = (organizationList || []).find((orgData) => orgData.organization._id === belongsTo?.targetId);
    return organizationData?.organization.name;
  };

  const orgName = getOrganizationName(currentTeam, data);

  return (
    <StyledHeader>
      <MaterialAvatar
        containerClasses="Document__teamAvatar"
        src={avatarUtils.getAvatar(avatarRemoteId || null)}
        hasBorder
        secondary
      >
        <Icomoon className="team" size={34} color={Colors.PRIMARY} />
      </MaterialAvatar>
      <StyledTitleContainer>
        <StyledTitle>{teamName}</StyledTitle>
        {orgName && <StyledSubTitle>{orgName}</StyledSubTitle>}
      </StyledTitleContainer>
    </StyledHeader>
  );
}

OrganizationDocumentAvatar.propTypes = {
  organizations: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  currentOrganization: selectors.getCurrentOrganization(state),
  organizations: selectors.getOrganizationList(state),
});

export default connect(mapStateToProps)(OrganizationDocumentAvatar);
