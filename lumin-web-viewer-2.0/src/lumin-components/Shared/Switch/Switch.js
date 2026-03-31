import MaterialSwitch from '@mui/material/Switch';
import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';

import { useMergeMuiClass, useStylesWithTheme } from 'hooks';

import { useStyles } from './Switch.styled';

const SWITCH_CLASSES = ['root', 'label'];

const Switch = forwardRef((props, ref) => {
  const { classes: customClasses, ...otherProps } = props;
  const classes = useStylesWithTheme(useStyles, props);
  const mergeClasses = useMergeMuiClass({
    materialClassNames: SWITCH_CLASSES,
    baseClasses: classes,
    customClasses,
  });

  return (
    <MaterialSwitch
      classes={mergeClasses}
      ref={ref}
      {...otherProps}
    />
  );
});

Switch.propTypes = {
  classes: PropTypes.object,
};

Switch.defaultProps = {
  classes: {},
};

export default Switch;
