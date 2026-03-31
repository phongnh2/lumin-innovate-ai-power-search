import styled from 'styled-components';
import { makeStyles } from '@mui/styles';

import themeConstants from 'constants/theme';
import { Breakpoints, Fonts } from 'constants/styles';
import { ButtonMaterialProps } from 'luminComponents/ButtonMaterial/ButtonMaterial.interface';
import SizeTransformer, { SizeResolution } from 'utils/styles/SizeTransformer';
import { IButtonSizeResult } from './types/ButtonSize';

const getDefaultColor = (props: any, color: string) => props.labelColor || color;

interface ChildrenContainerProps {
  $loading: boolean;
}

type MakeStyleProps = { theme: any, themeMode: string }
  & Omit<ButtonMaterialProps, 'children'>
  & Required<Pick<ButtonMaterialProps, 'color' | 'size'>>

export const useStyles = makeStyles<any, MakeStyleProps>({
  root: (props) => {
    const colorStyles = themeConstants.Button.buttonColorGetter(props);
    const transformer = new SizeTransformer.Button(props.size);
    const mobileSize = transformer.get<IButtonSizeResult>(SizeResolution.Mobile);
    const tabletSize = transformer.get<IButtonSizeResult>(SizeResolution.Tablet);
    const desktopSize = transformer.get<IButtonSizeResult>(SizeResolution.Desktop);
    return {
      fontFamily: Fonts.PRIMARY,
      textTransform: 'none',
      height: mobileSize.height,
      color: getDefaultColor(props, colorStyles.root.color),
      background: colorStyles.root.background,
      fontWeight: 600,
      fontSize: `${mobileSize.fontSize}px`,
      lineHeight: `${mobileSize.lineHeight}px`,
      borderRadius: 'var(--border-radius-primary)',
      boxShadow: 'none',
      textAlign: 'center',
      position: 'relative',
      transition: 'var(--editor-transition)',
      transitionProperty: 'color, background, border',
      width: (props.fullWidth ? '100%' : 'auto'),
      border: colorStyles.root.border,
      whiteSpace: 'nowrap',
      '&:hover': {
        background: colorStyles.hover.background,
        color: getDefaultColor(props, colorStyles.hover.color),
        boxShadow: 'none',
      },
      '&:active': {
        background: colorStyles.pressed.background,
        color: getDefaultColor(props, colorStyles.pressed.color),
        border: colorStyles.pressed.border,
        boxShadow: 'none',
      },
      [`@media screen and (min-width: ${Breakpoints.md}px)`]: {
        height: tabletSize.height,
        fontSize: `${tabletSize.fontSize}px`,
        lineHeight: `${tabletSize.lineHeight}px`,
      },
      [`@media screen and (min-width: ${Breakpoints.xl}px)`]: {
        height: desktopSize.height,
        fontSize: `${desktopSize.fontSize}px`,
        lineHeight: `${desktopSize.lineHeight}px`,
      }
    };
  },
  disabled: (props) => {
    const { disabled: disabledStyles = {} } = themeConstants.Button.buttonColorGetter(props);
    return {
      '&&': {
        backgroundColor: disabledStyles.background,
        color: getDefaultColor(props, disabledStyles.color),
        border: disabledStyles.border,
      },
    };
  },
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

export const ChildrenContainer = styled.span<ChildrenContainerProps>`
  visibility: ${(props) => (props.$loading ? 'hidden' : 'visible')};
  opacity: ${(props) => (props.$loading ? 0 : 1)};
  display: inherit;
  justify-content: inherit;
  align-items: inherit;
  width: 100%;
`;