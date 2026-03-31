import styled from 'styled-components';
import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { MAX_WIDTH_CONTAINER } from 'constants/lumin-common';

interface IconProps {
  $sizes: {
    mobile: number,
    tablet: number,
  };
}

export const Container = styled.section`
  background-color: ${Colors.WHITE};
  padding: 32px 28px;
  
  ${mediaQuery.md`
    padding: 48px 60px;
  `}

  ${mediaQuery.xl`
    padding: 68px 18px;
  `}
`;

export const Title = styled.h1`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 28px;
  color: ${Colors.NEUTRAL_100};
  margin: 0 0 24px;
  text-align: center;

  ${mediaQuery.md`
    font-size: 29px;
    line-height: 36px;
    margin-bottom: 40px;
  `}

  ${mediaQuery.xl`
    font-size: 36px;
    line-height: 54px;
    margin-bottom: 48px;
  `}
`;

export const Wrapper = styled.div`
  margin: 0 auto;
  max-width: ${MAX_WIDTH_CONTAINER}px;
  box-sizing: content-box;
  width: 100%;
`;

export const List = styled.ul`
  list-style-type: none;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  row-gap: 20px;
  padding: 0;

  ${mediaQuery.md`
    row-gap: 32px;
  `}

  ${mediaQuery.xl`
    grid-template-columns: repeat(6, minmax(0, 1fr));
    column-gap: 72px;
  `}
`;

export const ItemImg = styled.img<IconProps>`
  max-width: 100%;
  user-select: none;
  opacity: 1;
  transition: opacity 0.3s ease;
  height: ${(props) => props.$sizes.mobile}px;

  ${mediaQuery.md<IconProps>`
    height: ${(props) => props.$sizes.tablet}px;
  `}
`;

export const Item = styled.li`
  display: flex;
  align-items: center;

  &:nth-child(3n+1) {
    justify-content: flex-start;
  }
  &:nth-child(3n+2) {
    justify-content: center;
  }
  &:nth-child(3n) {
    justify-content: flex-end;
  }
  ${mediaQuery.xl`
    justify-content: center;
  `}
`;
