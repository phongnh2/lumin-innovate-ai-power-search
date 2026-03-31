import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';

import { ButtonText, ButtonSize } from 'lumin-components/ButtonMaterial';
import Icomoon from 'lumin-components/Icomoon';

import { useThemeMode } from 'hooks';

import { THEME_MODE } from 'constants/lumin-common';
import { Colors, Breakpoints } from 'constants/styles';
import themeConstants from 'constants/theme';

const ARROW_DOWN_COLOR = {
  [THEME_MODE.LIGHT]: Colors.NEUTRAL_60,
  [THEME_MODE.DARK]: Colors.NEUTRAL_40,
};

const useButtonStyles = makeStyles({
  root: {
    fontSize: 12,
    lineHeight: '16px',
    fontWeight: 400,
    height: 28,
    padding: 8,
    borderRadius: 4,
    [`@media screen and (min-width: ${Breakpoints.md - 1}px)`]: {
      fontSize: 14,
      lineHeight: '20px',
    },
  },
});

const ButtonPermission = React.forwardRef(({ children, classes, ...rest }, ref) => {
  const themeMode = useThemeMode();
  const buttonClasses = useButtonStyles();
  const newClasses = themeConstants.Button.buttonClassBuilder(buttonClasses, classes);
  return (
    <ButtonText
      size={ButtonSize.SM}
      classes={newClasses}
      ref={ref}
      {...rest}
    >
      {children}
      <Icomoon
        className="dropdown"
        size={10}
        color={ARROW_DOWN_COLOR[themeMode]}
        style={{ marginLeft: 8 }}
      />
    </ButtonText>
  );
});

ButtonPermission.propTypes = {
  children: PropTypes.node.isRequired,
  classes: PropTypes.object,
};
ButtonPermission.defaultProps = {
  classes: {},
};

export default ButtonPermission;
