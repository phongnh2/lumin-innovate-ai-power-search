import Button from '@mui/material/Button';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import CircularLoading from 'luminComponents/CircularLoading';
import Icomoon from 'luminComponents/Icomoon';
import Tooltip from 'luminComponents/Tooltip';

import { useTranslation } from 'hooks/useTranslation';

import { ButtonVariant } from './ButtonVariant';

import './ButtonMaterial.scss';

const propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  onMouseDown: PropTypes.func,
  label: PropTypes.string,
  dataElement: PropTypes.string,
  icon: PropTypes.string,
  iconSize: PropTypes.number,
  iconColor: PropTypes.string,
  href: PropTypes.string,
  title: PropTypes.string,
  type: PropTypes.string,
  id: PropTypes.string,
  loading: PropTypes.bool,
  loadingColor: PropTypes.string,
  location: PropTypes.string,
  variant: PropTypes.oneOf(Object.values(ButtonVariant)),
  interpolation: PropTypes.object
};

const defaultProps = {
  children: '',
  className: 'primary',
  disabled: false,
  label: 'none',
  iconSize: 16,
  title: '',
  type: 'button',
  iconColor: '',
  icon: '',
  dataElement: '',
  href: '',
  onMouseDown: () => {},
  onClick: () => {},
  id: '',
  loading: false,
  loadingColor: 'white',
  location: 'bottom',
  variant: ButtonVariant.NONE,
  interpolation: {}
};

const ButtonMaterial = React.forwardRef((props, ref) => {
  const {
    children,
    className,
    disabled,
    onClick,
    onMouseDown,
    label,
    dataElement,
    icon,
    iconSize,
    iconColor,
    href,
    title,
    type,
    id,
    loading,
    loadingColor,
    location,
    variant,
    interpolation,
    ...otherProps
  } = props;
  const { t } = useTranslation();

  const isOffline = useSelector(selectors.isOffline);
  const buttonLabel = (
    <>
      {loading && <CircularLoading size={20} color={loadingColor} style={{ marginRight: 12 }} />}
      {children}
    </>
  );

  const mergeClasses = classNames(`ViewerButtonMaterial ${className}`, {
    disabled,
    contained: variant === ButtonVariant.CONTAINED,
    outlined: variant === ButtonVariant.OUTLINED,
    'disabled--offline': isOffline && disabled,
  });

  const button = (
    <Button
      ref={ref}
      href={href}
      data-element={dataElement}
      aria-label={label}
      className={mergeClasses}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseDown={onMouseDown}
      type={type}
      id={id}
      {...otherProps}
    >
      {icon ? (
        <Icomoon className={icon} size={iconSize} color={iconColor} />
      ) : (
        buttonLabel
      )}
    </Button>
  );

  return title.trim() ? (
    <Tooltip
      location={location}
      title={title}
      interpolation={interpolation}
      additionalClass={classNames(`tooltip--${t(title).trim().toLowerCase().replace(/\s/g, '_')}`, {
        'tooltip--bottom-right': title === 'tool.select',
      })}
    >{button}
    </Tooltip>
  ) : (
    button
  );
});

ButtonMaterial.propTypes = propTypes;

ButtonMaterial.defaultProps = defaultProps;

export default ButtonMaterial;
