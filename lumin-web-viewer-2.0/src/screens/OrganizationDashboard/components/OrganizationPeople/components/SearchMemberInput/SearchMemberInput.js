import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import Input from 'lumin-components/Shared/Input';

import { useSearchInputShortkey } from 'hooks';

const INITIAL_WIDTH = 388;

const SearchMemberInput = ({ onChange, value, placeholder, autoFocus }) => {
  const [expand, setExpand] = useState(false);
  const shouldExpand = expand || Boolean(value);
  const inputRef = useRef();

  useSearchInputShortkey(inputRef);

  useEffect(() => {
    if (!autoFocus || !inputRef.current) {
      return;
    }
    inputRef.current.focus();
  }, [autoFocus]);

  const inputStyle = useMemo(() => ({
    width: shouldExpand ? '100%' : INITIAL_WIDTH,
    flexShrink: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
    transition: 'all 0.2s ease',
  }), [shouldExpand]);

  return (
    <Input
      style={inputStyle}
      onFocus={() => setExpand(true)}
      onBlur={() => setExpand(false)}
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      icon="search"
      showClearButton
      ref={inputRef}
    />
  );
};

SearchMemberInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  autoFocus: PropTypes.bool,
};

SearchMemberInput.defaultProps = {
  autoFocus: false,
};

export default SearchMemberInput;
