import styled from 'styled-components';
import Skeleton from 'lumin-components/Shared/Skeleton';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  display: grid;
  grid-template-columns: 4fr 1fr 58px 84px 40px;
  column-gap: 32px;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  width: 100%;
  box-sizing: border-box;
  background-color: ${Colors.WHITE};
  align-items: center;
  border-bottom: var(--border-secondary);
`;

export const CommonInfoWrapper = styled.div`
  display: flex;
  align-items: center;
  padding-left: 12px;
  width: 100%;
  min-width: 0;
  flex-shrink: 0;
  box-sizing: border-box;
`;

export const SquareSkeleton = styled(Skeleton)`
  margin: auto;
  ${({ $starSkeleton }) => $starSkeleton && `
    margin-right: 0;
  `}
`;

export const ItemGrid = styled.div`
  padding: 8px;
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: flex-start;
  border: var(--border-secondary);
  border-radius: var(--border-radius-primary);
  box-sizing: border-box;
  ${mediaQuery.md`
    padding: 12px;
  `}
`;

export const ItemGridWrapper = styled.div`
  height: 0;
  padding-top: 100%;
  position: relative;
`;

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: ${((props) => `repeat(${props.$column}, minmax(0, 1fr))`)};
  gap: 12px 12px;
  ${mediaQuery.md`
    gap: 16px 16px;
  `}
`;

export const GridThumbnailWrapper = styled.div`
  height: 70px;
  position: relative;
  ${mediaQuery.md`
    height: 103px;
  `}
  ${mediaQuery.xl`
    height: 86px;
  `}
  width: 100%;
  position: relative;
  box-sizing: border-box;
  margin-bottom: 12px;
`;

export const GridThumbnail = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
`;
