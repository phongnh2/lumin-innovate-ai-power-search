import React from 'react';
import { useTheme } from 'styled-components';

import Icomoon from 'luminComponents/Icomoon';

import * as Styled from './Radio.styled';

const Radio = React.forwardRef(({ ...props }, ref) => {
  const theme = useTheme();
  const classes = Styled.useStyles({ theme });
  return (
    <Styled.Radio
      {...props}
      classes={classes}
      ref={ref}
      icon={<Icomoon className="md_radio_box_unchecked" size={24} />}
      checkedIcon={<Icomoon className="md_radio_box_checked" size={24} />}
    />
  );
});

export default Radio;
