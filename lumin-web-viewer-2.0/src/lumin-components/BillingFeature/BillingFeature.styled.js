import { Colors } from 'constants/styles';
import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  width: 100%;
  box-sizing: border-box;
`;
export const Header = styled.div`
  color: ${Colors.NEUTRAL_80};
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 16px;
  ${mediaQuery.md`
    margin-bottom: 20px;
    font-size: 17px;
  `}
`;
export const Title = styled.h6`
  text-transform: uppercase;
  font-size: 17px;
  font-weight: 600;
  color: ${Colors.SECONDARY_50};
  display: inline-block;
  margin-right: 4px;
  ${mediaQuery.md`
    font-size: 20px;
  `}
`;
export const Item = styled.li`
  display: flex;
  align-items: center;
  color: ${Colors.NEUTRAL_80};
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  box-sizing: border-box;
  &:not(:last-child) {
    margin-bottom: 16px;
  }
  > span {
    display: inline-block;
    margin-left: 12px;
  }
  ${mediaQuery.md`
    align-items: flex-start;
    &:not(:last-child) {
      margin-bottom: 0;
    }
  `}
  ${mediaQuery.xl`
    width: 50%;
    &:nth-child(2n) {
      padding-left: 9px;
    }
    &:nth-child(2n + 1) {
      padding-right: 9px;
    }
    && {
      margin-bottom: 20px;
    }
  `}
`;
export const List = styled.ul`
  display: block;
  ${mediaQuery.md`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  `}
  ${mediaQuery.xl`
    display: flex;
    flex-wrap: wrap;
    gap: 0;
  `}
`;
