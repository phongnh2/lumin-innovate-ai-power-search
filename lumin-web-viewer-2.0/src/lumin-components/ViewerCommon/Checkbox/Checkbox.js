/**
 * @link https://v4.mui.com/components/checkboxes/#checkbox
 */
import MaterialCheckbox from '@mui/material/Checkbox';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';

import { useStylesWithTheme } from 'hooks';

import { THEME_MODE } from 'constants/lumin-common';
import { Colors } from 'constants/styles';

const checkedColor = (theme) => ({
  [THEME_MODE.LIGHT]: Colors.NEUTRAL_100,
  [THEME_MODE.DARK]: Colors.WHITE,
}[theme]);

const backgroundColor = (theme) => ({
  [THEME_MODE.LIGHT]: Colors.WHITE,
  [THEME_MODE.DARK]: Colors.NEUTRAL_100,
}[theme]);

const disabledColor = (theme) => ({
  [THEME_MODE.LIGHT]: Colors.NEUTRAL_80,
  [THEME_MODE.DARK]: Colors.NEUTRAL_20,
})[theme];

const useStyles = makeStyles({
  root: {
    color: ({ color }) => color,
    '&.Mui-checked': {
      color: ({ themeMode }) => checkedColor(themeMode),
    },
    '& .MuiIconButton-label': {
      position: 'relative',
      zIndex: 0,
    },
    '&:not(.Mui-checked) .MuiIconButton-label:after': {
      content: '""',
      left: 3,
      top: 3,
      height: 14,
      width: 14,
      position: 'absolute',
      transition: 'background-color .3s ease',
      backgroundColor: ({ themeMode }) => backgroundColor(themeMode),
      zIndex: -1,
    },
    '& .MuiSvgIcon-root': {
      width: 20,
      height: 20,
    },
  },
  checked: {
    color: ({ themeMode }) => checkedColor(themeMode),
  },
  disabled: {
    color: ({ themeMode }) => disabledColor(themeMode),
    opacity: 0.5,
  },
});

const Checkbox = forwardRef(({
  color, ...props
}, ref) => {
  const classes = useStylesWithTheme(useStyles, { color, ...props });
  return <MaterialCheckbox ref={ref} classes={classes} {...props} />;
});

Checkbox.propTypes = {
  color: PropTypes.string,
};

Checkbox.defaultProps = {
  color: Colors.NEUTRAL_60,
};

export default Checkbox;
