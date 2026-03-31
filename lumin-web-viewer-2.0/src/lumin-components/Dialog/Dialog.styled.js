import styled from 'styled-components';
import { makeStyles } from '@mui/styles';
import { Breakpoints, Shadows, Colors } from 'constants/styles';
import ButtonIconBase from 'luminComponents/Shared/ButtonIcon';
import { THEME_MODE } from 'constants/lumin-common';
import { ModalPlacement } from 'constants/styles/Modal';

const getPadding = ({ noPadding, hasCloseBtn }) => {
  if (hasCloseBtn) {
    return {
      xs: '20px 16px 16px',
      md: '28px 24px 24px',
    };
  }
  return {
    xs: noPadding ? 0 : 16,
    md: noPadding ? 0 : 24,
  };
};

export const getStyles = ({ theme }) =>
  ({
    [THEME_MODE.LIGHT]: {
      boxShadow: Shadows.SHADOW_XL,
      backgroundColor: Colors.WHITE,
    },
    [THEME_MODE.DARK]: {
      boxShadow: Shadows.SHADOW_M_DARK,
      backgroundColor: Colors.NEUTRAL_100,
    },
  }[theme]);

const getAlignItems = ({ placement }) => {
  if (placement === ModalPlacement.TOP) {
    return 'flex-start';
  }
  return 'center';
};

export const useStyles = makeStyles(() => ({
  root: (props) => ({
    zIndex: `${props.priority} !important`,
  }),
  container: (props) => ({
    alignItems: getAlignItems(props),
  }),
  paper: (props) =>
    !props.fullScreen
      ? {
          boxShadow: getStyles(props).boxShadow,
          maxWidth: 'calc(100vw - 32px)',
          padding: getPadding(props).xs,
          margin: 16,
          color: Colors.NEUTRAL_100,
          borderRadius: 'var(--border-radius-primary)',
          boxSizing: 'border-box',
          backgroundColor: getStyles(props).backgroundColor,
          width: props.width || 'fit-content',
          transitionProperty: 'transform, opacity',
          opacity: props.hasOverlapped && 0,
          transform: props.hasOverlapped && 'scale(0.9)',
          [`@media screen and (min-width: ${Breakpoints.md}px)`]: {
            padding: getPadding(props).md,
          },
        }
      : {},
  closeButton: {
    top: '18px',
    right: '26px',
  },
}));

export const IconButton = styled(ButtonIconBase)`
  position: absolute;
  right: 15px;
  top: 15px;
  z-index: 1;
`;
