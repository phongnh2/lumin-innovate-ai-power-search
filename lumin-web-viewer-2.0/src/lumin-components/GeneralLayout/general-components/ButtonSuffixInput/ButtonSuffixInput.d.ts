import { PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { ComponentProps } from 'react';

interface ButtonSuffixInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onSuffixClick?: () => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClick?: () => void;
  inputComponent?: React.ElementType;
  value?: string | number;
  tooltipProps?: Omit<ComponentProps<typeof PlainTooltip>, 'children'>;
}

declare const ButtonSuffixInput: React.ForwardRefExoticComponent<
  ButtonSuffixInputProps & React.RefAttributes<HTMLInputElement>
>;

export default ButtonSuffixInput;
