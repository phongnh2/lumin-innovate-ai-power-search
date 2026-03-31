/* eslint-disable react/no-unused-class-component-methods */
import Radio from '@mui/material/Radio';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';

import SvgElement from 'luminComponents/SvgElement';

const StyledRadio = withStyles({
  root: {
    padding: '6px',
    '&.Mui-disabled': {
      opacity: 0.5,
    },
  },
  disabled: {},
})(Radio);

class CustomRadio extends React.PureComponent {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.isViewer = window.location.pathname.startsWith('/viewer/');
  }

  get checked() {
    return this.inputRef.current.checked;
  }

  set checked(value) {
    this.inputRef.current.checked = value;
  }

  _getSvgIcon = (svgName) => {
    const { themeMode } = this.props;
    const isLightMode = themeMode === 'light';
    if (!this.isViewer) {
      return `${svgName}-Light`;
    }
    return `${svgName}${isLightMode ? '-Light' : '-Dark'}`;
  };

  render() {
    const { ...parentProps } = this.props;
    const { size = 16, ...rest } = parentProps;
    return (
      <StyledRadio
        {...rest}
        inputRef={this.inputRef}
        icon={
          <SvgElement content={this._getSvgIcon('Radio-NotSelected')} width={size} />
        }
        checkedIcon={
          <SvgElement content={this._getSvgIcon('Radio-Selected')} width={size} />
        }
      />
    );
  }
}

CustomRadio.propTypes = {
  dispatch: PropTypes.func.isRequired,
  themeMode: PropTypes.oneOf(['light', 'dark']),
};

CustomRadio.defaultProps = {
  themeMode: 'light',
};

export default CustomRadio;
