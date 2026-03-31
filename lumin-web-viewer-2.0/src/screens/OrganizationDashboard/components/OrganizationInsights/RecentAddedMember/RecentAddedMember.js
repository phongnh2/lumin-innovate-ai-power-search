import PropTypes from 'prop-types';
import React from 'react';

import MaterialAvatar from 'luminComponents/MaterialAvatar';
import Skeleton from 'luminComponents/Shared/Skeleton';

import { useTranslation } from 'hooks';

import { dateUtil } from 'utils';
import avatarUtils from 'utils/avatar';

import * as Styled from './RecentAddedMember.styled';

const propTypes = {
  user: PropTypes.object,
  loading: PropTypes.bool,
};
const defaultProps = {
  user: {},
  loading: true,
};

function RecentAddedMember({ user, loading }) {
  const joinDateText = dateUtil.formatMDYTime(user.joinDate);
  const { t } = useTranslation();

  if (loading) {
    return (
      <Styled.StyledContainer>
        <Skeleton variant="circular" width={40} height={40} />
        <Styled.StyledBodyLoading>
          <Styled.StyledNameLoading>
            <Skeleton variant="rectangular" width={100} height={12} />
          </Styled.StyledNameLoading>
          <Skeleton variant="rectangular" width={130} height={12} />
        </Styled.StyledBodyLoading>
        <Styled.StyledJoinDateLoading>
          <Skeleton variant="rectangular" width={130} height={12} />
        </Styled.StyledJoinDateLoading>
      </Styled.StyledContainer>
    );
  }
  return (
    <Styled.StyledContainer>
      <MaterialAvatar
        containerClasses="MaterialAvatar__border--mobile-off"
        size={32}
        src={avatarUtils.getAvatar(user.avatarRemoteId)}
        // secondary
        hasBorder
      >
        {avatarUtils.getTextAvatar(user.name)}
      </MaterialAvatar>

      <Styled.ContainerName>
        <Styled.StyledName>{user.name}</Styled.StyledName>
        <Styled.StyledEmail>{user.email}</Styled.StyledEmail>
      </Styled.ContainerName>
      {Boolean(joinDateText) && (
        <Styled.StyledJoinDate>{t('orgDashboardInsight.joinedAt', { date: joinDateText })}</Styled.StyledJoinDate>
      )}
    </Styled.StyledContainer>
  );
}

RecentAddedMember.propTypes = propTypes;
RecentAddedMember.defaultProps = defaultProps;

export default RecentAddedMember;
