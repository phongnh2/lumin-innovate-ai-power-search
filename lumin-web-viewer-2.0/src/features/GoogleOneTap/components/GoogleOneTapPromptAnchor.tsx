import React from 'react';

import { GOOGLE_PROMPT_WIDTH, PROMPT_ANCHOR_ID } from '../constants';

const GoogleOneTapPromptAnchor = (): JSX.Element => (
  <div
    id={PROMPT_ANCHOR_ID}
    style={{
      position: 'fixed',
      top: '64px',
      right: `calc(${GOOGLE_PROMPT_WIDTH}px + 16px)`,
      width: '0',
      height: '0',
      zIndex: 9999,
    }}
  />
);

export default GoogleOneTapPromptAnchor;
