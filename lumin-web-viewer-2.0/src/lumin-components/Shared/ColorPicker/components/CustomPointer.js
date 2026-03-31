import React from 'react';
import { css } from 'styled-components';

const CustomPointer = () => (
  <div
    css={css`
      width: 12px;
      height: 12px;
      border: 1px solid white;
      border-radius: 99px;
      transform: translate(-50%, -50%);
    `}
  />
);

export default CustomPointer;
