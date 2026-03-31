import { css, SerializedStyles } from '@emotion/react';

import { Colors } from '../theme';

const hrCss = css`
  outline: none;
  background: ${Colors.NEUTRAL_20};
  width: var(--vertical-bar-width);
  height: var(--vertical-bar-height);
  border: none;
  margin: 0;
`;

interface IVerticalBarProps {
  width?: string;
  size?: number;
  css?: SerializedStyles;
}

function VerticalBar({ width = '100%', size = 1, ...otherProps }: IVerticalBarProps) {
  return <hr {...otherProps} css={hrCss} style={{ '--vertical-bar-width': width, '--vertical-bar-height': `${size}px` } as any} />;
}

export default VerticalBar;
