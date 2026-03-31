/**
 * @link https://v4.mui.com/api/collapse/
 */

import { Collapse as MaterialCollapse, Fade } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

const Collapse = ({ isExpand, children, timeout, onExited, onEntered }) => (
  <MaterialCollapse in={isExpand} timeout={timeout} onExited={onExited} onEntered={onEntered}>
    <Fade timeout={timeout} in={isExpand}>
      <div>{children}</div>
    </Fade>
  </MaterialCollapse>
);

Collapse.propTypes = {
  isExpand: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
  timeout: PropTypes.number,
  onExited: PropTypes.func,
  onEntered: PropTypes.func,
};

Collapse.defaultProps = {
  isExpand: false,
  children: null,
  timeout: 250,
  onExited: () => {},
  onEntered: () => {},
};

export default Collapse;
