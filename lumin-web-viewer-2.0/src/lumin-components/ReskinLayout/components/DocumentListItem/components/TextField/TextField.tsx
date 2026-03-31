import classNames from 'classnames';
import { PlainTooltip, TextSize, TextType, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import styles from './TextField.module.scss';

interface TextFieldProps {
  value: string;
  disabled?: boolean;
  color?: string;
  type?: TextType;
  size?: TextSize;
  tooltip?: boolean;
  tooltipContent?: string;
  children?: React.ReactNode;
  component?: React.ElementType;
}
const TextField = ({
  value,
  type,
  size,
  color,
  disabled = false,
  tooltip,
  tooltipContent,
  children,
  component,
}: TextFieldProps) => {
  const showTooltip = !disabled && tooltip;
  return (
    <PlainTooltip content={showTooltip ? tooltipContent || value : ''} disableInteractive={!showTooltip}>
      <Text type={type} size={size} color={color} className={classNames(styles.value)} component={component}>
        {children || value}
      </Text>
    </PlainTooltip>
  );
};

export default TextField;
