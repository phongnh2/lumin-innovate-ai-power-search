import { THEME_MODE } from 'constants/lumin-common';
import { Colors } from 'constants/styles';
import styled from 'styled-components';

export const lightTheme = {
  color: Colors.NEUTRAL_100,
  iconColor: Colors.NEUTRAL_60,
};

export const darkTheme = {
  color: Colors.NEUTRAL_10,
  iconColor: Colors.NEUTRAL_40,
};

export const theme = {
  [THEME_MODE.LIGHT]: lightTheme,
  [THEME_MODE.DARK]: darkTheme,
};

export const PopperContainer = styled.div`
  padding: 16px;
  display: grid;
  grid-template-columns: 90px 1fr 24px;
  gap: 16px;
  width: 430px;
  color: ${({ theme }) => theme.color};
`;

export const PopperImg = styled.img`
  width: 90px;
  height: 90px;
`;

export const Title = styled.h3`
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 4px;
`;

export const Description = styled.p`
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`;

export const CloseButton = styled.div`
  width: 24px;
  height: 24px;
  margin-right: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.iconColor};

  &:hover {
    background-color: ${Colors.NEUTRAL_20};
  }
`;