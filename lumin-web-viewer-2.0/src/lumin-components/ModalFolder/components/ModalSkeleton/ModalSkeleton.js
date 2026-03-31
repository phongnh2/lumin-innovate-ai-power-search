import React from 'react';

import Skeleton from 'lumin-components/Shared/Skeleton';

import { Colors } from 'constants/styles';

import * as Styled from './ModalSkeleton.styled';

const DUMMIES = Array.from(Array(2).keys());

function ModalSkeleton() {
  return (
    <>
      <Skeleton
        variant="rectangular"
        width={100}
        height={16}
        color={Colors.NEUTRAL_10}
        style={{ marginBottom: 4 }}
      />
      <Skeleton
        variant="rectangular"
        height={48}
        color={Colors.NEUTRAL_10}
        style={{ marginBottom: 130 }}
      />

      <Styled.SkeletonButtonGroup>
        {DUMMIES.map((item) => (
          <Skeleton
            key={item}
            variant="rectangular"
            height={48}
            radius={8}
            color={Colors.NEUTRAL_10}
          />
        ))}
      </Styled.SkeletonButtonGroup>
    </>
  );
}

export default ModalSkeleton;
