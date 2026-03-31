import styled, { css } from 'styled-components';
import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';


export const PaginationContainer = styled(Grid)`
  display: flex;
  align-items: center;
  margin-top: 24px;
`;

export const PaginationItem = styled(Grid)`
  ${({ $hideInMobile }: { $hideInMobile?: boolean }) => {
    return css`
      ${$hideInMobile && 'display: none;'}

      ${mediaQuery.md`
        ${$hideInMobile && 'display: block;'}
      `}
    `
  }}
`;

export const PaginationWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 12px;

  ${mediaQuery.md<{ $hideInTabletUp?: boolean }>`
    margin-top: 0;

    ${({ $hideInTabletUp }) => $hideInTabletUp && css`
      display: none;
    `}
  `}
`;

export const PaginationGroup = styled.div<{ $right?: boolean }>`
  display: flex;
  align-items: center;

  ${({ $right }) => $right && `
    justify-content: flex-end;
  `}

  .select {
    width: 50px;
    height: 24px;
    padding: 4px 4px 4px 8px;
    margin: 0 0 0 12px;
    border-radius: 4px;
    border: var(--border-secondary);
    box-sizing: border-box;

    .input {
      justify-content: space-between;
    }

    ul {
      overflow-y: hidden;

      li {
        padding: 8px 12px;

        div div {
          margin: auto;
        }
      }
    }
  }
`;

export const PaginationText = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_60};
`;


export const useStyled = makeStyles({
  inputSelect: {
    '& span:first-child': {
      fontSize: '12px',
      lineHeight: '16px',
    },
  },
});