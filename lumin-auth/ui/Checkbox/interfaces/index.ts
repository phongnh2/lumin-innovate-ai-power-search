import { CheckboxProps } from '@mui/material';

export interface ICustomCheckboxProps {
  data?: Record<string, string>;
}

export type TCheckboxProps = Omit<CheckboxProps, 'ref'> & ICustomCheckboxProps;
