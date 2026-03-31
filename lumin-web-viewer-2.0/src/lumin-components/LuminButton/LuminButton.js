import Button from '@mui/material/Button';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import React from 'react';

import Icomoon from 'luminComponents/Icomoon';
import Tooltip from 'luminComponents/Shared/Tooltip';

import './LuminButton.scss';

const propTypes = {
  children: PropTypes.object,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  onMouseDown: PropTypes.func,
  label: PropTypes.string,
  icon: PropTypes.string,
  iconSize: PropTypes.number,
  iconColor: PropTypes.string,
  full: PropTypes.bool,
  small: PropTypes.bool,
  type: PropTypes.string,
  fontSecondary: PropTypes.bool,
  square: PropTypes.bool,
  isIconButton: PropTypes.bool,
  hasTooltip: PropTypes.bool,
};

const defaultProps = {
  children: {},
  className: '',
  disabled: false,
  onClick: () => {},
  onMouseDown: () => {},
  label: '',
  icon: '',
  iconSize: 16,
  iconColor: '',
  full: false,
  small: false,
  type: 'primary',
  fontSecondary: false,
  square: false,
  isIconButton: false,
  hasTooltip: false,
};

const LuminButton = React.forwardRef((props, ref) => {
  const {
    children,
    className,
    disabled,
    onClick,
    onMouseDown,
    label,
    icon,
    iconSize,
    iconColor,
    full,
    small,
    type,
    fontSecondary,
    square,
    isIconButton,
    hasTooltip,
    ...otherProps
  } = props;
  const mainClass = 'LuminButton';
  const getClassName = () => {
    const className = [];
    disabled && className.push('disabled');
    full && className.push('full');
    type && className.push(type);
    small && className.push('small');
    square && className.push('square');
    fontSecondary && className.push('font-secondary');
    isIconButton && className.push('icon-button');
    return className
      .map((item) => `${mainClass}--${item}`)
      .join(' ')
      .trim();
  };
  const buttonRender = (
    <Button
      aria-label={label}
      className={`LuminButton ${getClassName()} ${className}`}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={onMouseDown}
      disableRipple={!!isIconButton}
      ref={ref}
      {...otherProps}
    >
      {icon && (
        <Icomoon
          className={`${icon} LuminButton__icon`}
          size={iconSize}
          color={iconColor}
        />
      )}
      {!hasTooltip && label && <span className="LuminButton__label">{label}</span>}
      {!isEmpty(children) && children}
    </Button>
  );

  return (
    hasTooltip ?
      <Tooltip title={label}>
        {buttonRender}
      </Tooltip>
      :
      buttonRender
  );
});

LuminButton.propTypes = propTypes;
LuminButton.defaultProps = defaultProps;

export default LuminButton;
