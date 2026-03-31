import React from 'react';
import { css } from 'styled-components';

import Skeleton from 'lumin-components/Shared/Skeleton';

const ShareModal = () => (
  <div css={css`
    background: white;
    padding: 24px;
  `}
  >
    <Skeleton variant="text" height={32} width="30%" gap={{ bottom: 16 }} />
    <Skeleton variant="rectangular" height={48} gap={{ bottom: 12 }} />
    <div style={{ height: 316 }} />
    <div
      css={css`
        display: flex;
        justify-content: flex-end;
      `}
    >
      <Skeleton variant="rectangular" height={40} width={200} />
    </div>
  </div>
);

export default ShareModal;
