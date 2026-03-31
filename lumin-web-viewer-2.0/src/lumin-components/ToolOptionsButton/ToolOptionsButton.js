import Button from '@mui/material/Button';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Icomoon from 'luminComponents/Icomoon';
import Tooltip from 'luminComponents/Tooltip';

const ToolOptionsButton = (props) => {
  const {
    tooltipContent,
    isActive,
    onClick,
    disabled,
    isOffline,
  } = props;

  return (
    <Tooltip
      content={tooltipContent}
    >
      <Button
        className={classNames('ToolButtonGroupArrowDropdown__button', {
          'ToolButtonGroupArrowDropdown__button--active': isActive,
          disabled,
          'disabled--offline': disabled && isOffline,
        })}
        onClick={onClick}
      >
        <Icomoon className="arrow-down-alt" size={8} />
      </Button>
    </Tooltip>
  );
};

ToolOptionsButton.propTypes = {
  tooltipContent: PropTypes.string,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  isOffline: PropTypes.bool,
};

ToolOptionsButton.defaultProps = {
  tooltipContent: '',
  isActive: false,
  disabled: false,
  isOffline: false,
};
export default ToolOptionsButton;
