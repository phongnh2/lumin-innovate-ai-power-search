import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ButtonMaterial from 'lumin-components/ViewerCommon/ButtonMaterial';
import Icomoon from 'luminComponents/Icomoon';
import selectors from 'selectors';

import UserEventConstants from 'constants/eventConstants';
import { eventTracking } from 'utils';

import './ToggleButtonWithArrow.scss';

const propTypes = {
  isActive: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.string,
  iconSize: PropTypes.number,
  color: PropTypes.string,
  dataElement: PropTypes.string,
  title: PropTypes.string,
  disabled: PropTypes.bool,
  eventTrackingName: PropTypes.string,
};

const defaultProps = {
  isActive: false,
  className: '',
  icon: '',
  iconSize: 16,
  color: '',
  dataElement: '',
  title: '',
  disabled: false,
  eventTrackingName: '',
};

function ToggleButtonWithArrow(props) {
  const {
    className, isActive, onClick, icon, color, iconSize, dataElement, title, disabled, eventTrackingName,
  } = props;

  const [removeElement] = useSelector(
    (state) => [
      selectors.isElementDisabled(state, dataElement),
    ],
    shallowEqual,
  );

  const buttonClass = classNames({
    'ViewerButtonLumin square': true,
    active: isActive,
    inactive: !isActive,
  });

  const handleClick = (e) => {
    eventTrackingName && eventTracking(UserEventConstants.EventType.HEADER_BUTTON, { elementName: eventTrackingName });
    onClick(e);
  };
  return (
    <ButtonMaterial
      className={`${className} ${buttonClass}`}
      onClick={handleClick}
      title={title}
      dataElement={dataElement}
      disabled={removeElement || disabled}
    >
      <span className="ViewerButtonLumin__content">
        <Icomoon
          className={`${icon} ${color === '#FFFFFF' ? 'bordered' : ''}`}
          color={color}
          size={iconSize}
        />
      </span>
      <span className="ViewerButtonLumin__arrow">
        <Icomoon
          className="arrow-down-alt"
          size={8}
        />
      </span>
    </ButtonMaterial>
  );
}

ToggleButtonWithArrow.propTypes = propTypes;
ToggleButtonWithArrow.defaultProps = defaultProps;

export default ToggleButtonWithArrow;
