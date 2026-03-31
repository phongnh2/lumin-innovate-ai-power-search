import classNames from 'classnames';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React, {
  forwardRef, memo, useState, useRef
} from 'react';

import Tooltip from 'lumin-components/Shared/Tooltip';
import UserTag from 'luminComponents/AddShareMemberInput/components/UserTag';
import Icomoon from 'luminComponents/Icomoon';

import { useTrackFormEvent } from 'hooks/useTrackFormEvent';
import { useTranslation } from 'hooks/useTranslation';

import { INPUT_DEBOUNCE_TIME } from 'constants/formBuildTool';
import { Colors } from 'constants/styles';

import { InputSize } from './types/InputSize';

import './Input.scss';

const StyleTooltip = {
  borderRadius: 8,
  fontSize: 12,
  padding: '8px 16px',
  marginTop: '4px',
};
const Input = forwardRef(({
  classWrapper,
  className,
  onFocus,
  onBlur,
  label,
  errorMessage,
  labelClassName,
  fullWidth,
  hideValidationIcon,
  showClearButton,
  value,
  readOnly,
  disabled,
  icon,
  onChange,
  postfix,
  autoComplete,
  placeholder,
  type,
  style,
  iconPostfix,
  autoFocus,
  onClear,
  size,
  showPassword,
  onKeyDown,
  onTransitionEnd,
  inputData,
  name,
  onClick,
  classes,
  pointer,
  shouldShowTagList,
  tagList,
  handleRemoveTag,
}, ref) => {
  const { t } = useTranslation();
  const [isFocus, setFocus] = useState(false);
  const { trackInputChange } = useTrackFormEvent();
  const [inputType, setInputType] = useState(type);

  const debouncedOnTrackingInputChange = useRef(debounce((e) => {
    trackInputChange(e);
  }, INPUT_DEBOUNCE_TIME)).current;

  const error = Boolean(errorMessage);
  const isActive = !readOnly && !disabled;
  const shouldShowErrorIcon = error && !isFocus && !hideValidationIcon && isActive;
  const shouldShowClearButton = showClearButton && isActive && (Boolean(value?.length) || Boolean(onClear));
  const shouldShowPassword = showPassword && isActive && (Boolean(value?.length));

  const renderIcon = () => icon && <Icomoon
    size={18}
    className={classNames(icon, 'LuminInput__leftIcon', {
      'LuminInput__leftIcon--focused': isFocus,
      'LuminInput__leftIcon--error': error,
    })}
  />;

  const renderLabel = () => {
    const _className = `LuminInput__label ${labelClassName}`;
    return (typeof label === 'string')
      ? <label className={_className}>{label}</label>
      : <div className={_className}>{label}</div>;
  };

  const handleCheckIncluded = (tag) => (target) => target.email === tag;

  const handleShowPassword = () => setInputType(inputType === 'text' ? 'password' : 'text');

  const handleChangeInput = (e) => {
    onChange(e);
    debouncedOnTrackingInputChange(e);
  };

  const handleOnClick = (e) => {
    onClick(e);
    trackInputChange(e);
  };

  const onClearButtonClick = () => {
    onChange({
      target: {
        value: '',
      },
      currentTarget: {
        value: '',
      },
    });
    onClear && onClear();
  };

  const onInputFocus = (e) => {
    setFocus(true);
    onFocus(e);
  };

  const onInputBlur = (e) => {
    setFocus(false);
    onBlur(e);
  };

  return (
    <div
      style={style}
      className={classNames(`LuminInput ${classWrapper}`, {
        'LuminInput--fullWidth': fullWidth,
        'LuminInput--showTagList': shouldShowTagList,
      })}
    >
      {label && renderLabel()}
      <div style={{ ...disabled && { cursor: 'not-allowed' } }}>
      {shouldShowTagList && (
          <div
          className={classNames(
            {
              'LuminTagList': shouldShowTagList,
            }
          )}
        >
            {tagList.map((tag) => (
              <UserTag
                tag={tag}
                key={tag.email}
                handleDelete={() => handleRemoveTag(tag.email)}
                hasEmailIncluded={handleCheckIncluded}
              />
            ))}
          </div>
        )}
        <div
          className={classNames(['LuminInput__wrapper', className, classes.wrapper], {
            'LuminInput__wrapper--disabled': disabled,
            'LuminInput__wrapper--readonly': readOnly,
            'LuminInput__wrapper--error': error && !isFocus,
            'LuminInput__wrapper--showTagList': shouldShowTagList,
          })}
          onTransitionEnd={onTransitionEnd}
          onClick={handleOnClick}
          role="button"
          tabIndex={-1}
        >
          {renderIcon()}
          {iconPostfix && (
            <div className="LuminInput__icon-postfix">{iconPostfix}</div>
          )}
          <input
            className={classNames('LuminInput__input', `LuminInput__input--${size}`, {
              'LuminInput__input--hasIcon':
                shouldShowErrorIcon || shouldShowClearButton,
              'LuminInput__input--hasPreIcon': Boolean(icon),
              'LuminInput__input--pointer': pointer,
            }, classes.input)}
            ref={ref}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            onChange={handleChangeInput}
            value={value}
            disabled={disabled}
            readOnly={readOnly}
            autoComplete={autoComplete}
            placeholder={placeholder}
            type={inputType}
            autoFocus={autoFocus}
            onKeyDown={onKeyDown}
            name={name}
            {...inputData}
          />
          {shouldShowErrorIcon && (
            <Icomoon
              className="cancel-circle LuminInput__icon"
              size={20}
              color={Colors.SECONDARY_50}
            />
          )}
          {(shouldShowClearButton && value) && (
            <Icomoon
              onClick={onClearButtonClick}
              className="cancel LuminInput__icon LuminInput__icon--clickable"
              size={12}
              color={Colors.NEUTRAL_60}
            />
          )}
          {shouldShowPassword && (
            <Tooltip
              title={inputType === 'text' ? t('authenPage.hidePassword') : t('authenPage.showPassword')}
              tooltipStyle={StyleTooltip}
              placement="bottom"
            >
              <div className="LuminInput__rightIconContainer">
                <Icomoon
                  onClick={handleShowPassword}
                  className={inputType === 'text' ? 'eye-close' : 'eye-open'}
                  size={inputType === 'text' ? 16 : 18}
                  color={Colors.NEUTRAL_60}
                />
              </div>
            </Tooltip>
          )}
          {postfix}
          {error && !isFocus && (
            <Icomoon
              className="cancel1 LuminInput__icon-error"
              size={20}
              color={Colors.SECONDARY_50}
            />
          )}
        </div>
      </div>
      {errorMessage && !isFocus && (
        <p className="LuminInput__error-message">{errorMessage}</p>
      )}
    </div>
  );
});

