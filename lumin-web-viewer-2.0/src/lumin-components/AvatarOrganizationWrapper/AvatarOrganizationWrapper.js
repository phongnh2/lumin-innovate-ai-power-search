import React from 'react';
import PropTypes from 'prop-types';
import MaterialAvatar from 'lumin-components/MaterialAvatar';
import Icomoon from 'lumin-components/Icomoon';
import { Colors } from 'constants/styles';
import { PLAN_TYPE_LABEL } from 'constants/plan';
import { avatar } from 'utils';
import * as Styled from './AvatarOraganizationWrapper.styled';

const AvatarOrganizationWrapper = ({ payment, currentOrganization }) => (
  <Styled.Container>
    <Styled.AvatarWrapper>
      <MaterialAvatar
        size={32}
        src={avatar.getAvatar(currentOrganization.avatarRemoteId)}
      >
        <Icomoon className="organization-default" size={18} color={Colors.NEUTRAL_60} />
      </MaterialAvatar>
      <Styled.Name>
        {currentOrganization.name}
      </Styled.Name>
    </Styled.AvatarWrapper>
    <Styled.Plan>
      {PLAN_TYPE_LABEL[payment.type]} {payment.period?.toLowerCase()}
    </Styled.Plan>
  </Styled.Container>
);
AvatarOrganizationWrapper.propTypes = {
  payment: PropTypes.object.isRequired,
  currentOrganization: PropTypes.object.isRequired,
};
export default AvatarOrganizationWrapper;
