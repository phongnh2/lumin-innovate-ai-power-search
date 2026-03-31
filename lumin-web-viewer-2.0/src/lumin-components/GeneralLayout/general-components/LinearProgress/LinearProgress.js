import MuiLinearProgress from '@mui/material/LinearProgress';
import { merge } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { useTheme } from 'styled-components';

import * as Styled from './LinearProgress.styled';

const LinearProgress = (props) => {
  const theme = useTheme();
  const classes = Styled.useStyles({ theme });
  return <MuiLinearProgress classes={merge({}, classes, props.classes)} {...props} />;
};

LinearProgress.propTypes = {
  classes: PropTypes.object,
};

LinearProgress.defaultProps = {
  classes: {},
};

export default LinearProgress;
