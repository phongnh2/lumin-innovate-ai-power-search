import { forwardRef, Ref } from 'react';

import * as Styled from './Text.styled';
import { TextProps } from './interfaces';

const Text = forwardRef((props: TextProps, ref: Ref<any>) => {
  const { children, level, variant, align, ellipsis, underline, ...otherProps } = props;
  return (
    <Styled.Text {...otherProps} level={level} variant={variant} align={align} ref={ref} ellipsis={ellipsis} underline={underline}>
      {children}
    </Styled.Text>
  );
});

Text.defaultProps = {
  align: 'left',
  children: undefined
};

export default Text;
