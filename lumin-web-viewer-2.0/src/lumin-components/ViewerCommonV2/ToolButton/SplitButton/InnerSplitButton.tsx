import React, { forwardRef } from 'react';

import { SingleButtonProps } from '../SingleButton';

import * as Styled from './SplitButton.styled';

export type InnerSplitButtonProps = SingleButtonProps;

function InnerSplitButton(props: InnerSplitButtonProps, ref: React.Ref<HTMLButtonElement>) {
  return <Styled.InnerSplitButton ref={ref} {...props} />;
}

export default forwardRef(InnerSplitButton);
