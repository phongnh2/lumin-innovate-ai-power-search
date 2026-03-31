import { Skeleton as KiwiSkeleton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import Skeleton from 'luminComponents/Shared/Skeleton';

import { useEnableWebReskin } from 'hooks';

import * as Styled from './RightPanelSkeleton.styled';

function RightPanelSkeleton(): JSX.Element {
  const { isEnableReskin } = useEnableWebReskin();
  return (
    <Styled.RightSideBarItemContainer data-reskin={isEnableReskin}>
      {Array.from(Array(2)).map((item, index) => (
        <Styled.RightSideBarItemWrapper key={index}>
          <Styled.RightSideBarItem>
            <Styled.ArrowWrapper>
              {isEnableReskin ? (
                <KiwiSkeleton width={16} height={16} radius="sm" />
              ) : (
                <Skeleton variant="rectangular" width={16} height={16} />
              )}
            </Styled.ArrowWrapper>
            {isEnableReskin ? (
              <KiwiSkeleton width={20} height={20} radius="sm" />
            ) : (
              <Skeleton variant="rectangular" width={20} height={20} />
            )}
            <Styled.TextWrapper>
              {isEnableReskin ? (
                <KiwiSkeleton width={160} height={16} radius="sm" />
              ) : (
                <Skeleton variant="text" width={160} />
              )}
            </Styled.TextWrapper>
          </Styled.RightSideBarItem>
        </Styled.RightSideBarItemWrapper>
      ))}
    </Styled.RightSideBarItemContainer>
  );
}

RightPanelSkeleton.propTypes = {};

export default RightPanelSkeleton;
