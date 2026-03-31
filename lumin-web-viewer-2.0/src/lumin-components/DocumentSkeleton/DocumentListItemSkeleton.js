import React from 'react';

import Skeleton from 'lumin-components/Shared/Skeleton';

import { useDesktopMatch } from 'hooks';

import { Colors } from 'constants/styles';

import * as Styled from './DocumentSkeleton.styled';

function DocumentListItemSkeleton() {
  const isDesktopMatch = useDesktopMatch();
  const rectSkeletonHeight = isDesktopMatch ? 18 : 16;

  const renderSquareSkeletonItem = (starSkeleton = false) => (
    <Styled.SquareSkeleton
      variant="rectangular"
      width={24}
      height={24}
      color={Colors.NEUTRAL_10}
      $starSkeleton={starSkeleton}
    />
  );

  return (
    <Styled.Container>
      <Styled.CommonInfoWrapper>
        <Skeleton
          variant="rectangular"
          width={32}
          height={32}
          color={Colors.NEUTRAL_10}
          style={{ marginRight: 12 }}
        />
        <Skeleton
          variant="rectangular"
          width={isDesktopMatch ? 235 : 160}
          height={rectSkeletonHeight}
          color={Colors.NEUTRAL_10}
        />
        {renderSquareSkeletonItem(true)}
      </Styled.CommonInfoWrapper>

      <Skeleton
        variant="rectangular"
        width={isDesktopMatch ? 97 : 81}
        height={rectSkeletonHeight}
        color={Colors.NEUTRAL_10}
      />
      {renderSquareSkeletonItem()}
      <Skeleton
        variant="rectangular"
        width={isDesktopMatch ? 97 : 81}
        height={rectSkeletonHeight}
        color={Colors.NEUTRAL_10}
      />
      {renderSquareSkeletonItem()}
    </Styled.Container>
  );
}

export default DocumentListItemSkeleton;
