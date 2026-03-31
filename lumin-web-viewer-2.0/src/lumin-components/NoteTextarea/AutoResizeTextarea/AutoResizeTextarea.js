import TextareaAutosize from '@mui/material/TextareaAutosize';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';

const propTypes = {
  value: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  onKeyDown: PropTypes.func,
  className: PropTypes.string,
  id: PropTypes.string,
  shouldLimitHeight: PropTypes.bool,
};

const AutoResizeTextarea = React.forwardRef(({
  value = '',
  onChange,
  onBlur = () => {},
  onFocus = () => {},
  onKeyDown = () => {},
  placeholder = '',
  className = '',
  id = '',
  shouldLimitHeight,
}, forwardedRef) => {
  const textareaRef = useRef(null);
  return (
    <TextareaAutosize
      className={className}
      id={id}
      ref={(el) => {
        textareaRef.current = el;
        forwardedRef(el);
      }}
      onBlur={onBlur}
      onFocus={onFocus}
      placeholder={placeholder}
      onChange={onChange}
      onKeyDown={onKeyDown}
      value={value}
      {...(shouldLimitHeight && { maxRows: 6 })}
    />
  );
});

AutoResizeTextarea.propTypes = propTypes;

AutoResizeTextarea.defaultProps = {
  value: '',
  placeholder: '',
  onBlur: () => {},
  onFocus: () => {},
  onKeyDown: () => {},
  className: '',
  id: '',
  shouldLimitHeight: false,
};

export default AutoResizeTextarea;
