import Button from '@mui/material/Button';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTheme } from 'styled-components';

import Icomoon from 'luminComponents/Icomoon';

import { useStylesWithTheme } from 'hooks/useStylesWithTheme';

import { ButtonIconColor } from './types/ButtonIconColor';

import * as Styled from './ButtonIcon.styled';

const ButtonIcon = React.forwardRef((props, ref) => {
  const {
    color,
    icon,
    iconColor,
    size,
    iconSize,
    onClick,
    className,
    isActive,
    href,
    component,
    rounded,
    children,
    ...otherProps
  } = props;
  const theme = useTheme();
  const classes = useStylesWithTheme(Styled.useStyles, {
    color, size, isActive, iconColor, theme, rounded,
  });

  return (
    <Button
      ref={ref}
      className={classNames(classes.button, className)}
      onClick={onClick}
      href={href}
      component={component}
      {...otherProps}
    >
      {/* eslint-disable-next-line no-magic-numbers */}
      {children || <Icomoon size={iconSize || size / 2} color={iconColor} className={classNames(icon, classes.icon)} />}
    </Button>
  );
});

ButtonIcon.propTypes = {
  color: PropTypes.oneOf(Object.values(ButtonIconColor)),
  icon: PropTypes.string,
  onClick: PropTypes.func,
  size: PropTypes.number,
  className: PropTypes.string,
  isActive: PropTypes.bool,
  href: PropTypes.string,
  iconColor: PropTypes.string,
  iconSize: PropTypes.number,
  component: PropTypes.elementType,
  rounded: PropTypes.bool,
  children: PropTypes.node,
};

ButtonIcon.defaultProps = {
  color: ButtonIconColor.SECONDARY,
  icon: '',
  size: 32,
  onClick: () => {},
  className: '',
  isActive: false,
  href: '',
  iconColor: '',
  iconSize: undefined,
  component: undefined,
  rounded: false,
  children: null,
};

export default ButtonIcon;
