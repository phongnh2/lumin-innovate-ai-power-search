import { isValidElement } from 'react';

import { TIconButtonProps } from './interfaces';
import Icomoon from '../Icomoon';
import { Colors } from '../theme';
import * as Styled from './IconButton.styled';

function IconButton({ icon, size, iconSize = 16, iconColor, ...otherProps }: TIconButtonProps) {
  return (
    <Styled.IconButton {...otherProps} size={size}>
      {isValidElement(icon) ? icon : <Icomoon color={iconColor || Colors.NEUTRAL_100} type={String(icon)} size={iconSize} />}
    </Styled.IconButton>
  );
}

export default IconButton;
