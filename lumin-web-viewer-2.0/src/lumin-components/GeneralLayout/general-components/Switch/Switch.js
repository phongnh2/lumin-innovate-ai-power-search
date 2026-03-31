import MaterialSwitch from '@mui/material/Switch';
import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';
import { useTheme } from 'styled-components';

import { useMergeMuiClass } from 'hooks';

import * as Styled from './Switch.styled';

const SWITCH_CLASSES = ['root'];

const Switch = forwardRef(({ classes, ...props }, ref) => {
  const theme = useTheme();
  const _classes = Styled.useStyles({ theme });

  const mergeClasses = useMergeMuiClass({
    materialClassNames: SWITCH_CLASSES,
    baseClasses: _classes,
    customClasses: classes,
  });

  return <MaterialSwitch classes={mergeClasses} ref={ref} {...props} />;
});

Switch.propTypes = {
  classes: PropTypes.object,
};

Switch.defaultProps = {
  classes: {},
};

export default Switch;
