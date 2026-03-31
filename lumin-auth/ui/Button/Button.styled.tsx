import isPropValid from '@emotion/is-prop-valid';
import styled from '@emotion/styled';
import { ButtonBase } from '@mui/material';

import { BorderRadius } from '../theme';
import { SizeResolution, Breakpoints } from '../utils';

import { TButtonProps } from './interfaces';
import { IButtonSizeResult } from './types';
import { ButtonSizeTransformer } from './utils';
import { buttonColorGetter } from './utils/button-color-getter';

export const Button = styled(ButtonBase, {
  shouldForwardProp: prop => isPropValid(prop)
})<TButtonProps>(({ labelColor, fullWidth, themeMode, color, size, width }) => {
  const colorGetter = buttonColorGetter({ themeMode, color });
  const transformer = new ButtonSizeTransformer(size);
  const mobileSize = transformer.get<IButtonSizeResult>(SizeResolution.Mobile);
  const tabletSize = transformer.get<IButtonSizeResult>(SizeResolution.Tablet);
  const desktopSize = transformer.get<IButtonSizeResult>(SizeResolution.Desktop);
  return {
    '&&': {
      padding: '0 16px',
      color: labelColor || colorGetter.root.color,
      backgroundColor: colorGetter.root.background,
      borderRadius: BorderRadius.Primary,
      border: `${colorGetter.root.border ? 1 : 0}px solid`,
      fontWeight: 600,
      borderColor: colorGetter.root.border,
      ...(fullWidth && { width: '100%' }),
      ...(width && { width }),
      height: `${desktopSize.height}px`,
      lineHeight: `${desktopSize.lineHeight}px`,
      fontSize: `${desktopSize.fontSize}px`,
      transition: 'all 0.25s ease',
      textDecoration: 'none',
      '&:hover, &:focus': {
        backgroundColor: colorGetter.hover.background,
        color: colorGetter.hover.color,
        borderColor: colorGetter.hover.border
      },
      '&:focus-visible': {
        outline: '2px solid #007bff',
        outlineOffset: '2px'
      },
      '&:disabled': {
        backgroundColor: colorGetter.disabled.background,
        color: colorGetter.disabled.color,
        borderColor: colorGetter.disabled.border
      },
      '&:active': {
        backgroundColor: colorGetter.pressed.background,
        color: colorGetter.pressed.color,
        borderColor: colorGetter.pressed.border
      },
      [`@media screen and (max-width: ${Breakpoints.xl - 0.01}px)`]: {
        height: `${tabletSize.height}px`,
        lineHeight: `${tabletSize.lineHeight}px`,
        fontSize: `${tabletSize.fontSize}px`
      },
      [`@media screen and (max-width: ${Breakpoints.md - 0.01}px)`]: {
        height: `${mobileSize.height}px`,
        lineHeight: `${mobileSize.lineHeight}px`,
        fontSize: `${mobileSize.fontSize}px`
      }
    }
  };
});

export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 2;
`;

export const ChildrenContainer = styled('span', { shouldForwardProp: prop => isPropValid(prop) && prop !== 'loading' })<{ loading: boolean }>`
  visibility: ${props => (props.loading ? 'hidden' : 'visible')};
  opacity: ${props => (props.loading ? 0 : 1)};
  display: inherit;
  justify-content: inherit;
  align-items: inherit;
  width: 100%;
`;
