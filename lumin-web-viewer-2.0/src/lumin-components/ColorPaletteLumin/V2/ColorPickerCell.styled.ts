import { css } from 'styled-components';

import { spacings } from 'constants/styles/editor';

export const popperContainer = css({
  padding: `${spacings.le_gap_1}px`,
  width: 240,
});

export const textToolPopperContainer = css(({ theme }) => ({
  padding: `${spacings.le_gap_1}px`,
  background: `${theme.kiwi_colors_surface_surface_bright}`,
  minWidth: '205px',
}));
