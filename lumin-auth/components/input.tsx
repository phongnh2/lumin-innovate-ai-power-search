import classNames from 'classnames';
import React, { ReactNode } from 'react';

export function Error(props: { children: ReactNode; className: string }) {
  const { className, children } = props;
  return <p className={classNames('text-secondary-50 text-sm', className)}>{children}</p>;
}

export type LabelProps = {
  className?: string;
  htmlFor?: string;
  children: React.ReactNode;
};

export type InputProps = {
  error?: string;
  label?: string;
  icon?: any;
  iconRight?: React.ReactElement | string;
  onClear?: () => void;
} & React.ComponentPropsWithRef<'input'>;

export type PasswordInputProps = {
  readOnly?: boolean;
} & InputProps;
