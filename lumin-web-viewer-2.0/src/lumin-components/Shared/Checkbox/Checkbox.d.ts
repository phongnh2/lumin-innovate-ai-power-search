import React, { ChangeEvent } from 'react';

interface IProps {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  checked?: boolean;
  border?: string;
  background?: string;
  checkedColor?: string;
  indeterminate?: boolean;
}

declare const Checkbox: React.FC<IProps>;

export default Checkbox;
