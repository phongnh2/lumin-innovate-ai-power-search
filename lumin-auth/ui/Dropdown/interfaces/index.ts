import { SerializedStyles } from '@emotion/react';
import { PopperProps } from '@mui/material';
import { ReactElement, ReactNode } from 'react';

export interface IPopperChildren {
  open?: boolean;
  closePopper: () => void;
}

export type DropdownProps = Omit<PopperProps, 'open' | 'children' | 'trigger'> & {
  trigger: ReactElement;
  children: ({ open, closePopper }: IPopperChildren) => ReactNode;
  verticalGap?: boolean;
  disableClickAway?: boolean;
  triggerStyles?: SerializedStyles;
  disabled?: boolean;
};
