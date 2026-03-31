import { FormControlLabel as MaterialFormControlLabel } from '@mui/material';
import styled from 'styled-components';

import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { Colors, Fonts, DarkTheme, LightTheme } from 'constants/styles';
import { THEME_MODE } from 'constants/lumin-common';
import CustomCheckbox from 'lumin-components/CustomCheckbox/CustomCheckbox';


export const theme = {
  [THEME_MODE.LIGHT]: LightTheme,
  [THEME_MODE.DARK]: DarkTheme,
};

interface ContainerProps {
  loading?: boolean
  theme?: Record<string, unknown>
}

export const Paper = styled.div`
  max-width: 400px;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.MOVE_DOCUMENT_MODAL.CONFIRM_MODAL_BG};
  box-shadow: ${(props) => props.theme.MOVE_DOCUMENT_MODAL.SHADOW};
  box-sizing: border-box;
  color: ${(props) => props.theme.PRIMARY_TEXT};
`;

export const Container = styled.div<ContainerProps>`
  display: flex;
  flex-direction: column;
  position: relative;

  &:before {
    ${({ loading }) => loading && `
      content: '';
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      background-color: ${(props: ContainerProps) => props.theme.BACKGROUND};
      opacity: 0.5;
      z-index: 2;
    `}
  }
`;

export const Title = styled.h2`
  font-family: ${Fonts.PRIMARY};
  font-size: 18px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 24px;
  letter-spacing: 0.34px;
  text-align: center;
  color: ${({ theme }) => theme.MOVE_DOCUMENT_MODAL.CONFIRM_MODAL_TITLE};
  margin-bottom: 8px;
`;

export const Image = styled.img`
  width: 44px;
  height: 44px;
  margin-bottom: 16px;
  display: flex;
  justify-self: center;
  align-self: center;
`;

export const Content = styled.div`
  font-family: ${Fonts.PRIMARY};
  font-size: 14px;
  font-weight: 375;
  font-stretch: normal;
  font-style: normal;
  line-height: 20px;
  text-align: center;
  color: ${({ theme }) => theme.MOVE_DOCUMENT_MODAL.CONFIRM_MODAL_CONTENT};
  word-break: break-word;

  b {
    color: ${({ theme }) => theme.MOVE_DOCUMENT_MODAL.CONFIRM_MODAL_CONTENT};
    font-weight: bold;
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  gap: 2%;
  margin-top: 24px;
`;

export const Button = styled(ButtonMaterial)`
  && {
    width: 50%;
    background-color: ${Colors.SECONDARY_50};
    color: ${Colors.WHITE};
    padding: 10px;
    &.secondary {
      background-color: ${({ theme }) => theme.MOVE_DOCUMENT_MODAL.CONFIRM_MODAL_CANCEL_BTN_BG};
      color: ${({ theme }) => theme.MOVE_DOCUMENT_MODAL.CONFIRM_MODAL_CANCEL_BTN_TEXT};
    }
    &:not(:first-child) {
      margin-left: 16px;
    };
  }
`;

export const NotifyWrapper = styled.div`
  margin-top: 16px;
  height: 48px;
  background-color: ${Colors.PRIMARY_10};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: var(--border-radius-primary);
`;

export const Notify = styled.p`
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
`;

export const CheckBoxWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

/* @ts-ignore */
export const CheckBox = styled(CustomCheckbox)`
  padding: 0px;
`;

export const FormControlLabel = styled(MaterialFormControlLabel)`
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 0 18px 0 16px;
`