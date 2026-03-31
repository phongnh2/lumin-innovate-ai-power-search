import styled from 'styled-components';
import { Colors } from 'constants/styles';
import { THEME_MODE } from 'constants/lumin-common';

const lightTheme = {
  BACKGROUND_COLOR: Colors.NEUTRAL_100,
  ACTIVE_BACKGROUND_COLOR: Colors.PRIMARY_30,
  HOVER_BACKGROUND: Colors.NEUTRAL_10,
  BUTTON_ICON: Colors.NEUTRAL_60,
  BUTTON_ICON_HOVER: Colors.NEUTRAL_60,
  BUTTON_ICON_ACTIVE: Colors.PRIMARY_90,
  BUTTON_BORDER: Colors.NEUTRAL_80,
};

const darkTheme = {
  BACKGROUND_COLOR: Colors.NEUTRAL_100,
  ACTIVE_BACKGROUND_COLOR: Colors.PRIMARY_40,
  HOVER_BACKGROUND: Colors.NEUTRAL_80,
  BUTTON_ICON: Colors.NEUTRAL_40,
  BUTTON_ICON_HOVER: Colors.NEUTRAL_40,
  BUTTON_ICON_ACTIVE: Colors.PRIMARY_90,
  BUTTON_BORDER: Colors.NEUTRAL_80,
};

export const theme = {
  [THEME_MODE.LIGHT]: lightTheme,
  [THEME_MODE.DARK]: darkTheme,
};

export const Wrapper = styled.div`
  ${({ disableToolBar }) =>
    disableToolBar &&
    `
      cursor: not-allowed;
      pointer-events: none
  `}
`;

export const StyleItem = styled.button`
  margin-right: 6px;
  border-radius: 4px;
  padding: 7px;
  width: fit-content;

  ${({ disableToolBar, theme }) =>
    disableToolBar
      ? `
        pointer-events: none;
      `
      : `
        cursor: pointer;
        &.ql-active {
          background-color: ${theme.ACTIVE_BACKGROUND_COLOR} !important;
          .ql-stroke {
            stroke: ${theme.BUTTON_ICON_ACTIVE} !important;
          }
      
          .ql-fill {
            fill: ${theme.BUTTON_ICON_ACTIVE} !important;
          }
        }

        .ql-stroke {
          stroke: ${theme.BUTTON_ICON} !important;
        }
    
        .ql-fill {
          fill: ${theme.BUTTON_ICON} !important;
        }
        
    
        &:hover {
          background-color: ${theme.HOVER_BACKGROUND} !important;
          .ql-fill {
            fill: ${theme.BUTTON_ICON_HOVER} !important;
          }
    
          .ql-stroke {
            stroke: ${theme.BUTTON_ICON_HOVER} !important;
          }
        }  
  `}
`;
