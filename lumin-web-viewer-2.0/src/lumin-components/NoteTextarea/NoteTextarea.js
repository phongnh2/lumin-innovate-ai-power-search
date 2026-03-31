import React from 'react';
import PropTypes from 'prop-types';

import AutoResizeTextarea from 'luminComponents/NoteTextarea/AutoResizeTextarea';

const propTypes = {
  // same the value attribute of a HTML textarea element
  value: PropTypes.string,
  // same the placeholder attribute of a HTML textarea element
  placeholder: PropTypes.string,
  // same the onChange attribute of a HTML textarea element
  onChange: PropTypes.func.isRequired,
  // same the onBlur attribute of a HTML textarea element
  onBlur: PropTypes.func,
  // same the onBlur attribute of a HTML textarea element
  onFocus: PropTypes.func,
  // a function that will be invoked when Ctrl + Enter or Cmd + Enter are pressed
  onSubmit: PropTypes.func,
  onKeyDown: PropTypes.func,
};

const defaultProps = {
  // same the value attribute of a HTML textarea element
  value: '',
  // same the placeholder attribute of a HTML textarea element
  placeholder: '',
  // same the onBlur attribute of a HTML textarea element
  onBlur: () => {},
  // same the onBlur attribute of a HTML textarea element
  onFocus: () => {},
  // a function that will be invoked when Ctrl + Enter or Cmd + Enter are pressed
  onSubmit: () => {},
  onKeyDown: () => {},
};

const NoteTextarea = React.forwardRef((props, forwardedRef) => {
  const handleKeyDown = (e) => {
    props.onKeyDown(e);
    // (Cmd/Ctrl + Enter)
    if ((e.metaKey || e.ctrlKey) && e.which === 13) {
      props.onSubmit(e);
    }
  };

  const handleChange = (e) => {
    props.onChange(e);
  };

  const textareaProps = {
    ...props,
    ref: (el) => {
      forwardedRef(el);
    },
    onChange: handleChange,
    onKeyDown: handleKeyDown,
  };

  return <AutoResizeTextarea {...textareaProps} />;
});

NoteTextarea.propTypes = propTypes;
NoteTextarea.defaultProps = defaultProps;

export default NoteTextarea;
