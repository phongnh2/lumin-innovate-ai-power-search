import { omit } from 'lodash';
import { IconButton as MuiIconButton } from '@mui/material';

import { TIconButtonProps } from './interfaces';

function BaseIconButton(props: TIconButtonProps) {
  return <MuiIconButton {...omit(props, 'size')} />;
}

export default BaseIconButton;
