/// <reference path="./Icomoon.d.ts" />
import React from 'react';
import PropTypes from 'prop-types';

import './Icomoon.scss';

const propTypes = {
  className: PropTypes.string,
  color: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onClick: PropTypes.func,
  style: PropTypes.object,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const defaultProps = {
  className: '',
  color: '',
  onClick: null,
  size: 16,
  style: {},
};

const Icomoon = React.forwardRef((props, ref) => {
  const {
    className, color, onClick, size, style, ...otherProps
  } = props;
  const filter =
    color &&
      (color === 'rgba(255, 255, 255, 1)' || color === 'rgb(255, 255, 255)')
      ? 'rgba(192, 208, 223, 1)'
      : undefined;

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <i
      className={`icon icon-${className} icon__${size}`}
      style={{
        color, filter, fontSize: size, ...style,
      }}
      onClick={onClick}
      ref={ref}
      {...otherProps}
    />
  );
});

Icomoon.propTypes = propTypes;
Icomoon.defaultProps = defaultProps;

export default Icomoon;
