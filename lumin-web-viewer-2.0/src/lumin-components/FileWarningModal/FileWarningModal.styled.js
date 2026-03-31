import Divider from '@mui/material/Divider';
import styled from 'styled-components';

import ButtonMaterial from 'lumin-components/ButtonMaterial';

import { Colors, Fonts } from 'constants/styles';
import { THEME_MODE } from 'constants/lumin-common';

const lightTheme = {
  backgroundDivider: Colors.NEUTRAL_20,
  backgroundItemWrapper: Colors.NEUTRAL_5,
  textColor: Colors.NEUTRAL_80,
  titleColor: Colors.NEUTRAL_100,
};

const darkTheme = {
  backgroundDivider: Colors.NEUTRAL_80,
  backgroundItemWrapper: Colors.NEUTRAL_90,
  textColor: Colors.NEUTRAL_20,
  titleColor: Colors.NEUTRAL_10,
};

export const theme = {
  [THEME_MODE.LIGHT]: lightTheme,
  [THEME_MODE.DARK]: darkTheme,
};

export const NotfoundImageContainer = styled.div`
  margin: auto;
`;

export const NotfoundImage = styled.img``;

export const MainTitle = styled.p`
  font-weight: 600;
  font-family: ${Fonts.PRIMARY};
  font-size: 20px;
  font-style: normal;
  line-height: 28px;
  margin: 12px auto 0;
  color: ${({ theme }) => theme.titleColor};
  text-align: center;
`;

export const SubTitle = styled.p`
  font-weight: 375;
  font-family: ${Fonts.PRIMARY};
  font-size: 14px;
  font-style: normal;
  line-height: 20px;
  margin: 4px auto 0;
  color: ${({ theme }) => theme.textColor};
  text-align: center;
`;

export const ItemWrapper = styled.ul`
  display: flex;
  flex-direction: column;
  margin-top: 16px;
`;

export const ItemContainer = styled.li`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.backgroundItemWrapper};
  border-radius: 4px;
  padding: 16px 8px;
  align-items: center;
  margin-bottom: 12px;
`;

export const ItemMainTitle = styled.p`
  font-weight: 600;
  font-family: ${Fonts.PRIMARY};
  font-size: 14px;
  font-style: normal;
  line-height: 20px;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.textColor};
  text-align: center;
`;

export const ItemSubTitle = styled.p`
  font-weight: 375;
  font-family: ${Fonts.PRIMARY};
  font-size: 12px;
  font-style: normal;
  line-height: 16px;
  color: ${({ theme }) => theme.textColor};
  text-align: center;
`;

export const CustomDivider = styled(Divider)`
  background-color: ${({ theme }) => theme.backgroundDivider};
  margin: 4px 0 16px;
`;

export const Contact = styled.p`
  font-weight: 375;
  font-family: ${Fonts.PRIMARY};
  font-size: 14px;
  font-style: normal;
  line-height: 20px;
  color: ${({ theme }) => theme.textColor};
  text-align: center;
`;

export const ContactLink = styled.a`
  color: ${Colors.RED};
  text-decoration: underline;
  font-weight: 600;
`;

export const Button = styled(ButtonMaterial)`
  flex: 1;

  &.secondary {
    border: none;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  margin-top: 16px;

  div {
    &:not(:first-child) {
      display: contents;
      ${Button} {
        margin-left: 16px;
      }
    };
  }
`;
export const DocumentName = styled.b`
  font-weight: 600;
  display: inline;
`;
