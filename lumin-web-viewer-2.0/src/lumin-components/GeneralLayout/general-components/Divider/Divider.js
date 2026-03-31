import MuiDivider from '@mui/material/Divider';
import React from 'react';
import { useTheme } from 'styled-components';

import * as Styled from './Divider.styled';

const Divider = (props) => {
  const theme = useTheme();
  const classes = Styled.useStyles({ theme });

  return <MuiDivider classes={classes} {...props} />;
};

export default Divider;
