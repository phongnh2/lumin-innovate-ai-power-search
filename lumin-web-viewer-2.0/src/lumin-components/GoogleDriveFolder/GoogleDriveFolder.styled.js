import styled from 'styled-components';

import ButtonMaterial from 'lumin-components/ViewerCommon/ButtonMaterial';
import Icomoon from 'luminComponents/Icomoon';

import { THEME_MODE } from 'constants/lumin-common';
import { Fonts, Colors } from 'constants/styles';

const lightTheme = {
  backgroundCancelButton: Colors.NEUTRAL_10,
  CancelButton: Colors.NEUTRAL_100,
  backgroundCancelButtonHover: Colors.NEUTRAL_20,
  backgroundConfirmButton: Colors.SECONDARY_50,
  backgroundConfirmButtonHover: Colors.SECONDARY_60,
  ConfirmButton: Colors.NEUTRAL_0,
  DivideLine: Colors.NEUTRAL_20,
  LocationContent: Colors.NEUTRAL_70,
  FormFieldLabelColor: Colors.NEUTRAL_80,
  IcomoonStyled: Colors.NEUTRAL_60,
  LinkStyle: Colors.PRIMARY_60,
};

const darkTheme = {
  backgroundCancelButton: Colors.NEUTRAL_80,
  CancelButton: Colors.NEUTRAL_20,
  backgroundCancelButtonHover: Colors.NEUTRAL_70,
  backgroundConfirmButton: Colors.SECONDARY_50,
  backgroundConfirmButtonHover: Colors.SECONDARY_40,
  ConfirmButton: Colors.NEUTRAL_0,
  DivideLine: Colors.NEUTRAL_80,
  LocationContent: Colors.NEUTRAL_30,
  FormFieldLabelColor: Colors.NEUTRAL_20,
  IcomoonStyled: Colors.NEUTRAL_30,
  LinkStyle: Colors.PRIMARY_30,
};

export const theme = {
  [THEME_MODE.LIGHT]: lightTheme,
  [THEME_MODE.DARK]: darkTheme,
};

export const LocationHolder = styled.div`
  width: 100%;
  display: flex;
  justify-content: start;
  margin-top: 32px;
`;

export const LocationField = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  border-right: 1px solid ${({ theme }) => theme.DivideLine};
  flex-grow: 1;
  padding-right: 16px;
  max-width: 70%;
`;

export const FormFieldLabel = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  margin-right: 11px;
  color: ${({ theme }) => theme.FormFieldLabelColor};
`;

export const IconStyled = styled(Icomoon)`
  color:  ${({ theme }) => theme.IcomoonStyled};
`;

export const LocationContent = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  text-align: left;
  word-break: break-all;
  font-size: 12px;
  line-height: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 5px;
  color: ${({ theme }) => theme.LocationContent};
`;

export const ButtonStyled = styled(ButtonMaterial)`
  flex: 1;
  border-radius: 8px;
  outline: none;
  border: none;
  font-size: 14px;
  text-transform: none;
  font-weight: 600;
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  line-height: 16px;
  min-height: 32px;
  ${({ disabled }) => disabled && `
    opacity: 1;
  `}
`;

export const ChangeInput = styled(ButtonStyled)`
  margin-left: 16px;
  min-width: 81px !important;
  height: 40px;
  background-color: ${({ theme, isSubmit }) => (isSubmit ? theme.backgroundCancelButtonHover : theme.backgroundCancelButton)};
  color: ${({ theme }) => theme.CancelButton} !important;
  &:hover {
    background-color: ${({ theme, isSubmit }) => (isSubmit ? theme.backgroundConfirmButtonHover : theme.backgroundCancelButtonHover)};
  }
`;
