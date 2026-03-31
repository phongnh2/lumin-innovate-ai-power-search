import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import Skeleton from 'lumin-components/Shared/Skeleton';
import Tooltip from 'lumin-components/Shared/Tooltip';
import Icomoon from 'luminComponents/Icomoon';
import * as LeftSidebarStyled from 'luminComponents/LeftSidebar/LeftSidebar.styled';
import MaterialAvatar from 'luminComponents/MaterialAvatar';
import PopperButton from 'luminComponents/PopperButton/PopperButton';
import SidebarOwnerPane from 'luminComponents/SidebarOwnerPane';

import { avatar as avatarUtils } from 'utils';

import { Colors } from 'constants/styles';

import * as Styled from './SidebarOwnerInfo.styled';

const propTypes = {
  owner: PropTypes.object,
  loading: PropTypes.bool,
};
const defaultProps = {
  owner: {},
  loading: false,
};

function SidebarOwnerInfo({
  owner,
  loading,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isOffline = useSelector(selectors.isOffline);
  const renderPopperContent = useCallback(
    ({ closePopper }) => <SidebarOwnerPane owner={owner} closePopper={closePopper} />,
    [owner]
  );

  if (loading) {
    return (
      <Styled.ButtonWrapper>
        <Skeleton variant="circular" width={40} height={40} />
        <div>
          <Skeleton variant="text" height={20} />
          <Skeleton variant="text" />
        </div>
      </Styled.ButtonWrapper>
    );
  }

  return (
    <PopperButton
      ButtonComponent={Styled.Container}
      renderPopperContent={renderPopperContent}
      popperProps={{
        parentOverflow: 'viewport',
        placement: 'bottom-start',
        disablePortal: false,
      }}
      classes="joyride-info"
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      disabled={isOffline}
    >
      <Styled.ButtonContainer disabled={isOffline}>
        <Styled.ButtonWrapper>
          <MaterialAvatar
            size={32}
            src={avatarUtils.getAvatar(owner.avatarRemoteId)}
            variant="circular"
            hasBorder
            secondary={typeof (owner.defaultAvatar) !== 'string'}
          >
            {owner.defaultAvatar}
          </MaterialAvatar>
          <Styled.ContentContainer>
            <Tooltip title={owner.title || ''} enterDelay={1000} enterNextDelay={1000}>
              <LeftSidebarStyled.Title>{owner.title}</LeftSidebarStyled.Title>
            </Tooltip>
            <LeftSidebarStyled.Text>{owner.description}</LeftSidebarStyled.Text>
          </Styled.ContentContainer>
          <Styled.ToggleArrow isOpen={isOpen}>
            <Icomoon
              className="arrow-up"
              size={12}
              color={Colors.NEUTRAL_100}
              style={{ display: 'block' }}
            />
          </Styled.ToggleArrow>
        </Styled.ButtonWrapper>
      </Styled.ButtonContainer>
    </PopperButton>
  );
}

SidebarOwnerInfo.propTypes = propTypes;
SidebarOwnerInfo.defaultProps = defaultProps;

export default SidebarOwnerInfo;
