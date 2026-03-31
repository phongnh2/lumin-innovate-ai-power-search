import { Colors, Shadows } from 'constants/styles';
import styled from 'styled-components';

import { THEME_MODE } from 'constants/lumin-common';

import Icomoon from 'lumin-components/Icomoon';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { getAnimation } from 'lumin-components/RightSideBar/RightSideBar.styled';

const lightTheme = {
  ControlButton: Colors.NEUTRAL_10,
  ArrowIcon: Colors.NEUTRAL_60,
  Open_Hover_Button: Colors.NEUTRAL_20,
  Close_Hover_Button: Colors.NEUTRAL_0,
  ControlButtonBorderColor: Colors.NEUTRAL_0,
};

const darkTheme = {
  ControlButton: Colors.NEUTRAL_100,
  ArrowIcon: Colors.NEUTRAL_40,
  Open_Hover_Button: Colors.NEUTRAL_80,
  Close_Hover_Button: Colors.NEUTRAL_80,
  ControlButtonBorderColor: Colors.NEUTRAL_80,
};

export const theme = {
  [THEME_MODE.LIGHT]: lightTheme,
  [THEME_MODE.DARK]: darkTheme,
};

export const ControlButton = styled(ButtonMaterial)`
  height: 100%;
  width: 100%;
  min-width: 32px !important;
  background-color: transparent !important;
  transition: all 0.3s ease;


  ${({ $isOpen }) => `
    padding: ${$isOpen ? '0px 4px 0px 0px' : '0px 2px 0px 0px'} !important;
  `}

  &:hover {
    background-color: transparent;
  }

  & span {
    width: 12px !important;
    margin: 0px;
  }
`;

export const Wrapper = styled.div`
  width: 28px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  ${({ $isOpen, theme }) => `
    background-color: ${$isOpen ? 'transparent' : theme.ControlButton};
    border: ${!$isOpen && `1px solid ${theme.ControlButtonBorderColor} `};

    height:  ${$isOpen ? '28px' : '40px'};
    border-radius: ${$isOpen ? '4px' : '24px 0px 0px 24px'};
    box-shadow: ${!$isOpen && Shadows.SHADOW_XS};
    border-right-color: ${!$isOpen && 'transparent'};

    &:hover {
      width:  ${$isOpen ? '28px' : '44px'};
      border-radius: ${$isOpen ? '4px' : '99px 0px 0px 99px'};
      background-color: ${$isOpen ? theme.Open_Hover_Button : theme.Close_Hover_Button};
    }

    &:hover ${ControlButton} {
      padding: ${!$isOpen && '0px !important'};
    }
  `}
`;

export const OutSideWrapper = styled(Wrapper)`
  position: fixed;
  bottom: 8px;
  right: 0px;
  z-index: 71;
  cursor: pointer;
  ${({ showingAnimation }) => getAnimation(showingAnimation)}
}
`;

export const InSideWrapper = styled(Wrapper)`
  z-index: 2;
  cursor: pointer;
`;

export const ArrowIcon = styled(Icomoon)`
  width: 10px;
  height: 10px;
  border: 0px;
  box-shadow: 0 0 0 0 rgba(255, 82, 82, 1);
  right: 0px;
  margin: 0 auto;
  color: ${({ theme }) => theme.ArrowIcon};
`;
