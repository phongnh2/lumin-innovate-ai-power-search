import { css } from '@emotion/react';
import React from 'react';
import { Text } from '../../Text';

export type LabelProps = {
  className?: string;
  htmlFor?: string;
  children: React.ReactNode;
};

const labelCss = css`
  display: inline-block;
`;

function Label({ children, className, htmlFor }: LabelProps) {
  return (
    <Text variant='neutral' level={6} bold as='label' className={className} htmlFor={htmlFor} css={labelCss}>
      {children}
    </Text>
  );
}

Label.defaultProps = {
  className: undefined,
  htmlFor: undefined
};

export default Label;
