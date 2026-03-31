import { TextareaAutosize } from '@mui/base';
import React, { ComponentProps, Ref } from 'react';

import * as styles from './TextArea.styled';

interface IProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, ComponentProps<typeof TextareaAutosize> {
  label?: string;
  errorText?: string;
  size?: 'small' | 'medium' | 'large';
  bgColor?: string;
  autoFocus?: boolean;
}

const DEFAULT_TEXT_AREA_ROWS = 6;

const TextArea = React.forwardRef((props: IProps, ref: Ref<HTMLTextAreaElement>) => {
  const { label, size = 'medium', errorText, bgColor = 'transparent', ...otherProps } = props;

  return (
    <div>
      {label && <label>{label}</label>}
      <TextareaAutosize
        css={[
          styles.textAreaSize[size],
          styles.textAreaElement({ backgroundColor: bgColor }),
          errorText && styles.textAreaElementError,
        ]}
        ref={ref}
        style={{
          backgroundColor: bgColor,
        }}
        minRows={DEFAULT_TEXT_AREA_ROWS}
        maxRows={DEFAULT_TEXT_AREA_ROWS}
        {...otherProps}
      />
      {errorText && <span css={styles.errorMessage}>{errorText}</span>}
    </div>
  );
});

export default TextArea;
