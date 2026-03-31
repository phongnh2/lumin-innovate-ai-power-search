import { ChangeEvent, forwardRef, Ref } from 'react';

import { useTrackFormEvent } from '@/hooks/useTrackingFormEvent';

import CheckboxIcon from './CheckboxIcon';
import { TCheckboxProps } from './interfaces';
import * as Styled from './styled';

const Checkbox = forwardRef((props: TCheckboxProps, ref?: Ref<HTMLInputElement>) => {
  const { disabled, onChange, checked, data } = props;
  const { trackCheckboxUpdated } = useTrackFormEvent();
  const onCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    trackCheckboxUpdated(e);
    onChange?.(e, Boolean(checked));
  };
  return (
    <div>
      <Styled.Checkbox
        {...props}
        inputRef={ref}
        icon={<CheckboxIcon disabled={disabled} />}
        checkedIcon={<CheckboxIcon checked disabled={disabled} />}
        indeterminateIcon={<CheckboxIcon indeterminate disabled={disabled} />}
        onChange={onCheckboxChange}
        {...data}
      />
    </div>
  );
});

export default Checkbox;
