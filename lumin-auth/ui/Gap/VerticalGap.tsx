import React from 'react';

import { IGapProps } from './interfaces';
import { getSize } from './utils';

function VerticalGap({ level = 1, children, fullWidth, ...otherProps }: IGapProps) {
  return (
    <div {...otherProps} style={{ gap: getSize(level), display: 'grid', width: fullWidth ? '100%' : 'initial' }}>
      {children}
    </div>
  );
}

export default VerticalGap;
