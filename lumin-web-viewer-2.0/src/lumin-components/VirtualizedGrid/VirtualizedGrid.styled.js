import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';
import * as DocumentSkeletonStyled from '../DocumentSkeleton/DocumentSkeleton.styled';

export const GridContainer = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: ${({ $columnCount }) => `repeat(${$columnCount}, minmax(0, 1fr))`};
  gap: 12px 12px;
  ${mediaQuery.md`
    gap: 16px 16px;
  `}
  &[data-reskin='true'] {
    padding-bottom: var(--kiwi-spacing-1-5);
  }

  ${DocumentSkeletonStyled.ItemGridWrapper} {
    height: 100%;
    padding: 0;
  }
  ${DocumentSkeletonStyled.ItemGrid} {
    position: static;
    padding-bottom: 40px;
  }
`;
