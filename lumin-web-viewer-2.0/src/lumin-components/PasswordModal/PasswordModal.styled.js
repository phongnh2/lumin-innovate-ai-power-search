import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { Colors } from 'constants/styles';
import { THEME_MODE } from 'constants/lumin-common';

const lightTheme = {
  containerBackground: Colors.WHITE,
  title: Colors.NEUTRAL_100,
  text: Colors.NEUTRAL_80,
};

const darkTheme = {
  containerBackground: Colors.NEUTRAL_100,
  title: Colors.NEUTRAL_5,
  text: Colors.NEUTRAL_10,
};

export const theme = {
  [THEME_MODE.LIGHT]: lightTheme,
  [THEME_MODE.DARK]: darkTheme,
};

export const Container = styled.div`
  padding: 8px;
  background-color: ${({ theme }) => theme.containerBackground};
  box-sizing: border-box;
  border-radius: var(--border-radius-primary);
  ${mediaQuery.md`
    padding: 0px;
  `}
`;
export const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  position: relative;
  margin: 0 auto 16px;
`;
export const Icon = styled.img`
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
export const Title = styled.h6`
  color: ${({ theme }) => theme.title};
  font-weight: 600;
  font-size: 17px;
  text-align: center;
  line-height: 1.41;
  margin-bottom: 8px;
`;
export const Text = styled.p`
  color: ${({ theme }) => theme.text};
  font-weight: 400;
  font-size: 14px;
  line-height: 1.41;
  white-space: pre-wrap;
  margin-bottom: 16px;
`;
export const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: ${({ cancelable }) => (cancelable ? 'repeat(2, 1fr)' : '1fr')};
  column-gap: 16px;
  align-items: center;
  margin-top: 24px;
`;
