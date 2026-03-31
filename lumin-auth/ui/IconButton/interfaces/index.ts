import { IconButtonProps, LinkBaseProps } from '@mui/material';
import { ReactElement } from 'react';

export interface ICustomIconButtonProps {
  icon?: string | ReactElement;
  iconSize?: number | undefined;
  children?: JSX.Element | undefined;
  iconColor?: string | undefined;
  size?: number | string | undefined;
}

export type TIconButtonProps = Partial<LinkBaseProps> & Omit<IconButtonProps, 'size' | 'color' | 'icon'> & ICustomIconButtonProps;
