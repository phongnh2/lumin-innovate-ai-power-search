import { CSSProperties, ReactNode } from 'react';

import { Text } from '../Text';
import { TextProps } from '../Text/interfaces';

interface IErrorMessageProps extends TextProps {
  children: ReactNode;
  style?: CSSProperties;
}

function ErrorMessage({ children, ...otherProps }: IErrorMessageProps) {
  return (
    <Text {...otherProps} variant='error' level={6}>
      {children}
    </Text>
  );
}

export default ErrorMessage;
