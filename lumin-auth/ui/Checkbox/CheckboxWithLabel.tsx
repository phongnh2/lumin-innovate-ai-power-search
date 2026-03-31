import { forwardRef, ReactNode, Ref } from 'react';

import Checkbox from './Checkbox';
import { TCheckboxProps } from './interfaces';
import * as Styled from './styled';

type TCheckboxWithLabel = {
  label: ReactNode;
  checkboxClassName?: string | undefined;
  className?: string | undefined;
  dataAttribute?: Record<string, string>;
} & TCheckboxProps;

const CheckboxWithLabel = forwardRef(
  ({ label, className, checkboxClassName, dataAttribute, ...otherProps }: TCheckboxWithLabel, ref: Ref<HTMLInputElement>) => {
    return (
      <Styled.CheckboxLabel disabled={otherProps.disabled || false} className={className}>
        <Checkbox {...otherProps} className={checkboxClassName} data={dataAttribute} ref={ref} />
        <span>{label}</span>
      </Styled.CheckboxLabel>
    );
  }
);

export default CheckboxWithLabel;
