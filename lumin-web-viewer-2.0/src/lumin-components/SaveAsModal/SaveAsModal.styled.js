import styled from 'styled-components';

import PopperButton from 'lumin-components/PopperButton';
import ButtonMaterial from 'lumin-components/ViewerCommon/ButtonMaterial';
import Dialog from 'lumin-components/Dialog';

import { Fonts, Colors } from 'constants/styles';
import { THEME_MODE } from 'constants/lumin-common';


const lightTheme = {
  background: Colors.NEUTRAL_0,
  border: Colors.NEUTRAL_100,
  textPrimary: Colors.NEUTRAL_100,
  textSecondary: Colors.NEUTRAL_100,
  textPopper: Colors.NEUTRAL_100,
};

const darkTheme = {
  background: Colors.NEUTRAL_100,
  border: Colors.NEUTRAL_0,
  textPrimary: Colors.NEUTRAL_10,
  textSecondary: Colors.NEUTRAL_10,
  textPopper: Colors.NEUTRAL_20,
};

export const theme = {
  [THEME_MODE.LIGHT]: lightTheme,
  [THEME_MODE.DARK]: darkTheme,
};

export const CustomDialog = styled(Dialog)`
  padding: 24px;
  min-height: 256px;
`

export const Container = styled.div`
  width: 100%;
  color: ${({ theme }) => theme.textPrimary};
`;

export const TitleContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const Title = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 28px;
`;

export const FooterContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 4px;
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 28px;
  width: 100%;
`;

export const SubTitle = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.textSecondary}
`;

export const PopperBtn = styled(PopperButton)`
  width: 100%;
  height: 48px;
  border-radius: var(--border-radius-primary);
  border: var(--border-primary);
  max-width: 592px;
  justify-content: space-between;
  text-transform: none;
  padding: 12px 16px;
  color: ${({ theme }) => theme.background};
  font-weight: 375;
  margin-top: 12px;
  font-size: 14px;
  line-height: 20px;
  &:hover {
    background-color: transparent !important;
  }
`;

export const PopoverContainer = styled.div`
  width: 592px;
  height: 70px;
  & li {
    min-height: 36px;
    color: ${({ theme }) => theme.textPopper};
  }
`;

export const ButtonStyled = styled(ButtonMaterial)`
  border-radius: var(--border-radius-primary);
  outline: none;
  font-size: 14px;
  font-weight: 600;
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  line-height: 20px;
  width: 200px;
`;

export const ControlButton = styled(ButtonStyled)`
  height: 40px;
  text-transform: none !important;
  margin: ${({ $isSaveToDriveBtn }) => ($isSaveToDriveBtn && '0 16px 0 64px')};

  ${({ theme, $isSaveToDriveBtn }) => ($isSaveToDriveBtn ?
    `
      background-color: ${theme.background} !important;
      color: ${theme.textPrimary} !important;
      border: 1px solid ${theme.textPrimary};
    ` :
    `
      background-color: ${Colors.SECONDARY_50} !important;
      color: ${Colors.NEUTRAL_0} !important;
      border: 1px solid ${Colors.SECONDARY_50};
  `)}
`;

export const PopperContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

export const PopperTitle = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 375;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.textSecondary};
  margin-left: 8px;
`;

export const DropdownIconContainer = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const PopperContent = styled.div`
  height: 24px;
  display: flex;
  align-items: center;
`;

export const WarningContent = styled.div`
  display: flex;
  margin: 4px 0;
  gap: 4px;
  min-height: 32px;
  & i {
    margin: 2px 0 0 2px;
  }
  & p {
    color: ${Colors.WARNING_60} !important;
    margin-top: 2px;
    font-size: 12px;
    line-height: 16px;
  }
`