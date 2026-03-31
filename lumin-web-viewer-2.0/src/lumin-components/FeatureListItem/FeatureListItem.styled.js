import styled from 'styled-components';
import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.ul`
  width: 100%;
  margin: 0;
  padding: 0;

  ${mediaQuery.md`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  `}

  ${mediaQuery.xl`
    display: block;
  `}
`;

export const Item = styled.li`
  margin-bottom: 16px;
  margin-top: 0;
  display: flex;
  align-items: center;
  &:last-child {
    margin-bottom: 0px;
  }

  ${mediaQuery.md`
    &:last-child {
      margin-bottom: 16px;
    }
  `}

  ${mediaQuery.xl`
    &:last-child {
      margin-bottom: 0;
    }
  `}
`;

export const Icon = styled.div`
  width: 12px;
  height: 12px;
  margin-right: 12px;
  background-color: ${Colors.PRIMARY_80};
  border-radius: 50%;

  ${({ featured }) => featured && `
    background-color: ${Colors.WHITE};
  `}
`;

export const Text = styled.p`
  margin: 0;
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  color: #325167;

  ${({ featured }) => featured && `
    color: ${Colors.WHITE};
  `}
`;
