import styled from 'styled-components';

import { makeStyles } from '@mui/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { Fonts } from 'constants/styles';
import themeConstants from 'constants/theme';

export const useStyle = makeStyles({
  tab: (props) => {
    const colorStyles = themeConstants.Tab.tabColorGetter(props);
    return {
      fontFamily: Fonts.PRIMARY,
      flex: 1,
      padding: '0 12px',
      flexShrink: 0,
      height: 40,
      color: colorStyles.root.color,
      fontSize: 14,
      fontWeight: 600,
      lineHeight: '20px',
      textTransform: 'none',
      borderRadius: 0,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      position: 'relative',
      overflow: 'hidden',
      background: colorStyles.root.background,
      '&:hover': {
        background: colorStyles.hover.background,
      },
      'a&&': {
        padding: '0 12px',
      },
    };
  },
  tabActive: (props) => {
    const colorStyles = themeConstants.Tab.tabColorGetter(props);
    return {
      color: colorStyles.active.color,
      'a&&': {
        color: colorStyles.active.color,
        fontWeight: 600,
      },
      '& i': {
        color: colorStyles.active.color,
      },
      '&:after': {
        content: '""',
        display: 'block',
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 2,
        background: (props) => props.activeBarColor || colorStyles.active.barColor,
        zIndex: 2,
      },
    };
  },
  menuList: {
    padding: 0,
    width: '232px',
    maxHeight: '240px',
  },
});

export const Container = styled.div`
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'auto'};
  display: flex;
  background: ${({ theme }) => theme.backgroundContainer || 'transparent'};
  overflow: hidden;
`;

export const Icon = styled.span`
  display: none;
  align-items: center;
  margin-right: 16px;
  ${mediaQuery.md`
    display: flex;
  `}
`;

export const Label = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const PopoverText = styled.p`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const WrapperIcomoon = styled.div`
  margin-left: 12px;

  ${({ $isOpen }) => $isOpen && `
    transform: rotate(180deg);
  `}
`;
