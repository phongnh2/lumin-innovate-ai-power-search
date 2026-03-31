import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import selectors from 'selectors';

import Icomoon from 'luminComponents/Icomoon';
import MaterialAvatar from 'luminComponents/MaterialAvatar';

import { Colors } from 'constants/lumin-common';
import avatarUtils from 'utils/avatar';
import { StyledHeader, StyledName } from './OrganizationDocumentAvatar.styled';

function OrganizationDocumentAvatar({ currentOrganization }) {
  const { avatarRemoteId, name } = currentOrganization.data || {};
  return (
    <StyledHeader>
      <MaterialAvatar
        containerClasses="OrgAvatar"
        src={avatarUtils.getAvatar(avatarRemoteId || null)}
        variant="rounded"
        hasBorder
        secondary
        size={68}
      >
        <Icomoon className="organization-default" size={42} color={Colors.PRIMARY} />
      </MaterialAvatar>
      <StyledName>{name}</StyledName>
    </StyledHeader>
  );
}

OrganizationDocumentAvatar.propTypes = {
  currentOrganization: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  currentOrganization: selectors.getCurrentOrganization(state),
});

export default connect(mapStateToProps)(OrganizationDocumentAvatar);
