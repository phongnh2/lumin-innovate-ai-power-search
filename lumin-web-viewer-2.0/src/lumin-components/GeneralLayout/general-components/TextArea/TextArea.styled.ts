import { css } from 'styled-components';

import { spacings, typographies } from 'constants/styles/editor';

export const textAreaSize = {
  small: css({
    ...typographies.le_body_small,
  }),
  medium: css({
    ...typographies.le_body_medium,
  }),
  large: css({
    ...typographies.le_body_large,
  }),
};

export const textAreaElement = ({ backgroundColor }: { backgroundColor: string }) => css(({ theme }) => ({
  width: '100%',
  padding: `${spacings.le_gap_1}px`,
  textAlign: 'left',
  backgroundColor,
  border: `1px solid ${theme.le_main_outline_variant}`,
  borderRadius: '4px',
  outline: 'none!important',
  maxLines: 4,
  boxSizing: 'border-box',
  resize: 'none',
  color: theme.le_main_on_surface,
  '&::placeholder': {
    color: theme.le_disable_on_container,
  },
  '&:focus': {
    borderColor: theme.le_main_on_surface,
  },
}));

export const textAreaElementError = css(({ theme }) => ({
  borderColor: theme.le_error_error,
  color: theme.le_error_error,
  '&:focus': {
    borderColor: theme.le_main_on_surface,
  },
}));

export const errorMessage = css(({ theme }) => ({
  color: theme.le_error_error,
}));
