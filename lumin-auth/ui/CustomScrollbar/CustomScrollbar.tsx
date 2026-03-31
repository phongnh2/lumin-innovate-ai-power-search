import React, { ReactNode } from 'react';
import { ScrollbarProps } from 'react-custom-scrollbars-2';

import * as Styled from './CustomScrollbar.styled';

const CustomScrollbar = React.forwardRef((props: ScrollbarProps & { children: ReactNode }, ref?: any) => {
  const { children, ...otherProps } = props;
  return (
    <Styled.Scrollbars ref={ref} {...otherProps}>
      {children}
    </Styled.Scrollbars>
  );
});

export default CustomScrollbar;
