import styled from 'styled-components';

import ButtonMaterial from 'lumin-components/ButtonMaterial';

import { mediaQuery } from 'utils/styles/mediaQuery';

import { THEME_MODE } from 'constants/lumin-common';
import { Colors } from 'constants/styles';

const lightTheme = {
  colorTitle: Colors.NEUTRAL_100,
  colorSubtitle: Colors.NEUTRAL_80,
};

const darkTheme = {
  colorTitle: Colors.NEUTRAL_10,
  colorSubtitle: Colors.NEUTRAL_20,
};

export const theme = {
  [THEME_MODE.LIGHT]: lightTheme,
  [THEME_MODE.DARK]: darkTheme,
};

export const Container = styled.div`
  width: 100%;
`;

export const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Group = styled.div``;

export const Label = styled.p`
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorTitle};

  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
  `}
`;

export const Description = styled.p`
  font-weight: 400;
  font-size: 10px;
  line-height: 12px;
  color: ${({ theme }) => theme.colorSubtitle};
  margin-top: 8px;

  ${mediaQuery.md`
    font-size: 12px;
    line-height: 16px;
    margin-top: 4px;
  `}

  span {
    font-weight: 600;
    font-size: 10px;
    line-height: 16px;
    color: ${Colors.SECONDARY_50};
    cursor: pointer;
    margin-left: 8px;
    &:hover {
      text-decoration: underline;
    }

    ${mediaQuery.md`
      font-size: 14px;
      line-height: 20px;
      margin-left: 4px;
    `}
  }
`;

export const Input = styled.input`
  position: absolute;
  left: -999em;
`;

export const ButtonCopy = styled(ButtonMaterial)``;
