import { forwardRef, Ref } from 'react';

import { TextProps } from './interfaces';
import Text from './Text';

import { buttonTextDisabledCss } from './Text.styled';

type TCustomProps = {
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
};

function ButtonText(props: TextProps & TCustomProps, ref: Ref<HTMLButtonElement>) {
  const { disabled, type = 'button', ...otherProps } = props;
  return <Text {...otherProps} type={type} as='button' variant='highlight' bold ref={ref} css={disabled && buttonTextDisabledCss} />;
}

export default forwardRef(ButtonText);
