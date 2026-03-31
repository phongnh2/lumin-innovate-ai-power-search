import { ButtonProps } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { styleToJs } from 'lumin-ui/kiwi-ui';
import { typographies } from 'lumin-ui/tokens';
import { rgba } from 'polished';
import styled from 'styled-components';

import { le_opacity_container_disable, le_opacity_state_layer_hovered } from 'constants/styles/editor/opacities';

import SingleButton from '../SingleButton';

type MakeStyleProps = { theme: Record<string, string>; active: boolean } & ButtonProps;
export const useArrowButtonStyles = makeStyles<unknown, MakeStyleProps>({
  root: ({ theme }: MakeStyleProps) => ({
    minWidth: '20px',
    backgroundColor: 'transparent',
    color: theme.le_main_on_surface_variant,
    whiteSpace: 'nowrap',
    boxShadow: 'none',
    position: 'relative',
    transition: 'all var(--editor-transition)',
    transitionProperty: 'color, background, border',
    padding: '0',
    textTransform: 'none',
    ...styleToJs(typographies.kiwi_typography_label_md),
    '&:hover': {
      backgroundColor: 'transparent',
      color: theme.le_main_on_surface_variant,
      boxShadow: 'none',
    },
    '&:active': {
      color: theme.le_main_on_secondary_container,
      boxShadow: 'none',
    },
    '&:disabled': {
      background: 'transparent',
      color: theme.le_main_on_surface_variant,
      opacity: le_opacity_container_disable,
    },
  }),
  label: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: (props) => ({
    '&&': {
      backgroundColor: 'transparent',
      color: props.theme.le_main_on_surface_variant,
      opacity: le_opacity_container_disable,
    },
  }),
});

export const InnerSplitButton = styled(SingleButton)`
  &.MuiButton-root {
    background-color: transparent;
    border-radius: var(--border-radius-primary);
    transition: all var(--editor-transition);
    z-index: 2;
    &[data-active='true'] {
      background-color: ${({ theme }) => theme.le_main_secondary_container};
    }
  }

  &.Mui-disabled {
    background-color: ${({ theme }) => theme.le_main_surface_container};
  }
`;

export const ButtonContainer = styled.div`
  display: inline-flex;
  align-items: center;
  border-radius: var(--border-radius-primary);
  overflow: hidden;
  transition: all var(--editor-transition);
  cursor: pointer;
  position: relative;
  padding: 1px;
  box-sizing: border-box;

  &:after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    transition: all var(--editor-transition);
    border-radius: var(--border-radius-primary);
  }
  &:hover {
    background-color: var(--kiwi-colors-surface-surface-container);
    ${InnerSplitButton} {
      background-color: var(--kiwi-colors-surface-surface-container);
      &[data-active='true'] {
        background-color: var(--kiwi-colors-core-primary-container);
      }
    }
    &:after {
      background-color: ${({ theme }) => rgba(theme.le_main_on_surface, le_opacity_state_layer_hovered)};
    }
  }
`;
