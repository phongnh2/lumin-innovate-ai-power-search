import styled, { css } from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  ${mediaQuery.md`
    display: flex;
    align-items: flex-start;
    flex-direction: column;
  `}
`;

export const Text = styled.p<{ $bold?: boolean; $capitalize?: boolean }>`
  font-weight: 375;
  color: ${Colors.NEUTRAL_80};
  font-size: 12px;
  line-height: 16px;
  
  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}

  ${(props) =>
    props.$bold &&
    css`
      font-weight: 600;
      color: ${Colors.NEUTRAL_100};
      font-size: 14px;
      line-height: 20px;
    `}

  ${(props) =>
    props.$capitalize &&
    css`
      text-transform: capitalize;
    `}
`;

export const Link = styled(RouterLink)`
  color: ${Colors.SECONDARY_50};
  text-decoration: underline;
  font-weight: 375;
  white-space: nowrap;
`;

export const ButtonGroup = styled.div<{$single?: boolean}>`
  margin-top: 16px;
  display: flex;
  flex-direction: column-reverse;

  ${props => !props.$single && css`
    & > *:first-child {
      margin-top: 12px;
    }
    ${mediaQuery.md`
      & > *:first-child {
        margin-top: 0;
      }
      display: grid;
      gap: 16px;
      grid-template-columns: min-content min-content;
    `}
  `}
`;
