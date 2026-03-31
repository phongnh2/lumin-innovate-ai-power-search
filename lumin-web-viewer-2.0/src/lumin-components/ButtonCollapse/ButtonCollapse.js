import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import React from 'react';
import './ButtonCollapse.scss';

const propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  open: PropTypes.bool,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
};

const defaultProps = {
  children: null,
  open: false,
  onClick: () => {},
  disabled: false,
};

const ButtonCollapse = ({
  open, children, onClick, disabled,
}) => {
  const onClickHandle = () => {
    onClick(!open);
  };

  return (
    <Button className="ButtonCollapse__wrapper" onClick={onClickHandle} disabled={disabled}>
      {children}
    </Button>
  );
};

ButtonCollapse.propTypes = propTypes;
ButtonCollapse.defaultProps = defaultProps;

export default ButtonCollapse;
