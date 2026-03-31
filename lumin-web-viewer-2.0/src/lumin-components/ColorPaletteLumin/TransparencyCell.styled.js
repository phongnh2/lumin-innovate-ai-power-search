import styled from 'styled-components';
import Button from '@mui/material/Button';
import { Colors } from 'constants/styles';
import { THEME_MODE } from 'constants/lumin-common';

export const lightTheme = {
  icon: Colors.NEUTRAL_100,
  spanActive: Colors.NEUTRAL_80,
  span: Colors.NEUTRAL_40,
  borderColorActive: Colors.NEUTRAL_80,
  borderColor: Colors.NEUTRAL_40,
};

export const darkTheme = {
  icon: Colors.NEUTRAL_10,
  spanActive: Colors.NEUTRAL_20,
  span: Colors.NEUTRAL_60,
  borderColorActive: Colors.NEUTRAL_80,
  borderColor: Colors.NEUTRAL_60,
};

export const theme = {
  [THEME_MODE.LIGHT]: lightTheme,
  [THEME_MODE.DARK]: darkTheme,
};

export const StyledTransparenccyButton = styled(Button)`
    width: 100%;
    min-height: 32px;
    margin-top: 16px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    position: static;
    inset: 0%;
    border: 1px solid;
    box-sizing: border-box;
    border-radius: 8px;

    /* Inside Auto Layout */
    flex: none;
    order: 0;
    align-self: stretch;
    flex-grow: 0;
    background: 'transparent';
    transition: border-color 0.3s ease;
    border-color: ${({ theme }) => theme.borderColor};

    &.active {
      border-color: ${({ theme }) => theme.borderColorActive};
    }

    .icon {
        color: ${({ theme }) => theme.icon};
    }
`;

export const StyledSpan = styled.span`
  position: static;
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  margin: 0 auto;
  text-transform: capitalize;
  color: ${({ theme }) => theme.span};

  &.active {
    color: ${({ theme }) => theme.spanActive};
  }
`;
