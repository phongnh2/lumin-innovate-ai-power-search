/* eslint-disable arrow-body-style */
import MuiSlider, { SliderProps } from '@mui/material/Slider';
import React from 'react';
import { useTheme } from 'styled-components';

import * as Styled from './Slider.styled';

const Slider = React.forwardRef<HTMLSpanElement, SliderProps>((props, ref) => {
  const theme = useTheme();
  const classes = Styled.useStyles({ theme });
  return <MuiSlider classes={classes} ref={ref} {...props} />;
});

export default Slider;
