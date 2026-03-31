import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { Button } from '@/ui';

export const StyledButton = styled(Button)`
  && {
    border-color: #dadce0;
    border-radius: 4px;
  }
`;

export const containerCss = css`
  display: grid;
  align-items: center;
  grid-template-columns: 1fr;
  column-gap: 8px;
  row-gap: 12px;
`;

export const buttonContainerCss = css`
  width: 100%;
  height: 100%;
  position: relative;
`;

export const buttonCss = css`
  width: 100%;
  height: 100%;
`;

export const googleIconCss = css`
  margin-right: 8px;
`;
