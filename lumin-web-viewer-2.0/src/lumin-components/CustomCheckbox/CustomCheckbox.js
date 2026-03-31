/* eslint-disable class-methods-use-this */
import React from 'react';
import PropTypes from 'prop-types';

import { Checkbox } from 'lumin-components/Shared/Checkbox';

import './CustomCheckbox.scss';

const defaultProps = {
  themeMode: 'light',
  className: '',
  dispatch: () => {},
  indeterminate: false,
  disabled: false,
  type: '',
  onChange: () => {},
};

const propTypes = {
  themeMode: PropTypes.string,
  className: PropTypes.string,
  dispatch: PropTypes.func,
  indeterminate: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.string,
  onChange: () => {},
};

class CustomCheckbox extends React.PureComponent {
  constructor() {
    super();
    this.inputRef = React.createRef();
  }

  // eslint-disable-next-line react/no-unused-class-component-methods
  get checked() {
    return this.inputRef.current.checked;
  }

  // eslint-disable-next-line react/no-unused-class-component-methods
  set checked(value) {
    this.inputRef.current.checked = value;
  }

  render() {
    const {
      themeMode: _themeMode,
      dispatch: _dispatch,
      disabled,
      className,
      ...otherProps
    } = this.props;
    return (
      <Checkbox
        {...otherProps}
        inputRef={this.inputRef}
        className={className}
        disabled={disabled}
      />
    );
  }
}
CustomCheckbox.propTypes = propTypes;
CustomCheckbox.defaultProps = defaultProps;

export default CustomCheckbox;
