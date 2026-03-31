import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { useStylesWithTheme } from 'hooks/useStylesWithTheme';

import { THEME_MODE } from 'constants/lumin-common';
import { Colors } from 'constants/styles';
import { buttonClassBuilder } from 'constants/theme/Button';

import ButtonMaterial from './ButtonMaterial';

const buttonTextTheme = {
  [THEME_MODE.LIGHT]: {
    label: Colors.NEUTRAL_100,
    buttonHover: Colors.NEUTRAL_10,
  },
  [THEME_MODE.DARK]: {
    label: Colors.NEUTRAL_10,
    buttonHover: Colors.NEUTRAL_80,
  },
};

const useStyles = makeStyles({
  root: ({ themeMode }) => {
    const theme = buttonTextTheme[themeMode];
    return {
      color: theme.label,
      background: 'transparent',
      '&:hover': {
        color: theme.label,
        backgroundColor: theme.buttonHover,
      },
    };
  },
  label: {
    fontWeight: 400,
  },
});

const ButtonText = React.forwardRef(({ classes: originalClasses, ...rest }, ref) => {
  const buttonClasses = useStylesWithTheme(useStyles, rest);
  const classes = useMemo(() => buttonClassBuilder(originalClasses, buttonClasses), [buttonClasses, originalClasses]);
  return (
    <ButtonMaterial
      classes={classes}
      ref={ref}
      {...rest}
    />
  );
});

ButtonText.propTypes = {
  classes: PropTypes.object,
};
ButtonText.defaultProps = {
  classes: null,
};

export default ButtonText;
