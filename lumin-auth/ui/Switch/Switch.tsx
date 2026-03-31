import { SwitchProps } from '@mui/material';
import { forwardRef, Ref } from 'react';

import * as Styled from './Switch.styled';

const Switch = forwardRef((props: SwitchProps, ref?: Ref<HTMLButtonElement>): JSX.Element => {
  return <Styled.Switch ref={ref} {...props} />;
});

export default Switch;
