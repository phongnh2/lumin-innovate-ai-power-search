import { ReactChild } from 'react';
import styled from 'styled-components';
import { Colors, Fonts, BorderRadius } from 'constants/styles';
import Dialog from 'lumin-components/Dialog';
import ButtonMaterial from 'lumin-components/ViewerCommon/ButtonMaterial';

import { THEME_MODE } from 'constants/lumin-common';
import { typographies } from 'lumin-ui/dist/design-tokens/kiwi/js';

const lightTheme = {
  title: Colors.NEUTRAL_100,
  subTitle: Colors.NEUTRAL_80,
  backgroundImage: Colors.WHITE,
  backgroundImageWrapper: Colors.NEUTRAL_5,
};

const darkTheme = {
  title: Colors.NEUTRAL_10,
  subTitle: Colors.NEUTRAL_20,
  backgroundImage: Colors.NEUTRAL_100,
  backgroundImageWrapper: Colors.NEUTRAL_90,
};

export const theme = {
  [THEME_MODE.LIGHT]: lightTheme,
  [THEME_MODE.DARK]: darkTheme,
};

interface ImageProps {
  src: string;
}

interface DialogProps {
  children?: ReactChild;
  width: number | string;
  open: boolean;
  hasCloseBtn: boolean;
  onClose: () => void;
}

interface ButtonProps {
  children?: ReactChild;
  onClick: () => void;
}

export const CustomDialog = styled(Dialog)<DialogProps>`
  padding: 24px;
  margin: 0;
`;

export const Button = styled(ButtonMaterial)<ButtonProps>`
  padding: 0 !important;
  width: 120px !important;
  height: 41px;
`;


const FlexStyles = `
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-item: center;
`;

export const Container = styled.section`
  ${FlexStyles}
`;

export const QRContainer = styled.div`
  ${FlexStyles}
  padding: 24px 48px;
  border-radius: ${BorderRadius.PRIMARY};
  ${({ theme }) => `
    background-color: ${theme.backgroundImageWrapper};
  `}
`;

export const Title = styled.h3`
  text-align: center;
  padding: 0 var(--kiwi-spacing-1);
  color: var(--kiwi-colors-surface-on-surface);
  ${typographies.kiwi_typography_headline_sm};
`;

export const Description = styled.p`
  text-align: center;
  padding: var(--kiwi-spacing-1) var(--kiwi-spacing-2) var(--kiwi-spacing-2) var(--kiwi-spacing-2);
  color: var(--kiwi-colors-surface-on-surface-variant);
  ${typographies.kiwi_typography_body_md};
`;

export const ImageWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
`;

const MediaImage = styled.img<ImageProps>`
  ${({ theme }) => `
    background-color: ${theme.backgroundImage};
  `}
`
export const QRCode = styled(MediaImage)`
  width: 126px;
  height: 126px;
  margin: 0 auto;
`;

export const Image = styled(MediaImage)`
  width: 100%;
  height: 100%;
`;
