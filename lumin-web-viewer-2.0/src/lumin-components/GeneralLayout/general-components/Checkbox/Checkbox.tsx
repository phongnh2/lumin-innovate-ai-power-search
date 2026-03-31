import { CheckboxProps } from '@mui/material/Checkbox';
import React from 'react';
import { useTheme } from 'styled-components';

import * as Styled from './Checkbox.styled';

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(({ ...props }, ref) => {
  const theme = useTheme() as Record<string, string>;
  const classes = Styled.useStyles({ theme });

  return <Styled.Checkbox {...props} classes={classes} ref={ref} />;
});

export default Checkbox;
