import { ComponentPropsWithRef, ReactElement } from 'react';

export type InputProps = {
  error?: string;
  label?: string;
  icon?: any;
  iconRight?: ReactElement | string;
  onClear?: () => void;
  inputData?: Record<string, string>;
} & ComponentPropsWithRef<'input'>;
