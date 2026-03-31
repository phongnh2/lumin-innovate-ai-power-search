import styled from 'styled-components';
import { DarkTheme, LightTheme } from 'constants/styles';
import { THEME_MODE } from 'constants/lumin-common';

export const Theme = {
  [THEME_MODE.LIGHT]: LightTheme,
  [THEME_MODE.DARK]: DarkTheme,
};

export const PlaceMultipleTimesTooltipWrapper = styled.div`
    position: fixed;
    display: ${({ hide }) => (hide ? 'none' : 'flex')};
    justify-content : center;
    align-items: center;
    
    z-index: 100;
    padding: 8px 16px;
    border-radius: 8px;
    background: ${({ theme }) => theme.TOOLTIP_BG};
`;

export const PlaceMultipleTimesTooltipContent = styled.p`
    color: ${({ theme }) => theme.TOOLTIP_TEXT};
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    font-style: normal;
    margin: 0;  
`;
