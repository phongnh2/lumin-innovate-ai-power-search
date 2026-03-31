import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';

import Switch from 'lumin-components/Shared/Switch';

const useStyles = makeStyles({
  root: {
    width: 30,
    height: 18,
  },
  switchBase: {
    padding: 3,
  },
  checked: {
    transform: 'translateX(12px)!important',
  },
  thumb: {
    width: 12,
    height: 12,
  },
});

function ActionItemSwitch({ checked, disabled }) {
  const classes = useStyles();
  return (
    <Switch
      classes={classes}
      checked={checked}
      disabled={disabled}
    />
  );
}

ActionItemSwitch.propTypes = {
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
};
ActionItemSwitch.defaultProps = {
  checked: true,
  disabled: false,
};

export default ActionItemSwitch;
