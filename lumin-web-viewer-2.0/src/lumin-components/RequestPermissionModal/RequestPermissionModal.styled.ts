import styled from 'styled-components';
import { Fonts, Colors } from 'constants/styles';
import { THEME_MODE } from 'constants/lumin-common';

const lightTheme = {
  textTitleColor: Colors.NEUTRAL_100,
  backgroundTextarea: Colors.WHITE,
};
const darkTheme = {
  textTitleColor: Colors.NEUTRAL_10,
  backgroundTextarea: Colors.NEUTRAL_100,
};

export const theme = {
  [THEME_MODE.LIGHT]: lightTheme,
  [THEME_MODE.DARK]: darkTheme,
};

export const ModalContainer = styled.div``;

export const Title = styled.h2`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 28px;
  color: ${({ theme }) => theme.textTitleColor};
  margin: 0 0 24px;
`;

export const InputContainer = styled.div`
  margin-bottom: 24px;
`;
