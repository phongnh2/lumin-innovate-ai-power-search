import styled from 'styled-components';

import { THEME_MODE } from 'constants/lumin-common';
import { Fonts, Colors } from 'constants/styles';

const lightTheme = {
  text: Colors.NEUTRAL_100,
  backgroundCancelButton: Colors.NEUTRAL_10,
  CancelButton: Colors.NEUTRAL_100,
  backgroundCancelButtonHover: Colors.NEUTRAL_20,
  backgroundConfirmButton: Colors.SECONDARY_50,
  backgroundConfirmButtonHover: Colors.SECONDARY_60,
  ConfirmButton: Colors.NEUTRAL_0,
  FormFieldLabelColor: Colors.NEUTRAL_80,
};

const darkTheme = {
  text: Colors.NEUTRAL_10,
  backgroundCancelButton: Colors.NEUTRAL_80,
  CancelButton: Colors.NEUTRAL_20,
  backgroundCancelButtonHover: Colors.NEUTRAL_70,
  backgroundConfirmButton: Colors.SECONDARY_50,
  backgroundConfirmButtonHover: Colors.SECONDARY_40,
  ConfirmButton: Colors.NEUTRAL_0,
  FormFieldLabelColor: Colors.NEUTRAL_20,
};

export const theme = {
  [THEME_MODE.LIGHT]: lightTheme,
  [THEME_MODE.DARK]: darkTheme,
};

export const Container = styled.div`
  transition: padding 0.25s;
  width: 100%;
  color: ${({ theme }) => theme.text};
`;

export const TitleContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  padding-bottom: 8px;
`;

export const Title = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  margin-top: 20px;
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
  width: 100%;
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

export const LabelContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  text-align: center;
  margin-bottom: 24px;
`;

export const Label = styled.span`
  font-family:  ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
`;

export const Bold = styled.b`
  font-weight: 600;
`;

export const InputContainer = styled.div`
  position: relative;
`;

export const FooterContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
