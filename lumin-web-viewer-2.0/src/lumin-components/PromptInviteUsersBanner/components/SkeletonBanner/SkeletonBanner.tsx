import { Skeleton as KiwiSkeleton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import Variants from 'lumin-components/Shared/Skeleton/types/variants';
import { CenterContainer } from 'luminComponents/Shared/shared.styled';
import Skeleton from 'luminComponents/Shared/Skeleton';

import { useDesktopMatch } from 'hooks';

import * as Styled from '../../PromptInviteUsersBanner.styled';

export interface SkeletonBannerProps {
  isReskin?: boolean;
}

const SkeletonBanner = ({ isReskin = false }: SkeletonBannerProps) => {
  const isDesktopMatch = useDesktopMatch();

  if (isReskin) {
    return <KiwiSkeleton height="var(--kiwi-spacing-5-5)" radius="md" />;
  }

  return (
    <Styled.BannerWrapper $isLoading>
      <CenterContainer>
        <Styled.BannerContent>
          <Skeleton variant={Variants.H6} width={160} />
        </Styled.BannerContent>
      </CenterContainer>
      <CenterContainer>
        <Skeleton
          variant={Variants.RECT}
          width={80}
          height={40}
          style={{
            marginRight: 16,
          }}
        />
        <Skeleton
          variant={Variants.RECT}
          width={26}
          height={26}
          style={{
            margin: `0 ${isDesktopMatch ? 10 : 4}px`,
          }}
        />
      </CenterContainer>
    </Styled.BannerWrapper>
  );
};

export default SkeletonBanner;
