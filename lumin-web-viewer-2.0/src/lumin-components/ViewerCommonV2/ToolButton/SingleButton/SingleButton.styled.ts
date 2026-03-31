import { ButtonProps } from '@mui/material';
import { makeStyles } from '@mui/styles';
import styled from 'styled-components';

import { spacings } from 'constants/styles/editor';
import { le_label_medium } from 'constants/styles/editor/typographies';

interface ChildrenContainerProps {
  $loading: boolean;
}

interface LabelTextProps {
  $hideLabelOnSmallScreen: boolean;
}

type MakeStyleProps = {
  theme: Record<string, string>;
  isActive: boolean;
  hideLabelOnSmallScreen?: boolean;
} & ButtonProps;

export const useStyles = makeStyles<Record<string, string>, MakeStyleProps>({
  root: ({ theme, isActive }) => ({
    height: '32px',
    minWidth: '32px',
    background: isActive ? theme.le_main_secondary_container : 'transparent',
    color: isActive ? theme.le_main_on_secondary_container : theme.le_main_on_surface_variant,
    borderRadius: 'var(--border-radius-primary)',
    whiteSpace: 'nowrap',
    boxShadow: 'none',
    position: 'relative',
    transition: 'var(--editor-transition)',
    transitionProperty: 'color, background, border',
    padding: '0 4px',
    textTransform: 'none',
    ...le_label_medium,
    '&:hover': {
      background: isActive ? theme.le_main_secondary_container : theme.le_state_layer_on_surface_variant_hovered,
      color: isActive ? theme.le_main_on_secondary_container : theme.le_main_on_surface_variant,
      boxShadow: 'none',
    },
    '&:active': {
      background: theme.le_main_secondary_container,
      color: theme.le_main_on_secondary_container,
      boxShadow: 'none',
    },
  }),
  label: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
  disabled: (props) => ({
    '&&': {
      color: props.theme.le_disable_on_container,
    },
  }),
});

export const ChildrenContainer = styled.span<ChildrenContainerProps>`
  visibility: ${(props) => (props.$loading ? 'hidden' : 'visible')};
  opacity: ${(props) => (props.$loading ? 0 : 1)};
  display: inherit;
  justify-content: inherit;
  align-items: inherit;
  width: 100%;
`;

export const LabelText = styled.span<LabelTextProps>`
  margin-left: ${spacings.le_gap_0_5}px;
  width: 100%;
  ${({ $hideLabelOnSmallScreen }) =>
    $hideLabelOnSmallScreen
      ? `
      visibility: hidden;
      width: 0;
      margin-left: 0;
    `
      : ''}
`;

export const PremiumIconWrapper = styled.span`
  position: absolute;
  top: -2px;
  left: -4px;
  z-index: 2;
`;