Input.propTypes = {
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  errorMessage: PropTypes.node,
  label: PropTypes.node,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  onChange: PropTypes.func,
  fullWidth: PropTypes.bool,
  hideValidationIcon: PropTypes.bool,
  showClearButton: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  classWrapper: PropTypes.string,
  icon: PropTypes.string,
  postfix: PropTypes.node,
  autoComplete: PropTypes.string,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  style: PropTypes.object,
  iconPostfix: PropTypes.node,
  autoFocus: PropTypes.bool,
  onClear: PropTypes.func,
  size: PropTypes.oneOf(Object.values(InputSize)),
  showPassword: PropTypes.bool,
  onKeyDown: PropTypes.func,
  onTransitionEnd: PropTypes.func,
  onClick: PropTypes.func,
  inputData: PropTypes.object,
  name: PropTypes.string,
  classes: PropTypes.object,
  pointer: PropTypes.bool,
  shouldShowTagList: PropTypes.bool,
  tagList: PropTypes.array,
  handleRemoveTag: PropTypes.func,
};

Input.defaultProps = {
  className: '',
  labelClassName: '',
  errorMessage: '',
  label: '',
  onBlur: () => {},
  onFocus: () => {},
  onChange: () => {},
  fullWidth: false,
  hideValidationIcon: true,
  showClearButton: false,
  disabled: false,
  readOnly: false,
  classWrapper: '',
  icon: '',
  postfix: null,
  value: '',
  autoComplete: '',
  placeholder: '',
  type: 'text',
  style: {},
  iconPostfix: null,
  autoFocus: false,
  onClear: null,
  size: InputSize.LARGE,
  showPassword: false,
  onKeyDown: () => {},
  onTransitionEnd: () => {},
  onClick: () => {},
  inputData: {},
  name: '',
  classes: {},
  pointer: false,
  shouldShowTagList: false,
  tagList: [],
  handleRemoveTag: () => {},
};

export default memo(Input);
