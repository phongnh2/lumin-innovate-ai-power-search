import PropTypes from 'prop-types';
import React from 'react';

import * as Styled from './CustomScroll.styled';

const CustomScroll = React.forwardRef((props, ref) => {
  const { children, ...otherProps } = props;
  return (
    <Styled.Scrollbars
      {...otherProps}
      ref={ref}
      renderThumbVertical={(thumbProps) => <div {...thumbProps} className="custom-scroll__thumb" />}
    >
      {children}
    </Styled.Scrollbars>
  );
});

CustomScroll.propTypes = {
  children: PropTypes.node.isRequired,
};

CustomScroll.defaultProps = {};

export default CustomScroll;
