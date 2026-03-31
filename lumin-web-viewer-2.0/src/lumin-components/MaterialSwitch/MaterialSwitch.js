import { Switch } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';

import { Colors } from 'constants/styles';

const useStyles = makeStyles(() => ({
  root: {
    padding: 0,
    width: 51,
    height: 30,
  },
  switchBase: {
    padding: 1,
    '&.Mui-checked': {
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#3a506b',
        opacity: 1,
      },
    },
  },
  disabled: {
    '&.MuiSwitch-switchBase': {
      color: '#fff',
    },
    '&.MuiSwitch-switchBase + .MuiSwitch-track': {
      backgroundColor: Colors.SECONDARY,
    },
  },
  checked: {},
  track: {
    borderRadius: 16,
    width: '100%',
    height: '100%',
    border: 'none',
    borderColor: (props) => (props.noOffColor ? '#3a506b' : '#b8cbdd'),
    backgroundColor: (props) => (props.noOffColor ? '#3a506b' : '#b8cbdd'),
    opacity: 1,
  },
  thumb: {
    width: 28,
    height: 28,
  },
}));

const MaterialSwitch = React.forwardRef((props, ref) => {
  const {
    isChecked,
    defaultChecked,
    value,
    disabled,
    noOffColor,
    handleChange,
  } = props;
  const classes = useStyles({ noOffColor });

  return (
    <Switch
      ref={ref}
      className="Switch"
      classes={classes}
      onChange={handleChange}
      checked={isChecked || defaultChecked || false}
      value={value}
      disabled={disabled}
    />
  );
});

MaterialSwitch.propTypes = {
  isChecked: PropTypes.bool,
  defaultChecked: PropTypes.bool,
  value: PropTypes.string,
  disabled: PropTypes.bool,
  handleChange: PropTypes.func,
  noOffColor: PropTypes.bool,

};

MaterialSwitch.defaultProps = {
  isChecked: false,
  value: '',
  defaultChecked: false,
  disabled: false,
  handleChange: () => {},
  noOffColor: false,
};

export default MaterialSwitch;
