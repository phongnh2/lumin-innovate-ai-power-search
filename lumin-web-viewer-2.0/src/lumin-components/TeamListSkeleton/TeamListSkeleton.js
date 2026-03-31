import PropTypes from 'prop-types';
import React from 'react';

import Skeleton from 'lumin-components/Shared/Skeleton';
import * as TeamItemGridStyled from 'lumin-components/TeamItemGrid/TeamItemGrid.styled';

import { useDesktopMatch, useTabletMatch } from 'hooks';

import { Colors } from 'constants/styles';

import * as SkeletonStyled from './TeamListSkeleton.styled';

function TeamListSkeleton({ count }) {
  const isTabletMatch = useTabletMatch();
  const isDesktopMatch = useDesktopMatch();

  const memberAvatarSize = isTabletMatch ? 30 : 22;
  const teamAvatarSize = isDesktopMatch ? 56 : 46;
  const LOADING_DUMMIES = Array(count).fill();

  const renderSkeletonItem = (key) => (
    <SkeletonStyled.ItemContainer key={key}>
      <TeamItemGridStyled.ItemHeader>
        <Skeleton
          variant="rectangular"
          width={92}
          height={isTabletMatch ? 20 : 16}
          color={Colors.NEUTRAL_10}
        />

        {!isDesktopMatch && <Skeleton
          variant="rectangular"
          width={33}
          height={33}
          color={Colors.NEUTRAL_10}
        />}
      </TeamItemGridStyled.ItemHeader>

      <SkeletonStyled.ItemContent>
        <TeamItemGridStyled.TeamAvatarWrapper>
          <Skeleton
            variant="circular"
            width={teamAvatarSize}
            height={teamAvatarSize}
            color={Colors.NEUTRAL_10}
          />
        </TeamItemGridStyled.TeamAvatarWrapper>

        <Skeleton
          variant="rectangular"
          width={132}
          height={20}
          color={Colors.NEUTRAL_10}
        />

        <TeamItemGridStyled.MemberAvatarWrapper>
          {Array(3).fill().map((_, idx) => (
            <TeamItemGridStyled.MemberAvatarItem key={idx}>
              <Skeleton
                variant="circular"
                width={memberAvatarSize}
                height={memberAvatarSize}
                color={Colors.NEUTRAL_10}
                style={{ border: `1px solid ${Colors.WHITE}` }}
              />
            </TeamItemGridStyled.MemberAvatarItem>
          ))}
        </TeamItemGridStyled.MemberAvatarWrapper>
      </SkeletonStyled.ItemContent>
    </SkeletonStyled.ItemContainer>
  );

  return (
    <SkeletonStyled.SkeletonListContainer>
      {LOADING_DUMMIES.map((_, idx) => renderSkeletonItem(idx))}
    </SkeletonStyled.SkeletonListContainer>
  );
}

TeamListSkeleton.propTypes = {
  count: PropTypes.number.isRequired,
};

export default TeamListSkeleton;
