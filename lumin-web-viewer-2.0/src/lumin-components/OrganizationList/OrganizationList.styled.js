import styled, { css } from 'styled-components';
import { Grid, MenuList } from '@mui/material';

import SharedPopperButton from 'lumin-components/PopperButton';
import SharedMenuItem from 'lumin-components/Shared/MenuItem';

import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

const expandButtonStyles = css`
  position: relative;
  z-index: 1;
  &:after {
    content: '';
    display: block;
    position: absolute;
    top: -4px;
    left: -4px;
    bottom: -4px;
    right: -4px;
    cursor: pointer;
    z-index: 2;
    border-radius: 999px;
    transition: all 0.25s ease;

  }
`;

export const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 24px;
  padding-bottom: 24px;

  ${mediaQuery.md`
    margin-top: 32px;
  `}

  ${mediaQuery.xl`
    margin-top: 24px;
  `}
`;

export const Header = styled(Grid)`
  background: white;
  padding-bottom: 12px;
  border-bottom: 1px solid ${Colors.NEUTRAL_20};
  ${mediaQuery.xl`
    padding-bottom: 8px;
  `}
`;

export const HeaderItem = styled(Grid)`
  display: flex;
  align-items: center;

  ${({ $hideInMobile }) => $hideInMobile && `
    display: none;
  `}
  ${({ $dateJoin }) => $dateJoin && `
    flex-basis: 20%;
    max-width: 20%;
  `}
  ${mediaQuery.md`
    ${({ $hideInMobile }) => $hideInMobile && `
      display: flex;
    `}

    ${({ $hideInTabletUp }) => $hideInTabletUp && `
      display: none;
    `}
  `}
`;

export const HeaderText = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_50};
  ${(props) => props.button && expandButtonStyles}
`;

export const TooltipWrapper = styled.div`
  margin-left: 4px;
`;


export const PopperButton = styled(SharedPopperButton)`
  margin-left: 12px;
  ${expandButtonStyles}

  ${({ $haveTooltip }) => $haveTooltip &&
    css`
      margin-left: 8px;
    `}
`;

export const Menu = styled(MenuList)`
  min-width: 232px;
  padding: 0;
`;

export const MenuItem = styled(SharedMenuItem)`
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${Colors.NEUTRAL_80};
`;

export const ListContainer = styled.div`
  ${({ $disabled }) => $disabled && `
    opacity: 1;
    cursor: not-allowed;
    position: relative;
    pointer-events: none;
  `}
`;

export const NoResultWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 66px;

  ${mediaQuery.md`
    margin-top: 88px;
  `}

  ${mediaQuery.xl`
    margin-top: 66px;
  `}
`;

export const ImageNotFound = styled.img`
  width: 150px;
  height: 166px;
`;

export const TextNotFound = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  color: ${Colors.NEUTRAL_80};
  margin-top: 16px;
`;
