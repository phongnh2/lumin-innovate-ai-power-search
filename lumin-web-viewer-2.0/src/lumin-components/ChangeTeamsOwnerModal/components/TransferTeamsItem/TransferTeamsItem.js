import React from 'react';
import PropTypes from 'prop-types';
import Icomoon from 'lumin-components/Icomoon';
import MaterialAvatar from 'lumin-components/MaterialAvatar';
import { Colors } from 'constants/styles';
import avatarUtils from 'utils/avatar';
import * as orgUtils from 'utils/orgUtils';
import * as Styled from './TransferTeamsItem.styled';

const propTypes = {
  _id: PropTypes.string.isRequired,
  avatarRemoteId: PropTypes.string,
  name: PropTypes.string.isRequired,
  newAdmin: PropTypes.object,
  totalMembers: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
};
const defaultProps = {
  avatarRemoteId: null,
  newAdmin: {},
};

function TransferTeamsItem({
  _id,
  avatarRemoteId,
  name,
  newAdmin,
  totalMembers,
  onClick,
}) {
  const renderContent = () => {
    if (!newAdmin.email) {
      return (
        <Styled.Content>
          <Styled.BoldText>{name}</Styled.BoldText>
          <Styled.SmallText>{orgUtils.getMemberText(totalMembers)}</Styled.SmallText>
        </Styled.Content>
      );
    }

    return (
      <Styled.Text>
        <b>{newAdmin.email}</b>{' '}
        will be Admin of{' '}
        <b>{name}</b>
      </Styled.Text>
    );
  };

  const renderRightBlock = () => {
    if (!newAdmin.email) {
      return (
        <Icomoon
          className="arrow-right-alt"
          size={12}
          color={Colors.NEUTRAL_80}
        />
      );
    }

    return <Styled.LinkText as="span">Change</Styled.LinkText>;
  };

  return (
    <Styled.Container onClick={() => onClick(_id, newAdmin.email)}>
      <Styled.Wrapper>
        <MaterialAvatar
          src={avatarUtils.getAvatar(avatarRemoteId)}
          size={32}
          secondary
          team
          hasBorder
        />

        {renderContent()}

        {renderRightBlock()}
      </Styled.Wrapper>
    </Styled.Container>
  );
}

TransferTeamsItem.propTypes = propTypes;
TransferTeamsItem.defaultProps = defaultProps;

export default TransferTeamsItem;
