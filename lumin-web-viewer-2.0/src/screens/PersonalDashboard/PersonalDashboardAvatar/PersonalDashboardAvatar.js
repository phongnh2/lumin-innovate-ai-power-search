import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Avatar from 'lumin-components/MaterialAvatar';
import selectors from 'selectors';
import avatarUtils from 'utils/avatar';
import { PLAN_TYPE_LABEL } from 'constants/plan';

import * as Styled from './PersonalDashboardAvatar.styled';

const PersonalDashboardAvatar = ({ currentUser }) => {
  const { avatarRemoteId, name, payment } = currentUser;
  return (
    <Styled.Container>
      <Avatar hasBorder src={avatarUtils.getAvatar(avatarRemoteId)} size={42}>
        {avatarUtils.getTextAvatar(name)}
      </Avatar>
      <Styled.InfoContainer>
        <Styled.Name>{name}</Styled.Name>
        <Styled.Chip value={payment.type} label={PLAN_TYPE_LABEL[payment.type]} />
      </Styled.InfoContainer>
    </Styled.Container>
  );
};

PersonalDashboardAvatar.propTypes = {
  currentUser: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
});

export default connect(mapStateToProps)(PersonalDashboardAvatar);
