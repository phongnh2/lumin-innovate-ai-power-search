import { Checkbox, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

interface CheckboxOptionProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

const CheckboxOption: React.FC<CheckboxOptionProps> = ({ label, checked, disabled = false, onChange }) => (
  <Checkbox
    size="md"
    label={<Text color="var(--kiwi-colors-surface-on-surface)">{label}</Text>}
    checked={checked}
    disabled={disabled}
    onChange={onChange}
  />
);

export default CheckboxOption;
