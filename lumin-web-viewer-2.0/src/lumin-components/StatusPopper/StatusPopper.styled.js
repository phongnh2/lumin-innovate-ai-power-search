import styled from 'styled-components';

import { THEME_MODE } from 'constants/lumin-common';
import { Colors, Fonts } from 'constants/styles';

const lightTheme = {
  background: Colors.WHITE,
  titleColor: Colors.NEUTRAL_100,
  descColor: Colors.NEUTRAL_100,
  learnMoreColor: Colors.PRIMARY_80,
  closeColor: Colors.NEUTRAL_60,
};

const darkTheme = {
  background: Colors.NEUTRAL_100,
  titleColor: Colors.NEUTRAL_10,
  descColor: Colors.NEUTRAL_10,
  learnMoreColor: Colors.PRIMARY_40,
  closeColor: Colors.NEUTRAL_40,
};

export const theme = {
  [THEME_MODE.LIGHT]: lightTheme,
  [THEME_MODE.DARK]: darkTheme,
};

export const PopperWrapper = styled.div`
  --border-width: 1px;
  width: calc(400px - var(--border-width) * 2);
  padding: 8px 16px;
  display: flex;
  position: relative;
`;

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const ContentWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const ImgWrapper = styled.div`
  max-width: 96px;
  max-height: 96px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 16px;
`;

export const Img = styled.img`
  height: auto;
  width: 100%;
`;

export const Title = styled.h3`
  font-weight: 600;
  font-family: ${Fonts.PRIMARY};
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.titleColor};
`;

export const Desc = styled.p`
  font-weight: 375;
  font-family: ${Fonts.PRIMARY};
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.descColor};
  margin: 4px 0;
`;

export const LearnMore = styled.a`
  font-weight: 400;
  font-family: ${Fonts.PRIMARY};
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.learnMoreColor};
  text-decoration: underline;
  cursor: pointer;
`;

export const CloseWrapper = styled.div`
  position: absolute;
  top: -2px;
  right: 6px;
  cursor: pointer;
`;
