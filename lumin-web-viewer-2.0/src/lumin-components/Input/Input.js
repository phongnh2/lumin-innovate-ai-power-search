import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Icon from 'luminComponents/Icon';

import './Input.scss';

import selectors from 'selectors';

const propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  name: PropTypes.string,
  defaultChecked: PropTypes.bool,
  onChange: PropTypes.func,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]).isRequired,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  dataElement: PropTypes.string.isRequired,
};

const defaultProps = {
  name: '',
  defaultChecked: false,
  onChange: () => {},
  checked: false,
  disabled: false,
};

const Input = React.forwardRef((props, ref) => {
  const isDisabled = useSelector((state) => selectors.isElementDisabled(state, props.dataElement));

  const inputProps = omit(props, ['dataElement', 'label']);

  return isDisabled ? null : (
    <>
      <input className="Input" ref={ref} {...inputProps} />
      <label className="Input" htmlFor={props.id} data-element={props.dataElement}>{props.label}
        {ref?.current?.checked &&
          <div
            className="icon-container"
          >
            <Icon
              glyph="icon-menu-checkmark"
            />
          </div>}
      </label>
    </>
  );
});

const omit = (obj, keysToOmit) => Object.keys(obj).reduce((result, key) => {
  if (!keysToOmit.includes(key)) {
    result[key] = obj[key];
  }

  return result;
}, {});

Input.propTypes = propTypes;
Input.defaultProps = defaultProps;

export default Input;
