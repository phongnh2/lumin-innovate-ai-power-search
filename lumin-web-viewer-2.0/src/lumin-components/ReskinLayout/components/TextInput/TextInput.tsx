import classNames from 'classnames';
import { TextInput as KiwiTextInput, TextInputProps } from 'lumin-ui/kiwi-ui';
import React, { Ref } from 'react';

import styles from './TextInput.module.scss';

const TextInput = React.forwardRef(({ ...props }: TextInputProps, ref: Ref<HTMLInputElement>) => (
  <KiwiTextInput
    ref={ref}
    classNames={{
      label: classNames('kiwi-typography-title-sm', styles.labelWrapper),
      error: classNames('kiwi-typography-body-sm', styles.error),
      input: styles.input,
    }}
    {...props}
  />
));

export default TextInput;
