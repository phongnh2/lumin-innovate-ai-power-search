import React from 'react';

import Skeleton from 'lumin-components/Shared/Skeleton';

import { Colors } from 'constants/styles';

import * as Styled from './DocumentSkeleton.styled';

function DocumentGridItemSkeleton() {
  return (
    <Styled.ItemGridWrapper>
      <Styled.ItemGrid>
        <Styled.GridThumbnailWrapper>
          <Styled.GridThumbnail>
            <Skeleton
              variant="rectangular"
              width="100%"
              height="100%"
              color={Colors.SOLITUDE}
            />
          </Styled.GridThumbnail>
        </Styled.GridThumbnailWrapper>

        <Skeleton
          variant="rectangular"
          width="100%"
          height={16}
          color={Colors.SOLITUDE}
          style={{ marginBottom: 4 }}
        />

        <Skeleton
          variant="text"
          width="70%"
          color={Colors.SOLITUDE}
        />
      </Styled.ItemGrid>
    </Styled.ItemGridWrapper>
  );
}

export default DocumentGridItemSkeleton;
