import classNames from 'classnames';
import React, { forwardRef } from 'react';
import AutosizeInput from 'react-18-input-autosize';

import styles from './InputButton.module.scss';
import { IInputButtonProps } from '../../interface';

export enum InputType {
  NUMBER = 'number',
  TEXT = 'text',
  PASSWORD = 'password',
}

const InputButton = forwardRef<HTMLInputElement, IInputButtonProps>(
  (
    { value, isDisabled, inputType, onSubmit, onBlur, onChange, onFocus, className },
    ref
  ): JSX.Element => {
    const renderInputContent = (): JSX.Element => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(e);
        }}
        onBlur={onBlur}
        onFocus={onFocus}
      >
        <AutosizeInput
          ref={ref}
          style={{ display: 'flex' }}
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          disabled={isDisabled}
          title={String(value)}
          type={inputType}
          value={value}
          onChange={onChange}
          tabIndex={-1}
          className={classNames(styles.input, className)}
          injectStyles={false}
        />
      </form>
    );

    return renderInputContent();
  }
);

InputButton.defaultProps = {
  defaultValue: '',
  isDisabled: false,
  inputType: InputType.NUMBER,
};

export default InputButton;
