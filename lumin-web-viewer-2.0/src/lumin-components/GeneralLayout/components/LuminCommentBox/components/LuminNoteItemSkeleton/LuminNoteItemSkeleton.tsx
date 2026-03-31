import React from 'react';

import Skeleton from 'lumin-components/Shared/Skeleton';
import Variants from 'lumin-components/Shared/Skeleton/types/variants';

import * as Styled from './LuminNoteItemSkeleton.styled';

interface IProps {
  count?: number;
  className?: string;
}

function LuminCommentItemSkeleton(props: IProps): JSX.Element {
  const { count = 1, className = '' } = props;
  return (
    <Styled.Container>
      {Array.from({ length: count }, (_, index: number) => (
        <Styled.Wrapper key={index} className={className}>
          <Styled.HeaderWrapper>
            <Skeleton variant={Variants.CIRCLE} width={32} height={32} />
            <Styled.DetailsWrapper>
              <Skeleton variant={Variants.RECT} width={80} height={12} />
              <Skeleton variant={Variants.RECT} width={60} height={12} />
            </Styled.DetailsWrapper>
          </Styled.HeaderWrapper>
          <Styled.ContentWrapper>
            <Skeleton variant={Variants.RECT} width="100%" height={12} />
            <Skeleton variant={Variants.RECT} width={160} height={12} gap={{ top: 4 }} />
          </Styled.ContentWrapper>
        </Styled.Wrapper>
      ))}
    </Styled.Container>
  );
}

export default LuminCommentItemSkeleton;
