import Button from '@mui/material/Button';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Icomoon from 'luminComponents/Icomoon';
import Tooltip from 'luminComponents/Tooltip';
import './IconButton.scss';

const defaultProps = {
  disabled: false,
  onClick: () => {},
  label: 'none',
  icon: '',
  iconSize: 16,
  iconColor: '',
  title: '',
  location: 'bottom',
  hidden: [],
};

const propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  label: PropTypes.string,
  icon: PropTypes.string,
  iconSize: PropTypes.number,
  iconColor: PropTypes.string,
  title: PropTypes.string,
  location: PropTypes.string,
  hidden: PropTypes.array,
};

const IconButton = (props) => {
  const {
    disabled,
    onClick,
    label,
    icon,
    iconSize,
    iconColor,
    title,
    location,
    hidden,
  } = props;

  const getHiddenClass = () => {
    if (!hidden.length) {
      return '';
    }
    return hidden.map((item) => `hide-in-${item}`).join(' ');
  };

  const buttonClass = classNames({
    IconButton: true,
    [getHiddenClass()]: true,
    'IconButton--disabled': disabled,
  });

  const contentRender = (
    <Button
      aria-label={label}
      className={buttonClass}
      disabled={disabled}
      onClick={onClick}
    >
      <Icomoon className={icon} size={iconSize} color={iconColor} />
    </Button>
  );

  return title ? (
    <Tooltip content={title} location={location}>
      {contentRender}
    </Tooltip>
  ) : (
    contentRender
  );
};

IconButton.propTypes = propTypes;
IconButton.defaultProps = defaultProps;

export default IconButton;
