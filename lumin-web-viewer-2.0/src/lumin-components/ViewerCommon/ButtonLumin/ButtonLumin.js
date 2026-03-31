import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import selectors from 'selectors';

import Icomoon from 'lumin-components/Icomoon';
import Icon from 'lumin-components/Icon';
import ButtonMaterial from 'lumin-components/ViewerCommon/ButtonMaterial';

import { eventTracking } from 'utils';
import { ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import DataElements from 'constants/dataElement';
import UserEventConstants from 'constants/eventConstants';

import './ButtonLumin.scss';

const propTypes = {
  dataElement: PropTypes.string,
};

const defaultProps = {
  dataElement: '',
};

const Button = forwardRef((props, ref) => {
  const [removeElement, customOverrides = {}] = useSelector(
    (state) => [
      selectors.isElementDisabled(state, props.dataElement.replace('-tablet', '')),
      selectors.getCustomElementOverrides(state, props.dataElement),
    ],
    shallowEqual,
  );

  const document = useSelector((state) => selectors.getCurrentDocument(state));
  const isLoadingDocument = useSelector(selectors.isLoadingDocument);
  const newProps = { ...props, ...customOverrides };
  const {
    disabled,
    isActive,
    arrow,
    mediaQueryClassName,
    img,
    label,
    color,
    dataElement,
    onClick,
    className,
    title,
    iconSize,
    icon,
    eventTrackingName,
    interpolation,
  } = newProps;
  const buttonClass = [
    'ViewerButtonLumin square',
    className || '',
    arrow ? 'down-arrow' : '',
    isActive ? 'active' : 'inactive',
    label ? 'label' : 'icon',
    mediaQueryClassName || '',
  ]
    .join(' ')
    .trim();

  const isBase64 = img?.trim().startsWith('data:');
  // if there are no file extensions then assume that this is a glyph
  const isGlyph =
    img && !isBase64 && (!img.includes('.') || img.startsWith('<svg'));

  let content;
  if (isGlyph) {
    content = <Icon glyph={img} color={color} />;
  } else if (img && !isGlyph) {
    // eslint-disable-next-line jsx-a11y/alt-text
    content = <img src={img} />;
  } else if (label) {
    content = <p>{label}</p>;
  } else if (icon && !isGlyph) {
    content = (
      <Icomoon
        className={`${icon} ${color === '#FFFFFF' ? 'bordered' : ''}`}
        color={color}
        size={iconSize}
      />
    );
  }

  const handleClick = (event) => {
    eventTrackingName && eventTracking(UserEventConstants.EventType.HEADER_BUTTON,
      { elementName: eventTrackingName, elementPurpose: ButtonPurpose[eventTrackingName] }
    );
    onClick(event);
    if (dataElement === DataElements.ROTATE_COUNTER_CLOCKWISE_BUTTON) {
      eventTracking(UserEventConstants.EventType.ENTIRE_DOCUMENT_ROTATED, { source: document.service });
    }
  };

  return (
    <ButtonMaterial
      className={buttonClass}
      onClick={handleClick}
      title={title}
      dataElement={dataElement}
      disabled={removeElement || disabled || isLoadingDocument}
      data-lumin-btn-name={newProps['data-lumin-btn-name']}
      data-lumin-btn-purpose={newProps['data-lumin-btn-purpose']}
      ref={ref}
      interpolation={interpolation}
    >
      <span className="ViewerButtonLumin__content">{content}</span>
    </ButtonMaterial>
  );
});

Button.propTypes = propTypes;
Button.defaultProps = defaultProps;

export default React.memo(Button);
