import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import React from 'react';

import Tooltip from '@new-ui/general-components/Tooltip';

import Icomoon from 'lumin-components/Icomoon';

import { ICON_BTN_SIZE, BUTTON_TYPES, ICON_BTN_ACTIVE_STYLE } from './constants';

import * as Styled from './IconButton.styled';

const defaultProps = {
  icon: '',
  iconSize: 16,
  iconColor: '',
  size: ICON_BTN_SIZE.MD,
  activeStyle: ICON_BTN_ACTIVE_STYLE.NORMAL,
  tooltipData: {},
  children: null,
  active: false,
  onClick: () => {},
  disabled: false,
  type: BUTTON_TYPES.NORMAL,
  className: '',
  component: null,
  showTooltipWhenDisabled: false,
  dataElement: '',
};

const propTypes = {
  icon: PropTypes.string,
  iconSize: PropTypes.number,
  iconColor: PropTypes.string,
  size: PropTypes.oneOf(Object.values(ICON_BTN_SIZE)),
  activeStyle: PropTypes.oneOf(Object.values(ICON_BTN_ACTIVE_STYLE)),
  tooltipData: PropTypes.object,
  children: PropTypes.any,
  active: PropTypes.bool,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  type: PropTypes.string,
  className: PropTypes.string,
  component: PropTypes.any,
  showTooltipWhenDisabled: PropTypes.bool,
  dataElement: PropTypes.string,
};

/**
 *
 * @param {{
 *  size: "medium" | "small" | "large";
 *  activeStyle: "normal" | "stripe";
 * }} props
 *
 */

const IconButton = React.forwardRef(
  (
    {
      icon,
      iconSize,
      iconColor,
      size,
      tooltipData,
      children,
      active,
      activeStyle,
      onClick,
      disabled,
      type,
      className,
      showTooltipWhenDisabled,
      dataElement,
      component,
      ...otherProps
    },
    ref
  ) => {
    const contentRender = (
      <Styled.IconButton
        $size={size}
        $active={active}
        $activeStyle={activeStyle}
        onClick={onClick}
        disabled={disabled}
        $type={type}
        ref={ref}
        className={className}
        data-element={dataElement}
        {...otherProps}
      >
        {icon && <Icomoon className={icon} size={iconSize} color={iconColor} />}
        {component}
        {children}
      </Styled.IconButton>
    );

    const contentWithTooltip = disabled ? <div>{contentRender}</div> : contentRender;

    return !isEmpty(tooltipData) || (showTooltipWhenDisabled && disabled) ? (
      <Tooltip {...tooltipData}>{contentWithTooltip}</Tooltip>
    ) : (
      contentRender
    );
  }
);

IconButton.propTypes = propTypes;
IconButton.defaultProps = defaultProps;

export default IconButton;
